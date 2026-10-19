import { Injectable, signal } from '@angular/core';
import type {
  DatosCalculo,
  Ejemplo,
  RespuestaCalculadora,
} from '../../../../../shared/models/metodo.model';
import { parsearFuncion } from '../../../../../shared/domain/numerico/evaluador-funciones';
import { reglaFalsa, type FilaReglaFalsa } from './regla-falsa.algoritmo';

@Injectable({ providedIn: 'any' })
export class ReglaFalsaService {
  private readonly estado = signal<ReglaFalsaEstado | null>(null);
  readonly resultado = this.estado.asReadonly();

  calcular(datos: DatosCalculo): ReglaFalsaEstado {
    const estado = this.ejecutar(datos);
    this.estado.set(estado);
    return estado;
  }

  limpiar(): void {
    this.estado.set(null);
  }

  private ejecutar(datos: DatosCalculo): ReglaFalsaEstado {
    const f = this.parsearSeguro(datos.funcion);
    if (!f) {
      return fallo(
        datos,
        'No se pudo entender la función. Revisá la sintaxis: se admiten ^ para potencias, exp(), ln(), sen(), cos(), tan(), log() y sqrt().',
      );
    }

    const a = Number(datos.a);
    const b = Number(datos.b);
    const tol = Number(datos.tol);
    const maxIter = datos.maxIter ?? 100;

    const r = reglaFalsa({ f, a, b, tol, maxIter });

    const filas = r.filas.map((fila: FilaReglaFalsa) => ({
      n: fila.n,
      a: formatear(fila.a),
      b: formatear(fila.b),
      c: formatear(fila.c),
      fc: formatear(fila.fc),
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
            `Regla falsa convergió en ${r.iteraciones} iteraciones. La raíz es ` +
            `x ≈ ${formatear(r.raiz!)} con |Δc| < ${formatearTolTexto(tol)}. ` +
            'El método se detuvo porque el desplazamiento entre cortes quedó por debajo de la tolerancia.',
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

  calcularEjemplo(ejemplo: Ejemplo): ReglaFalsaEstado {
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

  rangoPara(datos: DatosCalculo): { min: number; max: number } {
    const a = Number(datos.a);
    const b = Number(datos.b);

    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return { min: -5, max: 5 };
    }

    const min = Math.min(a, b);
    const max = Math.max(a, b);
    const ancho = max - min || 1;
    const margen = ancho * 0.25;

    return { min: min - margen, max: max + margen };
  }
}

export interface ReglaFalsaEstado {
  datos: DatosCalculo;
  filas: Record<string, number | string>[];
  filaFinal?: number;
  raiz?: number;
  error?: number;
  iteraciones: number;
  convergio: boolean;
  respuesta: RespuestaCalculadora;
}

function fallo(datos: DatosCalculo, mensaje: string): ReglaFalsaEstado {
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
