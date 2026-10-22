import type { Columna } from '../../../../../shared/models/metodo.model';
import type { CampoCalculadoraM3, DatosModulo3 } from '../../../modelos/modulo3.model';

/**
 * CONFIGURACIÓN DE LAGRANGE.
 *
 * Acá viven los datos FIJOS del método: cómo se llama, qué columnas
 * tiene su tabla y qué campos pide su calculadora. El algoritmo está en
 * `lagrange.algoritmo.ts` y los textos en `lagrange.contenido.ts`.
 */

/* ------------------------------------------------------------------ */
/* Identidad del método                                                */
/* ------------------------------------------------------------------ */

export const LAGRANGE = {
  key: 'lagrange',
  nombre: 'Interpolación de Lagrange',
  familia: 'interpolacion' as const,
  resumen: 'Construye el polinomio que pasa por todos los datos, sin resolver sistemas.',
  color: '#1b6b93',
} as const;

/* ------------------------------------------------------------------ */
/* Tabla                                                               */
/* ------------------------------------------------------------------ */

/**
 * La tabla no muestra iteraciones (Lagrange no itera): muestra el
 * APORTE DE CADA DATO al polinomio evaluado en x*. Esa es la lectura
 * útil: ver cuánto pesa cada punto en el resultado.
 */
export const COLUMNAS_LAGRANGE: Columna[] = [
  { key: 'i', label: 'i', align: 'right' },
  { key: 'xi', label: 'xᵢ', align: 'right' },
  { key: 'yi', label: 'yᵢ', align: 'right' },
  { key: 'li', label: 'Lᵢ(x*)', align: 'right' },
  { key: 'aporte', label: 'yᵢ · Lᵢ(x*)', align: 'right' },
];

/* ------------------------------------------------------------------ */
/* Calculadora                                                         */
/* ------------------------------------------------------------------ */

export const CAMPOS_CALCULADORA_LAGRANGE: CampoCalculadoraM3[] = [
  {
    key: 'puntos',
    etiqueta: 'Puntos de la tabla (x, y)',
    ayuda: 'Cada dato como x, y. Separá los pares con punto y coma o saltos de línea.',
    requisito: 'Ej: 1, 0; 2, 0.6931; 3, 1.0986',
    valorInicial: '1, 0; 2, 0.6931; 3, 1.0986',
    tipo: 'text',
    placeholder: '1, 0; 2, 0.6931; 3, 1.0986',
  },
  {
    key: 'evaluarEn',
    etiqueta: 'Estimar en x =',
    ayuda: 'Es el valor donde querés el polinomio. Puede estar entre los datos o fuera.',
    requisito: 'No puede repetir la x de un dato si querés comparar, pero se admite igual.',
    valorInicial: '2.5',
    tipo: 'number',
    placeholder: '2.5',
  },
];

/** Con qué datos abre la calculadora de Lagrange. */
export const DATOS_POR_DEFECTO_LAGRANGE: DatosModulo3 = {
  puntos: [
    { x: 1, y: 0 },
    { x: 2, y: 0.6931 },
    { x: 3, y: 1.0986 },
  ],
  evaluarEn: 2.5,
  etiqueta: 'ln(x) en tres nodos',
};
