import { Injectable, signal } from '@angular/core';
import { claveDeGate } from './solution-gate.service';

/**
 * RESULTADO ESCRITO Y/O SUBIDO, POR EJERCICIO.
 *
 * Vive en un servicio `root`, así que sobrevive al cambio de pestaña. El
 * archivo se guarda como `File` en memoria del navegador: no hay backend y
 * no se envía nada a ningún servidor.
 *
 * Escribir o elegir un archivo NO cuenta como enviado: hay que apretar
 * «Marcar resultado como enviado». Además, cualquier edición posterior
 * vuelve a poner `enviado` en falso, para que el alumno no cambie el
 * resultado después de desbloquear la solución.
 */

export interface EstadoResultadoEjercicio {
  texto: string;
  archivoNombre: string | null;
  archivo: File | null;
  enviado: boolean;
}

const VACIO: Readonly<EstadoResultadoEjercicio> = {
  texto: '',
  archivoNombre: null,
  archivo: null,
  enviado: false,
};

export { claveDeGate as claveResultado };

@Injectable({ providedIn: 'root' })
export class ResultadoEjercicioService {
  private readonly estados = signal<Readonly<Record<string, EstadoResultadoEjercicio>>>({});

  estado(clave: string): Readonly<EstadoResultadoEjercicio> {
    return this.estados()[clave] ?? VACIO;
  }

  cambiarTexto(clave: string, texto: string): void {
    this.actualizar(clave, { texto, enviado: false });
  }

  cambiarArchivo(clave: string, archivo: File | null): void {
    this.actualizar(clave, {
      archivo,
      archivoNombre: archivo?.name ?? null,
      enviado: false,
    });
  }

  marcarEnviado(clave: string): void {
    const actual = this.estado(clave);
    if (actual.texto.trim() === '' && actual.archivoNombre === null) return;
    this.actualizar(clave, { enviado: true });
  }

  private actualizar(clave: string, cambios: Partial<EstadoResultadoEjercicio>): void {
    this.estados.update((estados) => ({
      ...estados,
      [clave]: { ...(estados[clave] ?? VACIO), ...cambios },
    }));
  }
}
