import { Injectable, signal } from '@angular/core';
import type {
  DatosCalculo,
  Ejemplo,
  RespuestaCalculadora,
} from '../../../../../shared/models/metodo.model';
import { parsearFuncion } from '../../../../../shared/domain/numerico/evaluador-funciones';
import { newtonRaphson, type FilaNewton } from './newton-raphson.algoritmo';

/**
 * SERVICIO de Newton-Raphson.
 *
 * ── Qué vive acá ──────────────────────────────────────────────────────
 * Un solo signal `estado` con la última corrida: la tabla de filas ya
 * formateada, la respuesta para el shell y los datos que la produjeron.
 * Las pestañas (calculadora y ejemplos) leen de ahí; ninguna guarda
 * copias del resultado.
 *
 * ── Por qué calcularEjemplo no toca el estado ─────────────────────────
 * `calcular()` sí guarda: es el botón Calcular de la calculadora.
 * `calcularEjemplo()` solo ejecuta y devuelve: las pestañas de ejemplos
 * y autoevaluación necesitan los N estados de N bloques a la vez, y si
 * cada uno guardara, pisarían al anterior.
 */
@Injectable({ providedIn: 'any' })
export class NewtonRaphsonService {
  private readonly estado = signal<NewtonEstado | null>(null);
  readonly resultado = this.estado.asReadonly();

  calcular(datos: DatosCalculo): NewtonEstado {
    const estado = this.ejecutar(datos);
    this.estado.set(estado);
    return estado;
  }

  limpiar(): void {
    this.estado.set(null);
  }

  private ejecutar(datos: DatosCalculo): NewtonEstado {
    const f = this.parsearSeguro(datos.funcion);
    if (!f) {
      return fallo(
        datos,
        'No se pudo entender la función. Revisá la sintaxis: se admiten ^ para potencias, exp(), ln(), sen(), cos(), tan(), log() y sqrt().',
      );
    }

    const x0 = Number(datos.x0);
    const tol = Number(datos.tol);
    const maxIter = datos.maxIter ?? 100;

    if (!Number.isFinite(x0)) {
      return fallo(datos, 'La semilla x₀ debe ser un número válido.');
    }
    if (!Number.isFinite(tol) || tol <= 0) {
      return fallo(datos, 'La tolerancia debe ser positiva.');
    }

    const r = newtonRaphson({ f, x0, tol, maxIter });

    const filas = r.filas.map((fila: FilaNewton) => ({
      n: fila.n,
      x: formatear(fila.x),
      fx: formatear(fila.fx),
      fpx: formatear(fila.fpx),
      delta: fila.delta === undefined ? '—' : formatear(fila.delta),
    }));

    const filaFinal = r.convergio ? filas.length - 1 : undefined;

    const respuesta: RespuestaCalculadora = r.convergio
      ? {
          exito: true,
          raiz: formatear(r.raiz!),
          iteraciones: r.iteraciones,
          error: r.error === undefined ? '—' : formatear(r.error),
          conclusion:
            `Newton-Raphson convergió en ${r.iteraciones} iteraciones. La raíz es ` +
            `x ≈ ${formatear(r.raiz!)} con |Δx| < ${formatearTolTexto(tol)}. ` +
            'El método se detuvo porque el desplazamiento entre una iteración ' +
            'y la siguiente quedó por debajo de la tolerancia.',
        }
      : {
          exito: false,
          conclusion:
            r.mensaje ??
            'No se pudo completar el cálculo con los datos ingresados.',
        };

    return {
      datos,
      filas,
      filaFinal,
      raiz: r.raiz,
      error: r.error,
      iteraciones: r.iteraciones,
      convergio: r.convergio,
      respuesta,
    };
  }

  /**
   * Corre un bloque de ejemplos SIN tocar el estado guardado: la
   * pestaña de ejemplos necesita N resultados simultáneos.
   */
  calcularEjemplo(ejemplo: Ejemplo): NewtonEstado {
    return this.ejecutar(ejemplo.calculo);
  }

  funcionDeEjemplo(ejemplo: Ejemplo): (x: number) => number {
    return this.funcionDesdeTexto(ejemplo.calculo.funcion);
  }

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
   * Rango del eje X para el gráfico: tiene que mostrar la semilla Y la
   * raíz (cuando existe), con margen para ver la curva y las tangentes.
   */
  rangoPara(
    datos: DatosCalculo,
    raiz?: number,
  ): { min: number; max: number } {
    const x0 = Number(datos.x0);
    const puntos = [x0, raiz].filter(
      (p): p is number => p !== undefined && Number.isFinite(p),
    );

    if (puntos.length === 0) {
      return { min: -5, max: 5 };
    }

    const min = Math.min(...puntos);
    const max = Math.max(...puntos);
    const ancho = max - min || 1;
    const margen = Math.max(1, ancho * 0.5);

    return { min: min - margen, max: max + margen };
  }
}

export interface NewtonEstado {
  datos: DatosCalculo;
  filas: Record<string, number | string>[];
  filaFinal?: number;
  raiz?: number;
  error?: number;
  iteraciones: number;
  convergio: boolean;
  respuesta: RespuestaCalculadora;
}

function fallo(datos: DatosCalculo, mensaje: string): NewtonEstado {
  return {
    datos,
    filas: [],
    iteraciones: 0,
    convergio: false,
    respuesta: { exito: false, conclusion: mensaje },
  };
}

function formatear(v: number): string {
  if (!Number.isFinite(v)) return '—';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(8).replace(/\.?0+$/, '');
}

function formatearTolTexto(tol: number): string {
  if (tol < 1e-4) return tol.toExponential(1);
  if (Number.isInteger(tol)) return String(tol);
  return String(tol);
}
