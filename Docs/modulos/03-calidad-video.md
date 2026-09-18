# Módulo 3: Calidad del video

## Objetivo

Comprobar que las condiciones mínimas de video son suficientes antes de iniciar la entrevista.

## Validaciones MVP

- La cámara está activa.
- Existe un rostro visible.
- La iluminación es razonable.
- El rostro está aproximadamente centrado.

## Modelo

```typescript
interface VideoQualityResult {
  cameraDetected: boolean;
  faceDetected: boolean;
  centered: boolean;
  brightness: number;
  brightnessStatus: "LOW" | "OK" | "HIGH";
}
```

## Reglas de bloqueo

La cámara y el rostro pueden ser requisitos para habilitar el inicio:

```typescript
const canStart =
  cameraReady &&
  microphoneReady &&
  faceDetected;
```

La iluminación debe mostrarse inicialmente como advertencia y no bloquear la entrevista.

## Límites

Este módulo no intenta determinar si el video es “profesional”, ni evalúa apariencia, atractivo, edad, raza o emociones.

## Criterio de aceptación

La pantalla de preparación muestra estados comprensibles para cámara, rostro, iluminación y centrado, y solo impide comenzar cuando faltan las condiciones obligatorias.

