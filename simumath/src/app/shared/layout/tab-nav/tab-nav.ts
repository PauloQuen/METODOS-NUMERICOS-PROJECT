import { Component, input, output } from '@angular/core';

export interface TabItem {
  label: string;
  /** Ruta del portal (data-path). */
  path: string;
}

/**
 * Navegación por pestañas entre secciones del módulo.
 * Sticky (top 0) para no perder el contexto al scrollear.
 * Variantes: 'pill' (control segmentado) o 'flat' (fila simple).
 */
@Component({
  selector: 'app-tab-nav',
  standalone: true,
  templateUrl: './tab-nav.html',
  styleUrl: './tab-nav.scss',
})
export class TabNav {
  readonly tabs = input<TabItem[]>([]);
  readonly activeTab = input('');
  readonly variant = input<'pill' | 'flat'>('pill');

  /** Emite el path de la pestaña presionada. */
  readonly select = output<string>();

  /**
   * Evita el default del <a href="#">: sin preventDefault, el navegador
   * resuelve "#" contra el <base href="/"> y recarga la app desde la raíz.
   */
  onTabClick(event: Event, path: string): void {
    event.preventDefault();
    this.select.emit(path);
  }

  isActive(path: string): boolean {
    return path === this.activeTab();
  }
}