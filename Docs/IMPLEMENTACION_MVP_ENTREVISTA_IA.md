# MVP — Simulador de Entrevistas con IA Multimodal

## 1. Objetivo del proyecto

Construir un **prototipo funcional de simulación de entrevistas laborales con Inteligencia Artificial** que permita:

1. Verificar que la cámara y el micrófono del usuario funcionen correctamente.
2. Iniciar una entrevista por voz con una IA.
3. Realizar una pregunta inicial abierta para conocer al candidato.
4. Mantener memoria contextual de lo dicho durante la entrevista.
5. Realizar preguntas técnicas previamente definidas.
6. Analizar de forma simultánea:
   - contenido de las respuestas;
   - ritmo del habla;
   - pausas;
   - muletillas;
   - volumen;
   - presencia del rostro;
   - encuadre;
   - orientación aproximada de la cabeza;
   - movimiento corporal/postura observable.
7. Generar una retroalimentación automática al finalizar.
8. Mostrar un resumen visual de la entrevista.

El MVP **NO tomará decisiones de contratación**, no clasificará candidatos para una empresa y no intentará inferir emociones, personalidad, honestidad, nerviosismo o estados mentales.

El propósito será exclusivamente:

> **Simular una entrevista laboral y proporcionar retroalimentación al candidato para que pueda mejorar.**

---

# 2. Alcance del MVP

## Incluido

- Pantalla inicial.
- Selección de una entrevista preconfigurada.
- Prueba de cámara.
- Prueba de micrófono.
- Detección de rostro.
- Verificación básica de iluminación/encuadre.
- Entrevista por voz con IA.
- Pregunta inicial abierta.
- Preguntas técnicas predefinidas.
- Repreguntas simples generadas por IA.
- Memoria de conversación durante la sesión.
- Transcripción de respuestas.
- Métricas de audio.
- Métricas visuales.
- Evaluación técnica de respuestas.
- Resumen final.
- Retroalimentación pregunta por pregunta.

## Fuera del MVP

No implementar inicialmente:

- Login.
- Registro.
- Recuperación de contraseña.
- Roles.
- Multiempresa.
- Panel administrativo.
- Pagos.
- Suscripciones.
- Emails.
- Integración con LinkedIn.
- Subida de CV.
- Matching con ofertas laborales.
- Ranking entre candidatos.
- Contratación automatizada.
- Base de datos compleja.
- Redis.
- BullMQ.
- Microservicios.
- Aplicación móvil.
- Grabación permanente de video.
- Reconocimiento de emociones.
- Detección de mentiras.
- Inferencias psicológicas.
- Análisis biométrico para identificar personas.

---

# 3. Stack tecnológico mínimo

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui opcional

## Cámara y micrófono

- MediaDevices API
- `navigator.mediaDevices.getUserMedia()`

## Audio

- Web Audio API

## Visión artificial

- MediaPipe Face Landmarker
- MediaPipe Pose Landmarker

## Inteligencia Artificial

- API de IA conversacional en tiempo real
- OpenAI Realtime API o equivalente
- Modelo LLM para evaluación de respuestas y generación de feedback

## Persistencia para MVP

Inicialmente:

- memoria del navegador;
- React State;
- Context/Zustand;
- `sessionStorage` o `localStorage`.

Una base de datos puede agregarse posteriormente.

## Gráficos

- Recharts

## Desarrollo

- Git
- GitHub
- Node.js
- npm / pnpm

---

# 4. Arquitectura general

```text
                         USUARIO
                            │
                            ▼
                    Next.js / React
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
       VIDEO              AUDIO           ENTREVISTA
          │                 │                 │
          ▼                 ▼                 ▼
      MediaPipe        Web Audio API      IA Realtime
   Face + Pose                │                 │
          │                   │                 │
          ▼                   ▼                 ▼
 Métricas visuales     Métricas audio     Conversación
          │                   │                 │
          └─────────────┬─────┴─────────────────┘
                        │
                        ▼
                Estado de entrevista
                        │
                        ▼
                 Evaluación con LLM
                        │
                        ▼
                  Reporte final
```

---

# 5. Flujo funcional del MVP

```text
INICIO
  │
  ▼
Seleccionar entrevista
  │
  ▼
Prueba de cámara y micrófono
  │
  ├── Error ──> corregir dispositivo
  │
  ▼
Ambos dispositivos correctos
  │
  ▼
Mostrar aviso de privacidad
  │
  ▼
Comenzar entrevista
  │
  ▼
IA se presenta
  │
  ▼
Pregunta abierta
  │
  ▼
Usuario responde
  │
  ├── análisis de audio
  ├── análisis de video
  ├── transcripción
  └── memoria contextual
  │
  ▼
Preguntas técnicas
  │
  ▼
Evaluación de cada respuesta
  │
  ▼
Última pregunta
  │
  ▼
IA se despide
  │
  ▼
Finalizar cámara/audio
  │
  ▼
Generar reporte
  │
  ▼
RESULTADOS
```

