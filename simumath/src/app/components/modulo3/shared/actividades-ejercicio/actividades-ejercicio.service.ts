import { Injectable, signal } from '@angular/core';
import {
  evaluarRespuesta,
  type FormatoRespuesta,
  type ValorCorrecto,
} from '../../../../shared/autoevaluacion-mejorada/respuesta.strategy';

/** Lo mínimo que necesita la verificación; sirve para Módulos 1, 2 y 3. */
export interface ResolucionParaVerificar {
  valorCorrecto: ValorCorrecto;
  tolerancia?: number;
  puntosPrueba?: number[];
}

/**
 * ESTADO EN MEMORIA DE LAS ACTIVIDADES DE UN EJERCICIO.
 *
 * ── Por qué un servicio y no un signal dentro del bloque ─────────────
 * Las pestañas del método son rutas hijas: al cambiar de pestaña Angular
 * destruye la Autoevaluación y, con ella, cualquier estado local. Si el
 * alumno abre el cuestionario, va a Teoría y vuelve, tiene que encontrar
 * sus respuestas y el panel donde lo dejó. Este servicio vive en la raíz
 * y conserva ese estado durante la sesión (sin localStorage).
 *
 * ── Por qué la clave es el id del ejercicio ──────────────────────────
 * Los ids del contenido son únicos en todo el Módulo 3. Así el mismo
 * servicio sirve para Lagrange, Mínimos Cuadrados o cualquier método
 * nuevo sin mezclar estados.
 */

/** Cuál de los tres paneles está abierto. `null` = todos cerrados. */
export type PanelActividad = 'solucion' | 'cuestionario' | 'resolucion' | null;

/** Resultado de comparar lo que escribió el alumno con el valor correcto. */
export type VerificacionResolucion =
  | 'sin-verificar'
  | 'acierto'
  | 'casi'
  | 'incorrecto'
  | 'invalido';

/** Todo lo que se recuerda de un ejercicio mientras el alumno navega. */
export interface EstadoActividadEjercicio {
  panel: PanelActividad;
  /** Respuestas del cuestionario: id de pregunta → id de opción. */
  respuestas: Record<string, string>;
  /** ¿Ya se presionó "Comprobar"? */
  comprobado: boolean;
  /** Texto que escribió el alumno en "Tu resultado". */
  entrada: string;
  verificacion: VerificacionResolucion;
  /** ¿Se reveló la respuesta final? */
  mostrarRespuesta: boolean;
}

const ESTADO_INICIAL: EstadoActividadEjercicio = {
  panel: null,
  respuestas: {},
  comprobado: false,
  entrada: '',
  verificacion: 'sin-verificar',
  mostrarRespuesta: false,
};

/** Tolerancia absoluta si el ejercicio no define otra. */
export const TOLERANCIA_RESOLUCION = 0.01;

/** Lo que devuelve la comparación numérica. */
export interface ResultadoVerificacion {
  estado: Exclude<VerificacionResolucion, 'sin-verificar'>;
  valor?: number;
}

/**
 * Compara el texto del alumno con el valor correcto (formato escalar).
 *
 * Se conserva como atajo para los ejercicios de siempre; el trabajo
 * real lo hace la estrategia común de `respuesta.strategy.ts`.
 */
export function evaluarResolucion(
  texto: string,
  valorCorrecto: number,
  tolerancia: number = TOLERANCIA_RESOLUCION,
): ResultadoVerificacion {
  const resultado = evaluarRespuesta(texto, {
    formato: 'escalar',
    valorCorrecto,
    tolerancia,
  });
  return {
    estado: resultado.estado,
    valor: typeof resultado.valor === 'number' ? resultado.valor : undefined,
  };
}

/** Servicio compartido por las tarjetas de autoevaluación del Módulo 3. */
@Injectable({ providedIn: 'root' })
export class ActividadesEjercicioService {
  private readonly estados = signal<Record<string, EstadoActividadEjercicio>>({});

  /** El estado del ejercicio, o uno inicial si todavía no se tocó. */
  estadoDe(id: string): EstadoActividadEjercicio {
    return this.estados()[id] ?? ESTADO_INICIAL;
  }

  /** Abre el panel pedido y cierra el que estuviera abierto. */
  alternarPanel(id: string, panel: Exclude<PanelActividad, null>): void {
    const actual = this.estadoDe(id).panel;
    this.actualizar(id, { panel: actual === panel ? null : panel });
  }

  responder(id: string, preguntaId: string, opcionId: string): void {
    const estado = this.estadoDe(id);
    this.actualizar(id, {
      respuestas: { ...estado.respuestas, [preguntaId]: opcionId },
    });
  }

  comprobar(id: string): void {
    this.actualizar(id, { comprobado: true });
  }

  /** Borra las respuestas y vuelve a habilitar el cuestionario. */
  reintentar(id: string): void {
    this.actualizar(id, { comprobado: false, respuestas: {} });
  }

  actualizarEntrada(id: string, entrada: string): void {
    // Al editar el resultado, el feedback anterior deja de ser válido.
    this.actualizar(id, { entrada, verificacion: 'sin-verificar' });
  }

  /**
   * Verifica la entrada con la estrategia del formato del ejercicio.
   * El formato viaja como parámetro porque lo declara el ejercicio, no
   * la resolución: así un mismo valor puede verificarse de otra manera
   * sin duplicar la capa de comparación.
   */
  verificar(
    id: string,
    resolucion: ResolucionParaVerificar,
    formato: FormatoRespuesta = 'escalar',
  ): void {
    const resultado = evaluarRespuesta(this.estadoDe(id).entrada, {
      formato,
      valorCorrecto: resolucion.valorCorrecto,
      tolerancia: resolucion.tolerancia,
      puntosPrueba: resolucion.puntosPrueba,
    });
    this.actualizar(id, { verificacion: resultado.estado });
  }

  alternarRespuesta(id: string): void {
    this.actualizar(id, { mostrarRespuesta: !this.estadoDe(id).mostrarRespuesta });
  }

  private actualizar(id: string, parcial: Partial<EstadoActividadEjercicio>): void {
    this.estados.update((estados) => ({
      ...estados,
      [id]: { ...(estados[id] ?? ESTADO_INICIAL), ...parcial },
    }));
  }
}
