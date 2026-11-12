import {
  POLITICA_POR_DEFECTO,
  type NivelDesbloqueo,
} from '../../shared/autoevaluacion-mejorada/solution-gate.service';
import { FLAG_AUTOEVALUACION, resolverFlag } from '../../shared/autoevaluacion-mejorada/feature-flags';

/**
 * POLÍTICA DE DESBLOQUEO DEL MÓDULO 0.
 *
 * Misma cascada que el resto del portal:
 * global → módulo → tipo → método → ejercicio.
 *
 * Los valores son idénticos a los del Módulo 1 y el Módulo 3 a propósito:
 * el alumno no debe reaprender el candado al cambiar de módulo. Se
 * declaran acá (y no se heredan del Módulo 3) para que cada módulo tenga
 * su política explícita y se pueda ajustar sin tocar a los demás.
 */
export const DESBLOQUEO_MODULO0: NivelDesbloqueo = {
  politica: 'cualquiera',
  umbralCuestionario: 0.66,
  intentosParaRendirse: 3,
};

export const DESBLOQUEO_TIPOS_MODULO0: Record<string, NivelDesbloqueo> = {
  aritmetica: {},
  medicion: {},
  truncamiento: {},
  propagacion: {},
};

export const DESBLOQUEO_METODOS_MODULO0: Record<string, NivelDesbloqueo> = {
  'cifras-significativas': {},
  'error-absoluto-relativo': {},
  taylor: {},
  'propagacion-errores': {},
};

/** Niveles que recibe el bloque de ejercicio, del más general al específico. */
export function politicaDeMetodoM0(tipoId: string, metodoId: string): NivelDesbloqueo[] {
  return [
    POLITICA_POR_DEFECTO,
    DESBLOQUEO_MODULO0,
    DESBLOQUEO_TIPOS_MODULO0[tipoId] ?? {},
    DESBLOQUEO_METODOS_MODULO0[metodoId] ?? {},
  ];
}

/** Bandera de la autoevaluación mejorada, resuelta para este método. */
export function autoevaluacionMejoradaM0(tipoId: string, metodoId: string): boolean {
  return resolverFlag(FLAG_AUTOEVALUACION, {
    moduloId: 'modulo0',
    tipoId,
    metodoId,
  });
}