---

# 6. Pantallas del MVP

Se requieren solamente cuatro pantallas principales.

---

## Pantalla 1 — Inicio

Ruta:

```text
/
```

Objetivo:

Permitir seleccionar una entrevista disponible.

Ejemplo:

```text
Simulador de entrevistas con IA

Selecciona una entrevista:

[ Backend Developer Junior ]

Duración estimada: 10 minutos
Preguntas técnicas: 3

[ Preparar entrevista ]
```

Para el MVP puede existir solamente una entrevista.

---

## Pantalla 2 — Preparación

Ruta:

```text
/setup
```

Debe mostrar:

```text
Preparación de entrevista

Cámara
✅ Detectada

Rostro
✅ Detectado

Iluminación
✅ Adecuada

Micrófono
✅ Detectado

Volumen
✅ Adecuado

[ Comenzar entrevista ]
```

El botón debe habilitarse cuando:

```text
cameraReady === true
microphoneReady === true
faceDetected === true
```

La iluminación puede ser inicialmente solo una advertencia y no bloquear la entrevista.

---

## Pantalla 3 — Entrevista

Ruta:

```text
/interview
```

Debe contener:

- video del candidato;
- indicador de micrófono;
- estado de la IA;
- pregunta actual;
- duración;
- indicador de si la IA escucha;
- botón para finalizar manualmente.

Ejemplo:

```text
┌────────────────────────────────────────┐
│                                        │
│            VIDEO USUARIO               │
│                                        │
└────────────────────────────────────────┘

🤖 Entrevistador

"Cuéntame un poco sobre ti y tu experiencia."

🎙 Escuchando...

Pregunta 1 de 4
```

---

## Pantalla 4 — Resultados

Ruta:

```text
/results
```

Debe mostrar:

- resumen;
- métricas de audio;
- métricas visuales;
- análisis técnico;
- feedback por pregunta;
- recomendaciones.

---

# 7. Estructura inicial del proyecto

```text
/interview-ai

/app
    /page.tsx

    /setup
        page.tsx

    /interview
        page.tsx

    /results
        page.tsx

    /api
        /evaluate
            route.ts

        /feedback
            route.ts

        /realtime-token
            route.ts

/components

    /setup
        CameraCheck.tsx
        MicrophoneCheck.tsx
        SetupStatus.tsx

    /interview
        CameraPreview.tsx
        AudioLevel.tsx
        InterviewAgent.tsx
        QuestionDisplay.tsx
        InterviewTimer.tsx

    /results
        AudioResults.tsx
        VideoResults.tsx
        TechnicalResults.tsx
        FeedbackCard.tsx
        SummaryCard.tsx

/lib

    /audio
        audioAnalyzer.ts
        speechMetrics.ts
        fillerWords.ts

    /vision
        faceAnalyzer.ts
        poseAnalyzer.ts
        videoQuality.ts

    /ai
        realtimeClient.ts
        evaluateAnswer.ts
        generateFeedback.ts
        prompts.ts

    /interview
        interviewConfig.ts
        interviewMachine.ts
        interviewMemory.ts

/store
    interviewStore.ts

/types
    interview.ts
    audio.ts
    vision.ts
    results.ts

/config
    interviews.ts
```

---

# 8. Modelo de datos principal

Aunque no utilicemos base de datos, necesitamos estructuras claras.

## InterviewConfig

```typescript
export interface InterviewConfig {
  id: string;
  title: string;
  description: string;
  openingQuestion: string;
  technicalQuestions: TechnicalQuestion[];
}
```

## TechnicalQuestion

```typescript
export interface TechnicalQuestion {
  id: string;
  question: string;
  expectedCriteria: string[];
  maxFollowUps?: number;
}
```

Ejemplo:

```typescript
const interview: InterviewConfig = {
  id: "backend-junior",
  title: "Backend Developer Junior",
  description: "Entrevista técnica básica para desarrolladores backend.",
  openingQuestion: "Cuéntame un poco sobre ti y tu experiencia.",
  technicalQuestions: [
    {
      id: "q1",
      question: "¿Qué es una API REST?",
      expectedCriteria: [
        "HTTP",
        "endpoints",
        "request",
        "response"
      ],
      maxFollowUps: 1
    },
    {
      id: "q2",
      question: "¿Qué experiencia tienes trabajando con bases de datos?",
      expectedCriteria: [
        "SQL",
        "consultas",
        "bases de datos relacionales"
      ],
      maxFollowUps: 1
    }
  ]
};
```

