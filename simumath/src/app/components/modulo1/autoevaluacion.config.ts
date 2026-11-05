import {
  POLITICA_POR_DEFECTO,
  type NivelDesbloqueo,
} from '../../shared/autoevaluacion-mejorada/solution-gate.service';
import {
  FLAG_AUTOEVALUACION,
  resolverFlag,
} from '../../shared/autoevaluacion-mejorada/feature-flags';

/**
 * POLÍTICA DE DESBLOQUEO DEL MÓDULO 1.
 *
 * La cascada va de lo general a lo específico:
 * global → módulo → tipo → método → ejercicio.
 *
 * Los tres primeros niveles están acá; el método y el ejercicio los
 * aporta cada página de autoevaluación.
 */
export const DESBLOQUEO_MODULO1: NivelDesbloqueo = {
  politica: 'cualquiera',
  umbralCuestionario: 0.66,
  intentosParaRendirse: 3,
};

export const DESBLOQUEO_TIPOS_MODULO1: Record<string, NivelDesbloqueo> = {
  cerrados: {},
  abiertos: {},
  polinomios: {},
  transversal: {},
};

export const DESBLOQUEO_METODOS_MODULO1: Record<string, NivelDesbloqueo> = {
  biseccion: {},
  'regla-falsa': {},
  'newton-raphson': {},
  secante: {},
  'punto-fijo': {},
  cardano: {},
  transversal: {},
};

/** Niveles que recibe el bloque, del más general al más específico. */
export function politicaDeMetodoM1(tipoId: string, metodoId: string): NivelDesbloqueo[] {
  return [
    POLITICA_POR_DEFECTO,
    DESBLOQUEO_MODULO1,
    DESBLOQUEO_TIPOS_MODULO1[tipoId] ?? {},
    DESBLOQUEO_METODOS_MODULO1[metodoId] ?? {},
  ];
}

/** Bandera por método, resuelta con la cascada global/módulo/tipo/método. */
export function autoevaluacionMejoradaM1(tipoId: string, metodoId: string): boolean {
  return resolverFlag(FLAG_AUTOEVALUACION, {
    moduloId: 'modulo1',
    tipoId,
    metodoId,
  });
}
