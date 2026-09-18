# Módulo 5: Análisis de postura

## Objetivo

Registrar señales observables de visibilidad corporal y movimiento durante la entrevista.

## Tecnología

- MediaPipe Pose Landmarker

## Métricas MVP

- Torso visible.
- Hombros visibles.
- Cambios importantes de posición.
- Movimiento corporal promedio.

## Modelo

```typescript
interface PoseMetrics {
  totalFrames: number;
  bodyVisibleFrames: number;
  significantMovementEvents: number;
  averageMovement: number;
}
```

## Reglas de interpretación

El resultado puede describir señales observables:

> “Se detectaron movimientos corporales frecuentes.”

No debe transformarse en conclusiones psicológicas como “estaba nervioso” o “estaba inseguro”.

## Rendimiento

Analizar frames a una frecuencia controlada para no bloquear la interfaz. Acumular estadísticas y descartar landmarks individuales cuando ya no sean necesarios.

## Criterio de aceptación

Al finalizar existe un objeto de métricas de postura, incluso si algunos frames no pudieron analizarse.