---

# 9. Estado global de la entrevista

Usar Zustand, Context API o un reducer.

Ejemplo:

```typescript
interface InterviewState {
  interviewId: string;

  status:
    | "setup"
    | "ready"
    | "introducing"
    | "asking"
    | "listening"
    | "evaluating"
    | "finished";

  currentQuestionIndex: number;

  conversation: ConversationMessage[];

  answers: InterviewAnswer[];

  audioMetrics: AudioMetrics;

  visionMetrics: VisionMetrics;

  startedAt?: number;
  finishedAt?: number;
}
```

---

# 10. Máquina de estados recomendada

Evitar manejar la entrevista únicamente con muchos `if`.

Usar una lógica explícita:

```text
SETUP
  │
  ▼
READY
  │
  ▼
INTRODUCING
  │
  ▼
ASKING
  │
  ▼
LISTENING
  │
  ▼
PROCESSING
  │
  ├── existe otra pregunta ──> ASKING
  │
  └── última pregunta ───────> FINISHING
                                │
                                ▼
                              FINISHED
```

Estados:

```typescript
type InterviewStatus =
  | "SETUP"
  | "READY"
  | "INTRODUCING"
  | "ASKING"
  | "LISTENING"
  | "PROCESSING"
  | "FINISHING"
  | "FINISHED";
```

---

# 11. Módulo 1 — Configuración de entrevistas

## Objetivo

Definir entrevistas sin necesidad de panel administrativo.

Archivo:

```text
/config/interviews.ts
```

Ejemplo:

```typescript
export const interviews = [
  {
    id: "backend-junior",
    title: "Backend Developer Junior",
    openingQuestion:
      "Cuéntame un poco sobre ti, tu formación y tu experiencia.",
    technicalQuestions: [
      {
        id: "rest-api",
        question: "¿Qué es una API REST?",
        expectedCriteria: [
          "HTTP",
          "endpoint",
          "request",
          "response"
        ]
      }
    ]
  }
];
```

## Criterio de aceptación

Se debe poder modificar una pregunta editando solamente el archivo de configuración.

---

# 12. Módulo 2 — Captura de cámara y micrófono

## Objetivo

Obtener permisos y mostrar los dispositivos.

### Código conceptual

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});
```

Separar tracks:

```typescript
const videoTrack = stream.getVideoTracks()[0];
const audioTrack = stream.getAudioTracks()[0];
```

## Validaciones

Cámara:

```text
cameraAvailable
videoPlaying
faceDetected
```

Micrófono:

```text
microphoneAvailable
audioSignalDetected
```

## Errores

Manejar:

```text
NotAllowedError
NotFoundError
NotReadableError
```

Mostrar mensajes comprensibles.

---

# 13. Módulo 3 — Calidad del video

## Objetivo

Comprobar antes de comenzar:

- cámara activa;
- rostro visible;
- iluminación razonable;
- usuario aproximadamente centrado.

## Primera versión

No intentar calcular una "calidad profesional".

Solo:

```text
hasVideo
faceDetected
brightnessLevel
faceCentered
```

## Resultado

```typescript
interface VideoQualityResult {
  cameraDetected: boolean;
  faceDetected: boolean;
  centered: boolean;
  brightness: number;
  brightnessStatus: "LOW" | "OK" | "HIGH";
}
```

---

# 14. Módulo 4 — Face Landmarker

## Objetivo

Analizar el rostro durante la entrevista.

Medir exclusivamente señales observables.

## Métricas MVP

```text
porcentaje de frames con rostro
porcentaje de frames centrado
porcentaje aproximado mirando hacia delante
cantidad de veces que desaparece el rostro
```

## Estructura

```typescript
interface FaceMetrics {
  totalFrames: number;
  framesWithFace: number;
  centeredFrames: number;
  forwardFrames: number;
  faceLostEvents: number;
}
```

## Cálculos

```typescript
faceVisiblePercentage =
  framesWithFace / totalFrames * 100;
```

```typescript
centeredPercentage =
  centeredFrames / framesWithFace * 100;
```

No guardar cada landmark permanentemente.

Procesar y acumular métricas.

---

# 15. Módulo 5 — Pose Landmarker

## Objetivo

Analizar cambios de postura y movimiento.

## Métricas sencillas

- torso visible;
- hombros visibles;
- cambios importantes de posición;
- movimiento corporal aproximado.

Estructura:

```typescript
interface PoseMetrics {
  totalFrames: number;
  bodyVisibleFrames: number;
  significantMovementEvents: number;
  averageMovement: number;
}
```

No producir conclusiones como:

```text
"estaba nervioso"
"estaba inseguro"
```

El feedback debe decir:

```text
"Se detectaron movimientos corporales frecuentes."
```

---

# 16. Módulo 6 — Análisis de audio

## Objetivo

Capturar métricas mientras el usuario habla.

Usar:

```text
Web Audio API
AudioContext
AnalyserNode
```

## Métricas

```typescript
interface AudioMetrics {
  averageVolume: number;
  peakVolume: number;
  speakingDurationMs: number;
  silenceDurationMs: number;
  longPauseCount: number;
}
```

## Detectar voz/silencio

Primera versión:

```text
amplitud > threshold
=> hablando

