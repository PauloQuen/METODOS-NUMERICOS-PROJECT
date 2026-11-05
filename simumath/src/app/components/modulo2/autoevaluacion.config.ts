import {
  POLITICA_POR_DEFECTO,
  type NivelDesbloqueo,
} from '../../shared/autoevaluacion-mejorada/solution-gate.service';
import {
  FLAG_AUTOEVALUACION,
  resolverFlag,
} from '../../shared/autoevaluacion-mejorada/feature-flags';

/**
 * POLÍTICA DE DESBLOQUEO DEL MÓDULO 2.
 *
 * Misma cascada que los otros módulos: global → módulo → tipo → método
 * → ejercicio. Acá solo están los tres primeros niveles.
 */
export const DESBLOQUEO_MODULO2: NivelDesbloqueo = {
  politica: 'cualquiera',
  umbralCuestionario: 0.66,
  intentosParaRendirse: 3,
};

export const DESBLOQUEO_TIPOS_MODULO2: Record<string, NivelDesbloqueo> = {
  directos: {},
  iterativos: {},
};

export const DESBLOQUEO_METODOS_MODULO2: Record<string, NivelDesbloqueo> = {
  gauss: {},
  lu: {},
};

/** Niveles que recibe el bloque, del más general al más específico. */
export function politicaDeMetodoM2(tipoId: string, metodoId: string): NivelDesbloqueo[] {
  return [
    POLITICA_POR_DEFECTO,
    DESBLOQUEO_MODULO2,
    DESBLOQUEO_TIPOS_MODULO2[tipoId] ?? {},
    DESBLOQUEO_METODOS_MODULO2[metodoId] ?? {},
  ];
}

/** Bandera por método, resuelta con la cascada global/módulo/tipo/método. */
export function autoevaluacionMejoradaM2(tipoId: string, metodoId: string): boolean {
  return resolverFlag(FLAG_AUTOEVALUACION, {
    moduloId: 'modulo2',
    tipoId,
    metodoId,
  });
}
