import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MATRICES_ESPECIALES } from './matrices-especiales.config';
import {
  Breadcrumb,
  type TramoBreadcrumb,
} from '../../../../../shared/layout/breadcrumb/breadcrumb';

/**
 * PÁGINA DE MATRICES ESPECIALES (GAUSS-SEIDEL).
 * Contenedor de las cuatro pestañas del método iterativo.
 */
@Component({
  selector: 'app-matrices-especiales',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Breadcrumb],
  templateUrl: './matrices-especiales.html',
  styleUrl: '../../../shared/estilos/pagina-metodo.scss',
})
export class MatricesEspeciales {
  readonly metodo = MATRICES_ESPECIALES;
  readonly rutaActual = signal<string>('teoria');

  readonly pestanas = [
    { texto: 'Teoría', icono: 'menu_book', ruta: 'teoria' },
    { texto: 'Ejemplos', icono: 'science', ruta: 'ejemplos' },
    { texto: 'Autoevaluación', icono: 'quiz', ruta: 'autoevaluacion' },
    { texto: 'Calculadora', icono: 'calculate', ruta: 'calculadora' },
  ] as const;

  readonly estilo = computed(() => ({ '--color-metodo': this.metodo.color }));

  readonly miga: TramoBreadcrumb[] = [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 2', ruta: '/modulo2' },
    { texto: 'Métodos iterativos', ruta: '/modulo2/tipos/iterativos' },
    { texto: MATRICES_ESPECIALES.nombre },
  ];

  constructor(route: ActivatedRoute) {
    route.url.subscribe((url) => {
      const ultimo = url.at(-1)?.toString() ?? 'teoria';
      const esPestana = this.pestanas.some((p) => p.ruta === ultimo);
      this.rutaActual.set(esPestana ? ultimo : 'teoria');
    });
  }
}
