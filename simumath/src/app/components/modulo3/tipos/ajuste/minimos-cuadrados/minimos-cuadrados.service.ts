import { Injectable, signal } from '@angular/core';
import type {
  DatosModulo3,
  EjemploModulo3,
  RespuestaCalculadoraM3,
} from '../../../modelos/modulo3.model';
import {
  minimosCuadrados,
  type FilaMinimosCuadrados,
} from './minimos-cuadrados.algoritmo';
import {
  formatearNumero,
  formatearPuntos,
  parsearPuntos,
  rangoParaPuntos,
} from '../../../shared/puntos';

/**
 * Orquestador de Mínimos Cuadrados: el pegamento entre el contenido y
 * el motor.
 *
 *   minimos-cuadrados.algoritmo.ts → la matemática (función pura)
 *   minimos-cuadrados.contenido.ts → los textos y los enunciados
 *   minimos-cuadrados.config.ts    → columnas y campos
 *   ESTE archivo                   → el pegamento entre los tres
 *
 * `providedIn: 'any'`: una instancia por bundle de carga diferida, así
 * el cálculo sobrevive al cambio de pestaña pero no se mezcla con el de
 * Lagrange.
 */
@Injectable({ providedIn: 'any' })
export class MinimosCuadradosService {
  private readonly estado = signal<MinimosCuadradosEstado | null>(null);

  /** El resultado del último cálculo, o null si todavía no calculó. */
  readonly resultado = this.estado.asReadonly();

  /** Corre el método con los datos que le pasaron. */
  calcular(datos: DatosModulo3): MinimosCuadradosEstado {
    const estado = this.ejecutar(datos);
    this.estado.set(estado);
    return estado;
  }

  /** Borra el cálculo. Lo llama el botón "Limpiar". */
  limpiar(): void {
    this.estado.set(null);
  }

  /** Corre el método para un ejemplo del contenido, sin guardarlo. */
  calcularEjemplo(ejemplo: EjemploModulo3): MinimosCuadradosEstado {
    return this.ejecutar(ejemplo.calculo);
  }

  /**
   * Corre el método a partir del texto que escribió el alumno.
   * El parseo vive acá para que el mensaje de error salga de un solo
   * lugar; si el texto no se entiende, se guarda un estado de fallo.
   */
  calcularDesdeTexto(entrada: {
    puntosTexto: string;
    evaluarEn?: number;
    etiqueta?: string;
  }): MinimosCuadradosEstado {
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

  /** La recta ajustada, como función, para el gráfico. */
  rectaDe(datos: DatosModulo3): (x: number) => number {
    const r = minimosCuadrados({ puntos: datos.puntos ?? [] });
    if (r.mensaje) return () => 0;
    return (x: number) => r.a0 + r.a1 * x;
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

  private ejecutar(datos: DatosModulo3): MinimosCuadradosEstado {
    const r = minimosCuadrados({ puntos: datos.puntos ?? [], evaluarEn: datos.evaluarEn });

    if (r.mensaje) {
      return fallo(datos, r.mensaje);
    }

    const filas: Record<string, number | string>[] = (r.filas as FilaMinimosCuadrados[]).map(
      (f) => ({
        i: f.i,
        xi: formatearNumero(Number(f.xi)),
        yi: formatearNumero(Number(f.yi)),
        x2: formatearNumero(Number(f.x2)),
        xy: formatearNumero(Number(f.xy)),
        yhat: f.yhat === '' ? '' : formatearNumero(Number(f.yhat)),
        residuo: f.residuo === '' ? '' : formatearNumero(Number(f.residuo)),
      }),
    );

    const x = r.evaluadoEn;
    const prediccion = r.prediccion;

    const respuesta: RespuestaCalculadoraM3 = {
      exito: true,
      etiquetaResultado:
        x !== undefined ? `ŷ(${formatearNumero(x)})` : 'Recta ajustada',
      resultado:
        prediccion !== undefined ? formatearNumero(prediccion) : r.recta,
      etiquetaBondad: 'Coeficiente de determinación r²',
      bondad: `${r.r2.toFixed(4)} (${(r.r2 * 100).toFixed(2)} %)`,
      conclusion:
        `La recta de mínimos cuadrados es ${r.recta}, con r = ${r.r.toFixed(4)} y r² = ${r.r2.toFixed(4)}. ` +
        `El ${(r.r2 * 100).toFixed(1)} % de la variación de y queda explicado por x. ` +
        (r.errorEstandar > 0
          ? `El error estándar de la estimación es ${r.errorEstandar.toFixed(4)}, en las mismas unidades que y. `
          : '') +
        (prediccion !== undefined && x !== undefined
          ? `Para x = ${formatearNumero(x)}, la predicción es ŷ ≈ ${formatearNumero(prediccion)}.`
          : ''),
    };

    return {
      datos,
      filas,
      recta: r.recta,
      a0: r.a0,
      a1: r.a1,
      r: r.r,
      r2: r.r2,
      errorEstandar: r.errorEstandar,
      prediccion,
      evaluadoEn: x,
      respuesta,
    };
  }
}

/* ------------------------------------------------------------------ */
/* Tipos y funciones libres                                            */
/* ------------------------------------------------------------------ */

/** Lo que este servicio recuerda entre pestañas. */
export interface MinimosCuadradosEstado {
  /** Qué datos se usaron para calcular. */
  datos: DatosModulo3;
  /** Las filas de la tabla de trabajo, ya formateadas. */
  filas: Record<string, number | string>[];
  /** La recta escrita como texto. */
  recta: string;
  /** Coeficientes de la recta. */
  a0: number;
  a1: number;
  /** Bondad del ajuste. */
  r: number;
  r2: number;
  errorEstandar: number;
  /** La predicción pedida, si hubo. */
  prediccion?: number;
  /** El x donde se evaluó la predicción. */
  evaluadoEn?: number;
  /** La respuesta formateada para la calculadora. */
  respuesta: RespuestaCalculadoraM3;
}

/** Estado de fallo, cuando ni siquiera se pudo arrancar. */
function fallo(datos: DatosModulo3, mensaje: string): MinimosCuadradosEstado {
  return {
    datos,
    filas: [],
    recta: '',
    a0: 0,
    a1: 0,
    r: 0,
    r2: 0,
    errorEstandar: 0,
    respuesta: { exito: false, conclusion: mensaje },
  };
}
