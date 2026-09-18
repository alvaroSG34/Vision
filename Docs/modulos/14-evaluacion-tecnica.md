# Módulo 14: Evaluación técnica

## Objetivo

Evaluar el contenido de cada respuesta comparándolo con los criterios esperados de la pregunta.

## Entrada

```json
{
  "question": "¿Qué es una API REST?",
  "answer": "Una API REST sirve para...",
  "expectedCriteria": ["HTTP", "endpoint", "request", "response"]
}
```

## Salida

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

## Prompt de evaluación

```text
Evalúa únicamente el contenido de la respuesta del candidato.
No evalúes personalidad, apariencia, edad, género, estado emocional
ni características sensibles.

Devuelve JSON con claridad, precisión técnica, relevancia,
criterios detectados, criterios faltantes, fortalezas y mejoras.
Las puntuaciones deben estar entre 0 y 10.
```

## Validación

- Validar que las puntuaciones estén entre 0 y 10.
- Validar que las listas sean arreglos de texto.
- Rechazar o normalizar respuestas que no cumplan el esquema.
- Usar Zod opcionalmente.

## Momento de ejecución

Evaluar después de cada respuesta o al terminar la entrevista. Para el MVP se puede evaluar al finalizar cada pregunta y guardar el resultado.

## Criterio de aceptación

Cada pregunta técnica respondida tiene una evaluación estructurada y visible en la pantalla de resultados.

