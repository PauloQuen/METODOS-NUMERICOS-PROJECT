/**
 * BANDERA DE LA AUTOEVALUACIÓN MEJORADA.
 *
 * Se resuelve con la misma idea que la política de desbloqueo: el valor
 * más específico gana. `global` es el piso; después módulo, tipo y
 * método. Con la bandera apagada, el método muestra exactamente la
 * autoevaluación de siempre (solo "Ver solución").
 *
 * ── Cómo encenderla ──────────────────────────────────────────────────
 * Para un método puntual:
 *   metodos: { 'modulo1/tipos/cerrados/biseccion': true }
 * Para todo un tipo:
 *   tipos: { 'modulo1/tipos/cerrados': true }
 * Para un módulo entero:
 *   modulos: { modulo3: true }
 *
 * La configuración del portal enciende los tres módulos. La bandera
 * sigue disponible para apagar un método puntual sin tocar su contenido.
 */

export interface FlagAutoevaluacionConfig {
  global?: boolean;
  modulos?: Record<string, boolean>;
  tipos?: Record<string, boolean>;
  metodos?: Record<string, boolean>;
}

export interface ContextoFlag {
  moduloId: string;
  tipoId: string;
  metodoId: string;
}

export function resolverFlag(
  config: FlagAutoevaluacionConfig,
  contexto: ContextoFlag,
): boolean {
  const claveTipo = `${contexto.moduloId}/${contexto.tipoId}`;
  const claveMetodo = `${claveTipo}/${contexto.metodoId}`;

  if (config.metodos?.[claveMetodo] !== undefined) {
    return config.metodos[claveMetodo];
  }
  if (config.tipos?.[claveTipo] !== undefined) {
    return config.tipos[claveTipo];
  }
  if (config.modulos?.[contexto.moduloId] !== undefined) {
    return config.modulos[contexto.moduloId];
  }
  return config.global ?? false;
}

/**
 * Configuración del portal. Los tres módulos usan la autoevaluación
 * mejorada: Ver solución + Cuestionario + Resolución con desbloqueo.
 * La bandera sigue existiendo para poder apagar un método puntual sin
 * tocar su contenido.
 */
export const FLAG_AUTOEVALUACION: FlagAutoevaluacionConfig = {
  global: false,
  modulos: {
    modulo0: true,
    modulo1: true,
    modulo2: true,
    modulo3: true,
  },
};
