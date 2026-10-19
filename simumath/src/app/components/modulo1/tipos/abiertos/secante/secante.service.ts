import { Injectable, signal } from '@angular/core';
import { parseFuncion } from '../../../../../shared/domain/numerico/methods';
import { parsearFuncion } from '../../../../../shared/domain/numerico/evaluador-funciones';
import type { IterRow } from '../../../../../shared/domain/numerico/methods';
import { CRITERIO_POR_DEFECTO } from '../../../../../shared/domain/numerico/criterio';
import type {
  DatosCalculo,
  Ejemplo,
} from '../../../../../shared/models/metodo.model';
import {
  COLUMNAS_SECANTE,
  DATOS_POR_DEFECTO,
  RANGO_X_POR_DEFECTO,
  SECANTE,
} from './secante.config';
import {
  ejecutarSecante,
  type FilaSecante,
} from './secante.algoritmo';

@Injectable({ providedIn: 'any' })
export class SecanteService {
  readonly metodo = SECANTE;
  readonly columnas = COLUMNAS_SECANTE;
  readonly datosPorDefecto = DATOS_POR_DEFECTO;
  readonly rangoPorDefecto = RANGO_X_POR_DEFECTO;

  readonly datos = signal<DatosCalculo>(DATOS_POR_DEFECTO);
  readonly filas = signal<IterRow[]>([]);
  readonly convergio = signal(false);
  readonly iteraciones = signal(0);
  readonly raiz = signal<number | undefined>(undefined);
  readonly error = signal<number | undefined>(undefined);
  readonly mensaje = signal<string | undefined>(undefined);
  readonly criterio = signal<string>(CRITERIO_POR_DEFECTO);

  private aNumero(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : NaN;
  }

  calcular(d: DatosCalculo): void {
    this.datos.set(d);
    this.mensaje.set(undefined);

    const fExpr = String(d.funcion ?? '').trim();
    const x0v = this.aNumero(d.x0);
    const x1v = this.aNumero(d.x1);
    const tolv = this.aNumero(d.tol);
    const maxv = this.aNumero(d.maxIter);

    if (!fExpr) {
      this.mensaje.set('Ingresá una función f(x).');
      this.filas.set([]);
      return;
    }
    if (!Number.isFinite(x0v) || !Number.isFinite(x1v)) {
      this.mensaje.set('Las semillas x₀ y x₁ deben ser números válidos.');
      this.filas.set([]);
      return;
    }
    if (Math.abs(x1v - x0v) < 1e-12) {
      this.mensaje.set('x₀ y x₁ deben ser distintos.');
      this.filas.set([]);
      return;
    }
    if (!Number.isFinite(tolv) || tolv <= 0) {
      this.mensaje.set('La tolerancia debe ser positiva.');
      this.filas.set([]);
      return;
    }
    if (!Number.isFinite(maxv) || maxv < 1) {
      this.mensaje.set('El máximo de iteraciones debe ser mayor a 0.');
      this.filas.set([]);
      return;
    }

    let f: (x: number) => number;
    try {
      f = parseFuncion(fExpr);
    } catch (e) {
      this.mensaje.set(e instanceof Error ? e.message : 'Expresión no válida.');
      this.filas.set([]);
      return;
    }

    const res = ejecutarSecante({
      f,
      x0: x0v,
      x1: x1v,
      tol: tolv,
      maxIter: Math.trunc(maxv),
      criterio: this.criterio() as any,
    });

    if (res.mensaje) this.mensaje.set(res.mensaje);

    const filasUI: IterRow[] = (res.filas as FilaSecante[]).map((r) => ({
      n: r.n,
      xPrev: r.xPrev,
      x: r.x,
      fx: r.fx,
      delta: r.delta === undefined ? '' : r.delta,
    }));
    this.filas.set(filasUI);
    this.convergio.set(res.convergio);
    this.iteraciones.set(res.iteraciones);
    this.raiz.set(res.raiz);
    this.error.set(res.error);
  }

  reiniciar(): void {
    this.datos.set(DATOS_POR_DEFECTO);
    this.filas.set([]);
    this.convergio.set(false);
    this.iteraciones.set(0);
    this.raiz.set(undefined);
    this.error.set(undefined);
    this.mensaje.set(undefined);
  }

