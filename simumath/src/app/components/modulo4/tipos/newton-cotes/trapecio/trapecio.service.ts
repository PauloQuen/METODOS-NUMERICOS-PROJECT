import { Injectable, signal } from '@angular/core';
import type {
  DatosModulo4,
  EjemploModulo4,
  RespuestaCalculadoraM4,
} from '../../../modelos/modulo4.model';
import {
  trapecioCompuesto,
  type ResultadoTrapecio,
} from './trapecio.algoritmo';
import type { IntegracionVista } from '../../../shared/integracion-vista';
import { numero, porcentaje } from '../../../shared/formato';
import { FuncionEvaluable } from '../../../../../shared/domain/numerico/evaluador-funciones';
import { ErrorExpresion } from '../../../../../shared/domain/numerico/tokenizador';

/**
 * Orquestador del trapecio: el pegamento entre el contenido y el motor.
 *
 *   trapecio.algoritmo.ts → la matemática (función pura)
 *   trapecio.contenido.ts → los textos y los enunciados
 *   trapecio.config.ts    → columnas y campos
 *   ESTE archivo          → compilar la función, formatear la tabla y
 *                           armar la respuesta de la calculadora
 *
 * `providedIn: 'any'`: una instancia por bundle de carga diferida, así
 * el cálculo sobrevive al cambio de pestaña pero no se mezcla con el de
 * Simpson.
 */
@Injectable({ providedIn: 'any' })
export class TrapecioService {
  private readonly estado = signal<TrapecioEstado | null>(null);

  /** El resultado del último cálculo, o null si todavía no calculó. */
  readonly resultado = this.estado.asReadonly();

  /** Corre el método con los datos que le pasaron. */
  calcular(datos: DatosModulo4): TrapecioEstado {
    const estado = this.ejecutar(datos);
    this.estado.set(estado);
    return estado;
  }

  /** Borra el cálculo. Lo llama el botón "Limpiar". */
  limpiar(): void {
    this.estado.set(null);
  }

  /** Corre el método para un ejemplo del contenido, sin guardarlo. */
  calcularEjemplo(ejemplo: EjemploModulo4): TrapecioEstado {
    return this.ejecutar(ejemplo.calculo);
  }

  /**
   * Corre el método a partir de lo que escribió el alumno.
   * El parseo y los mensajes de error viven acá para que salgan de un
   * solo lugar; si algo no se entiende, se guarda un estado de fallo.
   */
  calcularDesdeTexto(entrada: {
    funcion: string;
    a: string;
    b: string;
    n: string;
    valorExacto?: string;
  }): TrapecioEstado {
    const a = Number(entrada.a);
    const b = Number(entrada.b);
    const n = Number(entrada.n);

    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return this.guardarFallo(entrada.funcion, 'a y b tienen que ser números.');
    }
    if (!Number.isInteger(n) || n < 1) {
      return this.guardarFallo(
        entrada.funcion,
        'n tiene que ser un entero mayor o igual que 1 (por ejemplo 4, 8 o 16).',
      );
    }

    const exactoTexto = (entrada.valorExacto ?? '').trim();
    let valorExacto: number | undefined;
    if (exactoTexto !== '') {
      const parsed = Number(exactoTexto);
      if (!Number.isFinite(parsed)) {
        return this.guardarFallo(entrada.funcion, 'El valor exacto tiene que ser un número.');
      }
      valorExacto = parsed;
    }

