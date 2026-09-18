# Módulo 2: Captura de cámara y micrófono

## Objetivo

Solicitar permisos, obtener los dispositivos del usuario y entregar un stream reutilizable para la preparación y la entrevista.

## Tecnología

- `MediaDevices API`
- `navigator.mediaDevices.getUserMedia()`
- Tracks de video y audio del navegador

## Responsabilidades

- Solicitar cámara y micrófono.
- Mostrar la previsualización de video.
- Detectar si existe señal de audio.
- Informar estados de disponibilidad.
- Liberar los tracks al finalizar la entrevista.

## Implementación base

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
});

const videoTrack = stream.getVideoTracks()[0];
const audioTrack = stream.getAudioTracks()[0];
```

## Estado sugerido

```typescript
interface DeviceStatus {
  cameraAvailable: boolean;
  videoPlaying: boolean;
  microphoneAvailable: boolean;
  audioSignalDetected: boolean;
  error?: string;
}
```

## Errores que deben manejarse

- `NotAllowedError`: el usuario rechazó el permiso.
- `NotFoundError`: no existe un dispositivo compatible.
- `NotReadableError`: el dispositivo está ocupado o no puede leerse.

Los mensajes deben ser claros y orientar al usuario a revisar permisos, conexiones y dispositivos seleccionados.

## Criterio de aceptación

El usuario puede conceder permisos, ver su cámara y comprobar que el micrófono produce señal. Al salir de la entrevista, cámara y micrófono quedan liberados.

