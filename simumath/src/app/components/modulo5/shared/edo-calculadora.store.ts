import { Injectable, signal } from '@angular/core';
import type { DatosModulo5, RespuestaCalculadoraM5 } from '../modelos/modulo5.model';

export type MetodoCalculadora = 'euler' | 'rk4';

/** Resultado guardado de una calculadora, para que sobreviva al cambio
 *  de pestaña. */
export interface EstadoCalculadoraEdo {
  datos: DatosModulo5;
  filas: Record<string, number | string>[];
  filasOcultas: number;
  pasos: number;
  yFinal: number;
  exactaFinal?: number;
  errorFinal?: number;
  errorRel?: number;
  respuesta: RespuestaCalculadoraM5;
}

/**
 * Estado de las calculadoras del Módulo 5.
 *
 * `providedIn: 'any'` mantiene una instancia por bundle de carga
 * diferida. Guarda el último cálculo y lo que escribió el alumno por
 * método, así cambiar de pestaña no borra el trabajo.
 */
@Injectable({ providedIn: 'any' })
export class EdoCalculadoraStore {
  private readonly _estados = signal<Record<MetodoCalculadora, EstadoCalculadoraEdo | null>>({
    euler: null,
    rk4: null,
  });

  private readonly _valores = signal<Record<MetodoCalculadora, Record<string, string>>>({
    euler: {},
    rk4: {},
  });

  readonly estados = this._estados.asReadonly();
  readonly valores = this._valores.asReadonly();

  estadoDe(metodo: MetodoCalculadora): EstadoCalculadoraEdo | null {
    return this._estados()[metodo];
  }

  guardar(metodo: MetodoCalculadora, estado: EstadoCalculadoraEdo | null): void {
    this._estados.update((e) => ({ ...e, [metodo]: estado }));
  }

  guardarValores(metodo: MetodoCalculadora, valores: Record<string, string>): void {
    this._valores.update((v) => ({ ...v, [metodo]: valores }));
  }

  /** Vuelve el formulario a los valores iniciales y borra el cálculo. */
  limpiar(metodo: MetodoCalculadora): void {
    this._estados.update((e) => ({ ...e, [metodo]: null }));
    this._valores.update((v) => ({ ...v, [metodo]: {} }));
  }
}
