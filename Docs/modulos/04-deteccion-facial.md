# Módulo 4: Detección facial

## Objetivo

Detectar la presencia y posición aproximada del rostro durante la entrevista, acumulando métricas observables.

## Tecnología

- MediaPipe Face Landmarker
- Procesamiento de frames en el navegador

## Métricas MVP

- Porcentaje de frames con rostro.
- Porcentaje de frames centrados.
- Porcentaje aproximado orientado hacia delante.
- Cantidad de eventos en los que el rostro desaparece.

## Modelo

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
const faceVisiblePercentage =
  framesWithFace / totalFrames * 100;

const centeredPercentage =
  centeredFrames / framesWithFace * 100;
```

Las divisiones deben protegerse contra valores cero.

## Privacidad y límites

Procesar y acumular métricas sin guardar permanentemente cada landmark. No inferir emociones, personalidad, honestidad, nerviosismo ni estados mentales.

## Criterio de aceptación

La preparación indica si hay un rostro visible y los resultados finales muestran métricas agregadas de visibilidad y encuadre.