amplitud <= threshold
=> silencio
```

El threshold deberá calibrarse mediante pruebas.

---

# 17. Módulo 7 — Transcripción

Toda respuesta debe terminar convertida a texto.

Ejemplo:

```typescript
interface TranscriptSegment {
  startMs: number;
  endMs: number;
  text: string;
}
```

Resultado:

```text
"Trabajé durante dos años desarrollando aplicaciones..."
```

Guardar:

- texto;
- duración;
- timestamps si están disponibles.

---

# 18. Módulo 8 — Velocidad del habla

Fórmula:

```text
palabras por minuto =
cantidad de palabras /
duración hablada en minutos
```

Ejemplo:

```text
260 palabras
120 segundos

260 / 2 = 130 palabras/minuto
```

Implementación:

```typescript
function calculateWordsPerMinute(
  transcript: string,
  speakingDurationSeconds: number
) {
  const words = transcript
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return words / (speakingDurationSeconds / 60);
}
```

No etiquetar automáticamente como bueno o malo.

Mostrar primero el dato:

```text
Ritmo promedio: 132 palabras/minuto
```

---

# 19. Módulo 9 — Muletillas

Configurar una lista inicial para español.

```typescript
const fillerWords = [
  "eh",
  "emm",
  "mmm",
  "este",
  "bueno",
  "o sea",
  "digamos"
];
```

Resultado:

```typescript
interface FillerWordResult {
  total: number;
  items: {
    phrase: string;
    count: number;
  }[];
}
```

Ejemplo:

```json
{
  "total": 8,
  "items": [
    {
      "phrase": "este",
      "count": 5
    },
    {
      "phrase": "eh",
      "count": 3
    }
  ]
}
```

---

# 20. Módulo 10 — Pausas

Definir inicialmente:

```text
pausa normal:
< 2 segundos

pausa larga:
>= 2 segundos
```

Este valor es configurable.

Guardar:

```typescript
interface PauseMetrics {
  totalPauses: number;
  longPauses: number;
  averagePauseMs: number;
  longestPauseMs: number;
}
```

---

# 21. Módulo 11 — IA conversacional

## Objetivo

Permitir que la IA actúe como entrevistador.

La IA debe:

1. presentarse;
2. explicar la dinámica;
3. iniciar con una pregunta abierta;
4. escuchar;
5. utilizar información previa;
6. pasar a preguntas técnicas;
7. realizar como máximo una repregunta por pregunta en el MVP;
8. cerrar la entrevista.

---

# 22. Prompt base del entrevistador

Ejemplo conceptual:

```text
Eres un entrevistador virtual para una simulación laboral.

Tu función es realizar una entrevista profesional y natural.

Reglas:

- No evalúes al candidato verbalmente durante la entrevista.
- No digas si una respuesta está correcta o incorrecta.
- Sé cordial y profesional.
- Haz una sola pregunta a la vez.
- Recuerda información que el candidato haya mencionado.
- Puedes hacer una repregunta corta si ayuda a profundizar.
- Después continúa con las preguntas obligatorias.
- No inventes experiencia que el candidato no haya mencionado.
- No realices inferencias psicológicas.
- No evalúes apariencia física.
- Finaliza cuando se hayan completado todas las preguntas.
```

---

# 23. Presentación inicial de la IA

Ejemplo:

```text
Hola. Soy tu entrevistador virtual.

Esta es una simulación de entrevista laboral diseñada para ayudarte
a practicar y recibir retroalimentación.

Durante la entrevista analizaremos tus respuestas, algunas métricas
de voz y señales visuales observables como el encuadre y el movimiento.

Comencemos.

