import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SIMPSON } from './simpson.config';
import {
  Breadcrumb,
  type TramoBreadcrumb,
} from '../../../../../shared/layout/breadcrumb/breadcrumb';

/**
 * PÁGINA DE SIMPSON: el contenedor de las cuatro pestañas.
 *
 * Igual que en el trapecio: las pestañas son rutas hijas, así el cálculo
 * del alumno sobrevive al cambiar de pestaña y cada método tiene su
 * propia URL.
 */
@Component({
  selector: 'app-simpson',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Breadcrumb],
  templateUrl: './simpson.html',
  styleUrl: '../../../shared/estilos/pagina-metodo.scss',
})
export class Simpson {
  readonly metodo = SIMPSON;

  readonly rutaActual = signal<string>('teoria');

  readonly pestanas = [
    { texto: 'Teoría', icono: 'menu_book', ruta: 'teoria' },
    { texto: 'Ejemplos', icono: 'science', ruta: 'ejemplos' },
    { texto: 'Autoevaluación', icono: 'quiz', ruta: 'autoevaluacion' },
    { texto: 'Calculadora', icono: 'calculate', ruta: 'calculadora' },
  ] as const;

  readonly estilo = computed(() => ({ '--color-metodo': this.metodo.color }));

  /** Migas: Portal › Módulo 4 › Newton-Cotes › Simpson. */
  readonly miga: TramoBreadcrumb[] = [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 4', ruta: '/modulo4' },
    { texto: 'Newton-Cotes', ruta: '/modulo4/tipos/newton-cotes' },
    { texto: SIMPSON.nombre },
  ];

  constructor(route: ActivatedRoute) {
    route.url.subscribe((url) => {
      const ultimo = url.at(-1)?.toString() ?? 'teoria';
      const esPestana = this.pestanas.some((p) => p.ruta === ultimo);
      this.rutaActual.set(esPestana ? ultimo : 'teoria');
    });
  }
}
