# Módulos del MVP

Esta carpeta desglosa la implementación del simulador de entrevistas con IA definido en `IMPLEMENTACION_MVP_ENTREVISTA_IA.md`.

## Mapa de módulos

1. [Configuración de entrevistas](01-configuracion-entrevistas.md)
2. [Captura de cámara y micrófono](02-captura-camara-microfono.md)
3. [Calidad del video](03-calidad-video.md)
4. [Detección facial](04-deteccion-facial.md)
5. [Análisis de postura](05-analisis-postura.md)
6. [Análisis de audio](06-analisis-audio.md)
7. [Transcripción](07-transcripcion.md)
8. [Velocidad del habla](08-velocidad-habla.md)
9. [Muletillas](09-muletillas.md)
10. [Pausas](10-pausas.md)
11. [IA conversacional](11-ia-conversacional.md)
12. [Memoria de conversación](12-memoria-conversacion.md)
13. [Preguntas técnicas](13-preguntas-tecnicas.md)
14. [Evaluación técnica](14-evaluacion-tecnica.md)
15. [Datos por pregunta](15-datos-por-pregunta.md)
16. [Finalización de entrevista](16-finalizacion-entrevista.md)
17. [Reporte final](17-reporte-final.md)

## Orden recomendado

La implementación puede comenzar con los módulos 1, 2 y 3 para validar el flujo visual y los dispositivos. Después se integran los módulos de entrevista, análisis y resultados.

La aplicación debe funcionar aun cuando alguna métrica opcional no esté disponible. Por ejemplo, una pérdida temporal de cámara puede limitar el análisis visual sin invalidar toda la sesión.

