import { Component, computed, inject, signal } from '@angular/core';
import { EJERCICIOS_NEWTON } from '../newton-raphson.contenido';
import { COLUMNAS_NEWTON } from '../newton-raphson.config';
import { NewtonRaphsonService } from '../newton-raphson.service';
import { BloqueEjercicio } from '../../../../../../shared/domain/bloque-ejercicio/bloque-ejercicio';
import { dibujarNewtonRaphson } from '../newton-raphson.grafico';

@Component({
  selector: 'app-newton-raphson-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicio],
  templateUrl: './newton-raphson-autoevaluacion.html',
  styleUrl: './newton-raphson-autoevaluacion.scss',
})
export class NewtonRaphsonAutoevaluacion {
  readonly ejercicios = EJERCICIOS_NEWTON;
  readonly columnas = COLUMNAS_NEWTON;
  readonly dibujar = dibujarNewtonRaphson;

  private readonly servicio = inject(NewtonRaphsonService);

  protected readonly estados = signal(
    this.ejercicios.map((e) => this.servicio.calcularEjemplo(e)),
  );

  protected readonly funciones = this.ejercicios.map((e) =>
    this.servicio.funcionDeEjemplo(e),
  );

  protected readonly rangos = computed(() =>
    this.ejercicios.map((e, i) =>
      this.servicio.rangoPara(e.calculo, this.estados()[i].raiz),
    ),
  );
}
