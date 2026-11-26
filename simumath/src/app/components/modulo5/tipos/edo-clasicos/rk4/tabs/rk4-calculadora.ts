import { Component } from '@angular/core';
import { CalculadoraEdo } from '../../../../shared/calculadora-edo/calculadora-edo';
import { CAMPOS_CALCULADORA_RK4, COLUMNAS_RK4 } from '../rk4.config';

/** CALCULADORA DE RK4: delega en la calculadora compartida del módulo. */
@Component({
  selector: 'app-rk4-calculadora',
  standalone: true,
  imports: [CalculadoraEdo],
  template: `
    <app-calculadora-edo
      metodo="rk4"
      titulo="Calculadora de Runge-Kutta de orden 4"
      [campos]="campos"
      [columnas]="columnas"
      [intro]="intro"
    />
  `,
})
export class Rk4Calculadora {
  readonly campos = CAMPOS_CALCULADORA_RK4;
  readonly columnas = COLUMNAS_RK4;
  readonly intro =
    'Escribí f(t, y), el punto inicial, el paso h y el instante final. La tabla muestra las cuatro ' +
    'pendientes de cada paso. Si escribís la solución exacta, se calcula el error, la comparación ' +
    'con Euler y la tabla de convergencia.';
}
