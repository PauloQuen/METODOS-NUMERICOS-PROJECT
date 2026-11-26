import { Injectable, signal } from '@angular/core';
import { claveDeGate } from './solution-gate.service';

/**
 * RESPUESTAS DEL CUESTIONARIO ESTRICTO, POR EJERCICIO.
 *
 * Vive en un servicio `root` para que el cuestionario no se pierda al
 * cambiar de pestaña (los bloques de ejercicio se destruyen y se crean).
 * Es memoria del navegador: no hay `localStorage` ni backend.
 *
 * Cambiar una respuesta invalida la comprobación anterior, igual que en
 * el comportamiento que ya tenían los bloques de M4 y M5. La apertura de
 * los paneles también vive acá: así no se pierde al cambiar de pestaña.
 */

export type PanelCuestionarioEstricto = 'cuestionario' | 'resultado';

export interface EstadoCuestionarioEstricto {
  respuestas: Readonly<Record<string, string>>;
  comprobado: boolean;
  /** panels desplegables, como en la autoevaluación del Módulo 3 */
  cuestionarioAbierto: boolean;
  resultadoAbierto: boolean;
}

const VACIO: Readonly<EstadoCuestionarioEstricto> = {
  respuestas: {},
  comprobado: false,
  cuestionarioAbierto: false,
  resultadoAbierto: false,
};

export { claveDeGate as claveCuestionario };

@Injectable({ providedIn: 'root' })
export class CuestionarioEstrictoService {
  private readonly estados = signal<Readonly<Record<string, EstadoCuestionarioEstricto>>>({});

  estado(clave: string): Readonly<EstadoCuestionarioEstricto> {
    return this.estados()[clave] ?? VACIO;
  }

  responder(clave: string, preguntaId: string, opcionId: string): void {
    this.actualizar(clave, {
      respuestas: { ...this.estado(clave).respuestas, [preguntaId]: opcionId },
      comprobado: false,
    });
  }

  comprobar(clave: string): void {
    this.actualizar(clave, { comprobado: true });
  }

  /** Muestra u oculta un panel sin afectar respuestas ni comprobación. */
  alternarPanel(clave: string, panel: PanelCuestionarioEstricto): void {
    const campo = panel === 'cuestionario' ? 'cuestionarioAbierto' : 'resultadoAbierto';
    this.actualizar(clave, { [campo]: !this.estado(clave)[campo] });
  }

  private actualizar(clave: string, cambios: Partial<EstadoCuestionarioEstricto>): void {
    this.estados.update((estados) => ({
      ...estados,
      [clave]: { ...(estados[clave] ?? VACIO), ...cambios },
    }));
  }
}
