import { Injectable, signal } from '@angular/core';
import { parseFuncion } from '../../../../../shared/domain/numerico/methods';
import { parsearFuncion } from '../../../../../shared/domain/numerico/evaluador-funciones';
import type { DatosCalculo, Ejemplo } from '../../../../../shared/models/metodo.model';
import type { CasoCardano } from '../../../../../shared/domain/numerico/cardano';
import {
  CAMPOS_CALCULADORA,
  CARDANO,
  COLUMNAS_CARDANO,
  DATOS_POR_DEFECTO,
  RANGO_X_POR_DEFECTO,
} from './cardano.config';
import { ejecutarCardano, formatear, type CardanoEstado } from './cardano.algoritmo';

/**
 * Estado y cálculo de la pestaña Calculadora de Cardano.
 *
 * ── Por qué el estado vive acá y no en el componente ─────────────────
 * Mismo motivo que en los demás métodos: los signals sobreviven al
 * cambio de pestaña. El alumno calcula, va a Teoría y vuelve, y la
 * tabla sigue ahí.
 *
 * ── Lo que este servicio NO tiene ─────────────────────────────────────
 * Ni tolerancia, ni criterio, ni máximo de iteraciones: no son
 * parámetros del método sino del formulario que Cardano no muestra.
 * Los únicos inputs posibles son la función (calculadora) y lo que
 * traiga cada bloque de contenido (ejemplos/ejercicios).
 */
@Injectable({ providedIn: 'any' })
export class CardanoService {
  readonly metodo = CARDANO;
  readonly columnas = COLUMNAS_CARDANO;
  readonly campos = CAMPOS_CALCULADORA;
  readonly datosPorDefecto = DATOS_POR_DEFECTO;
  readonly rangoPorDefecto = RANGO_X_POR_DEFECTO;

  readonly datos = signal<DatosCalculo>(DATOS_POR_DEFECTO);
  readonly filas = signal<Record<string, number | string>[]>([]);
  readonly raices = signal<number[]>([]);
  readonly caso = signal<CasoCardano | null>(null);
  readonly resuelto = signal(false);
  readonly mensaje = signal<string | undefined>(undefined);

  /**
   * Corre Cardano con la función que escribió el alumno y actualiza el
   * estado guardado (el que lee la pestaña Calculadora).
   */
  calcular(d: DatosCalculo): void {
    this.datos.set(d);
    this.mensaje.set(undefined);

    const expr = String(d.funcion ?? '').trim();
    if (!expr) {
      this.mensaje.set('Ingresá una f(x) de grado 3, igualada a cero.');
      this.limpiarResultado();
      return;
    }

    let fn: (x: number) => number;
    try {
      fn = parseFuncion(expr);
    } catch (e) {
      this.mensaje.set(e instanceof Error ? e.message : 'Expresión no válida.');
      this.limpiarResultado();
      return;
    }

    const res = ejecutarCardano({ datos: d, fn });

    if (!res.resuelto) {
      this.mensaje.set(res.mensaje);
      this.limpiarResultado();
      return;
    }

    this.filas.set(res.filas);
    this.raices.set(res.raices);
    this.caso.set(res.caso);
    this.resuelto.set(true);
  }

  reiniciar(): void {
    this.datos.set(DATOS_POR_DEFECTO);
    this.mensaje.set(undefined);
    this.limpiarResultado();
  }

  private limpiarResultado(): void {
    this.filas.set([]);
    this.raices.set([]);
    this.caso.set(null);
    this.resuelto.set(false);
  }

  /* ---------------------------------------------------------------- */
  /* API para las pestañas de Teoría / Ejemplos / Autoevaluación       */
  /* ---------------------------------------------------------------- */
  /*
   * Estas pestañas muestran varios bloques AL MISMO TIEMPO, así que no
   * pueden usar los signals de arriba: cada `calcularEjemplo` pisaría
   * el anterior. Por eso `calcularEjemplo` solo ejecuta y DEVUELVE.
   */

  /** Corre un bloque de ejemplo/ejercicio SIN tocar el estado guardado. */
  calcularEjemplo(ejemplo: Ejemplo): CardanoEstado {
    const fn = this.parsearSeguro(ejemplo.calculo.funcion);
    if (!fn) {
      return {
        datos: ejemplo.calculo,
        filas: [],
        raices: [],
        caso: null,
        resuelto: false,
        mensaje:
          'No se pudo entender la función. Revisá la sintaxis: se admiten ' +
          '^ para potencias y expresiones como 2x^3 (el coeficiente 2 no ' +
          'requiere signo).',
      };
    }
    return ejecutarCardano({ datos: ejemplo.calculo, fn });
  }

  /** La función de un ejemplo ya parseada, para el gráfico. */
  funcionDeEjemplo(ejemplo: Ejemplo): (x: number) => number {
    return this.funcionDesdeTexto(ejemplo.calculo.funcion);
  }

  /**
   * Parsea una expresión; si no se entiende, devuelve NaN en todos los
   * puntos para que el gráfico quede vacío en vez de inventar una curva.
   */
  funcionDesdeTexto(texto: string): (x: number) => number {
    return this.parsearSeguro(texto) ?? (() => NaN);
  }

  private parsearSeguro(texto: string): ((x: number) => number) | null {
    try {
      return parsearFuncion(texto);
    } catch {
      return null;
    }
  }

  /**
   * Rango del eje X para el gráfico, centrado en las raíces.
   *
   * El margen es el 35 % del span a cada lado (con piso de 1.25) y el
   * ancho mínimo total es 4, así una raíz única todavía se ve con la
   * curva respirando alrededor. El ancho NUNCA baja del span: si no,
   * una cúbica con raíces separadas dejaría alguna fuera del cuadro.
   */
  rangoPara(raices: number[]): { min: number; max: number } {
    const validas = raices.filter((r) => Number.isFinite(r));
    if (validas.length === 0) return RANGO_X_POR_DEFECTO;

    const min = Math.min(...validas);
    const max = Math.max(...validas);
    const span = max - min;
    const margen = Math.max(1.25, span * 0.35);
    const ancho = Math.max(4, span + 2 * margen);

    const centro = (min + max) / 2;
    return { min: centro - ancho / 2, max: centro + ancho / 2 };
  }

  /** Todas las raíces formateadas y unidas, para la respuesta del shell. */
  raicesTexto(raices: number[]): string {
    return raices.map((r) => formatear(r)).join(', ');
  }
}
