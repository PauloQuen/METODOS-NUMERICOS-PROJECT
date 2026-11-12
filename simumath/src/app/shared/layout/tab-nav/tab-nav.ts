import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface TabItem {
  label: string;
  /** Ruta relativa dentro del módulo (data-path). */
  path: string;
}

/**
 * Navegación por pestañas entre secciones del módulo.
 * Sticky (top 0) para no perder el contexto al scrollear.
 * Variantes: 'pill' (control segmentado) o 'flat' (fila simple).
 *
 * Antes las pestañas eran `<a href="#">` con un evento: no se podían abrir
 * en otra pestaña y el enlace no tenía destino. Ahora son enlaces reales
 * (`routerLink`), con `aria-current="page"` en la sección activa.
 */
@Component({
  selector: 'app-tab-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tab-nav.html',
  styleUrl: './tab-nav.scss',
})
export class TabNav {
  readonly tabs = input<TabItem[]>([]);
  readonly activeTab = input('');
  readonly variant = input<'pill' | 'flat'>('pill');
  /** Prefijo de las rutas, por ejemplo `/modulo1`. */
  readonly base = input('');

  isActive(path: string): boolean {
    return path === this.activeTab();
  }
}
