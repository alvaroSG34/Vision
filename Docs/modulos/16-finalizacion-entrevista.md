# Módulo 16: Finalización de entrevista

## Objetivo

Cerrar correctamente la conversación, liberar recursos y preparar los datos para generar resultados.

## Flujo de finalización

1. Impedir nuevas preguntas.
2. Pedir a la IA que se despida.
3. Detener micrófono.
4. Detener cámara.
5. Detener MediaPipe.
6. Cerrar la conexión realtime.
7. Consolidar métricas.
8. Evaluar respuestas pendientes.
9. Generar el resumen.
10. Navegar a `/results`.

## Estados

```typescript
type InterviewStatus =
  | "SETUP"
  | "READY"
  | "INTRODUCING"
  | "ASKING"
  | "LISTENING"
  | "PROCESSING"
  | "FINISHING"
  | "FINISHED";
```

## Finalización manual

Si el usuario pulsa “Finalizar entrevista”:

```text
status = FINISHING
```

Se genera el reporte con la información disponible, indicando si quedaron preguntas sin responder.

## Manejo de fallos

La limpieza de recursos debe ejecutarse aunque falle la evaluación o la generación del feedback. El usuario debe poder acceder a resultados parciales.

## Criterio de aceptación

Al terminar no quedan streams activos ni conexiones innecesarias, y la aplicación llega a `/results` con datos consistentes.

