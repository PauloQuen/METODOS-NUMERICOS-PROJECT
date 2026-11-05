import { Injectable, signal } from '@angular/core';
import type {
  DatosModulo3,
  EjemploModulo3,
  RespuestaCalculadoraM3,
} from '../../../modelos/modulo3.model';
import { lagrange, polinomioLagrange, type FilaLagrange } from './lagrange.algoritmo';
import {
  formatearNumero,
  formatearPuntos,
  parsearPuntos,
  rangoParaPuntos,
} from '../../../shared/puntos';

/**
 * Orquestador de Lagrange: el pegamento entre el contenido y el motor.
 *
 * ── Dónde vive cada cosa ─────────────────────────────────────────────
 *   lagrange.algoritmo.ts  → la matemática (función pura, sin Angular)
 *   lagrange.contenido.ts  → los textos y los enunciados
 *   lagrange.config.ts     → las columnas y los campos de la calculadora
 *   ESTE archivo           → el pegamento entre los tres
 *
 * ── Por qué un servicio y no lógica en el componente ─────────────────
 * Porque el cálculo tiene que sobrevivir a que el alumno cambie de
 * pestaña. Con un signal acá, si va a Teoría, vuelve a la Calculadora y
 * su resultado sigue ahí. Con lógica dentro del componente, se perdería
 * al destruirse.
 *
 * `providedIn: 'any'` da una instancia por injector de carga diferida:
 * las cuatro pestañas comparten la instancia, pero el cálculo muere al
 * salir del método (no se mezcla con el de Mínimos Cuadrados).
 */
@Injectable({ providedIn: 'any' })
export class LagrangeService {
  private readonly estado = signal<LagrangeEstado | null>(null);

  /** El resultado del último cálculo, o null si todavía no calculó. */
  readonly resultado = this.estado.asReadonly();

  /** Corre el método con los datos que le pasaron. */
  calcular(datos: DatosModulo3): LagrangeEstado {
    const estado = this.ejecutar(datos);
    this.estado.set(estado);
    return estado;
  }

  /** Borra el cálculo. Lo llama el botón "Limpiar". */
  limpiar(): void {
    this.estado.set(null);
  }

  /** Corre el método para un ejemplo del contenido, sin guardarlo. */
  calcularEjemplo(ejemplo: EjemploModulo3): LagrangeEstado {
    return this.ejecutar(ejemplo.calculo);
  }

  /**
   * Corre el método a partir del texto que escribió el alumno.
   *
   * El parseo de los puntos vive acá y no en el componente: así el
   * mensaje de error ("No entendí el par...") sale de un solo lugar y
   * la pestaña queda delgada. Si el texto no se entiende, NO se lanza
   * una excepción: se guarda un estado de fallo con el mensaje, que es
   * lo que el panel muestra en pantalla.
   */
  calcularDesdeTexto(entrada: {
    puntosTexto: string;
    evaluarEn?: number;
    etiqueta?: string;
  }): LagrangeEstado {
    const { puntos, error } = parsearPuntos(entrada.puntosTexto);
    if (error) {
      const estado = fallo({ puntos: [] }, error);
      this.estado.set(estado);
      return estado;
    }
    return this.calcular({ puntos, evaluarEn: entrada.evaluarEn, etiqueta: entrada.etiqueta });
  }

  /* ---------------------------------------------------------------- */
  /* Utilidades para las pestañas                                      */
  /* ---------------------------------------------------------------- */

  /** El polinomio interpolante, ya como función, para el gráfico. */
  polinomioDe(datos: DatosModulo3): (x: number) => number {
    if (!datos.puntos || datos.puntos.length < 2) return () => 0;
    return polinomioLagrange(datos.puntos);
  }

  /** El rango del eje x que conviene mostrar. */
  rangoPara(datos: DatosModulo3): { min: number; max: number } {
    return rangoParaPuntos(datos.puntos ?? [], datos.evaluarEn);
  }

  /** El texto precargado de la calculadora para un ejemplo. */
  puntosComoTexto(datos: DatosModulo3): string {
    return formatearPuntos(datos.puntos ?? []);
  }

  /* ---------------------------------------------------------------- */
  /* El trabajo de verdad                                             */
  /* ---------------------------------------------------------------- */

  private ejecutar(datos: DatosModulo3): LagrangeEstado {
    const r = lagrange({ puntos: datos.puntos ?? [], evaluarEn: datos.evaluarEn });

    if (r.mensaje) {
      return fallo(datos, r.mensaje);
    }

    // `li` y `aporte` vienen vacíos (NaN) si no se pidió evaluar en
    // ningún punto; en la tabla se muestran como "—".
    const filas: Record<string, number | string>[] = (r.filas as FilaLagrange[]).map((f) => ({
      i: f.i,
      xi: formatearNumero(f.xi),
      yi: formatearNumero(f.yi),
      li: formatearNumero(f.li),
      aporte: formatearNumero(f.aporte),
    }));

    const x = r.evaluadoEn;
    const valor = r.valor;

    const respuesta: RespuestaCalculadoraM3 = {
      exito: true,
      etiquetaResultado: x !== undefined ? `P(${formatearNumero(x)})` : 'Polinomio',
      resultado: valor !== undefined ? formatearNumero(valor) : (r.polinomio ?? '—'),
      etiquetaBondad: 'Error máximo en los nodos',
      // El polinomio pasa exacto por los datos: el error en los nodos es
      // 0 salvo la paja numérica del punto flotante. Decirlo así es más
      // honesto que mostrar un "2.7e-14" que parece un error grave.
      bondad:
        r.errorEnNodos === undefined
          ? '—'
          : r.errorEnNodos < 1e-9
            ? '0 (pasa por todos los datos)'
            : r.errorEnNodos.toExponential(2),
      conclusion:
        valor !== undefined && x !== undefined
          ? `El polinomio interpolante es ${r.polinomio}. Evaluado en x = ${formatearNumero(x)} ` +
            `da P(${formatearNumero(x)}) ≈ ${formatearNumero(valor)}. ` +
            `Por construcción pasa exactamente por los ${filas.length} datos (error en los nodos ≈ 0).`
          : `El polinomio interpolante es ${r.polinomio}. Indicá un valor de x para estimar.`,
    };

    return {
      datos,
      filas,
      valor,
      evaluadoEn: x,
      polinomio: r.polinomio,
      coeficientes: r.coeficientes,
      respuesta,
    };
  }
}

/* ------------------------------------------------------------------ */
/* Tipos y funciones libres                                            */
/* ------------------------------------------------------------------ */

/** Lo que este servicio recuerda entre pestañas. */
export interface LagrangeEstado {
  /** Qué datos se usaron para calcular. */
  datos: DatosModulo3;
  /** Las filas de la tabla, ya formateadas. */
  filas: Record<string, number | string>[];
  /** El valor P(x*), como número (para el gráfico). */
  valor?: number;
  /** El x donde se evaluó. */
  evaluadoEn?: number;
  /** El polinomio escrito como texto. */
  polinomio?: string;
  /** Los coeficientes de mayor a menor grado. */
  coeficientes?: number[];
  /** La respuesta formateada para la calculadora. */
  respuesta: RespuestaCalculadoraM3;
}

/** Estado de fallo, cuando ni siquiera se pudo arrancar. */
function fallo(datos: DatosModulo3, mensaje: string): LagrangeEstado {
  return {
    datos,
    filas: [],
    respuesta: { exito: false, conclusion: mensaje },
  };
}
