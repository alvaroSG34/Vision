import type { InterviewConfig } from "@/types/interview";

export const interviews: InterviewConfig[] = [
  {
    id: "backend-junior",
    title: "Backend Developer Junior",
    description:
      "Practica una entrevista técnica inicial para un perfil backend junior.",
    durationMinutes: 10,
    openingQuestion:
      "Cuéntame un poco sobre ti, tu formación y tu experiencia.",
    technicalQuestions: [
      {
        id: "rest-api",
        question: "¿Qué es una API REST?",
        expectedCriteria: ["HTTP", "endpoint", "request", "response"],
        maxFollowUps: 1,
      },
      {
        id: "get-post",
        question: "¿Cuál es la diferencia entre GET y POST?",
        expectedCriteria: ["lectura", "creación", "request body", "idempotencia"],
        maxFollowUps: 1,
      },
      {
        id: "databases",
        question: "¿Qué experiencia tienes trabajando con bases de datos?",
        expectedCriteria: ["SQL", "consultas", "modelo relacional", "índices"],
        maxFollowUps: 1,
      },
    ],
  },
];

export const defaultInterview = interviews[0];
