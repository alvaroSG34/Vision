# Módulo 7: Transcripción

## Objetivo

Convertir cada respuesta hablada en texto para conservarla, evaluarla y mostrarla en los resultados.

## Responsabilidades

- Recibir el texto reconocido por el sistema de voz.
- Asociarlo con la pregunta actual.
- Guardar duración y timestamps cuando estén disponibles.
- Detectar respuestas vacías o incompletas.

## Modelo

```typescript
interface TranscriptSegment {
  startMs: number;
  endMs: number;
  text: string;
}
```

## Resultado mínimo

```typescript
interface Transcript {
  text: string;
  segments?: TranscriptSegment[];
  durationMs: number;
}
```

## Integración

La transcripción debe asociarse al `questionId` de la respuesta. El texto se utilizará posteriormente para velocidad del habla, muletillas, evaluación técnica y feedback.

## Criterio de aceptación

Después de cada respuesta existe texto recuperable y asociado a la pregunta correcta.

