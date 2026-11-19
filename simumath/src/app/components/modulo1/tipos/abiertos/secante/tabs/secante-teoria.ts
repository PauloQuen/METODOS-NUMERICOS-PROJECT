import { Component } from '@angular/core';
import { TEORIA_SECANTE } from '../secante.contenido';
import { TeoriaContenido } from '../../../../../../shared/domain/teoria-contenido/teoria-contenido';

/** Fundamentos, convergencia, algoritmo y recomendaciones de Secante. */
@Component({
  selector: 'app-secante-teoria',
  standalone: true,
  imports: [TeoriaContenido],
  templateUrl: './secante-teoria.html',
  styleUrl: './secante-teoria.scss',
})
export class SecanteTeoria {
  readonly teoria = TEORIA_SECANTE;
}
