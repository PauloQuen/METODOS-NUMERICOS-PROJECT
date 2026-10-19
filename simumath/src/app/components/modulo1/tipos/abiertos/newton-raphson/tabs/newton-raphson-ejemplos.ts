import { Component, computed, inject, signal } from '@angular/core';
import { EJEMPLOS_NEWTON } from '../newton-raphson.contenido';
import { COLUMNAS_NEWTON } from '../newton-raphson.config';
import { NewtonRaphsonService } from '../newton-raphson.service';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';
import { dibujarNewtonRaphson } from '../newton-raphson.grafico';

@Component({
  selector: 'app-newton-raphson-ejemplos',
  standalone: true,
  imports: [BloqueEjemplo],
  templateUrl: './newton-raphson-ejemplos.html',
  styleUrl: './newton-raphson-ejemplos.scss',
})
export class NewtonRaphsonEjemplos {
  readonly ejemplos = EJEMPLOS_NEWTON;
  readonly columnas = COLUMNAS_NEWTON;
  readonly dibujar = dibujarNewtonRaphson;

  private readonly servicio = inject(NewtonRaphsonService);

  protected readonly estados = signal(
    this.ejemplos.map((e) => this.servicio.calcularEjemplo(e)),
  );

  protected readonly funciones = this.ejemplos.map((e) =>
    this.servicio.funcionDeEjemplo(e),
  );

  protected readonly rangos = computed(() =>
    this.ejemplos.map((e, i) =>
      this.servicio.rangoPara(e.calculo, this.estados()[i].raiz),
    ),
  );
}
