import { Injectable, signal } from '@angular/core';
import type {
  DatosSistema,
  EjemploModulo2,
  RespuestaCalculadoraM2,
} from '../../../modelos/modulo2.model';
import { gaussSeidel } from './matrices-especiales.algoritmo';
import { columnasGaussSeidel } from './matrices-especiales.config';
import type { Columna } from '../../../../../shared/models/metodo.model';
import {
  formatearNumero,
  formatearVector,
  parsearSistema,
  parsearVector,
  residuoMaximo,
} from '../../../shared/sistema';

/**
 * Orquestador de Matrices Especiales (Gauss-Seidel).
 *
 * Guarda el último resultado para que sobreviva al cambio de pestaña.
 * Además prepara la tabla, los textos de cada iteración y el resumen
 * que muestra el panel de la calculadora.
 */
@Injectable({ providedIn: 'any' })
export class MatricesEspecialesService {
  private readonly estado = signal<GaussSeidelEstado | null>(null);

  readonly resultado = this.estado.asReadonly();

  calcular(datos: DatosSistema): GaussSeidelEstado {
    const estado = this.ejecutar(datos);
    this.estado.set(estado);
    return estado;
  }

  calcularEjemplo(ejemplo: EjemploModulo2): GaussSeidelEstado {
    return this.ejecutar(ejemplo.calculo);
  }

  calcularDesdeTexto(entrada: {
    matrizTexto: string;
    vectorTexto: string;
    tolTexto?: string;
    maxIterTexto?: string;
    x0Texto?: string;
    etiqueta?: string;
  }): GaussSeidelEstado {
    const { sistema, error } = parsearSistema(entrada.matrizTexto, entrada.vectorTexto);
    if (error || !sistema) {
      const estado = fallo({ A: [], b: [] }, error ?? 'No se pudo leer el sistema.');
      this.estado.set(estado);
      return estado;
    }

    const tol = aNumeroOpcional(entrada.tolTexto) ?? 1e-6;
    const maxIter = Math.floor(aNumeroOpcional(entrada.maxIterTexto) ?? 100);
    if (tol <= 0) {
      const estado = fallo(sistema, 'La tolerancia debe ser mayor que cero.');
      this.estado.set(estado);
      return estado;
    }

    let x0: number[] | undefined;
    if (entrada.x0Texto && entrada.x0Texto.trim() !== '') {
      const parsed = parsearVector(entrada.x0Texto);
      if (parsed.error) {
        const estado = fallo(sistema, parsed.error);
        this.estado.set(estado);
        return estado;
      }
      x0 = parsed.b;
    }

    return this.calcular({ ...sistema, tol, maxIter, x0, etiqueta: entrada.etiqueta });
  }

  limpiar(): void {
    this.estado.set(null);
  }

  private ejecutar(datos: DatosSistema): GaussSeidelEstado {
    const r = gaussSeidel({
      A: datos.A,
      b: datos.b,
      tol: datos.tol,
      maxIter: datos.maxIter,
      x0: datos.x0,
    });

    if (!r.x) {
      return fallo(datos, r.mensaje ?? 'No se pudo ejecutar el método.');
    }

    const n = r.x.length;
    const residual = residuoMaximo(datos.A, datos.b, r.x);
    const pasos = r.iteracionesDetalle.map((it) => {
      return (
        `Iteración ${it.k}: x = ${formatearVector(it.x)}. ` +
        `Cambio máximo respecto de la anterior: ${formatearNumero(it.error)}.`
      );
    });

    // La tabla se muestra formateada; el gráfico vuelve a convertir los
    // valores a número para ubicar cada punto.
    const filas = r.filas.map((fila) => {
      const salida: Record<string, number | string> = { k: fila['k'] };
      for (let i = 0; i < n; i++) {
        salida[`x${i + 1}`] = formatearNumero(Number(fila[`x${i + 1}`]));
      }
      salida['error'] = formatearNumero(Number(fila['error']));
      return salida;
    });

    const respuesta: RespuestaCalculadoraM2 = {
      exito: true,
      etiquetaResultado: 'Aproximación final x',
      resultado: formatearVector(r.x),
      etiquetaBondad: r.convergio ? 'Iteraciones y error final' : 'Estado de la iteración',
      bondad: r.convergio
        ? `${r.iteraciones} iteraciones · error ${formatearNumero(r.error)}`
        : `No convergió en ${r.iteraciones} iteraciones · error ${formatearNumero(r.error)}`,
      conclusion: r.convergio
        ? `Gauss-Seidel convergió en ${r.iteraciones} iteraciones. La solución es ` +
          `x ≈ ${formatearVector(r.x)}, con error de cambio ${formatearNumero(r.error)} ` +
          `y residuo ‖Ax − b‖∞ = ${formatearNumero(residual)}. ` +
          (r.diagonalDominante
            ? 'La matriz es estrictamente diagonalmente dominante, que garantiza la convergencia.'
            : 'La matriz no es estrictamente diagonalmente dominante: la convergencia no estaba garantizada.')
        : `El método no alcanzó la tolerancia en ${r.iteraciones} iteraciones. ` +
          `La última aproximación es x = ${formatearVector(r.x)}; probá aumentar el máximo de ` +
          'iteraciones o reordenar las ecuaciones para conseguir dominancia diagonal.',
    };

    return {
      datos,
      filas,
      columnas: columnasGaussSeidel(n),
      x: r.x,
      error: r.error,
      iteraciones: r.iteraciones,
      convergio: r.convergio,
      diagonalDominante: r.diagonalDominante,
      residual,
      pasos,
      respuesta,
    };
  }
}

export interface GaussSeidelEstado {
  datos: DatosSistema;
  filas: Record<string, number | string>[];
  columnas: Columna[];
  x?: number[];
  error?: number;
  iteraciones: number;
  convergio: boolean;
  diagonalDominante: boolean;
  residual?: number;
  pasos: string[];
  respuesta: RespuestaCalculadoraM2;
}

function fallo(datos: DatosSistema, mensaje: string): GaussSeidelEstado {
  return {
    datos,
    filas: [],
    columnas: columnasGaussSeidel(datos.A.length || 3),
    iteraciones: 0,
    convergio: false,
    diagonalDominante: false,
    pasos: [],
    respuesta: { exito: false, conclusion: mensaje },
  };
}

function aNumeroOpcional(texto: string | undefined): number | undefined {
  if (texto === undefined || texto.trim() === '') return undefined;
  const n = Number(texto);
  return Number.isFinite(n) ? n : undefined;
}