Cuéntame un poco sobre ti, tu formación y tu experiencia.
```

No afirmar:

```text
"Esta información jamás será compartida"
```

a menos que técnicamente se pueda garantizar.

---

# 24. Módulo 12 — Memoria de conversación

Para el MVP no necesitamos memoria vectorial.

Mantener un arreglo:

```typescript
interface ConversationMessage {
  role: "assistant" | "user";
  content: string;
  timestamp: number;
}
```

Ejemplo:

```typescript
[
  {
    role: "assistant",
    content: "Cuéntame sobre ti.",
    timestamp: 1000
  },
  {
    role: "user",
    content:
      "Soy desarrollador y trabajé dos años con Flutter.",
    timestamp: 5000
  }
]
```

La IA recibirá las intervenciones previas relevantes.

---

# 25. Memoria estructurada opcional

Podemos extraer además:

```typescript
interface CandidateContext {
  technologies: string[];
  experienceYears?: number;
  projects: string[];
  education?: string;
}
```

Ejemplo:

```json
{
  "technologies": [
    "Flutter",
    "Node.js"
  ],
  "experienceYears": 2,
  "projects": [
    "Sistema POS"
  ]
}
```

Esto es opcional para el primer prototipo.

---

# 26. Módulo 13 — Preguntas técnicas

La IA NO debe inventar las preguntas principales.

Las preguntas obligatorias salen de:

```text
InterviewConfig
```

Flujo:

```text
pregunta configurada
        │
        ▼
IA la formula
        │
        ▼
usuario responde
        │
        ▼
repregunta opcional
        │
        ▼
siguiente pregunta
```

---

# 27. Módulo 14 — Evaluación técnica

Cada respuesta será evaluada después de finalizar.

Entrada:

```json
{
  "question": "¿Qué es una API REST?",
  "answer": "Una API REST sirve para...",
  "expectedCriteria": [
    "HTTP",
    "endpoint",
    "request",
    "response"
  ]
}
```

Salida esperada:

```json
{
  "clarity": 8,
  "technicalAccuracy": 7,
  "relevance": 9,
  "detectedCriteria": [
    "HTTP",
    "endpoint"
  ],
  "missingCriteria": [
    "request",
    "response"
  ],
  "strengths": [
    "Explicó correctamente el concepto de endpoint."
  ],
  "improvements": [
    "Podría explicar la relación entre request y response."
  ]
}
```

---

# 28. Prompt para evaluación

Ejemplo conceptual:

```text
Evalúa la respuesta de un candidato durante una simulación
de entrevista laboral.

No evalúes personalidad, apariencia, edad, género,
estado emocional ni características sensibles.

Evalúa únicamente el contenido de la respuesta.

Pregunta:
{{QUESTION}}

Respuesta:
{{ANSWER}}

Criterios esperados:
{{CRITERIA}}

Devuelve solamente JSON con:

clarity: 0-10
technicalAccuracy: 0-10
relevance: 0-10
detectedCriteria: string[]
missingCriteria: string[]
strengths: string[]
improvements: string[]
```

---

# 29. Respuesta estructurada

Es importante pedir JSON estructurado y validarlo.

Crear:

```typescript
interface AnswerEvaluation {
  clarity: number;
  technicalAccuracy: number;
  relevance: number;
  detectedCriteria: string[];
  missingCriteria: string[];
  strengths: string[];
  improvements: string[];
}
```

Validar antes de guardar.

Opcional:

- Zod.

---

# 30. Módulo 15 — Datos por pregunta

Cada pregunta debe guardar:

```typescript
interface InterviewAnswer {
  questionId: string;
  question: string;
  answer: string;

  startedAt: number;
  finishedAt: number;

  wordsPerMinute: number;

  pauseMetrics: PauseMetrics;

  fillerWords: FillerWordResult;

  evaluation?: AnswerEvaluation;
}
```

---

# 31. Módulo 16 — Finalización de entrevista

Cuando ya no existan preguntas:

1. impedir nuevas preguntas;
2. pedir a la IA que se despida;
3. detener micrófono;
4. detener cámara;
5. detener MediaPipe;
6. cerrar conexión realtime;
7. consolidar métricas;
8. evaluar respuestas pendientes;
9. generar resumen;
10. navegar a `/results`.

---

# 32. Despedida

Ejemplo:

```text
Muchas gracias por participar.

Hemos terminado la simulación de entrevista.

A continuación podrás revisar un resumen de tus respuestas
y algunas recomendaciones para mejorar futuras entrevistas.
```

---

# 33. Módulo 17 — Reporte final

Estructura general:

```typescript
interface InterviewResult {
  interviewTitle: string;

  durationSeconds: number;

  audio: {
    wordsPerMinute: number;
    fillerWords: FillerWordResult;
    pauses: PauseMetrics;
    averageVolume: number;
  };

  video: {
    faceVisiblePercentage: number;
    centeredPercentage: number;
    forwardPercentage: number;
    movementLevel: number;
  };

  answers: InterviewAnswer[];

  summary: string;

  recommendations: string[];
}
```

---

# 34. Pantalla de resultados

Ejemplo:

```text
RESULTADOS

Duración
08:42

COMUNICACIÓN

Ritmo:
132 palabras/minuto

Muletillas:
8

Pausas largas:
3

VIDEO

Rostro visible:
96%

Encuadre:
91%

