# Módulo 15: Datos por pregunta

## Objetivo

Unificar la respuesta, sus métricas y su evaluación en una estructura que pueda mostrarse y enviarse al reporte final.

## Modelo

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

## Responsabilidades

- Asociar cada respuesta al identificador de pregunta.
- Guardar tiempos de inicio y finalización.
- Guardar la transcripción final.
- Adjuntar métricas de voz.
- Adjuntar evaluación técnica cuando exista.

## Reglas

- `questionId` es obligatorio.
- Una respuesta incompleta debe poder guardarse.
- Las métricas faltantes deben representarse de forma segura, sin romper el reporte.
- No guardar datos de otra pregunta en la respuesta actual.

## Criterio de aceptación

Cada pregunta completada produce un registro independiente que puede renderizarse en resultados.

