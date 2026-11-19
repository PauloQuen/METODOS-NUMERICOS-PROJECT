import { Component } from '@angular/core';
import { TEORIA_BISECCION } from '../biseccion.contenido';
import { TeoriaContenido } from '../../../../../../shared/domain/teoria-contenido/teoria-contenido';

/** Fundamentos, convergencia, algoritmo y recomendaciones de Bisección. */
@Component({
  selector: 'app-biseccion-teoria',
  standalone: true,
  imports: [TeoriaContenido],
  templateUrl: './biseccion-teoria.html',
  styleUrl: './biseccion-teoria.scss',
})
export class BiseccionTeoria {
  readonly teoria = TEORIA_BISECCION;
}
