import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TRAPECIO } from './trapecio.config';
import {
  Breadcrumb,
  type TramoBreadcrumb,
} from '../../../../../shared/layout/breadcrumb/breadcrumb';

/**
 * PÁGINA DEL TRAPECIO: el contenedor de las cuatro pestañas.
 *
 * Mismo patrón que las páginas de los módulos anteriores: las pestañas
 * son rutas hijas (no `@if`), así el cálculo del alumno sobrevive al
 * cambiar de pestaña. La interfaz no cambia de un método a otro.
 */
@Component({
  selector: 'app-trapecio',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Breadcrumb],
  templateUrl: './trapecio.html',
  styleUrl: '../../../shared/estilos/pagina-metodo.scss',
})
export class Trapecio {
  readonly metodo = TRAPECIO;

  readonly rutaActual = signal<string>('teoria');

  readonly pestanas = [
    { texto: 'Teoría', icono: 'menu_book', ruta: 'teoria' },
    { texto: 'Ejemplos', icono: 'science', ruta: 'ejemplos' },
    { texto: 'Autoevaluación', icono: 'quiz', ruta: 'autoevaluacion' },
    { texto: 'Calculadora', icono: 'calculate', ruta: 'calculadora' },
  ] as const;

  readonly estilo = computed(() => ({ '--color-metodo': this.metodo.color }));

  /** Migas: Portal › Módulo 4 › Newton-Cotes › Trapecio. */
  readonly miga: TramoBreadcrumb[] = [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 4', ruta: '/modulo4' },
    { texto: 'Newton-Cotes', ruta: '/modulo4/tipos/newton-cotes' },
    { texto: TRAPECIO.nombre },
  ];

  constructor(route: ActivatedRoute) {
    route.url.subscribe((url) => {
      const ultimo = url.at(-1)?.toString() ?? 'teoria';
      const esPestana = this.pestanas.some((p) => p.ruta === ultimo);
      this.rutaActual.set(esPestana ? ultimo : 'teoria');
    });
  }
}
