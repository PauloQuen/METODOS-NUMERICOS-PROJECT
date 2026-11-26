import type { Columna } from '../../../../../shared/models/metodo.model';
import type {
  CampoCalculadoraM5,
  DatosModulo5,
} from '../../../modelos/modulo5.model';
import { camposEdo } from '../../../shared/edo';

export const RK4 = {
  key: 'rk4',
  nombre: 'Runge-Kutta de orden 4 (RK4)',
  familia: 'edo-clasicos' as const,
  resumen: 'Combina cuatro pendientes del paso con pesos 1-2-2-1.',
  color: '#8a5a00',
} as const;

/**
 * Tabla de RK4: además de tₙ e yₙ se muestran las cuatro pendientes que
 * se promedian. Es la tabla que hace visible de dónde sale el factor h/6.
 */
export const COLUMNAS_RK4: Columna[] = [
  { key: 'n', label: 'n', align: 'right' },
  { key: 't', label: 'tₙ', align: 'right' },
  { key: 'y', label: 'yₙ', align: 'right' },
  { key: 'k1', label: 'k₁', align: 'right' },
  { key: 'k2', label: 'k₂', align: 'right' },
  { key: 'k3', label: 'k₃', align: 'right' },
  { key: 'k4', label: 'k₄', align: 'right' },
  { key: 'exacta', label: 'y exacta', align: 'right' },
  { key: 'error', label: 'error', align: 'right' },
];

export const CAMPOS_CALCULADORA_RK4: CampoCalculadoraM5[] = camposEdo({
  funcion: 't + y',
  t0: '0',
  y0: '1',
  h: '0.2',
  tFin: '1',
});

export const DATOS_POR_DEFECTO_RK4: DatosModulo5 = {
  funcion: 't + y',
  t0: 0,
  y0: 1,
  h: 0.2,
  tFin: 1,
  exacta: '2*exp(t) - t - 1',
  etiqueta: 'y′ = t + y, y(0) = 1',
};
