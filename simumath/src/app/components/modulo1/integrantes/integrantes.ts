import { Component } from '@angular/core';
import { UiCard } from '../../../shared/ui/ui-card/ui-card';
import { Badge } from '../../../shared/ui/badge/badge';

/**
 * Integrantes y Referencias.
 * La estructura del equipo está lista; los datos se completan cuando el
 * grupo los confirme (no se inventa información).
 */
@Component({
  selector: 'app-integrantes',
  imports: [UiCard, Badge],
  templateUrl: './integrantes.html',
  styleUrl: './integrantes.scss',
})
export class Integrantes {
  /** Lugares del equipo; los nombres se cargan al confirmar el grupo. */
  readonly integrantes = [1, 2, 3, 4, 5].map((i) => ({
    lugar: `Integrante ${i}`,
    rol: i === 1 ? 'Coordinador' : 'Docente colaborador',
    pendiente: true,
  }));

  readonly referencias = [
    {
      autor: 'Chapra, S. & Canale, R.',
      titulo: 'Métodos Numéricos para Ingenieros',
      detalle: '7.ª ed., McGraw-Hill.',
    },
    {
      autor: 'Burden, R. & Faires, D.',
      titulo: 'Análisis Numérico',
      detalle: '10.ª ed., Cengage Learning.',
    },
    {
      autor: 'Newman, M.',
      titulo: 'Computational Physics',
      detalle: 'CreateSpace, ed. revisada.',
    },
  ];
}