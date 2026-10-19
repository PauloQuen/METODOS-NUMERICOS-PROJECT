import { Component, inject } from '@angular/core';
import { EJERCICIOS_BISECCION } from '../biseccion.contenido';
import { COLUMNAS_BISECCION } from '../biseccion.config';
import { BiseccionService, type BiseccionEstado } from '../biseccion.service';
import { dibujarBiseccion } from '../biseccion.grafico';
import { BloqueEjercicio } from '../../../../../../shared/domain/bloque-ejercicio/bloque-ejercicio';

/**
 * PESTAÑA DE AUTOEVALUACIÓN de Bisección.
 *
 * ── Por qué el cálculo va por acá y no dentro del bloque ─────────────
 * `BloqueEjercicio` es genérico: sabe mostrar la solución, pero no sabe
 * qué método es ni qué datos tiene. Quien los conoce es el componente
 * del método, así que es este el que calcula y le pasa la tabla ya
 * lista. El bloque mantiene su estado de "mostrar/ocultar solución"
 * por ejercicio, así que el alumno puede revelar uno y dejarlo abierto.
 *
 * ── Por qué se calcula una sola vez ──────────────────────────────────
 * Igual que en Ejemplos: el array es fijo. Si se calculara en cada
 * lectura del template, con 3 ejercicios serían 3 corridas del
 * algoritmo por ciclo de detección de cambios.
 */
@Component({
  selector: 'app-biseccion-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicio],
  templateUrl: './biseccion-autoevaluacion.html',
  styleUrl: './biseccion-autoevaluacion.scss',
})
export class BiseccionAutoevaluacion {
  private readonly servicio = inject(BiseccionService);

  /** Los tres ejercicios: dos numéricos y uno de casuística. */
  readonly ejercicios = EJERCICIOS_BISECCION;

  readonly columnas = COLUMNAS_BISECCION;
  readonly dibujar = dibujarBiseccion;

  /** El cálculo de cada ejercicio, hecho una vez al construir. */
  protected readonly calculos: BiseccionEstado[] = this.ejercicios.map((e) =>
    this.servicio.calcularEjemplo(e),
  );


  protected calculoDe(indice: number): BiseccionEstado {
    return this.calculos[indice];
  }

  protected funcionDe(indice: number): (x: number) => number {
    return this.servicio.funcionDeEjemplo(this.ejercicios[indice]);
  }

  protected rangoDe(indice: number): { min: number; max: number } {
    return this.servicio.rangoPara(this.ejercicios[indice].calculo);
  }
}