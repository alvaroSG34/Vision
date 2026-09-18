# Módulo 6: Análisis de audio

## Objetivo

Capturar métricas básicas de la voz mientras el usuario responde, sin intentar interpretar emociones.

## Tecnología

- Web Audio API
- `AudioContext`
- `AnalyserNode`

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

## Detección de voz

La primera versión puede usar un umbral calibrable:

```text
amplitud > threshold  => hablando
amplitud <= threshold => silencio
```

El umbral debe probarse en distintos micrófonos y entornos.

## Responsabilidades

- Medir amplitud y volumen promedio.
- Acumular tiempo hablado y tiempo en silencio.
- Producir datos por respuesta y para el reporte global.
- Notificar si no existe señal de micrófono.

## Límites

No afirmar que el volumen o la voz demuestran ansiedad, inseguridad, intención de mentir o cualquier estado mental.

## Criterio de aceptación

Al terminar una respuesta existe un objeto de audio con volumen, duración hablada y silencios calculados.

