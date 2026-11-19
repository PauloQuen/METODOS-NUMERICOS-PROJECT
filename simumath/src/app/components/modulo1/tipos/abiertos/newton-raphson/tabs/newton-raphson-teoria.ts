import { Component } from '@angular/core';
import { TEORIA_NEWTON } from '../newton-raphson.contenido';
import { TeoriaContenido } from '../../../../../../shared/domain/teoria-contenido/teoria-contenido';

/** Fundamentos, convergencia, algoritmo y recomendaciones de Newton-Raphson. */
@Component({
  selector: 'app-newton-raphson-teoria',
  standalone: true,
  imports: [TeoriaContenido],
  templateUrl: './newton-raphson-teoria.html',
  styleUrl: './newton-raphson-teoria.scss',
})
export class NewtonRaphsonTeoria {
  readonly teoria = TEORIA_NEWTON;
}
