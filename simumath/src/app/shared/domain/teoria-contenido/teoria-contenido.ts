import { FormulaMatematica } from '../../practica-guiada/formula-matematica';
import { Component, ViewEncapsulation, computed, input, signal } from '@angular/core';
import { UiCard } from '../../ui/ui-card/ui-card';
import type { RecursoTeoria, TeoriaPlantillaVista } from '../../models/metodo.model';

/**
 * MARCO COMÚN DE LA PESTAÑA TEORÍA.
 *
 * Reproduce la estructura del Módulo 3 para todos los métodos:
 *   1. Concepto + video principal (si hay).
 *   2. Las tres ideas en acordeón.
 *   3. Recursos de internet para ampliar.
 *   4. La tarjeta del método: fórmula, pasos, criterios, ventajas y límites.
 *
 * Los ejemplos NO viven acá: cada método los proyecta al final con su
 * propio bloque, porque el Módulo 1 dibuja una función, el Módulo 2 un
 * sistema y el Módulo 3 una tabla de puntos. El marco solo se ocupa de
 * la parte común.
 *
 * `ViewEncapsulation.None` es a propósito: los estilos de este marco
 * también tienen que alcanzar a las secciones de ejemplo proyectadas
 * por el componente padre (`.teoria-m3__seccion`). Las clases están
 * namespaced con `teoria-m3` / `teoria__`, así que no pisan el resto.
 */
@Component({
  selector: 'app-teoria-contenido',
  standalone: true,
  imports: [FormulaMatematica, UiCard],
  templateUrl: './teoria-contenido.html',
  styleUrl: './teoria-contenido.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TeoriaContenido {
  readonly formatearFormulas = input(false);
  readonly teoria = input.required<TeoriaPlantillaVista>();

  /** Texto de la tercera idea (orden, error, precisión, etc.). */
  readonly terceraTexto = input.required<string>();
  readonly terceraTitulo = input('¿Qué precisión se puede esperar?');
  readonly terceraIcono = input('straighten');

  readonly videoEtiqueta = input('Video · ejemplo resuelto');
  readonly videoTitulo = input('Video · ejemplo resuelto');
  readonly videoDescripcion = input('');

  readonly tituloMetodo = input('El método');
  readonly tituloCriterios = input('¿Qué se mide?');
  readonly tituloRecomendaciones = input('Recomendaciones de uso');

  protected readonly abierta = signal<'fundamento' | 'falla' | 'tercera' | null>(null);

  protected readonly recursos = computed(() => this.teoria().recursos ?? []);

  protected alternar(que: 'fundamento' | 'falla' | 'tercera'): void {
    this.abierta.update((actual) => (actual === que ? null : que));
  }

  protected iconoRecurso(tipo: string): string {
    switch (tipo) {
      case 'video':
        return 'play_circle';
      case 'interactivo':
        return 'touch_app';
      default:
        return 'article';
    }
  }
}
