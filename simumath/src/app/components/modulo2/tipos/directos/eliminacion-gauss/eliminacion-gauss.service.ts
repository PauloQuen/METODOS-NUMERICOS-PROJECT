import { Injectable, signal } from '@angular/core';
import type {
  DatosSistema,
  EjemploModulo2,
  RespuestaCalculadoraM2,
} from '../../../modelos/modulo2.model';
import { eliminacionGauss } from './eliminacion-gauss.algoritmo';
import {
  formatearNumero,
  formatearVector,
  parsearSistema,
} from '../../../shared/sistema';

/**
 * Orquestador de Eliminación de Gauss.
 *
 * El servicio guarda el último resultado en un signal para que no se
 * pierda al cambiar de pestaña. `providedIn: 'any'` da una instancia
 * por injector de carga diferida, compartida por las cuatro pestañas
 * del método pero separada de los demás métodos.
 */
@Injectable({ providedIn: 'any' })
export class EliminacionGaussService {
  private readonly estado = signal<GaussEstado | null>(null);

  readonly resultado = this.estado.asReadonly();

  calcular(datos: DatosSistema): GaussEstado {
    const estado = this.ejecutar(datos);
    this.estado.set(estado);
    return estado;
  }

  calcularEjemplo(ejemplo: EjemploModulo2): GaussEstado {
    return this.ejecutar(ejemplo.calculo);
  }

  calcularDesdeTexto(entrada: {
    matrizTexto: string;
    vectorTexto: string;
    etiqueta?: string;
  }): GaussEstado {
    const { sistema, error } = parsearSistema(entrada.matrizTexto, entrada.vectorTexto);
    if (error || !sistema) {
      const estado = fallo({ A: [], b: [] }, error ?? 'No se pudo leer el sistema.');
      this.estado.set(estado);
      return estado;
    }
    return this.calcular({ ...sistema, etiqueta: entrada.etiqueta });
  }

  limpiar(): void {
    this.estado.set(null);
  }

  private ejecutar(datos: DatosSistema): GaussEstado {
    const r = eliminacionGauss({ A: datos.A, b: datos.b });

    if (r.mensaje || !r.x) {
      return fallo(datos, r.mensaje ?? 'No se pudo resolver el sistema.');
    }

    const filas: Record<string, number | string>[] = r.filas.map((f) => ({
      paso: f.paso,
      pivote: f.pivote,
      fila: f.fila,
      operacion: f.operacion,
      matriz: f.matriz,
      termino: f.termino,
    }));

    const residual = r.residual ?? 0;
    const respuesta: RespuestaCalculadoraM2 = {
      exito: true,
      etiquetaResultado: 'Solución x',
      resultado: formatearVector(r.x),
      etiquetaBondad: 'Residuo máximo ‖Ax − b‖∞',
      bondad: formatearNumero(residual, 8),
      conclusion:
        `La solución del sistema es x = ${formatearVector(r.x)}. ` +
        `El residuo máximo es ${formatearNumero(residual, 8)} y el determinante de A es ` +
        `${formatearNumero(r.determinante)}. Se hicieron ${r.pivoteos} intercambio(s) de fila ` +
        'por pivoteo parcial.',
    };

    return {
      datos,
      filas,
      x: r.x,
      residual,
      determinante: r.determinante,
      pivoteos: r.pivoteos,
      respuesta,
    };
  }
}

export interface GaussEstado {
  datos: DatosSistema;
  filas: Record<string, number | string>[];
  x?: number[];
  residual?: number;
  determinante?: number;
  pivoteos: number;
  respuesta: RespuestaCalculadoraM2;
}

function fallo(datos: DatosSistema, mensaje: string): GaussEstado {
  return {
    datos,
    filas: [],
    pivoteos: 0,
    respuesta: { exito: false, conclusion: mensaje },
  };
}
