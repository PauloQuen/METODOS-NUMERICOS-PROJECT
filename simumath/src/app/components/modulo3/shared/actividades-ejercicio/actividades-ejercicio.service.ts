import { Injectable, signal } from '@angular/core';
import {
  evaluarRespuesta,
  type FormatoRespuesta,
  type ValorCorrecto,
} from '../../../../shared/autoevaluacion-mejorada/respuesta.strategy';
import { barajar } from '../../../../shared/autoevaluacion-mejorada/barajar';

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

/** Pregunta mínima para ordenar y mezclar; sirve para M0, M1, M2 y M3. */
export interface PreguntaOrdenable {
  id: string;
  opciones: readonly { id: string }[];
}

/** Todo lo que se recuerda de un ejercicio mientras el alumno navega. */
export interface EstadoActividadEjercicio {
  panel: PanelActividad;
  /** Respuestas del cuestionario: id de pregunta → id de opción. */
  respuestas: Record<string, string>;
  /** ¿Ya se presionó "Comprobar"? */
  comprobado: boolean;
  /** Orden visible de las preguntas; se conserva para no saltar al responder. */
  ordenPreguntas: string[];
  /** Orden visible de las opciones por pregunta. */
  ordenOpciones: Record<string, string[]>;
  /** Respuestas del minicuestionario de la solución guiada. */
  respuestasGuia: Record<string, string>;
  /** ¿Ya se comprobó la pregunta de ese paso? */
  comprobadasGuia: Record<string, boolean>;
  /** Orden visible de las opciones de cada paso de la guía. */
  ordenOpcionesGuia: Record<string, string[]>;
  /** Texto que escribió el alumno en "Tu resultado". */
  entrada: string;
  verificacion: VerificacionResolucion;
  /** ¿Se reveló la respuesta final? */
  mostrarRespuesta: boolean;
  /** Paso actual de la solución guiada (0 = primero). */
  pasoGuia: number;
}

