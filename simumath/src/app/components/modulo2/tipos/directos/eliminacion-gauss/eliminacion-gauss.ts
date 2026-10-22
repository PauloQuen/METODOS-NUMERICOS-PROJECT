import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ELIMINACION_GAUSS } from './eliminacion-gauss.config';
import {
  Breadcrumb,
  type TramoBreadcrumb,
} from '../../../../../shared/layout/breadcrumb/breadcrumb';

/**
 * PÁGINA DE ELIMINACIÓN DE GAUSS: contenedor de las cuatro pestañas.
 * No hace matemática: muestra el método, la navegación y el outlet.
 */
@Component({
  selector: 'app-eliminacion-gauss',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Breadcrumb],
  templateUrl: './eliminacion-gauss.html',
  styleUrl: '../../../shared/estilos/pagina-metodo.scss',
})
export class EliminacionGauss {
  readonly metodo = ELIMINACION_GAUSS;
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
    { texto: 'Métodos directos', ruta: '/modulo2/tipos/directos' },
    { texto: ELIMINACION_GAUSS.nombre },
  ];

  constructor(route: ActivatedRoute) {
    route.url.subscribe((url) => {
      const ultimo = url.at(-1)?.toString() ?? 'teoria';
      const esPestana = this.pestanas.some((p) => p.ruta === ultimo);
      this.rutaActual.set(esPestana ? ultimo : 'teoria');
    });
  }
}
