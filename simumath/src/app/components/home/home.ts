import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TabItem } from '../../shared/layout/tab-nav/tab-nav';
import { UiCard } from '../../shared/ui/ui-card/ui-card';
import { Badge } from '../../shared/ui/badge/badge';
import { Btn } from '../../shared/ui/btn/btn';
import { AppFooter } from '../../shared/layout/app-footer/app-footer';

/**
 * Rutas directas de las secciones del Módulo 1.
 * Van SIEMPRE con el prefijo /modulo1 para evitar depender de redirects
 * intermedios (que en servidores estáticos pueden resolver a home).
 */
const SECCIONES: TabItem[] = [
  { label: 'Teoría', path: '/modulo1/teoria-y-errores' },
  { label: 'Ejemplos', path: '/modulo1/ejemplos-resueltos' },
  { label: 'Autoevaluación', path: '/modulo1/autoevaluacion-y-recursos' },
  { label: 'Calculadoras', path: '/modulo1/calculadoras-interactivas' },
  { label: 'Gráficos', path: '/modulo1/graficos' },
];

@Component({
  selector: 'app-home',
  imports: [UiCard, Badge, Btn, AppFooter],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly router = inject(Router);

  readonly secciones = SECCIONES;

  /** Navega a la sección elegida (ruta absoluta del portal). */
  navigate(path: string): void {
    void this.router.navigate([path]);
  }
}