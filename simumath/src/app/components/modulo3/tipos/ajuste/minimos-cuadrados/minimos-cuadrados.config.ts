import type { Columna } from '../../../../../shared/models/metodo.model';
import type { CampoCalculadoraM3, DatosModulo3 } from '../../../modelos/modulo3.model';

/**
 * CONFIGURACIÓN DE MÍNIMOS CUADRADOS.
 *
 * Datos fijos del método: nombre, columnas de la tabla de trabajo y
 * campos de la calculadora. El algoritmo está en
 * `minimos-cuadrados.algoritmo.ts` y los textos en el contenido.
 */

/* ------------------------------------------------------------------ */
/* Identidad del método                                                */
/* ------------------------------------------------------------------ */

export const MINIMOS_CUADRADOS = {
  key: 'minimos-cuadrados',
  nombre: 'Mínimos cuadrados',
  familia: 'ajuste' as const,
  resumen: 'Ajusta la recta que mejor representa datos con error de medición.',
  color: '#8a5a00',
} as const;

/* ------------------------------------------------------------------ */
/* Tabla de trabajo                                                    */
/* ------------------------------------------------------------------ */

/**
 * La tabla muestra el trabajo completo de la regresión: las columnas
 * auxiliares xᵢ² y xᵢ·yᵢ (que son las que se suman), el valor que
 * predice la recta ŷᵢ y el residuo rᵢ = yᵢ − ŷᵢ. La última fila trae
 * las sumatorias, que son las que entran en la fórmula.
 */
export const COLUMNAS_MINIMOS_CUADRADOS: Columna[] = [
  { key: 'i', label: 'i', align: 'right' },
  { key: 'xi', label: 'xᵢ', align: 'right' },
  { key: 'yi', label: 'yᵢ', align: 'right' },
  { key: 'x2', label: 'xᵢ²', align: 'right' },
  { key: 'xy', label: 'xᵢ·yᵢ', align: 'right' },
  { key: 'yhat', label: 'ŷᵢ', align: 'right' },
  { key: 'residuo', label: 'rᵢ = yᵢ − ŷᵢ', align: 'right' },
];

/* ------------------------------------------------------------------ */
/* Calculadora                                                         */
/* ------------------------------------------------------------------ */

export const CAMPOS_CALCULADORA_MINIMOS_CUADRADOS: CampoCalculadoraM3[] = [
  {
    key: 'puntos',
    etiqueta: 'Puntos experimentales (x, y)',
    ayuda: 'Cada dato como x, y. Separá los pares con punto y coma o saltos de línea.',
    requisito: 'Ej: 2, 1.4; 4, 2.9; 6, 4.3; 8, 5.8; 10, 7.2',
    valorInicial: '2, 1.4; 4, 2.9; 6, 4.3; 8, 5.8; 10, 7.2',
    tipo: 'text',
    placeholder: '2, 1.4; 4, 2.9; 6, 4.3',
  },
  {
    key: 'evaluarEn',
    etiqueta: 'Predecir en x =',
    ayuda: 'Valor de la variable independiente para el que querés la predicción de la recta.',
    requisito: 'Es opcional: si lo dejás vacío, solo se ajusta la recta.',
    valorInicial: '7',
    tipo: 'number',
    placeholder: '7',
  },
];

/** Con qué datos abre la calculadora de mínimos cuadrados. */
export const DATOS_POR_DEFECTO_MINIMOS_CUADRADOS: DatosModulo3 = {
  puntos: [
    { x: 2, y: 1.4 },
    { x: 4, y: 2.9 },
    { x: 6, y: 4.3 },
    { x: 8, y: 5.8 },
    { x: 10, y: 7.2 },
  ],
  evaluarEn: 7,
  etiqueta: 'Alargamiento de un resorte',
};
