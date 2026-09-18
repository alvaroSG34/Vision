"use client";

import { useRouter } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { interviews } from "@/config/interviews";
import { useInterviewStore } from "@/store/interviewStore";

export default function HomePage() {
  const router = useRouter();
  const selectInterview = useInterviewStore((state) => state.selectInterview);
  const interview = interviews[0];

  function prepareInterview() {
    selectInterview(interview);
    router.push("/setup");
  }

  return (
    <main className="shell">
      <div className="container">
        <AppHeader />
        <section className="hero">
          <span className="eyebrow">Simulador de entrevistas</span>
          <h1>Practica con claridad. Responde con confianza.</h1>
          <p>
            Simula una entrevista técnica y recibe feedback sobre tus respuestas,
            ritmo de comunicación y señales observables de la sesión.
          </p>
        </section>

        <section className="selection-card card">
          <div className="title-row">
            <div>
              <span className="eyebrow">Entrevista disponible</span>
              <h2>{interview.title}</h2>
              <p className="lead">{interview.description}</p>
            </div>
            <span className="pill">Inicial</span>
          </div>
          <div className="meta">
            <span>◷ {interview.durationMinutes} min aprox.</span>
            <span>⌘ {interview.technicalQuestions.length} preguntas técnicas</span>
          </div>
          <button className="button button-primary button-full" onClick={prepareInterview}>
            Preparar entrevista
          </button>
        </section>
      </div>
    </main>
  );
}
