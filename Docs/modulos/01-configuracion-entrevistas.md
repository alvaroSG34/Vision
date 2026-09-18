# Módulo 1: Configuración de entrevistas

## Objetivo

Definir las entrevistas disponibles mediante archivos de configuración, sin necesitar un panel administrativo ni una base de datos.

## Responsabilidades

- Registrar el título y la descripción de cada entrevista.
- Definir la pregunta inicial abierta.
- Definir las preguntas técnicas obligatorias.
- Definir los criterios esperados para evaluar cada respuesta.
- Definir el número máximo de repreguntas.

## Ubicación sugerida

```text
/config/interviews.ts
```

## Modelo principal

```typescript
export interface TechnicalQuestion {
  id: string;
  question: string;
  expectedCriteria: string[];
  maxFollowUps?: number;
}

export interface InterviewConfig {
  id: string;
  title: string;
  description: string;
  openingQuestion: string;
  technicalQuestions: TechnicalQuestion[];
}
```

## Reglas

- Las preguntas principales deben salir de la configuración.
- La IA puede formular la pregunta de forma natural, pero no inventarla.
- Cambiar una pregunta debe requerir editar únicamente este archivo.
- Cada pregunta debe tener un identificador estable.

## Criterio de aceptación

Se puede agregar o modificar una entrevista editando la configuración, y la pantalla inicial muestra sus datos correctamente.

