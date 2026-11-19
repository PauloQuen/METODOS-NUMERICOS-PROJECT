import { Component } from '@angular/core';
import { TEORIA_REGLA_FALSA } from '../regla-falsa.contenido';
import { TeoriaContenido } from '../../../../../../shared/domain/teoria-contenido/teoria-contenido';

@Component({
  selector: 'app-regla-falsa-teoria',
  standalone: true,
  imports: [TeoriaContenido],
  templateUrl: './regla-falsa-teoria.html',
  styleUrl: './regla-falsa-teoria.scss',
})
export class ReglaFalsaTeoria {
  readonly teoria = TEORIA_REGLA_FALSA;
}
