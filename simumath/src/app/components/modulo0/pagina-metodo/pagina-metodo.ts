import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Breadcrumb, type TramoBreadcrumb } from '../../../shared/layout/breadcrumb/breadcrumb';
import {
  FAMILIAS_MODULO0,
  rutaDeFamiliaModulo0,
  type MetodoModulo0,
} from '../registro-modulo0';

/**
 * PÁGINA DE UN MÉTODO DEL MÓDULO 0.
 *
 * Un solo componente para los cuatro métodos: el nombre, el resumen, el
 * color y la familia llegan por `data` desde el archivo de rutas del
 * método. Así la página no sabe si está mostrando Taylor o cifras
 * significativas, y agregar un método no duplica esta plantilla.
 *
 * Las cuatro pestañas son rutas hijas reales (no un `@if`), igual que en
 * el resto del portal: el botón "atrás" funciona y el enlace a una
 * pestaña se puede compartir.
 */
@Component({
  selector: 'app-m0-pagina-metodo',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Breadcrumb],
  templateUrl: './pagina-metodo.html',
  // Se reutiliza la hoja de la página de método del M3: la estructura
  // visual es la misma y cambiarla en un solo archivo mantiene el portal
  // consistente.
  styleUrl: '../../modulo3/shared/estilos/pagina-metodo.scss',
})
export class PaginaMetodoModulo0 {
  private readonly route = inject(ActivatedRoute);

  /** Definición del método, provista por la ruta. */
  readonly metodo = this.route.snapshot.data['metodo'] as MetodoModulo0;

  /** Nombre legible de la familia, derivado del registro. */
  readonly familia = FAMILIAS_MODULO0.find((f) => f.key === this.metodo.familia);

  readonly rutaBase = `${rutaDeFamiliaModulo0(this.metodo.familia)}/${this.metodo.ruta}`;

  readonly pestanas = [
    { texto: 'Teoría', icono: 'menu_book', ruta: 'teoria' },
    { texto: 'Ejemplos', icono: 'science', ruta: 'ejemplos' },
    { texto: 'Autoevaluación', icono: 'quiz', ruta: 'autoevaluacion' },
    { texto: 'Calculadora', icono: 'calculate', ruta: 'calculadora' },
  ] as const;

  /** Pestaña activa según la URL. */
  readonly rutaActual = signal<string>('teoria');

  readonly estilo = computed(() => ({ '--color-metodo': this.metodo.color }));

  /** Migas: Portal › Módulo 0 › Familia › Método. */
  readonly miga: TramoBreadcrumb[] = [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 0', ruta: '/modulo0' },
    {
      texto: this.familia?.nombre ?? 'Métodos',
      ruta: rutaDeFamiliaModulo0(this.metodo.familia),
    },
    { texto: this.metodo.nombre },
  ];

  constructor() {
    this.route.url.subscribe((url) => {
      const ultimo = url.at(-1)?.toString() ?? 'teoria';
      const esPestana = this.pestanas.some((p) => p.ruta === ultimo);
      this.rutaActual.set(esPestana ? ultimo : 'teoria');
    });
  }
}
