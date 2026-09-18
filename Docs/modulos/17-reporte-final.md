# Módulo 17: Reporte final

## Objetivo

Combinar las respuestas, métricas y evaluaciones en un resumen visual útil para el candidato.

## Modelo

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

## Secciones de la pantalla `/results`

- Duración total.
- Métricas de comunicación.
- Muletillas y pausas.
- Métricas de video observables.
- Evaluación técnica por pregunta.
- Fortalezas.
- Oportunidades de mejora.
- Resumen general.
- Recomendaciones.

## Generación de feedback

Enviar al modelo:

```text
evaluaciones por pregunta
+ métricas de audio
+ métricas visuales observables
```

Solicitar un resumen y recomendaciones basados únicamente en esos datos.

## Reglas de seguridad

El reporte no debe inferir emociones, personalidad, honestidad, edad, género, apariencia, salud ni estados mentales. Debe usar lenguaje descriptivo y neutral.

## Criterio de aceptación

El usuario puede revisar datos reales de la sesión, la evaluación de cada pregunta, al menos tres recomendaciones y un resumen general.