const ESTADO_INICIAL: EstadoActividadEjercicio = {
  panel: null,
  respuestas: {},
  comprobado: false,
  ordenPreguntas: [],
  ordenOpciones: {},
  respuestasGuia: {},
  comprobadasGuia: {},
  ordenOpcionesGuia: {},
  entrada: '',
  verificacion: 'sin-verificar',
  mostrarRespuesta: false,
  pasoGuia: 0,
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

  /**
   * Prepara el orden visible del cuestionario una sola vez.
   *
   * Baraja preguntas y opciones, y conserva ese orden en el estado para
   * que responder no haga saltar la pregunta de lugar. Si el contenido
   * cambia, completa únicamente lo que falta.
   */
  prepararCuestionario(id: string, preguntas: readonly PreguntaOrdenable[]): void {
    const estado = this.estadoDe(id);
    const ids = preguntas.map((pregunta) => pregunta.id);
    const ordenCompleto =
      estado.ordenPreguntas.length === ids.length &&
      ids.every((preguntaId) => estado.ordenPreguntas.includes(preguntaId));

    if (ordenCompleto) {
      this.prepararOpciones(id, preguntas, estado.ordenOpciones);
      return;
    }

    const ordenOpciones = { ...estado.ordenOpciones };
    for (const pregunta of preguntas) {
      if (!ordenOpciones[pregunta.id]) {
        ordenOpciones[pregunta.id] = barajar(pregunta.opciones.map((opcion) => opcion.id));
      }
    }

    this.actualizar(id, {
      ordenPreguntas: barajar(ids),
      ordenOpciones,
    });
  }

  private prepararOpciones(
    id: string,
    preguntas: readonly PreguntaOrdenable[],
    ordenOpciones: Record<string, string[]>,
  ): void {
    let cambios = false;
    const siguiente = { ...ordenOpciones };
    for (const pregunta of preguntas) {
      const orden = siguiente[pregunta.id];
      const ids = pregunta.opciones.map((opcion) => opcion.id);
      if (!orden || orden.length !== ids.length) {
        siguiente[pregunta.id] = barajar(ids);
        cambios = true;
      }
    }
    if (cambios) this.actualizar(id, { ordenOpciones: siguiente });
  }

  /** Borra las respuestas y vuelve a habilitar el cuestionario. */
  reintentar(id: string, preguntas: readonly PreguntaOrdenable[] = []): void {
    const ordenPreguntas = barajar(preguntas.map((pregunta) => pregunta.id));
    const ordenOpciones: Record<string, string[]> = {};
    for (const pregunta of preguntas) {
      ordenOpciones[pregunta.id] = barajar(pregunta.opciones.map((opcion) => opcion.id));
    }
    this.actualizar(id, {
      comprobado: false,
      respuestas: {},
      ordenPreguntas,
      ordenOpciones,
    });
  }

  /** Orden actual de las preguntas; si todavía no se preparó, el original. */
  ordenPreguntasDe(id: string): readonly string[] {
    return this.estadoDe(id).ordenPreguntas;
  }

  /** Orden actual de las opciones de una pregunta. */
  ordenOpcionesDe(id: string, preguntaId: string): readonly string[] {
    return this.estadoDe(id).ordenOpciones[preguntaId] ?? [];
  }

  /** Prepara el orden de las opciones de una pregunta de la guía. */
  prepararOpcionesGuia(id: string, clave: string, opciones: readonly { id: string }[]): void {
    const estado = this.estadoDe(id);
    const orden = estado.ordenOpcionesGuia[clave];
    if (orden && orden.length === opciones.length) return;
    this.actualizar(id, {
      ordenOpcionesGuia: {
        ...estado.ordenOpcionesGuia,
        [clave]: barajar(opciones.map((opcion) => opcion.id)),
      },
    });
  }

  opcionesGuiaDe(id: string, clave: string): readonly string[] {
    return this.estadoDe(id).ordenOpcionesGuia[clave] ?? [];
  }

  respuestaGuiaDe(id: string, clave: string): string {
    return this.estadoDe(id).respuestasGuia[clave] ?? '';
  }

  guiaComprobadaDe(id: string, clave: string): boolean {
    return this.estadoDe(id).comprobadasGuia[clave] ?? false;
  }

  responderGuia(id: string, clave: string, opcionId: string): void {
    const estado = this.estadoDe(id);
    this.actualizar(id, {
      respuestasGuia: { ...estado.respuestasGuia, [clave]: opcionId },
      comprobadasGuia: { ...estado.comprobadasGuia, [clave]: false },
    });
  }

  comprobarGuia(id: string, clave: string): void {
    const estado = this.estadoDe(id);
    if (!estado.respuestasGuia[clave]) return;
    this.actualizar(id, {
      comprobadasGuia: { ...estado.comprobadasGuia, [clave]: true },
    });
  }

  reiniciarGuia(id: string): void {
    this.actualizar(id, {
      pasoGuia: 0,
      respuestasGuia: {},
      comprobadasGuia: {},
      ordenOpcionesGuia: {},
    });
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

  /** Paso recordado de la solución guiada, para sobrevivir al cambio de pestaña. */
  pasoGuiaDe(id: string): number {
    return this.estadoDe(id).pasoGuia;
  }

  /** Paso actual del minicuestionario para una pregunta concreta. */
  claveGuia(paso: number, preguntaId: string): string {
    return `${paso}:${preguntaId}`;
  }

  guardarPasoGuia(id: string, paso: number): void {
    this.actualizar(id, { pasoGuia: Math.max(0, paso) });
  }

  private actualizar(id: string, parcial: Partial<EstadoActividadEjercicio>): void {
    this.estados.update((estados) => ({
      ...estados,
      [id]: { ...(estados[id] ?? ESTADO_INICIAL), ...parcial },
    }));
  }
}
