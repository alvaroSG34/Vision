# Módulo 13: Preguntas técnicas

## Objetivo

Ejecutar un conjunto fijo de preguntas técnicas y permitir una repregunta controlada por cada una.

## Flujo

```text
Pregunta configurada
        ↓
IA la formula naturalmente
        ↓
Usuario responde
        ↓
Repregunta opcional
        ↓
Siguiente pregunta
```

## Reglas

- Las preguntas principales salen de `InterviewConfig`.
- La IA puede adaptar el tono, pero no cambiar el objetivo técnico.
- El máximo inicial es una repregunta por pregunta.
- La entrevista debe avanzar aunque no se haga repregunta.
- El orden debe ser determinista.

## Estado sugerido

```typescript
interface TechnicalQuestionState {
  questionId: string;
  followUpsUsed: number;
  completed: boolean;
}
```

## Criterio de aceptación

La entrevista completa todas las preguntas configuradas en orden, sin quedar atrapada en una conversación indefinida.