Orientación frontal aproximada:
84%

Movimiento:
Moderado
```

---

# 35. Resultados por pregunta

Ejemplo:

```text
Pregunta 1

¿Qué es una API REST?

Claridad
8/10

Precisión técnica
7/10

Relevancia
9/10

Fortalezas
✓ Explicaste correctamente los endpoints.
✓ Relacionaste REST con HTTP.

Podrías mejorar
△ Explicar request y response.
△ Dar un ejemplo práctico.
```

---

# 36. Resumen general con IA

Después de evaluar todas las preguntas, enviar al modelo:

```text
evaluaciones
+
métricas audio
+
métricas visuales
```

Solicitar:

```json
{
  "summary": "...",
  "recommendations": [
    "...",
    "...",
    "..."
  ]
}
```

Reglas:

- basarse solamente en datos disponibles;
- no inferir emociones;
- no inferir personalidad;
- no hacer diagnósticos;
- no inferir honestidad;
- no evaluar características físicas.

---

# 37. API routes mínimas

## `/api/realtime-token`

Responsabilidad:

Crear credenciales temporales para la conexión de voz.

El navegador no debe contener una API key permanente.

---

## `/api/evaluate`

Entrada:

```json
{
  "question": "...",
  "answer": "...",
  "criteria": []
}
```

Salida:

```json
{
  "clarity": 8,
  "technicalAccuracy": 7,
  "relevance": 9,
  "strengths": [],
  "improvements": []
}
```

---

## `/api/feedback`

Entrada:

```json
{
  "answers": [],
  "audioMetrics": {},
  "visionMetrics": {}
}
```

Salida:

```json
{
  "summary": "...",
  "recommendations": []
}
```

---

# 38. Variables de entorno

Ejemplo:

```text
OPENAI_API_KEY=
```

Opcionalmente:

```text
NEXT_PUBLIC_APP_NAME=Interview AI
```

Nunca colocar claves secretas dentro del código frontend.

Aunque el proyecto sea un prototipo, mantener esta separación.

---

# 39. Store global

Recomendación:

```text
Zustand
```

Ejemplo conceptual:

```typescript
interface InterviewStore {
  config?: InterviewConfig;

  conversation: ConversationMessage[];

  answers: InterviewAnswer[];

  audioMetrics: AudioMetrics;

  faceMetrics: FaceMetrics;

  poseMetrics: PoseMetrics;

  result?: InterviewResult;

  addMessage: (message: ConversationMessage) => void;

  addAnswer: (answer: InterviewAnswer) => void;

  reset: () => void;
}
```

---

# 40. Fase 1 — Prototipo visual

## Objetivo

Construir todo el recorrido sin IA real.

Pantallas:

```text
/
↓
/setup
↓
/interview
↓
/results
```

En `/interview` utilizar preguntas simuladas.

En `/results` utilizar datos falsos.

## Definition of Done

El usuario puede recorrer toda la aplicación sin errores.

---

# 41. Fase 2 — Cámara y micrófono

Implementar:

```text
getUserMedia()
video preview
audio stream
indicador volumen
```

## Definition of Done

Se visualiza la cámara y el sistema indica si existe señal de micrófono.

---

# 42. Fase 3 — Face Landmarker

Implementar detección de rostro.

Primera función:

```text
isFaceDetected
```

Después:

```text
isCentered
```

## Definition of Done

La pantalla de setup muestra:

```text
Rostro detectado ✅
```

cuando corresponde.

---

# 43. Fase 4 — Verificación previa

Combinar:

```text
cámara
micrófono
rostro
volumen
iluminación
```

## Definition of Done

El usuario recibe una lista clara de estados antes de empezar.

---

# 44. Fase 5 — IA conversacional

Conectar conversación por voz.

Primera prueba:

```text
IA: Hola. ¿Cómo te llamas?

Usuario: ...

IA: Encantado...
```

## Definition of Done

Se mantiene una conversación de al menos 3 intercambios sin recargar la página.

---

# 45. Fase 6 — Flujo controlado de entrevista

Dejar de conversar libremente.

Implementar:

```text
introduction
openingQuestion
technicalQuestion1
technicalQuestion2
technicalQuestion3
goodbye
```

## Definition of Done

La IA completa todas las preguntas en el orden correcto.

---

# 46. Fase 7 — Transcripción

Guardar cada respuesta como texto.

## Definition of Done

Después de cada respuesta existe:

```typescript
answer.text
```

con el contenido reconocido.

---

# 47. Fase 8 — Memoria

Enviar contexto previo al modelo.

Prueba:

Usuario:

```text
Trabajo con Flutter desde hace dos años.
```

Más adelante la IA debería poder decir:

```text
Mencionaste que trabajas con Flutter...
```

## Definition of Done

La IA utiliza correctamente un dato mencionado anteriormente.

---

# 48. Fase 9 — Métricas de audio

Implementar:

```text
duración
palabras/minuto
muletillas
pausas
volumen
```

## Definition of Done

Al finalizar una respuesta se genera un objeto `AudioMetrics`.

---

# 49. Fase 10 — Métricas visuales

Durante la entrevista acumular:

```text
faceVisiblePercentage
centeredPercentage
forwardPercentage
movementLevel
```

## Definition of Done

Al finalizar existe un objeto `VisionMetrics`.

---

# 50. Fase 11 — Evaluación técnica

Después de cada respuesta:

```text
Pregunta
+
Respuesta
+
Criterios
      ↓
     LLM
      ↓
