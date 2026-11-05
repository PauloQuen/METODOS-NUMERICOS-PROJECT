import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LU } from './lu.config';
import {
  familiaDeModulo2,
  rutaDeFamiliaModulo2,
} from '../../../registro-modulo2';
import {
  Breadcrumb,
  type TramoBreadcrumb,
} from '../../../../../shared/layout/breadcrumb/breadcrumb';

/**
 * Página de la factorización LU.
 *
 * ── Qué aporta y qué no ──────────────────────────────────────────────
 * Aporta la CABECERA: migas, nombre del método y las cuatro pestañas.
 * No aporta ni una línea de contenido: el contenido vive en las cuatro
 * pestañas, que son rutas hijas. El motivo es el mismo que en el
 * Módulo 1: si las pestañas fueran un `@if` dentro de la página, al
 * cambiar de pestaña se recrearía todo y el cálculo que el alumno tiene
 * a medias se perdería.
 *
 * ── El color del método ──────────────────────────────────────────────
 * El color vive en `LU.color` y se inyecta por variable CSS
 * (`--color-metodo`). Así el botón de la pestaña activa y el resto de
 * detalles se tiñen con el color del método sin repetir el hex en el
 * CSS.
 */
@Component({
  selector: 'app-metodo-lu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Breadcrumb],
  templateUrl: './lu.html',
  styleUrl: './lu.scss',
})
export class MetodoLu {
  readonly metodo = LU;
  readonly rutaActual = signal<string>('teoria');

  readonly pestanas = [
    { texto: 'Teoría', icono: 'menu_book', ruta: 'teoria' },
    { texto: 'Ejemplos', icono: 'science', ruta: 'ejemplos' },
    { texto: 'Autoevaluación', icono: 'quiz', ruta: 'autoevaluacion' },
    { texto: 'Calculadora', icono: 'calculate', ruta: 'calculadora' },
  ] as const;

  constructor(route: ActivatedRoute) {
    route.url.subscribe((url) => {
      const ultimo = url.at(-1)?.toString() ?? 'teoria';
      const esPestana = this.pestanas.some((p) => p.ruta === ultimo);
      this.rutaActual.set(esPestana ? ultimo : 'teoria');
    });
  }

  readonly estilo = computed(() => ({ '--color-metodo': this.metodo.color }));

  readonly miga = computed<TramoBreadcrumb[]>(() => {
    const familia = familiaDeModulo2(this.metodo.key);
    return [
      { texto: 'Portal', ruta: '/home' },
      { texto: 'Módulo 2', ruta: '/modulo2/inicio' },
      { texto: familia.nombre, ruta: rutaDeFamiliaModulo2(familia.key) },
      { texto: this.metodo.nombre },
    ];
  });
}
