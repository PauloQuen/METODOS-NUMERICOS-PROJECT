import { Component } from '@angular/core';
import { TEORIA_PUNTO_FIJO } from '../punto-fijo.contenido';
import { TeoriaContenido } from '../../../../../../shared/domain/teoria-contenido/teoria-contenido';

/** Fundamentos, convergencia, algoritmo y recomendaciones de Punto Fijo. */
@Component({
  selector: 'app-punto-fijo-teoria',
  standalone: true,
  imports: [TeoriaContenido],
  templateUrl: './punto-fijo-teoria.html',
  styleUrl: './punto-fijo-teoria.scss',
})
export class PuntoFijoTeoria {
  readonly teoria = TEORIA_PUNTO_FIJO;
}
