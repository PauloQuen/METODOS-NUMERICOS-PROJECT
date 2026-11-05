import { Injectable, signal } from '@angular/core';
import {
  formatearNumero,
  parsearMatriz,
  parsearVector,
  type SistemaLineal,
} from '../../../../../shared/domain/numerico/matriz';
import type {
  EjemploSistema,
  DatosSistema,
} from '../../../../../shared/models/sistema.model';
import { GAUSS, SISTEMA_POR_DEFECTO } from './gauss.config';
import { ejecutarGauss, type FilaGauss } from './gauss.algoritmo';

/**
 * SERVICIO DE LA ELIMINACIÓN GAUSSIANA.
 *
 * ── Dos usos distintos, un solo motor ─────────────────────────────────
 * · La CALCULADORA llama a `calcular()`: el alumno escribe su sistema y
 *   apretó "Calcular". El resultado queda guardado en los signals, para
 *   que sobreviva al cambio de pestaña.
 * · Las pestañas de TEORÍA, EJEMPLOS y AUTOEVALUACIÓN muestran varios
 *   bloques al mismo tiempo, así que no pueden usar los signals (cada
 *   cálculo pisaría al anterior). Para eso está `calcularEjemplo()`, que
 *   ejecuta y DEVUELVE sin tocar el estado guardado.
 *
 * Es el mismo esquema que usa el Módulo 1, y por el mismo motivo: separar
 * "el estado de la calculadora" de "el cálculo de un bloque".
 */
@Injectable({ providedIn: 'any' })
export class GaussService {
  readonly metodo = GAUSS;

  /** El sistema de la calculadora, con lo que el alumno escribió. */
  readonly sistema = signal<SistemaLineal>({
    A: SISTEMA_POR_DEFECTO.A.map((f) => [...f]),
    b: [...SISTEMA_POR_DEFECTO.b],
  });

  /** Las filas de la tabla de la calculadora. */
  readonly filas = signal<Record<string, number | string>[]>([]);

  /**
   * La narración de cada paso, uno por fila de la tabla.
   *
   * Va APARTE de las filas y no dentro: la tabla muestra las columnas
   * que declara `COLUMNAS_GAUSS`, y una columna con el detalle entero
   * haría la tabla ilegible. El texto se usa para el visor de pasos,
   * que es donde el alumno lee qué está pasando.
   *
   * Es el mismo criterio que usa `calcularEjemplo`: el texto sale del
   * motor, nunca se escribe a mano, así que no puede dejar de
   * coincidir con los números de la tabla.
   */
  readonly textosPasos = signal<string[]>([]);

  /** La solución que encontró la calculadora. */
  readonly solucion = signal<number[] | undefined>(undefined);

  /** El residuo ‖Ax − b‖∞ de la solución de la calculadora. */
  readonly residuo = signal<number | undefined>(undefined);

  /** Un mensaje de error, si el sistema no se pudo resolver. */
  readonly mensaje = signal<string | undefined>(undefined);

  /* ---------------------------------------------------------------- */
  /* Calculadora                                                       */
  /* ---------------------------------------------------------------- */

  /**
   * Resuelve el sistema que escribió el alumno.
   *
   * `textoMatriz` y `textoVector` llegan como strings porque eso es lo que
   * sale del textarea y del input.
   */
  calcular(textoMatriz: string, textoVector: string): void {
    this.mensaje.set(undefined);
    this.solucion.set(undefined);
    this.residuo.set(undefined);
    this.filas.set([]);
    this.textosPasos.set([]);

    const matriz = parsearMatriz(textoMatriz);
    if ('error' in matriz) {
      this.mensaje.set(matriz.error);
      return;
    }

    const vector = parsearVector(textoVector);
    if ('error' in vector) {
      this.mensaje.set(vector.error);
      return;
    }

    const problema = this.validar(matriz.matriz, vector.vector);
    if (problema) {
      this.mensaje.set(problema);
      return;
    }

    const sistema: SistemaLineal = { A: matriz.matriz, b: vector.vector };
    this.sistema.set(sistema);

    const resultado = ejecutarGauss(sistema);
    this.filas.set(this.filasDeTabla(resultado.filas));
    this.textosPasos.set(resultado.filas.map((f) => f.detalle));
    this.solucion.set(resultado.solucion);
    this.residuo.set(resultado.residuo);
    if (resultado.mensaje) {
      this.mensaje.set(resultado.mensaje);
    }
  }

