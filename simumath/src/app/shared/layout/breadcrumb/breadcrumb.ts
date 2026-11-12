import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

/** Un tramo de la miga de pan: el texto y, si no es el último, dónde lleva. */
export interface TramoBreadcrumb {
  texto: string;
  /** Ruta absoluta del enlace. El último tramo NO lleva ruta: es donde estás. */
  ruta?: string;
}

/**
 * MIGA DE PAN — "Portal › Módulo 1 › Métodos cerrados › Bisección".
 *
 * ── Por qué un componente y no tres `<nav>` escritos a mano ───────────
 * Porque el día que cambie el separador, el tamaño o el color hay que
 * tocar tres pantallas, y en alguna se olvida. Acá se escribe una vez.
 *
 * El ÚLTIMO tramo no es enlace: es la página donde estás parado. Se marca
 * con `aria-current="page"` para que el lector de pantalla lo diga, y se
 * renderiza como `<strong>` en vez de `<a>` para que no se pueda tocar
 * (un enlace a la página actual es ruido en el historial del navegador).
 *
 * `tono` existe porque la miga se ve sobre dos fondos distintos: el hero
 * navy (texto claro) y el cuerpo de la página (texto oscuro).
 */
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
})
export class Breadcrumb {
  private readonly router = inject(Router);

  /** Los tramos, de izquierda a derecha. El último es la página actual. */
  readonly tramos = input.required<TramoBreadcrumb[]>();

  /** 'navy' sobre el hero oscuro, 'claro' sobre el fondo de la página. */
  readonly tono = input<'navy' | 'claro'>('claro');

  readonly tonoClass = computed(() => (this.tono() === 'navy' ? 'breadcrumb--navy' : ''));

  /**
   * Destino del botón "Volver": el último tramo anterior con ruta.
   * No se usa el historial del navegador porque puede llevar a una página
   * ajena al módulo (por ejemplo, un resultado del buscador). Así el
   * retroceso siempre sube un nivel de la jerarquía del portal.
   */
  private readonly tramosAnteriores = computed(() => {
    const actual = this.router.url.split(/[?#]/)[0].replace(/\/$/, '');
    return this.tramos().filter((tramo) => {
      if (!tramo.ruta) return false;
      if (tramo.ruta === actual) return false;
      // En la portada de un módulo, "Volver" sube al portal y no a la
      // misma portada (que redirigiría otra vez a /inicio).
      if (actual.endsWith('/inicio') && tramo.ruta === actual.slice(0, -'/inicio'.length)) {
        return false;
      }
      return true;
    });
  });

  readonly rutaVolver = computed(() => this.tramosAnteriores().at(-1)?.ruta ?? '/home');

  readonly textoVolver = computed(() => this.tramosAnteriores().at(-1)?.texto ?? 'el inicio');
}
