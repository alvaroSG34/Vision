# Módulo 12: Memoria de conversación

## Objetivo

Conservar el contexto de la sesión para que el entrevistador pueda responder de forma coherente y utilizar datos mencionados por el candidato.

## Modelo básico

```typescript
interface ConversationMessage {
  role: "assistant" | "user";
  content: string;
  timestamp: number;
}
```

## Almacenamiento MVP

- Estado de React o Zustand.
- Memoria del navegador.
- `sessionStorage` o `localStorage` si se necesita conservar la sesión al navegar.

No se requiere memoria vectorial ni una base de datos para el primer prototipo.

## Memoria estructurada opcional

```typescript
interface CandidateContext {
  technologies: string[];
  experienceYears?: number;
  projects: string[];
  education?: string;
}
```

## Reglas

- Enviar únicamente el contexto relevante a la IA.
- No inventar datos que el candidato no haya mencionado.
- Limpiar la memoria al reiniciar una entrevista.
- No persistir datos más allá de lo necesario para el MVP.

## Criterio de aceptación

Si el candidato menciona una tecnología o experiencia, la IA puede referirse a ella correctamente más adelante durante la misma sesión.

