"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { useInterviewStore } from "@/store/interviewStore";

export default function ResultsPage() {
  const router = useRouter();
  const config = useInterviewStore((state) => state.config);
  const answers = useInterviewStore((state) => state.answers);
  const startedAt = useInterviewStore((state) => state.startedAt);
  const finishedAt = useInterviewStore((state) => state.finishedAt);
  const reset = useInterviewStore((state) => state.reset);

  const duration = startedAt && finishedAt
    ? Math.max(1, Math.round((finishedAt - startedAt) / 60000))
    : 0;
  const totals = useMemo(() => {
    const count = answers.length || 1;
    return {
      wpm: Math.round(answers.reduce((sum, item) => sum + item.wordsPerMinute, 0) / count),
      fillers: answers.reduce((sum, item) => sum + item.fillerWords.total, 0),
      longPauses: answers.reduce((sum, item) => sum + item.pauseMetrics.longPauses, 0),
    };
  }, [answers]);

  function restart() {
    reset();
    router.push("/");
  }

  return (
    <main className="shell">
      <div className="container">
        <AppHeader />
        <section className="page-head">
          <span className="eyebrow">Entrevista finalizada</span>
          <h1 className="page-title">Tu resumen de práctica</h1>
          <p className="lead">{config.title} · Respuestas transcritas durante la sesión de práctica.</p>
        </section>

        <section className="results-grid">
          <article className="metric card"><span>Duración</span><strong>{duration} min</strong></article>
          <article className="metric card"><span>Ritmo promedio</span><strong>{totals.wpm || "—"} ppm</strong></article>
          <article className="metric card"><span>Muletillas</span><strong>{totals.fillers}</strong><small>Detectadas en transcripción</small></article>
          <article className="metric card"><span>Pausas largas</span><strong>{totals.longPauses}</strong><small>2 segundos o más</small></article>
        </section>

        <section className="section card">
          <h2>Resumen general</h2>
          <p className="lead">
            Completaste {answers.length} de {config.technicalQuestions.length + 1} preguntas. El ritmo, las muletillas y las pausas se calculan a partir de datos observables de la sesión.
          </p>
        </section>

        <section className="section card">
          <h2>Recomendaciones</h2>
          <ul className="feedback-list">
            <li>Da un ejemplo concreto al explicar conceptos técnicos.</li>
            <li>Estructura cada respuesta con contexto, acción y resultado.</li>
            <li>Revisa las métricas cuando estén conectados el audio y la cámara reales.</li>
          </ul>
        </section>

        <section className="section card">
          <h2>Respuestas por pregunta</h2>
          {answers.length === 0 ? (
            <p className="lead">No hay respuestas registradas. Puedes iniciar una nueva práctica cuando quieras.</p>
          ) : answers.map((item) => (
            <article className="answer-card" key={item.questionId}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
              <span className="score">
                {item.wordsPerMinute} ppm · {Math.max(1, Math.round(item.recordingDurationMs / 1000))} s · {item.transcriptionProvider === "openai" ? "OpenAI" : "Navegador"}
              </span>
              <p className="small">
                Muletillas: {item.fillerWords.total} · Pausas: {item.pauseMetrics.totalPauses} · Pausas largas: {item.pauseMetrics.longPauses}
              </p>
              {item.evaluation && <p className="small">Claridad: {item.evaluation.clarity}/10 · Relevancia: {item.evaluation.relevance}/10</p>}
            </article>
          ))}
        </section>

        <div className="actions">
          <button className="button button-primary" onClick={restart}>Practicar otra vez</button>
        </div>
      </div>
    </main>
  );
}
