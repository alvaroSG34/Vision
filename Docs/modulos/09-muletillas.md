# Módulo 9: Muletillas

## Objetivo

Detectar y contabilizar palabras o frases de apoyo frecuentes en la transcripción.

## Lista inicial para español

```typescript
const fillerWords = [
  "eh",
  "emm",
  "mmm",
  "este",
  "bueno",
  "o sea",
  "digamos",
];
```

La lista debe ser configurable y el conteo debe evitar coincidencias parciales incorrectas cuando sea posible.

## Modelo

```typescript
interface FillerWordResult {
  total: number;
  items: {
    phrase: string;
    count: number;
  }[];
}
```

## Feedback

Usar lenguaje descriptivo, por ejemplo: “Se detectaron 8 muletillas”. Evitar convertir el conteo en una evaluación absoluta de la calidad o personalidad del candidato.

## Criterio de aceptación

El sistema cuenta las muletillas por respuesta y consolida un total para el reporte final.

