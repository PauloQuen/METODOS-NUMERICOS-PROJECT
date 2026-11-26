import type { Columna } from '../../../../../shared/models/metodo.model';
import type {
  CampoCalculadoraM5,
  DatosModulo5,
} from '../../../modelos/modulo5.model';
import { camposEdo } from '../../../shared/edo';

export const EULER = {
  key: 'euler',
  nombre: 'Euler explícito',
  familia: 'edo-clasicos' as const,
  resumen: 'Avanza un paso h siguiendo la recta tangente del punto actual.',
  color: '#1b6b93',
} as const;

/**
 * Tabla de pasos de Euler: en cada fila se ve de dónde sale el siguiente
 * valor. La última fila no tiene k₁ porque no se da otro paso.
 */
export const COLUMNAS_EULER: Columna[] = [
  { key: 'n', label: 'n', align: 'right' },
  { key: 't', label: 'tₙ', align: 'right' },
  { key: 'y', label: 'yₙ', align: 'right' },
  { key: 'k1', label: 'f(tₙ, yₙ)', align: 'right' },
  { key: 'exacta', label: 'y exacta', align: 'right' },
  { key: 'error', label: 'error', align: 'right' },
];

export const CAMPOS_CALCULADORA_EULER: CampoCalculadoraM5[] = camposEdo({
  funcion: 't + y',
  t0: '0',
  y0: '1',
  h: '0.1',
  tFin: '1',
});

export const DATOS_POR_DEFECTO_EULER: DatosModulo5 = {
  funcion: 't + y',
  t0: 0,
  y0: 1,
  h: 0.1,
  tFin: 1,
  exacta: '2*exp(t) - t - 1',
  etiqueta: 'y′ = t + y, y(0) = 1',
};
