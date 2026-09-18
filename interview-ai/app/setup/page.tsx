"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";

import { AppHeader } from "@/components/AppHeader";
import { useInterviewStore } from "@/store/interviewStore";

type CheckState = "idle" | "checking" | "ready" | "error";
type LightingState = "idle" | "checking" | "low" | "ok" | "high";

function getDeviceErrorMessage(error: unknown) {
  if (!(error instanceof DOMException)) {
    return "No fue posible acceder a tus dispositivos. Inténtalo nuevamente.";
  }

  if (error.name === "NotAllowedError") {
    return "El acceso fue bloqueado. Habilita cámara y micrófono en los permisos del navegador.";
  }
  if (error.name === "NotFoundError") {
    return "No se encontró una cámara o micrófono compatible.";
  }
  if (error.name === "NotReadableError") {
    return "El dispositivo está siendo usado por otra aplicación. Ciérrala e inténtalo de nuevo.";
  }

  return "No fue posible iniciar la cámara y el micrófono.";
}

export default function SetupPage() {
  const router = useRouter();
  const config = useInterviewStore((state) => state.config);
  const beginInterview = useInterviewStore((state) => state.beginInterview);
  const setMediaStream = useInterviewStore((state) => state.setMediaStream);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const preserveStreamRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const faceAnimationFrameRef = useRef<number | null>(null);
  const lightingAnimationFrameRef = useRef<number | null>(null);
  const faceDetectionRunRef = useRef(0);
  const lightingRunRef = useRef(0);
  const lastMeterUpdateRef = useRef(0);
  const lastFaceUpdateRef = useRef(0);
  const lastLightingUpdateRef = useRef(0);
  const [cameraState, setCameraState] = useState<CheckState>("idle");
  const [microphoneState, setMicrophoneState] = useState<CheckState>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioSignalDetected, setAudioSignalDetected] = useState(false);
  const [faceState, setFaceState] = useState<CheckState>("idle");
  const [faceCentered, setFaceCentered] = useState(false);
  const [lightingState, setLightingState] = useState<LightingState>("idle");
  const [brightness, setBrightness] = useState(0);
  const [error, setError] = useState("");
  const [faceError, setFaceError] = useState("");

  const releaseFaceLandmarker = useCallback(() => {
    faceDetectionRunRef.current += 1;
    if (faceAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(faceAnimationFrameRef.current);
      faceAnimationFrameRef.current = null;
    }
    faceLandmarkerRef.current?.close();
    faceLandmarkerRef.current = null;
  }, []);

  const releaseLightingAnalysis = useCallback(() => {
    lightingRunRef.current += 1;
    if (lightingAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(lightingAnimationFrameRef.current);
      lightingAnimationFrameRef.current = null;
    }
  }, []);

  const releaseDevices = useCallback(() => {
    releaseFaceLandmarker();
    releaseLightingAnalysis();
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (!preserveStreamRef.current) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    }
    streamRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
  }, [releaseFaceLandmarker, releaseLightingAnalysis]);

  useEffect(() => releaseDevices, [releaseDevices]);

  async function startFaceDetection() {
    const video = videoRef.current;
    if (!video) return;
    const runId = faceDetectionRunRef.current + 1;
    faceDetectionRunRef.current = runId;

    setFaceState("checking");
    setFaceCentered(false);
    setFaceError("");

    try {
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm",
      );
      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
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
        faceLandmarker.close();
        return;
      }
      faceLandmarkerRef.current = faceLandmarker;

      const analyzeFrame = (timestamp: number) => {
        if (runId !== faceDetectionRunRef.current) return;
        if (
          faceLandmarkerRef.current &&
          video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          timestamp - lastFaceUpdateRef.current > 150
        ) {
          lastFaceUpdateRef.current = timestamp;
          const result = faceLandmarkerRef.current.detectForVideo(video, timestamp);
          const landmarks = result.faceLandmarks[0];

          if (!landmarks) {
            setFaceState("checking");
            setFaceCentered(false);
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

            setFaceState("ready");
            setFaceCentered(centered);
          }
        }
        faceAnimationFrameRef.current = window.requestAnimationFrame(analyzeFrame);
      };
      faceAnimationFrameRef.current = window.requestAnimationFrame(analyzeFrame);
    } catch {
      if (runId !== faceDetectionRunRef.current) return;
      releaseFaceLandmarker();
      setFaceState("error");
      setFaceError("No se pudo cargar el análisis facial. Revisa tu conexión e inténtalo nuevamente.");
    }
  }

  function startLightingAnalysis() {
    const video = videoRef.current;
    if (!video) return;
    const runId = lightingRunRef.current + 1;
    lightingRunRef.current = runId;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) return;
    canvas.width = 64;
    canvas.height = 48;
    setLightingState("checking");

    const analyzeFrame = (timestamp: number) => {
      if (runId !== lightingRunRef.current) return;

      if (
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        timestamp - lastLightingUpdateRef.current > 500
      ) {
        lastLightingUpdateRef.current = timestamp;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let luminanceTotal = 0;

        for (let index = 0; index < pixels.length; index += 4) {
          luminanceTotal +=
            pixels[index] * 0.2126 +
            pixels[index + 1] * 0.7152 +
            pixels[index + 2] * 0.0722;
        }

        const average = Math.round(luminanceTotal / (pixels.length / 4));
        setBrightness(average);
        setLightingState(average < 55 ? "low" : average > 205 ? "high" : "ok");
      }

      lightingAnimationFrameRef.current = window.requestAnimationFrame(analyzeFrame);
    };
    lightingAnimationFrameRef.current = window.requestAnimationFrame(analyzeFrame);
  }

  async function requestDevices() {
    preserveStreamRef.current = false;
    releaseDevices();
    setError("");
    setAudioLevel(0);
    setAudioSignalDetected(false);
    setBrightness(0);
    setLightingState("idle");
    setFaceError("");
    setCameraState("checking");
    setMicrophoneState("checking");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("MediaDevices no está disponible");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState(stream.getVideoTracks().length ? "ready" : "error");
      setMicrophoneState(stream.getAudioTracks().length ? "ready" : "error");

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      await audioContext.resume();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);

      const updateMeter = (timestamp: number) => {
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const sample of samples) {
          const normalized = (sample - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / samples.length);
        const level = Math.min(100, Math.round(rms * 550));

        if (timestamp - lastMeterUpdateRef.current > 100) {
          lastMeterUpdateRef.current = timestamp;
          setAudioLevel(level);
          setAudioSignalDetected(rms > 0.012);
        }
        animationFrameRef.current = window.requestAnimationFrame(updateMeter);
      };
      animationFrameRef.current = window.requestAnimationFrame(updateMeter);
      void startFaceDetection();
      startLightingAnalysis();
    } catch (caughtError) {
      releaseDevices();
      setCameraState("error");
      setMicrophoneState("error");
      setError(getDeviceErrorMessage(caughtError));
    }
  }

  function start() {
    if (!streamRef.current) return;
    preserveStreamRef.current = true;
    setMediaStream(streamRef.current);
    beginInterview();
    router.push("/interview");
  }

  const devicesReady =
    cameraState === "ready" &&
    microphoneState === "ready" &&
    faceState === "ready" &&
    faceCentered;

  return (
    <main className="shell">
      <div className="container">
        <AppHeader />
        <section className="page-head">
          <span className="eyebrow">Paso 1 de 2</span>
          <h1 className="page-title">Preparación de entrevista</h1>
          <p className="lead">Verifica tu cámara y micrófono antes de comenzar: {config.title}.</p>
        </section>

        <section className="setup-layout">
          <article className="camera-card card">
            <div className="title-row">
              <div>
                <span className="eyebrow">Vista previa</span>
                <h2>Cámara del candidato</h2>
              </div>
              {cameraState === "ready" && <span className="pill">● En vivo</span>}
            </div>
            <div className="camera-preview">
              <video ref={videoRef} autoPlay muted playsInline />
              {cameraState !== "ready" && (
                <div className="camera-placeholder">
                  <span>◉</span>
                  <p>{cameraState === "checking" ? "Conectando dispositivos…" : "Activa la cámara para ver tu imagen"}</p>
                </div>
              )}
            </div>
            <button className="button button-secondary button-full" onClick={requestDevices} disabled={cameraState === "checking"}>
              {devicesReady ? "Volver a comprobar dispositivos" : "Activar cámara y micrófono"}
            </button>
            {(error || faceError) && <p className="device-error" role="alert">{error || faceError}</p>}
          </article>

          <div className="checks-column">
            <article className="status-card card">
              <div className="status-row"><h3>Cámara</h3><StatusBadge state={cameraState} /></div>
              <p>{cameraState === "ready" ? "Cámara detectada y transmitiendo video." : "Necesitamos permiso para usar tu cámara."}</p>
            </article>
            <article className="status-card card">
              <div className="status-row"><h3>Micrófono</h3><StatusBadge state={microphoneState} /></div>
              <p>{microphoneState === "ready" ? (audioSignalDetected ? "Se detecta señal de audio." : "Habla para comprobar la señal de audio.") : "Necesitamos permiso para usar tu micrófono."}</p>
              <div className="audio-meter" aria-label={`Nivel de micrófono: ${audioLevel}%`}><span style={{ width: `${audioLevel}%` }} /></div>
            </article>
            <article className="status-card card">
              <div className="status-row"><h3>Rostro y encuadre</h3><StatusBadge state={faceState} /></div>
              <p>{faceState === "ready" ? (faceCentered ? "Rostro detectado y correctamente centrado." : "Rostro detectado. Colócate en el centro del encuadre.") : "Buscando un rostro visible frente a la cámara."}</p>
            </article>
            <article className="status-card card">
              <div className="status-row"><h3>Iluminación</h3><LightingBadge state={lightingState} /></div>
              <p>{getLightingMessage(lightingState, brightness)}</p>
            </article>
          </div>
        </section>

        <p className="notice">La cámara y el micrófono se usan únicamente durante esta sesión de práctica. No se guardan grabaciones en esta fase.</p>
        <div className="actions">
          <button className="button button-secondary" onClick={() => router.push("/")}>Volver</button>
          <button className="button button-primary" onClick={start} disabled={!devicesReady}>Comenzar entrevista</button>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ state }: { state: CheckState }) {
  if (state === "ready") return <span className="ok">✓ Correcto</span>;
  if (state === "checking") return <span className="status-wait">Comprobando…</span>;
  if (state === "error") return <span className="status-error">Revisar</span>;
  return <span className="status-wait">Pendiente</span>;
}

function LightingBadge({ state }: { state: LightingState }) {
  if (state === "ok") return <span className="ok">✓ Adecuada</span>;
  if (state === "low") return <span className="status-error">Poca luz</span>;
  if (state === "high") return <span className="status-error">Mucha luz</span>;
  return <span className="status-wait">{state === "checking" ? "Analizando…" : "Pendiente"}</span>;
}

function getLightingMessage(state: LightingState, value: number) {
  if (state === "low") return `Brillo promedio: ${value}/255. Busca una fuente de luz frente a ti.`;
  if (state === "high") return `Brillo promedio: ${value}/255. Reduce la luz directa o a contraluz.`;
  if (state === "ok") return `Brillo promedio: ${value}/255. La iluminación es adecuada.`;
  return "Analizaremos la iluminación cuando la cámara esté activa.";
}
