"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";

import { AppHeader } from "@/components/AppHeader";
import { useInterviewStore } from "@/store/interviewStore";
import type { FillerWordResult, PauseMetrics } from "@/types/audio";
import type { InterviewAnswer, TranscriptionProvider } from "@/types/interview";
import type { VisionMetrics } from "@/types/vision";

type ResponseState = "ready" | "recording" | "transcribing" | "error";
type ProviderStatus = TranscriptionProvider | "loading";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const SPEECH_THRESHOLD = 0.012;
const MIN_PAUSE_MS = 300;
const LONG_PAUSE_MS = 2000;
const FILLER_WORDS = ["eh", "emm", "mmm", "este", "bueno", "o sea", "digamos"];

interface PauseTracker {
  hasSpoken: boolean;
  silenceStartedAt?: number;
  pauses: number[];
}

interface FaceTracker {
  totalFrames: number;
  framesWithFace: number;
  centeredFrames: number;
  forwardFrames: number;
  faceLostEvents: number;
  wasFaceVisible: boolean;
}

const EMPTY_PAUSE_METRICS: PauseMetrics = {
  totalPauses: 0,
  longPauses: 0,
  averagePauseMs: 0,
  longestPauseMs: 0,
};

const EMPTY_FACE_TRACKER: FaceTracker = {
  totalFrames: 0,
  framesWithFace: 0,
  centeredFrames: 0,
  forwardFrames: 0,
  faceLostEvents: 0,
  wasFaceVisible: false,
};

function buildVisionMetrics(tracker: FaceTracker): VisionMetrics {
  const faceFrames = tracker.framesWithFace;
  return {
    faceVisiblePercentage: tracker.totalFrames
      ? Math.round((faceFrames / tracker.totalFrames) * 100)
      : 0,
    centeredPercentage: faceFrames
      ? Math.round((tracker.centeredFrames / faceFrames) * 100)
      : 0,
    forwardPercentage: faceFrames
      ? Math.round((tracker.forwardFrames / faceFrames) * 100)
      : 0,
    faceLostEvents: tracker.faceLostEvents,
  };
}

function countFillerWords(text: string): FillerWordResult {
  const normalizedText = text
    .toLocaleLowerCase("es-ES")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const items = FILLER_WORDS.map((phrase) => {
    const normalizedPhrase = phrase.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const escapedPhrase = normalizedPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = normalizedText.match(new RegExp(`(?:^|\\s)${escapedPhrase}(?=$|[\\s.,;:!?])`, "g"));
    return { phrase, count: matches?.length ?? 0 };
  }).filter((item) => item.count > 0);

  return {
    total: items.reduce((total, item) => total + item.count, 0),
    items,
  };
}

function buildPauseMetrics(pauses: number[]): PauseMetrics {
  if (pauses.length === 0) return EMPTY_PAUSE_METRICS;

  const totalMs = pauses.reduce((total, pause) => total + pause, 0);
  return {
    totalPauses: pauses.length,
    longPauses: pauses.filter((pause) => pause >= LONG_PAUSE_MS).length,
    averagePauseMs: Math.round(totalMs / pauses.length),
    longestPauseMs: Math.max(...pauses),
  };
}

function getSupportedRecorderMimeType() {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["audio/webm;codecs=opus", "audio/webm"]
    .find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}

function getCurrentTimestamp() {
  return Date.now();
}

