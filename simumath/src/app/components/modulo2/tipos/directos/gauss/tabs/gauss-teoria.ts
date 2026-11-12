import { Component } from '@angular/core';
import { TEORIA_GAUSS } from '../gauss.contenido';
import { TeoriaContenido } from '../../../../../../shared/domain/teoria-contenido/teoria-contenido';
@Component({
  selector: 'app-gauss-teoria', standalone: true, imports: [TeoriaContenido],
  templateUrl: './gauss-teoria.html', styleUrl: './gauss-teoria.scss',
})
export class GaussTeoria { readonly teoria = TEORIA_GAUSS; }
