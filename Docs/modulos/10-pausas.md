# Módulo 10: Pausas

## Objetivo

Identificar silencios y distinguir pausas normales de pausas largas.

## Regla inicial

```text
pausa normal: < 2 segundos
pausa larga:  >= 2 segundos
```

El valor debe ser configurable.

## Modelo

```typescript
interface PauseMetrics {
  totalPauses: number;
  longPauses: number;
  averagePauseMs: number;
  longestPauseMs: number;
}
```

## Responsabilidades

- Recibir intervalos de silencio del analizador de audio.
- Contar pausas totales y pausas largas.
- Calcular promedio y pausa máxima.
- Asociar las métricas con la respuesta correspondiente.

## Límites

Una pausa no debe interpretarse automáticamente como nerviosismo, inseguridad o falta de conocimiento. El reporte debe presentar el dato de forma neutral.

## Criterio de aceptación

Cada respuesta puede mostrar la cantidad y duración de sus pausas, y el reporte global consolida estos valores.

