import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppFooter } from '../../shared/layout/app-footer/app-footer';
import { Badge } from '../../shared/ui/badge/badge';
import { BuscadorGlobal } from '../../shared/search/buscador-global/buscador-global';
import { MODULOS_DISPONIBLES } from '../../shared/search/catalogo';

/**
 * PORTADA DEL PORTAL.
 *
 * ── Qué cambió y por qué ─────────────────────────────────────────────
 * Antes la portada ofrecía dos rejillas de tarjetas (acciones de estudio
 * y fases del curso). Eran diez destinos y ninguna forma de buscar: el
 * alumno que ya sabía qué quería tenía que recorrer la jerarquía
 * completa. Ahora el protagonista es un buscador global y, debajo, una
 * fila de accesos por módulo.
 *
 * ── Qué se conservó ──────────────────────────────────────────────────
 * El hero, el encabezado "¿Qué quieres estudiar hoy?" y el pie. El
 * contenido de las tarjetas NO se perdió: el nombre, la descripción y
 * las etiquetas de cada módulo viven en `shared/search/catalogo.ts`, que
 * alimenta tanto esta fila de accesos como el índice del buscador. La
 * descripción de los módulos 4 y 5 (antes solo en tarjetas) se puede
 * encontrar buscando "Simpson", "Euler" o "fase 4".
 *
 * ── Por qué los accesos no son tarjetas ──────────────────────────────
 * El pedido era retirar las tarjetas, no disfrazarlas. Estos accesos son
 * chips de navegación: una sola línea, sin descripción ni métricas, para
 * llegar al módulo, no para reemplazar la decisión que ahora resuelve el
 * buscador.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, Badge, AppFooter, BuscadorGlobal],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  /** Módulos con página propia, en orden: M0 primero. */
  readonly modulos = MODULOS_DISPONIBLES;
}
