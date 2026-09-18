# Módulo 11: IA conversacional

## Objetivo

Permitir una entrevista por voz con un entrevistador virtual que siga un flujo controlado y natural.

## Tecnología

- OpenAI Realtime API o equivalente.
- Ruta backend para credenciales temporales.
- Modelo de lenguaje para evaluación y feedback posterior.

## Comportamiento requerido

La IA debe:

- Presentarse y explicar la dinámica.
- Hacer una pregunta abierta inicial.
- Escuchar la respuesta.
- Usar información relevante mencionada previamente.
- Formular preguntas técnicas configuradas.
- Hacer como máximo una repregunta por pregunta en el MVP.
- Despedirse al completar el flujo.

## Prompt base

```text
Eres un entrevistador virtual para una simulación laboral.

Realiza una entrevista profesional y natural.
Haz una sola pregunta a la vez. No evalúes verbalmente al candidato
durante la entrevista. Recuerda información previa y puedes hacer una
repregunta corta. Completa las preguntas obligatorias configuradas.
No inventes experiencia. No realices inferencias psicológicas ni evalúes
la apariencia física.
```

## Control del flujo

La IA no debe decidir libremente todas las preguntas. La aplicación debe mantener el índice de la pregunta actual y pasarle a la IA la pregunta que corresponde.

## Criterio de aceptación

Se mantienen al menos tres intercambios de voz sin recargar la página y las preguntas técnicas aparecen en el orden configurado.

