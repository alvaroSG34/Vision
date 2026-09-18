"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { useInterviewStore } from "@/store/interviewStore";
import type { InterviewAnswer } from "@/types/interview";

function createMockEvaluation(answer: string) {
  const complete = answer.trim().length > 80;
  return {
    clarity: complete ? 8 : 6,
    technicalAccuracy: complete ? 7 : 6,
    relevance: complete ? 8 : 7,
    strengths: ["La respuesta aborda el tema de la pregunta."],
    improvements: ["Incluye un ejemplo concreto para profundizar la explicación."],
  };
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamCleanupTimerRef = useRef<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

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
      void video.play();
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
        setAudioLevel(Math.min(100, Math.round(Math.sqrt(sum / samples.length) * 550)));
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

  function finish() {
    finishInterview();
    router.push("/results");
  }

  function saveAnswer() {
    if (!current) return finish();
    const text = answer.trim() || "No se registró una respuesta para esta pregunta.";
    const result: InterviewAnswer = {
      questionId: current.id,
      question: current.question,
      answer: text,
      startedAt: Date.now() - 45000,
      finishedAt: Date.now(),
      wordsPerMinute: text.split(/\s+/).filter(Boolean).length * 1.33,
      fillerCount: 1,
      longPauseCount: 0,
      evaluation: createMockEvaluation(text),
    };

    const isLast = currentQuestionIndex === questions.length - 1;
    setAnswer("");
    addAnswer(result);
    if (isLast) finish();
  }

  if (!current) return null;

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
            <div className="video-bottom">
              <span>Vista del candidato</span>
              <span className="live-audio"><i className="dot" /> Micrófono activo</span>
            </div>
          </section>

          <section className="side-panel card">
            <span className="eyebrow">Entrevistador virtual</span>
            <div className="progress"><span style={{ width: `${progress}%` }} /></div>
            <p className="small">Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
            <h1 className="question">{current.question}</h1>
            <div className="mic"><span className="dot" /> {audioLevel > 2 ? "Detectando voz" : "Micrófono activo"}</div>
            <div className="audio-meter interview-meter" aria-label={`Nivel de micrófono: ${audioLevel}%`}><span style={{ width: `${audioLevel}%` }} /></div>
            <label className="small" htmlFor="answer">Respuesta de prueba</label>
            <textarea
              id="answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Escribe una respuesta para simular la transcripción..."
            />
            <div className="actions" style={{ justifyContent: "space-between" }}>
              <button className="button button-danger" onClick={finish}>Finalizar</button>
              <button className="button button-primary" onClick={saveAnswer}>
                {currentQuestionIndex === questions.length - 1 ? "Ver resultados" : "Siguiente pregunta"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
