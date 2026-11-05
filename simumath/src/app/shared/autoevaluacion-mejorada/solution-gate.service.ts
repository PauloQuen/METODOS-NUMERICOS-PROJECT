import { Injectable, signal } from '@angular/core';

export type PoliticaDesbloqueo = 'cuestionario' | 'respuesta' | 'cualquiera' | 'ambos';

export interface PoliticaDesbloqueoConfig {
  politica: PoliticaDesbloqueo;
  umbralCuestionario: number;
  intentosParaRendirse: number;
}

export const POLITICA_POR_DEFECTO: PoliticaDesbloqueoConfig = {
  politica: 'cualquiera',
  umbralCuestionario: 0.66,
  intentosParaRendirse: 3,
};

export interface EstadoGate {
  cuestionarioAprobado: boolean;
  respuestasCorrectas: number;
  totalPreguntas: number;
  respuestaCorrecta: boolean;
  /** Intentos fallidos acumulados (cuestionario o respuesta). */
  intentosRespuesta: number;
  verSolucionForzado: boolean;
}

/** Configuración parcial de un nivel de la cascada. */
export interface NivelDesbloqueo {
  politica?: PoliticaDesbloqueo;
  umbralCuestionario?: number;
  intentosParaRendirse?: number;
}

/**
 * Punto de enchufe para persistir el progreso. La app usa memoria
 * (el signal de este servicio); si algún día se quiere localStorage,
 * alcanza con implementar esta interfaz y pasar el almacén al servicio.
 */
export interface ProgresoStorage {
  leer(clave: string): EstadoGate | null;
  escribir(clave: string, estado: EstadoGate): void;
}

/**
 * Resuelve la política con herencia en cascada. El orden del arreglo
 * va de lo más general a lo más específico: global → módulo → tipo →
 * método → ejercicio. Cada campo definido pisa al anterior; los que no
 * están definidos conservan el valor heredado.
 */
export function resolverConfig(
  niveles: readonly NivelDesbloqueo[],
): PoliticaDesbloqueoConfig {
  const resultado: PoliticaDesbloqueoConfig = { ...POLITICA_POR_DEFECTO };
  for (const nivel of niveles) {
    if (nivel.politica !== undefined) resultado.politica = nivel.politica;
    if (nivel.umbralCuestionario !== undefined) {
      resultado.umbralCuestionario = nivel.umbralCuestionario;
    }
    if (nivel.intentosParaRendirse !== undefined) {
      resultado.intentosParaRendirse = nivel.intentosParaRendirse;
    }
  }
  return resultado;
}

/** Clave única por método + ejercicio (evita colisiones entre métodos). */
export function claveDeGate(
  moduloId: string,
  tipoId: string,
  metodoId: string,
  ejercicioId: string,
): string {
  return `${moduloId}/${tipoId}/${metodoId}/${ejercicioId}`;
}

const ESTADO_INICIAL: EstadoGate = {
  cuestionarioAprobado: false,
  respuestasCorrectas: 0,
  totalPreguntas: 0,
  respuestaCorrecta: false,
  intentosRespuesta: 0,
  verSolucionForzado: false,
};

@Injectable({ providedIn: 'root' })
export class SolutionGateService {
  private readonly estados = signal<Record<string, EstadoGate>>({});

  estadoDe(clave: string): EstadoGate {
    return this.estados()[clave] ?? ESTADO_INICIAL;
  }

  actualizar(clave: string, parcial: Partial<EstadoGate>): void {
    this.estados.update((arr) => {
      const actual = arr[clave] ?? ESTADO_INICIAL;
      return { ...arr, [clave]: { ...actual, ...parcial } };
    });
  }

  puedeDesbloquear(clave: string, config: PoliticaDesbloqueoConfig = POLITICA_POR_DEFECTO): boolean {
    const e = this.estadoDe(clave);
    if (e.verSolucionForzado) return true;
    if (config.politica === 'cuestionario') return e.cuestionarioAprobado;
    if (config.politica === 'respuesta') return e.respuestaCorrecta;
    if (config.politica === 'ambos') return e.cuestionarioAprobado && e.respuestaCorrecta;
    // cualquiera
    return e.cuestionarioAprobado || e.respuestaCorrecta;
  }

  textoQueFalta(clave: string, config: PoliticaDesbloqueoConfig = POLITICA_POR_DEFECTO): string {
    const e = this.estadoDe(clave);
    if (this.puedeDesbloquear(clave, config)) return '';
    if (config.politica === 'cuestionario') return 'Aprueba el cuestionario para desbloquear la solución.';
    if (config.politica === 'respuesta') return 'Verifica tu respuesta correctamente para desbloquear la solución.';
    if (config.politica === 'ambos') return 'Aprueba el cuestionario y verifica tu respuesta para desbloquear la solución.';
    return 'Resuelve el cuestionario o verifica tu respuesta para desbloquear la solución.';
  }

  debeMostrarRendirse(clave: string, config: PoliticaDesbloqueoConfig = POLITICA_POR_DEFECTO): boolean {
    const e = this.estadoDe(clave);
    return !this.puedeDesbloquear(clave, config) && e.intentosRespuesta >= config.intentosParaRendirse && !e.verSolucionForzado;
  }
}
