import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BISECCION } from './biseccion.config';
import {
  familiaDe,
  rutaDeFamilia,
} from '../../../../../shared/domain/numerico/registro';
import {
  Breadcrumb,
  type TramoBreadcrumb,
} from '../../../../../shared/layout/breadcrumb/breadcrumb';

/**
 * PÁGINA DE BISECCIÓN: el contenedor de las cuatro pestañas.
 *
 * ── Qué hace esta pantalla y qué NO hace ─────────────────────────────
 * Hace: mostrar el nombre del método, su resumen, la navegación entre
 * pestañas y dejar el contenido de cada una en el outlet.
 *
 * NO hace: ninguna matemática. No importa el algoritmo, ni los textos,
 * ni los ejemplos, ni el servicio. Solo decide qué pestaña se ve.
 *
 * ── Por qué las pestañas son rutas y no un `@if` ─────────────────────
 * Si las cuatro_estuvieran en este template, cambiar de pestaña
 * recrearía todo el contenido. Con rutas hijas, el router conserva cada
 * pestaña y el servicio conserva el cálculo aunque el alumno vaya a
 * Teoría y vuelva: el trabajo no se pierde.
 */
@Component({
  selector: 'app-biseccion',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Breadcrumb],
  templateUrl: './biseccion.html',
  styleUrl: './biseccion.scss',
})
export class Biseccion {
  /** Los datos del método: nombre, resumen y color. */
  readonly metodo = BISECCION;

  /**
   * La URL actual, para saber qué pestaña marcar.
   *
   * El router es la fuente de verdad: no guardamos la pestaña activa en
   * este componente. Así el botón "atrás" del navegador funciona, y
   * cualquiera puede mandar al alumno directo a la calculadora con un
   * link. Si guardáramos la pestaña en un signal, el historial atrás del
   * navegador dejaría de servir para algo útil.
   */
  readonly rutaActual = signal<string>('teoria');

  /** Las pestañas, con su ícono y su ruta. */
  readonly pestanas = [
    { texto: 'Teoría', icono: 'menu_book', ruta: 'teoria' },
    { texto: 'Ejemplos', icono: 'science', ruta: 'ejemplos' },
    { texto: 'Autoevaluación', icono: 'quiz', ruta: 'autoevaluacion' },
    { texto: 'Calculadora', icono: 'calculate', ruta: 'calculadora' },
  ] as const;

  constructor(route: ActivatedRoute) {
    // Cada vez que cambia la URL, se actualiza la barra. Se toma el
    // último segmento con un valor conocido de pestaña, así los
    // parámetros de la ruta no ensucian la lectura.
    route.url.subscribe((url) => {
      const ultimo = url.at(-1)?.toString() ?? 'teoria';
      const esPestana = this.pestanas.some((p) => p.ruta === ultimo);
      this.rutaActual.set(esPestana ? ultimo : 'teoria');
    });
  }

  /** El color del método, para que la barra y el título compartan tono. */
  readonly estilo = computed(() => ({ '--color-metodo': this.metodo.color }));

  /**
   * Migas: Portal › Módulo 1 › Métodos cerrados › Bisección.
   *
   * Las tres primeras salen del REGISTRO, no están escritas a mano: si
   * mañana la familia cambia de nombre o la ruta se reacomoda, acá no hay
   * nada que tocar.
   */
  readonly miga = computed<TramoBreadcrumb[]>(() => {
    const familia = familiaDe(BISECCION.key);
    return [
      { texto: 'Portal', ruta: '/home' },
      { texto: 'Módulo 1', ruta: '/modulo1' },
      { texto: familia.nombre, ruta: rutaDeFamilia(familia.key) },
      { texto: BISECCION.nombre },
    ];
  });
}