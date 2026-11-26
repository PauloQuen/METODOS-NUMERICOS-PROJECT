import { Component } from '@angular/core';
import { CalculadoraEdo } from '../../../../shared/calculadora-edo/calculadora-edo';
import { CAMPOS_CALCULADORA_EULER, COLUMNAS_EULER } from '../euler.config';

/** CALCULADORA DE EULER: delega en la calculadora compartida del módulo. */
@Component({
  selector: 'app-euler-calculadora',
  standalone: true,
  imports: [CalculadoraEdo],
  template: `
    <app-calculadora-edo
      metodo="euler"
      titulo="Calculadora de Euler explícito"
      [campos]="campos"
      [columnas]="columnas"
      [intro]="intro"
    />
  `,
})
export class EulerCalculadora {
  readonly campos = CAMPOS_CALCULADORA_EULER;
  readonly columnas = COLUMNAS_EULER;
  readonly intro =
    'Escribí f(t, y), el punto inicial, el paso h y el instante final. La tabla muestra cada paso ' +
    'con la pendiente usada; el gráfico compara la poligonal con la solución exacta si la escribís. ' +
    'Si el valor exacto no se pasa, la última columna de error queda vacía.';
}
