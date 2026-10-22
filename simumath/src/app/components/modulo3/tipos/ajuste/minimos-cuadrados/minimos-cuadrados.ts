import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MINIMOS_CUADRADOS } from './minimos-cuadrados.config';
import {
  Breadcrumb,
  type TramoBreadcrumb,
} from '../../../../../shared/layout/breadcrumb/breadcrumb';

/**
 * PÁGINA DE MÍNIMOS CUADRADOS: el contenedor de las cuatro pestañas.
 * Mismo patrón que la página de Lagrange y que las del Módulo 1: la
 * interfaz no cambia de un método a otro.
 */
@Component({
  selector: 'app-minimos-cuadrados',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Breadcrumb],
  templateUrl: './minimos-cuadrados.html',
  styleUrl: '../../../shared/estilos/pagina-metodo.scss',
})
export class MinimosCuadrados {
  readonly metodo = MINIMOS_CUADRADOS;

  readonly rutaActual = signal<string>('teoria');

  readonly pestanas = [
    { texto: 'Teoría', icono: 'menu_book', ruta: 'teoria' },
    { texto: 'Ejemplos', icono: 'science', ruta: 'ejemplos' },
    { texto: 'Autoevaluación', icono: 'quiz', ruta: 'autoevaluacion' },
    { texto: 'Calculadora', icono: 'calculate', ruta: 'calculadora' },
  ] as const;

  readonly estilo = computed(() => ({ '--color-metodo': this.metodo.color }));

  /** Migas: Portal › Módulo 3 › Ajuste de curvas › Mínimos cuadrados. */
  readonly miga: TramoBreadcrumb[] = [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 3', ruta: '/modulo3' },
    { texto: 'Ajuste de curvas', ruta: '/modulo3/tipos/ajuste' },
    { texto: MINIMOS_CUADRADOS.nombre },
  ];

  constructor(route: ActivatedRoute) {
    route.url.subscribe((url) => {
      const ultimo = url.at(-1)?.toString() ?? 'teoria';
      const esPestana = this.pestanas.some((p) => p.ruta === ultimo);
      this.rutaActual.set(esPestana ? ultimo : 'teoria');
    });
  }
}