  /* ---------------------------------------------------------------- */
  /* API para las pestañas de Teoría / Ejemplos / Autoevaluación       */
  /* ---------------------------------------------------------------- */
  /*
   * Estas pestañas muestran N bloques (los ejemplos o los ejercicios)
   * AL MISMO TIEMPO, así que no pueden usar los signals de arriba: cada
   * `calcularEjemplo` pisaría el anterior. Por eso `calcularEjemplo`
   * solo ejecuta y DEVUELVE, sin tocar el estado guardado.
   *
   * El estado guardado (arriba) lo sigue usando la calculadora, que sí
   * necesita que el resultado sobreviva al cambio de pestaña.
   */

  /**
   * Corre un bloque de ejemplo/ejercicio SIN tocar el estado guardado.
   * Devuelve las filas ya formateadas para la tabla y el gráfico.
   */
  calcularEjemplo(ejemplo: Ejemplo): SecanteEstado {
    return this.ejecutarBloque(ejemplo.calculo);
  }

  private ejecutarBloque(datos: DatosCalculo): SecanteEstado {
    const f = this.parsearSeguro(datos.funcion);
    if (!f) {
      return fallo(
        datos,
        'No se pudo entender la función. Revisá la sintaxis: se admiten ^ ' +
          'para potencias, exp(), ln(), sen(), cos(), tan(), log() y sqrt().',
      );
    }

    const x0 = Number(datos.x0);
    const x1 = Number(datos.x1);
    const tol = Number(datos.tol);
    const maxIter = datos.maxIter ?? 100;

    if (!Number.isFinite(x0) || !Number.isFinite(x1)) {
      return fallo(datos, 'Las semillas x₀ y x₁ deben ser números válidos.');
    }
    if (Math.abs(x1 - x0) < 1e-12) {
      return fallo(datos, 'x₀ y x₁ deben ser distintos.');
    }
    if (!Number.isFinite(tol) || tol <= 0) {
      return fallo(datos, 'La tolerancia debe ser positiva.');
    }

    const r = ejecutarSecante({
      f,
      x0,
      x1,
      tol,
      maxIter: Math.trunc(maxIter),
      criterio: this.criterio() as any,
    });

    const filas = r.filas.map((fila: FilaSecante) => ({
      n: fila.n,
      xPrev: formatear(fila.xPrev),
      x: formatear(fila.x),
      fx: formatear(fila.fx),
      delta: fila.delta === undefined ? '—' : formatear(fila.delta),
    }));

    return {
      datos,
      filas,
      filaFinal: r.convergio ? filas.length - 1 : undefined,
      raiz: r.raiz,
      error: r.error,
      iteraciones: r.iteraciones,
      convergio: r.convergio,
      mensaje: r.mensaje,
    };
  }

  /** La función de un ejemplo ya parseada, para el gráfico. */
  funcionDeEjemplo(ejemplo: Ejemplo): (x: number) => number {
    return this.funcionDesdeTexto(ejemplo.calculo.funcion);
  }

  /** Parsea una expresión; si no se entiende, devuelve una función vacía. */
  funcionDesdeTexto(texto: string): (x: number) => number {
    return this.parsearSeguro(texto) ?? (() => 0);
  }

  private parsearSeguro(texto: string): ((x: number) => number) | null {
    try {
      return parsearFuncion(texto);
    } catch {
      return null;
    }
  }

  /**
   * Rango del eje X para el gráfico: tiene que mostrar las DOS semillas
   * y la raíz (cuando existe), con margen para ver la curva y las cuerdas.
   */
  rangoPara(
    datos: DatosCalculo,
    raiz?: number,
  ): { min: number; max: number } {
    const puntos = [Number(datos.x0), Number(datos.x1), raiz].filter(
      (p): p is number => p !== undefined && Number.isFinite(p),
    );

    if (puntos.length === 0) {
      return RANGO_X_POR_DEFECTO;
    }

    const min = Math.min(...puntos);
    const max = Math.max(...puntos);
    const ancho = max - min || 1;
    const margen = Math.max(0.5, ancho * 0.5);

    return { min: min - margen, max: max + margen };
  }
}

/** Lo que devuelve una corrida de ejemplo: filas y respuesta cruda. */
export interface SecanteEstado {
  datos: DatosCalculo;
  filas: Record<string, number | string>[];
  filaFinal?: number;
  raiz?: number;
  error?: number;
  iteraciones: number;
  convergio: boolean;
  mensaje?: string;
}

/** Estado de una corrida que no se pudo ejecutar. */
function fallo(datos: DatosCalculo, mensaje: string): SecanteEstado {
  return {
    datos,
    filas: [],
    iteraciones: 0,
    convergio: false,
    mensaje,
  };
}

/** Formatea un número para mostrarlo, o «—» si no es finito. */
function formatear(v: number): string {
  if (!Number.isFinite(v)) return '—';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(8).replace(/\.?0+$/, '');
}