AnswerEvaluation
```

## Definition of Done

Cada respuesta técnica tiene su evaluación estructurada.

---

# 51. Fase 12 — Resultados

Combinar:

```text
AudioMetrics
VisionMetrics
AnswerEvaluations
```

## Definition of Done

La pantalla `/results` muestra datos reales de la entrevista terminada.

---

# 52. Fase 13 — Feedback general

Enviar todos los resultados a IA y generar:

```text
resumen
+
recomendaciones
```

## Definition of Done

El usuario recibe al menos:

- 3 fortalezas;
- 3 recomendaciones;
- feedback de cada pregunta.

---

# 53. Orden exacto recomendado de desarrollo

```text
01. Crear Next.js
02. Crear rutas
03. Crear diseño básico
04. Crear InterviewConfig
05. Crear store
06. Integrar cámara
07. Integrar micrófono
08. Crear audio meter
09. Integrar Face Landmarker
10. Crear validación setup
11. Crear pantalla interview
12. Integrar IA realtime
13. Crear máquina de estados
14. Implementar preguntas
15. Guardar transcripción
16. Implementar memoria
17. Métricas de audio
18. Pose Landmarker
19. Métricas visuales
20. Evaluación técnica
21. Generar resumen
22. Crear pantalla results
23. Probar flujo completo
24. Corregir errores
25. Deploy del prototipo
```

---

# 54. Primera entrevista de prueba

Para evitar complejidad, comenzar con:

```text
Puesto:
Backend Developer Junior
```

Pregunta inicial:

```text
Cuéntame un poco sobre ti, tu formación y tu experiencia.
```

Preguntas técnicas:

```text
1. ¿Qué es una API REST?

2. ¿Cuál es la diferencia entre GET y POST?

3. ¿Qué experiencia tienes trabajando con bases de datos?
```

Esto es suficiente para validar el MVP.

---

# 55. Duración objetivo

El prototipo debería durar aproximadamente:

```text
5 a 10 minutos
```

Estructura:

```text
Introducción
30 segundos

Presentación candidato
1-2 minutos

Preguntas técnicas
4-6 minutos

Cierre
30 segundos
```

---

# 56. Manejo de repreguntas

Para controlar el MVP:

```text
máximo 1 follow-up por pregunta
```

Regla:

```text
Si la respuesta es demasiado corta
O contiene un elemento interesante
=> hacer una repregunta

Después:
=> continuar obligatoriamente
```

Evitar entrevistas infinitas.

---

# 57. Condiciones de finalización

Finalizar cuando:

```text
currentQuestionIndex >= totalQuestions
```

o cuando el usuario presione:

```text
Finalizar entrevista
```

Si finaliza manualmente:

```text
status = FINISHING
```

y generar resultados con lo disponible.

---

# 58. Manejo de errores

## Cámara perdida

Mostrar:

```text
Se perdió acceso a la cámara.
La entrevista puede continuar con análisis visual limitado.
```

Para MVP no necesariamente cancelar.

---

## Micrófono perdido

Mostrar:

```text
No se detecta el micrófono.
Verifica tu dispositivo para continuar.
```

Pausar la entrevista.

---

## IA desconectada

Mostrar:

```text
La conexión con el entrevistador se interrumpió.
Intentando reconectar...
```

Permitir reintento.

---

# 59. Privacidad en el prototipo

Antes de comenzar:

```text
Esta simulación utiliza tu cámara y micrófono.

Durante la entrevista se analizarán señales de audio,
contenido de tus respuestas y métricas visuales observables
para generar retroalimentación.

