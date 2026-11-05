import {
  POLITICA_POR_DEFECTO,
  type NivelDesbloqueo,
} from '../../shared/autoevaluacion-mejorada/solution-gate.service';
import {
  FLAG_AUTOEVALUACION,
  resolverFlag,
} from '../../shared/autoevaluacion-mejorada/feature-flags';

/**
 * POLÍTICA DE DESBLOQUEO DEL MÓDULO 3.
 *
 * La cascada se arma de lo general a lo específico:
 * global → módulo → tipo → método → ejercicio.
 * Acá solo están los tres primeros niveles; el método y el ejercicio
 * los aporta cada página. Los valores repetidos respecto del default
 * están escritos a propósito: sirven de documentación de la política
 * vigente y se pueden cambiar sin tocar componentes.
 */
export const DESBLOQUEO_MODULO3: NivelDesbloqueo = {
  politica: 'cualquiera',
  umbralCuestionario: 0.66,
  intentosParaRendirse: 3,
};

export const DESBLOQUEO_TIPOS_MODULO3: Record<string, NivelDesbloqueo> = {
  interpolacion: {},
  ajuste: {},
};

export const DESBLOQUEO_METODOS_MODULO3: Record<string, NivelDesbloqueo> = {
  lagrange: {},
  'lagrange-nuevo': {},
  'minimos-cuadrados': {},
};

/** Niveles que recibe el bloque, del más general al más específico. */
export function politicaDeMetodoM3(tipoId: string, metodoId: string): NivelDesbloqueo[] {
  return [
    POLITICA_POR_DEFECTO,
    DESBLOQUEO_MODULO3,
    DESBLOQUEO_TIPOS_MODULO3[tipoId] ?? {},
    DESBLOQUEO_METODOS_MODULO3[metodoId] ?? {},
  ];
}

/** Bandera por método, resuelta con la cascada global/módulo/tipo/método. */
export function autoevaluacionMejoradaM3(tipoId: string, metodoId: string): boolean {
  return resolverFlag(FLAG_AUTOEVALUACION, {
    moduloId: 'modulo3',
    tipoId,
    metodoId,
  });
}
