import { Component, input } from '@angular/core';
import type { RecursoFuente } from '../recursos-section';

/**
 * LISTA DE LECTURAS Y FUENTES.
 *
 * Cada fuente declara su tipo, autor/entidad y año. Los enlaces externos
 * salen con `rel="noopener noreferrer"` y una marca visual de que abren
 * fuera del portal.
 */
@Component({
  selector: 'app-source-list',
  standalone: true,
  templateUrl: './source-list.html',
  styleUrl: './source-list.scss',
})
export class SourceList {
  readonly fuentes = input.required<RecursoFuente[]>();

  protected etiquetaTipo(tipo: RecursoFuente['tipo']): string {
    switch (tipo) {
      case 'libro':
        return 'Libro';
      case 'articulo':
        return 'Artículo';
      case 'web':
        return 'Web';
      case 'video':
        return 'Video';
      case 'apuntes':
        return 'Apuntes';
      case 'documentacion':
        return 'Documentación';
    }
  }
}