  /** Vuelve al sistema de ejemplo. */
  reiniciar(): void {
    this.sistema.set({
      A: SISTEMA_POR_DEFECTO.A.map((f) => [...f]),
      b: [...SISTEMA_POR_DEFECTO.b],
    });
    this.filas.set([]);
    this.textosPasos.set([]);
    this.solucion.set(undefined);
    this.residuo.set(undefined);
    this.mensaje.set(undefined);
  }

  /* ---------------------------------------------------------------- */
  /* API para las pestañas                                             */
  /* ---------------------------------------------------------------- */

  /**
   * Corre un ejemplo SIN tocar el estado guardado.
   *
   * Devuelve las filas ya formateadas, los textos de cada paso y lo que
   * hace falta para el gráfico.
   */
  calcularEjemplo(ejemplo: EjemploSistema): GaussEstado {
    const { A, b } = ejemplo.calculo;
    const resultado = ejecutarGauss({ A, b });

    return {
      sistema: { A, b },
      filas: this.filasDeTabla(resultado.filas),
      textosPasos: resultado.filas.map((f) => f.detalle),
      filaFinal: resultado.exito ? resultado.filas.length - 1 : undefined,
      solucion: resultado.solucion,
      residuo: resultado.residuo,
      mensaje: resultado.mensaje,
    };
  }

  /** El sistema de un ejemplo, para el gráfico. */
  sistemaDeEjemplo(ejemplo: EjemploSistema): SistemaLineal {
    return { A: ejemplo.calculo.A, b: ejemplo.calculo.b };
  }

  /**
   * Rango del gráfico: tiene que entrar la solución Y los cortes de las
   * rectas con los ejes, que son los otros dos lugares donde el alumno
   * mira. Con margen para que no queden pegadas al borde.
   */
  rangoPara(sistema: SistemaLineal, solucion?: number[]): { min: number; max: number } {
    const puntos: number[] = [];

    for (let i = 0; i < sistema.A.length; i++) {
      const [a, b] = sistema.A[i];
      const c = sistema.b[i];
      if (Math.abs(a) > 1e-12) puntos.push(c / a); // corte con el eje x₂
      if (Math.abs(b) > 1e-12) puntos.push(c / b); // corte con el eje x₁
    }
    if (solucion) {
      for (const v of solucion) {
        if (Number.isFinite(v)) puntos.push(v);
      }
    }

    if (puntos.length === 0) return { min: -6, max: 6 };

    const min = Math.min(...puntos);
    const max = Math.max(...puntos);
    const ancho = max - min || 2;
    const margen = Math.max(1, ancho * 0.25);

    return { min: min - margen, max: max + margen };
  }

  /* ---------------------------------------------------------------- */
  /* Internos                                                          */
  /* ---------------------------------------------------------------- */

  /** Convierte los pasos del motor en filas de tabla. */
  private filasDeTabla(pasos: FilaGauss[]): Record<string, number | string>[] {
    return pasos.map((p) => ({
      n: p.n,
      etapa: p.etapa,
      pivote: formatearNumero(p.pivote),
      factor: p.factor === undefined ? '—' : formatearNumero(p.factor),
      fila: p.fila,
    }));
  }

  /**
   * Revisa que el sistema tenga sentido antes de intentar resolverlo.
   *
   * Los dos errores que más se escriben: una matriz que no es cuadrada y
   * un lado derecho con otra cantidad de números.
   */
  private validar(A: number[][], b: number[]): string | undefined {
    const n = A.length;
    if (n === 0) {
      return 'Escribí la matriz de coeficientes.';
    }
    for (let i = 0; i < n; i++) {
      if (A[i].length !== n) {
        return (
          `La matriz no es cuadrada: tiene ${n} fila(s) y la fila ${i + 1} ` +
          `tiene ${A[i].length} coeficiente(s). Un sistema de n ecuaciones ` +
          'tiene n incógnitas.'
        );
      }
    }
    if (b.length !== n) {
      return (
        `El lado derecho tiene ${b.length} valor(es) y la matriz tiene ${n} ` +
        'fila(s): tiene que haber un valor por ecuación.'
      );
    }
    return undefined;
  }
}

/** Lo que devuelve el cálculo de un ejemplo o ejercicio. */
export interface GaussEstado {
  /** El sistema que se resolvió. */
  sistema: SistemaLineal;
  /** Las filas de la tabla, ya formateadas. */
  filas: Record<string, number | string>[];
  /** La narración de cada paso, para los botones de avance. */
  textosPasos: string[];
  /** La fila donde está la solución. */
  filaFinal?: number;
  /** La solución, si se encontró. */
  solucion?: number[];
  /** El residuo ‖Ax − b‖∞. */
  residuo?: number;
  /** Por qué no se pudo resolver, si no se pudo. */
  mensaje?: string;
}
