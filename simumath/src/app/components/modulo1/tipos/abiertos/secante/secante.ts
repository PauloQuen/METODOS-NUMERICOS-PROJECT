import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SECANTE } from './secante.config';
import {
  familiaDe,
  rutaDeFamilia,
} from '../../../../../shared/domain/numerico/registro';
import {
  Breadcrumb,
  type TramoBreadcrumb,
} from '../../../../../shared/layout/breadcrumb/breadcrumb';

@Component({
  selector: 'app-metodo-secante',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Breadcrumb],
  templateUrl: './secante.html',
  styleUrl: './secante.scss',
})
export class MetodoSecante {
  readonly metodo = SECANTE;
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
    const familia = familiaDe(this.metodo.key);
    return [
      { texto: 'Portal', ruta: '/home' },
      { texto: 'Módulo 1', ruta: '/modulo1' },
      { texto: familia.nombre, ruta: rutaDeFamilia(familia.key) },
      { texto: this.metodo.nombre },
    ];
  });
}
