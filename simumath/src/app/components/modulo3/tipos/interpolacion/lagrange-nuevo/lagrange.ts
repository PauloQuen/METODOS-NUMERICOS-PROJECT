import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LAGRANGE } from './lagrange.config';
import {
  Breadcrumb,
  type TramoBreadcrumb,
} from '../../../../../shared/layout/breadcrumb/breadcrumb';

/**
 * PÁGINA DE LAGRANGE: el contenedor de las cuatro pestañas.
 *
 * No hace ninguna matemática: muestra el nombre del método, su resumen,
 * la navegación entre pestañas y deja el contenido de cada una en el
 * outlet. Es el mismo patrón que la página de Bisección del Módulo 1,
 * para que un alumno que ya conoce un método no tenga que reaprender la
 * interfaz.
 *
 * ── Por qué las pestañas son rutas y no un `@if` ─────────────────────
 * Porque así funciona el botón "atrás" del navegador, se puede
 * compartir el enlace a una pestaña y el cálculo del alumno no se
 * pierde al cambiar de pestaña.
 */
@Component({
  selector: 'app-lagrange',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Breadcrumb],
  templateUrl: './lagrange.html',
  // Los estilos de la página son los mismos para los dos métodos del
  // módulo, así que viven en un solo archivo compartido.
  styleUrl: '../../../shared/estilos/pagina-metodo.scss',
})
export class Lagrange {
  /** Los datos del método: nombre, familia, resumen y color. */
  readonly metodo = LAGRANGE;

  /** Pestana activa según la URL. */
  readonly rutaActual = signal<string>('teoria');

  readonly pestanas = [
    { texto: 'Teoría', icono: 'menu_book', ruta: 'teoria' },
    { texto: 'Ejemplos', icono: 'science', ruta: 'ejemplos' },
    { texto: 'Autoevaluación', icono: 'quiz', ruta: 'autoevaluacion' },
    { texto: 'Calculadora', icono: 'calculate', ruta: 'calculadora' },
  ] as const;

  /** El color del método, para el título y la barra. */
  readonly estilo = computed(() => ({ '--color-metodo': this.metodo.color }));

  /** Migas: Portal › Módulo 3 › Interpolación › Lagrange. */
  readonly miga: TramoBreadcrumb[] = [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 3', ruta: '/modulo3' },
    { texto: 'Interpolación', ruta: '/modulo3/tipos/interpolacion' },
    { texto: LAGRANGE.nombre },
  ];

  constructor(route: ActivatedRoute) {
    route.url.subscribe((url) => {
      const ultimo = url.at(-1)?.toString() ?? 'teoria';
      const esPestana = this.pestanas.some((p) => p.ruta === ultimo);
      this.rutaActual.set(esPestana ? ultimo : 'teoria');
    });
  }
}