    return this.calcular({ funcion: entrada.funcion, a, b, n, valorExacto });
  }

  /* ---------------------------------------------------------------- */
  /* Utilidades para las pestañas                                      */
  /* ---------------------------------------------------------------- */

  /** f compilada, para el gráfico. Si el texto no se entiende, NaN. */
  funcionDe(datos: DatosModulo4): (x: number) => number {
    try {
      const f = FuncionEvaluable.compilar(datos.funcion);
      return (x: number) => f.evaluar(x);
    } catch {
      return () => NaN;
    }
  }

  /** El rango del eje x que conviene mostrar: [a, b] con un margen. */
  rangoPara(datos: DatosModulo4): { min: number; max: number } {
    const min = Math.min(datos.a, datos.b);
    const max = Math.max(datos.a, datos.b);
    const margen = (max - min) * 0.08 || 1;
    return { min: min - margen, max: max + margen };
  }

  /* ---------------------------------------------------------------- */
  /* El trabajo de verdad                                              */
  /* ---------------------------------------------------------------- */

  private ejecutar(datos: DatosModulo4): TrapecioEstado {
    let f: (x: number) => number;
    try {
      const compilada = FuncionEvaluable.compilar(datos.funcion);
      f = (x: number) => compilada.evaluar(x);
    } catch (error) {
      const mensaje =
        error instanceof ErrorExpresion
          ? error.message
          : 'No se pudo interpretar la función. Revisá la sintaxis.';
      return fallo(datos, mensaje);
    }

    const r = trapecioCompuesto({
      f,
      a: datos.a,
      b: datos.b,
      n: datos.n,
      valorExacto: datos.valorExacto,
    });

    if (r.mensaje) {
      return fallo(datos, r.mensaje);
    }

    const filas = r.filas.map((fila) => ({
      i: fila.i,
      xi: fila.xi === '' ? '' : numero(Number(fila.xi)),
      fxi: fila.fxi === '' ? '' : numero(Number(fila.fxi)),
      coef: fila.coef,
      aporte: fila.aporte === '' ? '' : numero(Number(fila.aporte)),
    }));

    return {
      datos,
      funcionTexto: datos.funcion,
      a: datos.a,
      b: datos.b,
      n: r.n,
      h: r.h,
      integral: r.integral,
      exacto: r.exacto,
      errorAbs: r.errorAbs,
      errorRel: r.errorRel,
      filas,
      suma: r.suma,
      respuesta: armarRespuesta(datos, r),
    };
  }

  private guardarFallo(funcion: string, mensaje: string): TrapecioEstado {
    const estado = fallo({ funcion, a: 0, b: 0, n: 0 }, mensaje);
    this.estado.set(estado);
    return estado;
  }
}

/* ------------------------------------------------------------------ */
/* Tipos y funciones libres                                            */
/* ------------------------------------------------------------------ */

/** Lo que este servicio recuerda entre pestañas. */
export interface TrapecioEstado extends IntegracionVista {
  /** Qué datos se usaron para calcular. */
  datos: DatosModulo4;
  /** Suma ponderada (la fila Σ). */
  suma: number;
  /** La respuesta formateada para la calculadora. */
  respuesta: RespuestaCalculadoraM4;
}

/** Estado de fallo, cuando ni siquiera se pudo calcular. */
function fallo(datos: DatosModulo4, mensaje: string): TrapecioEstado {
  return {
    datos,
    funcionTexto: datos.funcion,
    a: datos.a,
    b: datos.b,
    n: 0,
    h: 0,
    integral: 0,
    filas: [],
    suma: 0,
    respuesta: { exito: false, conclusion: mensaje },
  };
}

/** Texto de la respuesta de la calculadora. */
function armarRespuesta(datos: DatosModulo4, r: ResultadoTrapecio): RespuestaCalculadoraM4 {
  const tieneExacto = r.exacto !== undefined && r.errorAbs !== undefined;

  const conclusion =
    `Con n = ${r.n} subintervalos, h = (${numero(datos.b)} − ${numero(datos.a)}) / ${r.n} = ` +
    `${numero(r.h, 6)}. La suma ponderada es ${numero(r.suma, 6)} y la integral aproximada es ` +
    `${numero(r.integral, 6)}.` +
    (tieneExacto
      ? ` El error absoluto es ${numero(r.errorAbs!, 6)} (${porcentaje(r.errorRel ?? 0)}): ` +
        `al duplicar n, ese error debería bajar a la cuarta parte.`
      : ' Ingresá el valor exacto si querés medir el error.');

  return {
    exito: true,
    etiquetaResultado: 'I ≈',
    resultado: numero(r.integral, 6),
    etiquetaBondad: tieneExacto ? 'Error absoluto' : 'Ancho de cada trapecio h',
    bondad: tieneExacto
      ? `${numero(r.errorAbs!, 6)} (${porcentaje(r.errorRel ?? 0)})`
      : numero(r.h, 6),
    conclusion,
  };
}
