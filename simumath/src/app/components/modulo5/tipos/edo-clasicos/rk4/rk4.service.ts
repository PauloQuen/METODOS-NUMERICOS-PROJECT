import { Injectable, signal } from '@angular/core';
import type {
  DatosModulo5,
  EjemploModulo5,
  RespuestaCalculadoraM5,
} from '../../../modelos/modulo5.model';
import { rungeKutta4 } from './rk4.algoritmo';
import type { EdoVista } from '../../../shared/edo-vista';
import {
  armarRespuestaEdo,
  compilarExacta,
  compilarF,
  filasDeRk4,
} from '../../../shared/edo';

/**
 * Orquestador de RK4: compila f(t, y), corre el algoritmo y formatea la
 * tabla (con k₁…k₄) y la respuesta de la calculadora.
 */
@Injectable({ providedIn: 'any' })
export class Rk4Service {
  private readonly estado = signal<Rk4Estado | null>(null);

  readonly resultado = this.estado.asReadonly();

  calcular(datos: DatosModulo5): Rk4Estado {
    const estado = this.ejecutar(datos);
    this.estado.set(estado);
    return estado;
  }

  limpiar(): void {
    this.estado.set(null);
  }

  calcularEjemplo(ejemplo: EjemploModulo5): Rk4Estado {
    return this.ejecutar(ejemplo.calculo);
  }

  calcularDesdeTexto(entrada: {
    funcion: string;
    t0: string;
    y0: string;
    h: string;
    tFin: string;
    exacta?: string;
  }): Rk4Estado {
    const t0 = Number(entrada.t0);
    const y0 = Number(entrada.y0);
    const h = Number(entrada.h);
    const tFin = Number(entrada.tFin);

    if (![t0, y0, h, tFin].every((v) => Number.isFinite(v))) {
      return this.guardarFallo(entrada.funcion, 't₀, y₀, h y t final tienen que ser números.');
    }
    if (h <= 0) {
      return this.guardarFallo(entrada.funcion, 'El paso h tiene que ser mayor que 0.');
    }
    if (tFin <= t0) {
      return this.guardarFallo(entrada.funcion, 'El instante final tiene que ser mayor que t₀.');
    }

    const exactaTexto = (entrada.exacta ?? '').trim();
    if (exactaTexto !== '' && !compilarExacta(exactaTexto)) {
      return this.guardarFallo(
        entrada.funcion,
        'No se pudo interpretar la solución exacta. Dejala vacía o escribila con t, por ejemplo exp(t).',
      );
    }

    return this.calcular({
      funcion: entrada.funcion,
      t0,
      y0,
      h,
      tFin,
      exacta: exactaTexto === '' ? undefined : exactaTexto,
    });
  }

  exactaDe(datos: DatosModulo5): ((t: number) => number) | undefined {
    return compilarExacta(datos.exacta);
  }

  rangoPara(datos: DatosModulo5): { min: number; max: number } {
    const min = Math.min(datos.t0, datos.tFin);
    const max = Math.max(datos.t0, datos.tFin);
    const margen = (max - min) * 0.03 || 1;
    return { min: min - margen, max: max + margen };
  }

  private ejecutar(datos: DatosModulo5): Rk4Estado {
    const compilada = compilarF(datos.funcion);
    if (!compilada.f) return fallo(datos, compilada.error ?? 'No se pudo interpretar f(t, y).');

    const exacta = compilarExacta(datos.exacta);

    const r = rungeKutta4({
      f: compilada.f,
      t0: datos.t0,
      y0: datos.y0,
      h: datos.h,
      tFin: datos.tFin,
      exacta,
    });

    if (r.mensaje) return fallo(datos, r.mensaje);

    const todas = filasDeRk4(r);
    const { filas, ocultas } = recortar(todas);

    return {
      datos,
      funcionTexto: datos.funcion,
      exactaTexto: datos.exacta,
      t0: r.t0,
      y0: r.y0,
      h: r.h,
      tFin: r.tFin,
      pasos: r.pasos,
      yFinal: r.yFinal,
      exactaFinal: r.exactaFinal,
      errorFinal: r.errorFinal,
      errorRel: r.errorRel,
      filas,
      filasOcultas: ocultas,
      respuesta: armarRespuestaEdo('RK4', datos, r),
    };
  }

  private guardarFallo(funcion: string, mensaje: string): Rk4Estado {
    const estado = fallo({ funcion, t0: 0, y0: 0, h: 0, tFin: 0 }, mensaje);
    this.estado.set(estado);
    return estado;
  }
}

export interface Rk4Estado extends EdoVista {
  datos: DatosModulo5;
  respuesta: RespuestaCalculadoraM5;
}

const MAX_FILAS_TABLA = 1000;

function recortar(filas: Record<string, number | string>[]): {
  filas: Record<string, number | string>[];
  ocultas: number;
} {
  if (filas.length <= MAX_FILAS_TABLA) return { filas, ocultas: 0 };
  return { filas: filas.slice(0, MAX_FILAS_TABLA), ocultas: filas.length - MAX_FILAS_TABLA };
}

function fallo(datos: DatosModulo5, mensaje: string): Rk4Estado {
  return {
    datos,
    funcionTexto: datos.funcion,
    exactaTexto: datos.exacta,
    t0: datos.t0,
    y0: datos.y0,
    h: datos.h,
    tFin: datos.tFin,
    pasos: 0,
    yFinal: 0,
    filas: [],
    respuesta: { exito: false, conclusion: mensaje },
  };
}
