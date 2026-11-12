import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListaEjerciciosError } from '../shared/lista-ejercicios-error/lista-ejercicios-error';
import { datosDeRuta } from '../shared/datos-ruta';
import type { Columna } from '../../../shared/models/metodo.model';
import type { EjercicioError } from '../modelos/modulo0.model';
import type { NivelDesbloqueo } from '../../../shared/autoevaluacion-mejorada/solution-gate.service';

/**
 * Pestaña Autoevaluación: los ejercicios del método con pista,
 * cuestionario de comprensión, resolución verificable y el mismo
 * candado del Módulo 3.
 */
@Component({
  selector: 'app-m0-tab-autoevaluacion',
  standalone: true,
  imports: [ListaEjerciciosError],
  template: `
    <app-m0-lista-ejercicios
      [ejercicios]="ejercicios"
      [columnas]="columnas"
      [tipoId]="tipoId"
      [metodoId]="metodoId"
      [mejorada]="mejorada"
      [desbloqueoBase]="desbloqueoBase"
      [titulo]="'Autoevaluación'"
      [intro]="intro"
    />
  `,
})
export class TabAutoevaluacionModulo0 {
  private readonly route = inject(ActivatedRoute);
  private readonly datos = datosDeRuta(this.route);
  readonly ejercicios = this.datos['ejercicios'] as EjercicioError[];
  readonly columnas = this.datos['columnas'] as Columna[];
  readonly tipoId = this.datos['tipoId'] as string;
  readonly metodoId = this.datos['metodoId'] as string;
  readonly mejorada = this.datos['mejorada'] as boolean;
  readonly desbloqueoBase = this.datos['desbloqueoBase'] as NivelDesbloqueo[];
  readonly intro = this.datos['introAutoevaluacion'] as string;
}