No se utilizará el análisis visual para inferir emociones,
personalidad, honestidad ni características sensibles.
```

Botón:

```text
Acepto y continuar
```

---

# 60. Principios de análisis visual

Permitido:

```text
rostro visible
posición
encuadre
orientación
movimiento
postura observable
```

Evitar:

```text
emociones
raza
edad
atractivo
personalidad
confianza psicológica
honestidad
nerviosismo
salud
discapacidad
estado mental
```

---

# 61. Principios del análisis de voz

Permitido:

```text
velocidad
duración
pausas
muletillas
volumen
claridad de transcripción
```

Evitar afirmar:

```text
"su voz demuestra ansiedad"
"su voz indica inseguridad"
"está mintiendo"
```

---

# 62. Ejemplo completo de resultado

```json
{
  "durationSeconds": 512,

  "audio": {
    "wordsPerMinute": 131,
    "averageVolume": 0.68,

    "fillerWords": {
      "total": 7,
      "items": [
        {
          "phrase": "este",
          "count": 4
        },
        {
          "phrase": "eh",
          "count": 3
        }
      ]
    },

    "pauses": {
      "totalPauses": 14,
      "longPauses": 3,
      "averagePauseMs": 850,
      "longestPauseMs": 3200
    }
  },

  "video": {
    "faceVisiblePercentage": 97,
    "centeredPercentage": 91,
    "forwardPercentage": 83,
    "movementLevel": 0.32
  },

  "answers": [
    {
      "questionId": "rest-api",

      "question": "¿Qué es una API REST?",

      "answer":
        "Una API REST permite que diferentes aplicaciones se comuniquen...",

      "wordsPerMinute": 128,

      "evaluation": {
        "clarity": 8,
        "technicalAccuracy": 7,
        "relevance": 9,

        "detectedCriteria": [
          "HTTP",
          "endpoint"
        ],

        "missingCriteria": [
          "request",
          "response"
        ],

        "strengths": [
          "Explica correctamente la finalidad general."
        ],

        "improvements": [
          "Podría explicar request y response."
        ]
      }
    }
  ],

  "summary":
    "La entrevista tuvo respuestas claras y generalmente relevantes.",

  "recommendations": [
    "Dar ejemplos concretos al responder preguntas técnicas.",
    "Reducir el uso de muletillas.",
    "Desarrollar un poco más algunas respuestas."
  ]
}
```

---

# 63. Testing manual obligatorio

Probar:

## Cámara

- cámara permitida;
- cámara rechazada;
- no existe cámara;
- rostro visible;
- rostro fuera del video;
- poca iluminación.

## Micrófono

- permitido;
- rechazado;
- volumen bajo;
- volumen normal;
- silencio.

## Entrevista

- respuesta normal;
- respuesta corta;
- silencio prolongado;
- usuario interrumpe IA;
- IA hace follow-up;
- última pregunta;
- finalización manual.

## Resultados

- todas las preguntas respondidas;
- algunas preguntas respondidas;
- métricas visuales incompletas;
- métricas de audio incompletas.

---

# 64. Definition of Done del MVP completo

El MVP estará terminado cuando un usuario pueda:

1. Abrir la aplicación.
2. Elegir la entrevista de prueba.
3. Dar permisos de cámara y micrófono.
4. Verificar ambos dispositivos.
5. Comenzar la entrevista.
6. Escuchar al entrevistador IA.
7. Responder hablando.
8. Mantener una conversación contextual.
9. Responder tres preguntas técnicas.
10. Ser analizado en audio mientras habla.
11. Ser analizado visualmente mediante MediaPipe.
12. Finalizar la entrevista.
13. Recibir evaluación de sus respuestas.
14. Ver métricas de voz.
15. Ver métricas visuales.
16. Leer un resumen.
17. Recibir recomendaciones.

Si todo esto funciona de principio a fin:

> **El MVP está completo.**

---

# 65. Roadmap resumido

```text
SPRINT / FASE 1
UI + navegación

SPRINT / FASE 2
Cámara + micrófono

SPRINT / FASE 3
MediaPipe Face

SPRINT / FASE 4
IA por voz

SPRINT / FASE 5
Preguntas estructuradas

SPRINT / FASE 6
Transcripción + memoria

SPRINT / FASE 7
Audio analytics

SPRINT / FASE 8
Pose analytics

SPRINT / FASE 9
Evaluación técnica

SPRINT / FASE 10
Reporte final

SPRINT / FASE 11
Testing + correcciones

SPRINT / FASE 12
Deploy
```

---

# 66. Resultado final esperado

El prototipo debe demostrar la siguiente hipótesis:

> Es posible realizar una simulación de entrevista laboral usando IA conversacional, análisis de voz y visión artificial para proporcionar retroalimentación útil al candidato en tiempo real o al finalizar la sesión.

La experiencia final será:

```text
Entrar
  ↓
Preparar dispositivos
  ↓
Hablar con entrevistador IA
  ↓
Responder preguntas
  ↓
Análisis multimodal
  ↓
Finalizar
  ↓
Recibir feedback
```

Este flujo constituye el núcleo del producto y debe completarse antes de agregar cualquier funcionalidad secundaria.
