import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CalculadoraErrorVista } from '../shared/calculadora-error/calculadora-error';
import { datosDeRuta } from '../shared/datos-ruta';
import type { Columna } from '../../../shared/models/metodo.model';
import type {
  CampoCalculadoraError,
  RespuestaCalculadoraError,
} from '../modelos/modulo0.model';

/** Pestaña Calculadora: el formulario y el cálculo propios del método. */
@Component({
  selector: 'app-m0-tab-calculadora',
  standalone: true,
  imports: [CalculadoraErrorVista],
  template: `
    <app-m0-calculadora-error
      [campos]="campos"
      [columnas]="columnas"
      [titulo]="titulo"
      [intro]="intro"
      [calcular]="calcular"
    />
  `,
})
export class TabCalculadoraModulo0 {
  private readonly route = inject(ActivatedRoute);
  private readonly datos = datosDeRuta(this.route);
  readonly campos = this.datos['campos'] as CampoCalculadoraError[];
  readonly columnas = this.datos['columnas'] as Columna[];
  readonly titulo = this.datos['tituloCalculadora'] as string;
  readonly intro = this.datos['introCalculadora'] as string;
  readonly calcular = this.datos['calcular'] as (
    valores: Record<string, string>,
  ) => RespuestaCalculadoraError;
}
