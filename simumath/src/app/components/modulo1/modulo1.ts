import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { TabItem, TabNav } from '../../shared/layout/tab-nav/tab-nav';
import { Badge } from '../../shared/ui/badge/badge';
import { Btn } from '../../shared/ui/btn/btn';
import { AppFooter } from '../../shared/layout/app-footer/app-footer';
import { Breadcrumb, type TramoBreadcrumb } from '../../shared/layout/breadcrumb/breadcrumb';

interface SeccionModulo {
  path: string;
  etiqueta: string;
  titulo: string;
  subtitulo: string;
  /** True si aparece como pestaña en la navegación del módulo. */
  enNav?: boolean;
}

/**
 * Secciones del Módulo 1. El orden del array es el orden de las pestañas:
 * la navegación muestra Teoría · Ejemplos · Autoevaluación · Calculadoras ·
 * Gráficos; Integrantes queda fuera del nav y se accede desde el footer o el
 * Portal (hub), como pidió el profe.
 */
export const SECCIONES_MODULO1: SeccionModulo[] = [
  {
    path: 'teoria-y-errores',
    etiqueta: 'Teoría',
    titulo: 'Teoría y Errores',
    subtitulo: 'Fundamentos del error numérico, los 5 métodos y criterios de parada.',
    enNav: true,
  },
  {
    path: 'ejemplos-resueltos',
    etiqueta: 'Ejemplos',
    titulo: 'Ejemplos Resueltos',
    subtitulo: 'Todo el proceso de cálculo con la fórmula aplicada, tabla de iteraciones y MATLAB.',
    enNav: true,
  },
  {
    path: 'autoevaluacion-y-recursos',
    etiqueta: 'Autoevaluación',
    titulo: 'Autoevaluación y Recursos',
    subtitulo: 'Ejercicios con solución desplegable para verificar tu avance.',
    enNav: true,
  },
  {
    path: 'calculadoras-interactivas',
    etiqueta: 'Calculadoras',
    titulo: 'Calculadoras Interactivas',
    subtitulo: 'Los 5 algoritmos paso a paso sobre tus datos, con verificación del criterio de parada.',
    enNav: true,
  },
  {
    path: 'graficos',
    etiqueta: 'Gráficos',
    titulo: 'Gráficos',
    subtitulo: 'Visualización de funciones, intervalos y convergencia de cada método.',
    enNav: true,
  },
  {
    path: 'integrantes-y-referencias',
    etiqueta: 'Integrantes',
    titulo: 'Integrantes y Referencias',
    subtitulo: 'Equipo de desarrollo y bibliografía de la asignatura.',
  },
];

/**
 * Módulo 1 — Ecuaciones No Lineales y Errores.
 * Layout común de las 5 secciones: hero con breadcrumb, app-tab-nav sticky
 * y footer institucional. El contenido vive en cada componente hijo.
 */
@Component({
  selector: 'app-modulo1',
  imports: [RouterOutlet, TabNav, Badge, Btn, AppFooter, Breadcrumb],
  templateUrl: './modulo1.html',
  styleUrl: './modulo1.scss',
})
export class Modulo1 {
  private readonly router = inject(Router);

  /** URL actual como señal real. router.url es una propiedad plana: si se
   *  leyera dentro de un computed, la señal quedaría cacheada y la pastilla
   *  activa NUNCA se movería al navegar dentro del SPA. */
  private readonly urlActual = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly secciones = SECCIONES_MODULO1;
  readonly tabs: TabItem[] = SECCIONES_MODULO1.filter((s) => s.enNav).map((s) => ({
    label: s.etiqueta,
    path: s.path,
  }));

  /** Sección activa según la URL actual. */
  readonly activeTab = computed(() => {
    const url = this.urlActual() ?? '';
    return SECCIONES_MODULO1.find((s) => url.includes(s.path))?.path ?? '';
  });

  /** Título y subtítulo del hero según la sección activa. */
  readonly seccion = computed(() => {
    const url = this.urlActual() ?? '';
    return (
      SECCIONES_MODULO1.find((s) => url.includes(s.path)) ?? SECCIONES_MODULO1[0]
    );
  });

  /**
   * Qué barra muestra el layout según dónde esté parado el alumno:
   *
   * · 'material' → las secciones generales (Teoría, Ejemplos...): hero con
   *   tabs. Es el caso viejo, sin cambios.
   * · 'landing'  → la Pantalla A trae su PROPIO hero navy a todo el ancho:
   *   acá no se pinta nada, solo se libera el ancho del contenido.
   * · 'metodo'   → la página del método (Bisección y las que vengan) trae
   *   su propia cabecera y sus pestañas: el layout solo deja salir el
   *   contenido, sin el hero viejo encima.
   *
   * Los tres casos se distinguen por la URL porque el router es la fuente
   * de verdad. 'metodo' se chequea primero: una URL de método contiene
   * '/tipos/', que no debe caer nunca en 'material'.
   */
  readonly modo = computed<'material' | 'landing' | 'metodo'>(() => {
    const url = this.urlActual() ?? '';
    if (url.includes('/tipos/')) return 'metodo';
    if (url.includes('/inicio')) return 'landing';
    return 'material';
  });

  /** Migas del hero de las secciones generales. */
  readonly migaSeccion = computed<TramoBreadcrumb[]>(() => [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 1', ruta: '/modulo1' },
    { texto: this.seccion().titulo },
  ]);

  navigate(path: string): void {
    void this.router.navigate(['modulo1', path]);
  }
}