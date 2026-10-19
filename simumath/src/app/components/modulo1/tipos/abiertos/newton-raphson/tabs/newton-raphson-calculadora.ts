import { Component, computed, inject, signal } from '@angular/core';
import { NewtonRaphsonService } from '../newton-raphson.service';
import {
  CAMPOS_CALCULADORA,
  COLUMNAS_NEWTON,
  DATOS_POR_DEFECTO,
} from '../newton-raphson.config';
import { dibujarNewtonRaphson } from '../newton-raphson.grafico';
import { CalculadoraShell } from '../../../../../../shared/domain/calculadora-shell/calculadora-shell';
import { IterationTable } from '../../../../../../shared/domain/iteration-table/iteration-table';
import { PasosControl } from '../../../../../../shared/domain/pasos-control/pasos-control';
import { GraficoMetodo } from '../../../../../../shared/domain/grafico-metodo/grafico-metodo';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import type { DatosCalculo } from '../../../../../../shared/models/metodo.model';

/**
 * PESTAÑA DE CALCULADORA de Newton-Raphson.
 *
 * `CalculadoraShell` solo junta lo que el alumno escribe (es genérico y
 * no sabe qué es una semilla): acá se convierten los strings a números,
 * se los pasa al `NewtonRaphsonService` y se lee el estado resultante.
 *
 * El resultado vive en el servicio, no en signals propios: si fuera
 * local, el cálculo moriría al salir de la pestaña. El alumno puede ir
 * a Teoría, volver, y seguir con la misma cuenta.
 */
@Component({
  selector: 'app-newton-raphson-calculadora',
  standalone: true,
  imports: [CalculadoraShell, IterationTable, PasosControl, GraficoMetodo, UiCard],
  templateUrl: './newton-raphson-calculadora.html',
  styleUrl: './newton-raphson-calculadora.scss',
})
export class NewtonRaphsonCalculadora {
  private readonly servicio = inject(NewtonRaphsonService);

  readonly campos = CAMPOS_CALCULADORA;
  readonly columnas = COLUMNAS_NEWTON;
  readonly dibujar = dibujarNewtonRaphson;

  protected readonly estado = this.servicio.resultado;
  protected readonly valores = signal<Record<string, string>>({});
  protected readonly paso = signal(0);
  protected readonly funcion = signal<(x: number) => number>(() => 0);
  protected readonly rango = signal<{ min: number; max: number }>({
    min: -5,
    max: 5,
  });

  protected alCalcular(escrito: Record<string, string>): void {
    const datos: DatosCalculo = {
      funcion: escrito['funcion'] ?? DATOS_POR_DEFECTO.funcion,
      x0: aNumero(escrito['x0'], DATOS_POR_DEFECTO.x0),
      tol: aNumero(escrito['tol'], DATOS_POR_DEFECTO.tol),
      maxIter: aNumero(escrito['maxIter'], DATOS_POR_DEFECTO.maxIter),
    };

    const estado = this.servicio.calcular(datos);

    this.funcion.set(this.servicio.funcionDesdeTexto(datos.funcion));
    this.rango.set(this.servicio.rangoPara(datos, estado.raiz));
    this.paso.set(0);
  }

  protected alCambiarPaso(paso: number): void {
    this.paso.set(paso);
  }

  protected alLimpiar(): void {
    this.servicio.limpiar();
    this.valores.set({});
    this.paso.set(0);
  }

  protected readonly total = computed(() => this.estado()?.filas.length ?? 0);

  protected readonly textoDelPaso = computed(() => {
    const e = this.estado();
    if (!e) return '';

    const fila = e.filas[this.paso()];
    if (!fila) return '';

    const n = fila['n'];
    const x = fila['x'];
    const fx = fila['fx'];
    const fpx = fila['fpx'];
    const delta = fila['delta'];
    const ultima = e.filaFinal === this.paso();

    const base =
      `Iteración ${n}: x = ${x}, f(x) = ${fx}, f'(x) = ${fpx}, |Δx| = ${delta}.`;

    return ultima
      ? `${base} Esta es la última: se cumplió el criterio de parada.`
      : `${base} Como |Δx| todavía supera la tolerancia, se traza la ` +
        'tangente en este punto y se repite desde su cruce con el eje.';
  });
}

/** Convierte lo que escribió el alumno, con un valor por defecto. */
function aNumero(
  texto: string | undefined,
  porDefecto: number | undefined,
): number {
  if (texto === undefined || texto.trim() === '') return porDefecto ?? 0;
  return Number(texto);
}
