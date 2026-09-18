# Módulo 8: Velocidad del habla

## Objetivo

Calcular la cantidad aproximada de palabras pronunciadas por minuto en cada respuesta.

## Fórmula

```text
palabras por minuto = cantidad de palabras / duración hablada en minutos
```

## Implementación

```typescript
export function calculateWordsPerMinute(
  transcript: string,
  speakingDurationSeconds: number,
) {
  const words = transcript
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  if (speakingDurationSeconds <= 0) return 0;

  return words / (speakingDurationSeconds / 60);
}
```

## Presentación

Mostrar primero el dato, por ejemplo:

> Ritmo promedio: 132 palabras/minuto

No etiquetar automáticamente un ritmo como bueno o malo. El contexto de la respuesta y las pausas debe considerarse en el feedback.

## Criterio de aceptación

Cada respuesta con transcripción y duración válida obtiene un valor de palabras por minuto.

