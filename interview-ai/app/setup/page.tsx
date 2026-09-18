"use client";

import { useRouter } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { useInterviewStore } from "@/store/interviewStore";

const checks = [
  ["Cámara", "Detectada y lista para usarse"],
  ["Rostro", "Detectado y correctamente centrado"],
  ["Iluminación", "Adecuada para el análisis visual"],
  ["Micrófono", "Detectado con señal de audio"],
];

export default function SetupPage() {
  const router = useRouter();
  const config = useInterviewStore((state) => state.config);
  const beginInterview = useInterviewStore((state) => state.beginInterview);

  function start() {
    beginInterview();
    router.push("/interview");
  }

  return (
    <main className="shell">
      <div className="container">
        <AppHeader />
        <section className="page-head">
          <span className="eyebrow">Paso 1 de 2</span>
          <h1 className="page-title">Preparación de entrevista</h1>
          <p className="lead">Verificamos los elementos básicos antes de comenzar: {config.title}.</p>
        </section>

        <section className="grid">
          {checks.map(([title, description]) => (
            <article className="status-card card" key={title}>
              <div className="status-row">
                <h3>{title}</h3>
                <span className="ok">✓ Correcto</span>
              </div>
              <p>{description}</p>
            </article>
          ))}
        </section>

        <p className="notice">
          Esta versión utiliza estados simulados. En la siguiente fase se conectarán la cámara,
          el micrófono y MediaPipe para realizar estas verificaciones con dispositivos reales.
        </p>
        <div className="actions">
          <button className="button button-secondary" onClick={() => router.push("/")}>
            Volver
          </button>
          <button className="button button-primary" onClick={start}>
            Comenzar entrevista
          </button>
        </div>
      </div>
    </main>
  );
}
