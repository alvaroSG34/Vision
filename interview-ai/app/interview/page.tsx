"use client";

import { useEffect, useMemo, useState } from "react";
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
  const addAnswer = useInterviewStore((state) => state.addAnswer);
  const finishInterview = useInterviewStore((state) => state.finishInterview);
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(0);

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
    const id = window.setInterval(() => setSeconds(Math.floor((Date.now() - (startedAt ?? Date.now())) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);

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

  if (!current) {
    return null;
  }

  return (
    <main className="shell">
      <div className="container">
        <AppHeader />
        <div className="interview-layout">
          <section className="video-panel">
            <div className="video-top">
              <span>● Cámara simulada</span>
              <span>◷ {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span>
            </div>
            <div className="avatar">◉</div>
            <p>Vista del candidato</p>
          </section>

          <section className="side-panel card">
            <span className="eyebrow">Entrevistador virtual</span>
            <div className="progress"><span style={{ width: `${progress}%` }} /></div>
            <p className="small">Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
            <h1 className="question">{current.question}</h1>
            <div className="mic"><span className="dot" /> Escuchando (simulado)</div>
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
