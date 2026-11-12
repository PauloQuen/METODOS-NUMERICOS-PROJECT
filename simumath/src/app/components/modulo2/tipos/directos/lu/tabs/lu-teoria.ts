import { Component } from '@angular/core';
import { TEORIA_LU } from '../lu.contenido';
import { TeoriaContenido } from '../../../../../../shared/domain/teoria-contenido/teoria-contenido';
@Component({
  selector: 'app-lu-teoria', standalone: true, imports: [TeoriaContenido],
  templateUrl: './lu-teoria.html', styleUrl: './lu-teoria.scss',
})
export class LuTeoria { readonly teoria = TEORIA_LU; }