export default function InterviewPage() {
  const router = useRouter();
  const config = useInterviewStore((state) => state.config);
  const currentQuestionIndex = useInterviewStore((state) => state.currentQuestionIndex);
  const startedAt = useInterviewStore((state) => state.startedAt);
  const mediaStream = useInterviewStore((state) => state.mediaStream);
  const addAnswer = useInterviewStore((state) => state.addAnswer);
  const finishInterview = useInterviewStore((state) => state.finishInterview);
  const clearMediaStream = useInterviewStore((state) => state.clearMediaStream);
  const setVisionMetrics = useInterviewStore((state) => state.setVisionMetrics);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamCleanupTimerRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recordingStartedAtRef = useRef<number>(0);
  const fallbackTranscriptRef = useRef("");
  const fallbackInterimRef = useRef("");
  const userStoppedRecognitionRef = useRef(false);
  const recognitionShouldRunRef = useRef(false);
  const recognitionRestartTimerRef = useRef<number | null>(null);
  const isFinishingRef = useRef(false);
  const transcriptionAbortRef = useRef<AbortController | null>(null);
  const isResponseRecordingRef = useRef(false);
  const pauseTrackerRef = useRef<PauseTracker>({ hasSpoken: false, pauses: [] });
  const completedPauseMetricsRef = useRef<PauseMetrics>(EMPTY_PAUSE_METRICS);
  const faceAnimationFrameRef = useRef<number | null>(null);
  const faceDetectionRunRef = useRef(0);
  const faceTrackerRef = useRef<FaceTracker>(EMPTY_FACE_TRACKER);
  const [seconds, setSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [provider, setProvider] = useState<ProviderStatus>("loading");
  const [responseState, setResponseState] = useState<ResponseState>("ready");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [responseError, setResponseError] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceLookingForward, setFaceLookingForward] = useState(false);

  const questions = useMemo(
    () => [
      { id: "opening", question: config.openingQuestion },
      ...config.technicalQuestions.map(({ id, question }) => ({ id, question })),
    ],
    [config],
  );
  const current = questions[currentQuestionIndex];
  const progress = Math.round((currentQuestionIndex / questions.length) * 100);

  useEffect(() => {
    let active = true;

    void fetch("/api/transcription-status")
      .then(async (response) => {
        if (!response.ok) throw new Error("Provider status unavailable");
        return response.json() as Promise<{ provider: TranscriptionProvider }>;
      })
      .then(({ provider: activeProvider }) => {
        if (active) setProvider(activeProvider);
      })
      .catch(() => {
        if (active) setProvider("web-speech");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(
      () => setSeconds(Math.floor((Date.now() - (startedAt ?? Date.now())) / 1000)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [startedAt]);

  useEffect(() => {
    if (streamCleanupTimerRef.current !== null) {
      window.clearTimeout(streamCleanupTimerRef.current);
      streamCleanupTimerRef.current = null;
    }

    if (!mediaStream) {
      router.replace("/setup");
      return;
    }

    const video = videoRef.current;
    if (video) {
      video.srcObject = mediaStream;
      void video.play().catch((error: unknown) => {
        if (!(error instanceof DOMException) || error.name !== "AbortError") {
          console.warn("No fue posible iniciar la vista previa de cámara", error);
        }
      });
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    audioContext.createMediaStreamSource(mediaStream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    let lastUpdate = 0;

    const updateMeter = (timestamp: number) => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) {
        const normalized = (sample - 128) / 128;
        sum += normalized * normalized;
      }

      if (timestamp - lastUpdate > 100) {
        lastUpdate = timestamp;
        const rms = Math.sqrt(sum / samples.length);
        setAudioLevel(Math.min(100, Math.round(rms * 550)));

        if (isResponseRecordingRef.current) {
          const tracker = pauseTrackerRef.current;
          if (rms > SPEECH_THRESHOLD) {
            tracker.hasSpoken = true;
            if (tracker.silenceStartedAt !== undefined) {
              const pauseDuration = timestamp - tracker.silenceStartedAt;
              if (pauseDuration >= MIN_PAUSE_MS) tracker.pauses.push(pauseDuration);
              tracker.silenceStartedAt = undefined;
            }
          } else if (tracker.hasSpoken && tracker.silenceStartedAt === undefined) {
            tracker.silenceStartedAt = timestamp;
          }
        }
      }
      animationFrameRef.current = window.requestAnimationFrame(updateMeter);
    };

    void audioContext.resume();
    animationFrameRef.current = window.requestAnimationFrame(updateMeter);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      void audioContext.close();
      streamCleanupTimerRef.current = window.setTimeout(() => {
        clearMediaStream();
      }, 0);
    };
  }, [clearMediaStream, mediaStream, router]);

  useEffect(() => {
    const video = videoRef.current;
    if (!mediaStream || !video) return;
    const activeVideo = video;

    const runId = faceDetectionRunRef.current + 1;
    faceDetectionRunRef.current = runId;
    faceTrackerRef.current = { ...EMPTY_FACE_TRACKER };
    setFaceDetected(false);
    setFaceLookingForward(false);
    let faceLandmarker: FaceLandmarker | null = null;
    let lastSampleTimestamp = 0;

    async function startFaceAnalysis() {
      try {
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm",
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (runId !== faceDetectionRunRef.current) {
          landmarker.close();
          return;
        }
        faceLandmarker = landmarker;

        const analyzeFrame = (timestamp: number) => {
          if (runId !== faceDetectionRunRef.current || !faceLandmarker) return;

          if (
            activeVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
            timestamp - lastSampleTimestamp >= 200
          ) {
            lastSampleTimestamp = timestamp;
            const tracker = faceTrackerRef.current;
            const result = faceLandmarker.detectForVideo(activeVideo, timestamp);
            const landmarks = result.faceLandmarks[0];
            tracker.totalFrames += 1;

            if (!landmarks) {
              if (tracker.wasFaceVisible) tracker.faceLostEvents += 1;
              tracker.wasFaceVisible = false;
              setFaceDetected(false);
              setFaceLookingForward(false);
            } else {
              const xs = landmarks.map((landmark) => landmark.x);
              const ys = landmarks.map((landmark) => landmark.y);
              const minX = Math.min(...xs);
              const maxX = Math.max(...xs);
              const minY = Math.min(...ys);
              const maxY = Math.max(...ys);
              const centerX = (minX + maxX) / 2;
              const centerY = (minY + maxY) / 2;
              const faceWidth = maxX - minX;
              const centered =
                centerX >= 0.32 && centerX <= 0.68 &&
                centerY >= 0.22 && centerY <= 0.78 &&
                faceWidth >= 0.12;
              const nose = landmarks[1];
              const forward = Boolean(nose) && faceWidth > 0 &&
                Math.abs(nose.x - centerX) / faceWidth <= 0.12;

              tracker.framesWithFace += 1;
              if (centered) tracker.centeredFrames += 1;
              if (forward) tracker.forwardFrames += 1;
              tracker.wasFaceVisible = true;
              setFaceDetected(true);
              setFaceLookingForward(forward);
            }
          }

          faceAnimationFrameRef.current = window.requestAnimationFrame(analyzeFrame);
        };
        faceAnimationFrameRef.current = window.requestAnimationFrame(analyzeFrame);
      } catch {
        if (runId === faceDetectionRunRef.current) setFaceDetected(false);
      }
    }

    void startFaceAnalysis();

    return () => {
      faceDetectionRunRef.current += 1;
      if (faceAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(faceAnimationFrameRef.current);
        faceAnimationFrameRef.current = null;
      }
      faceLandmarker?.close();
    };
  }, [mediaStream]);

  useEffect(() => () => {
    isFinishingRef.current = true;
    isResponseRecordingRef.current = false;
    recognitionShouldRunRef.current = false;
    if (recognitionRestartTimerRef.current !== null) {
      window.clearTimeout(recognitionRestartTimerRef.current);
    }
    transcriptionAbortRef.current?.abort();
    recognitionRef.current?.abort();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  function saveTranscript(text: string, transcriptionProvider: TranscriptionProvider) {
    const normalizedText = text.trim();
    if (!current || !normalizedText || isFinishingRef.current) return;

    const finishedAt = getCurrentTimestamp();
    const recordingDurationMs = Math.max(1, finishedAt - recordingStartedAtRef.current);
    const wordCount = normalizedText.split(/\s+/).filter(Boolean).length;
    const wordsPerMinute = Math.round(wordCount / (recordingDurationMs / 60000));
    const result: InterviewAnswer = {
      questionId: current.id,
      question: current.question,
      answer: normalizedText,
      startedAt: recordingStartedAtRef.current,
      finishedAt,
      recordingDurationMs,
      transcriptionProvider,
      wordsPerMinute,
      fillerWords: countFillerWords(normalizedText),
      pauseMetrics: completedPauseMetricsRef.current,
    };

    const isLast = currentQuestionIndex === questions.length - 1;
    audioChunksRef.current = [];
    fallbackTranscriptRef.current = "";
    setLiveTranscript("");
    setResponseError("");
    setResponseState("ready");
    addAnswer(result);

    if (isLast) {
      completeInterview();
    }
  }

  async function transcribeOpenAIResponse() {
    const blob = new Blob(audioChunksRef.current, { type: recorderRef.current?.mimeType || "audio/webm" });
    audioChunksRef.current = [];

    if (blob.size === 0) {
      setResponseError("No se detectó audio. Revisa el micrófono e inténtalo nuevamente.");
      setResponseState("error");
      return;
    }
    if (blob.size > MAX_AUDIO_BYTES) {
      setResponseError("La respuesta supera el límite de 10 MB. Intenta responder en un fragmento más corto.");
      setResponseState("error");
      return;
    }

    const controller = new AbortController();
    transcriptionAbortRef.current = controller;
    const formData = new FormData();
    formData.append("file", new File([blob], "respuesta.webm", { type: blob.type || "audio/webm" }));

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const payload = await response.json() as { text?: string; error?: string };

      if (!response.ok || !payload.text) {
        throw new Error(payload.error || "No fue posible transcribir la respuesta.");
      }
      saveTranscript(payload.text, "openai");
    } catch (error) {
      if (isFinishingRef.current || (error instanceof DOMException && error.name === "AbortError")) return;
      const browserTranscript = `${fallbackTranscriptRef.current}${fallbackInterimRef.current}`.trim();
      if (browserTranscript) {
        saveTranscript(browserTranscript, "web-speech");
        return;
      }
      setResponseError(error instanceof Error ? error.message : "No fue posible transcribir la respuesta.");
      setResponseState("error");
    } finally {
      transcriptionAbortRef.current = null;
      recorderRef.current = null;
    }
  }

  function startWebSpeechRecognition(mode: "primary" | "fallback" = "primary") {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      if (mode === "primary") {
        setResponseError("Tu navegador no admite reconocimiento de voz. Usa Chrome o Edge, o configura OPENAI_API_KEY.");
        setResponseState("error");
      }
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalText = fallbackTranscriptRef.current;
      let interimText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) finalText += `${result[0].transcript} `;
        else interimText += result[0].transcript;
      }
      fallbackTranscriptRef.current = finalText;
      fallbackInterimRef.current = interimText;
      setLiveTranscript(`${finalText}${interimText}`.trim());
    };
    recognition.onerror = (event) => {
      if (isFinishingRef.current || event.error === "aborted") return;
      recognitionShouldRunRef.current = false;
      if (mode === "fallback") return;
      setResponseError(`El reconocimiento de voz falló: ${event.error}. Inténtalo nuevamente.`);
      setResponseState("error");
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      if (isFinishingRef.current) return;
      if (!userStoppedRecognitionRef.current) {
        if (!recognitionShouldRunRef.current) return;
        recognitionRestartTimerRef.current = window.setTimeout(() => {
          if (recognitionShouldRunRef.current && !isFinishingRef.current) {
            startWebSpeechRecognition(mode);
          }
        }, 250);
        return;
      }
      if (mode === "fallback") return;

      const transcript = `${fallbackTranscriptRef.current}${fallbackInterimRef.current}`.trim();
      if (!transcript) {
        setResponseError("No se detectó texto. Habla con claridad e inténtalo nuevamente.");
        setResponseState("error");
        return;
      }
      saveTranscript(transcript, "web-speech");
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      recognitionShouldRunRef.current = true;
      setResponseState("recording");
    } catch {
      setResponseError("No se pudo iniciar el reconocimiento de voz. Inténtalo nuevamente.");
      setResponseState("error");
    }
  }

  function startOpenAIRecording() {
    if (!mediaStream || typeof MediaRecorder === "undefined") {
      setResponseError("Tu navegador no admite grabación de audio. Usa Chrome o Edge.");
      setResponseState("error");
      return;
    }

    const audioTracks = mediaStream.getAudioTracks();
    if (audioTracks.length === 0) {
      setResponseError("No se encontró un track de micrófono activo. Vuelve a la preparación e inténtalo nuevamente.");
      setResponseState("error");
      return;
    }

    const mimeType = getSupportedRecorderMimeType();
    let recorder: MediaRecorder;
    try {
      const audioOnlyStream = new MediaStream(audioTracks);
      recorder = new MediaRecorder(audioOnlyStream, mimeType ? { mimeType } : undefined);
    } catch {
      setResponseError("No se pudo iniciar la grabación de audio. Usa Chrome o Edge e inténtalo nuevamente.");
      setResponseState("error");
      return;
    }
    audioChunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunksRef.current.push(event.data);
    };
    recorder.onerror = () => {
      setResponseError("La grabación de audio se interrumpió. Inténtalo nuevamente.");
      setResponseState("error");
    };
    recorder.onstop = () => {
      if (!isFinishingRef.current) void transcribeOpenAIResponse();
    };
    recorderRef.current = recorder;
    try {
      recorder.start();
      startWebSpeechRecognition("fallback");
      setResponseState("recording");
    } catch {
      recorderRef.current = null;
      setResponseError("El navegador no pudo comenzar a grabar el micrófono. Inténtalo nuevamente.");
      setResponseState("error");
    }
  }

  function startResponse() {
    if (!mediaStream || provider === "loading") return;
    isFinishingRef.current = false;
    recordingStartedAtRef.current = getCurrentTimestamp();
    fallbackTranscriptRef.current = "";
    fallbackInterimRef.current = "";
    userStoppedRecognitionRef.current = false;
    recognitionShouldRunRef.current = true;
    setLiveTranscript("");
    setResponseError("");
    startAudioTracking();

    if (provider === "openai") startOpenAIRecording();
    else startWebSpeechRecognition();
  }

  function startAudioTracking() {
    isResponseRecordingRef.current = true;
    pauseTrackerRef.current = { hasSpoken: false, pauses: [] };
    completedPauseMetricsRef.current = EMPTY_PAUSE_METRICS;
  }

  function stopAudioTracking() {
    isResponseRecordingRef.current = false;
    completedPauseMetricsRef.current = buildPauseMetrics(pauseTrackerRef.current.pauses);
  }

  function stopResponse() {
    if (responseState !== "recording") return;
    setResponseState("transcribing");
    stopAudioTracking();

    if (provider === "openai") {
      recorderRef.current?.stop();
      recognitionShouldRunRef.current = false;
      recognitionRef.current?.stop();
      return;
    }

    userStoppedRecognitionRef.current = true;
    recognitionShouldRunRef.current = false;
    recognitionRef.current?.stop();
  }

  function finish() {
    isFinishingRef.current = true;
    isResponseRecordingRef.current = false;
    recognitionShouldRunRef.current = false;
    transcriptionAbortRef.current?.abort();
    recognitionRef.current?.abort();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    completeInterview();
  }

  function completeInterview() {
    setVisionMetrics(buildVisionMetrics(faceTrackerRef.current));
    finishInterview();
    router.push("/results");
  }

  if (!current) return null;

  const isBusy = responseState === "recording" || responseState === "transcribing";

  return (
    <main className="shell">
      <div className="container">
        <AppHeader />
        <div className="interview-layout">
          <section className="video-panel">
            <video ref={videoRef} className="interview-video" autoPlay muted playsInline />
            <div className="video-top">
              <span>● Cámara en vivo</span>
              <span>◷ {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span>
            </div>
            <div className={`camera-attention ${faceDetected ? (faceLookingForward ? "camera-attention-ok" : "camera-attention-warning") : "camera-attention-error"}`}>
              <span className="camera-attention-dot" />
              {faceDetected
                ? (faceLookingForward ? "Mirando a cámara" : "Alinea tu mirada con la cámara")
                : "No se detecta tu rostro"}
            </div>
            <div className="video-bottom">
              <span>Vista del candidato</span>
              <span className="live-audio"><i className="dot" /> {faceDetected ? "Rostro detectado" : "Buscando rostro"}</span>
            </div>
          </section>

          <section className="side-panel card">
            <span className="eyebrow">Entrevistador virtual</span>
            <div className="progress"><span style={{ width: `${progress}%` }} /></div>
            <p className="small">Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
            <h1 className="question">{current.question}</h1>
            <div className="mic"><span className="dot" /> {audioLevel > 2 ? "Detectando voz" : "Micrófono activo"}</div>
            <div className="audio-meter interview-meter" aria-label={`Nivel de micrófono: ${audioLevel}%`}><span style={{ width: `${audioLevel}%` }} /></div>

            <section className="response-control" aria-live="polite">
              <p className="small">
                {responseState === "recording"
                  ? "Grabando tu respuesta…"
                  : responseState === "transcribing"
                    ? "Transcribiendo respuesta…"
                    : provider === "openai"
                      ? "Transcripción segura con OpenAI"
                      : provider === "web-speech"
                        ? "Transcripción mediante tu navegador"
                        : "Preparando transcripción…"}
              </p>
              {liveTranscript && <p className="live-transcript">{liveTranscript}</p>}
              {responseError && <p className="device-error" role="alert">{responseError}</p>}
              {responseState === "recording" ? (
                <button className="button button-primary button-full" onClick={stopResponse}>
                  Terminar respuesta
                </button>
              ) : (
                <button className="button button-primary button-full" onClick={startResponse} disabled={provider === "loading" || responseState === "transcribing"}>
                  {responseState === "error" ? "Reintentar respuesta" : "Iniciar respuesta"}
                </button>
              )}
            </section>

            <div className="actions" style={{ justifyContent: "flex-start" }}>
              <button className="button button-danger" onClick={finish} disabled={isBusy}>Finalizar entrevista</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
