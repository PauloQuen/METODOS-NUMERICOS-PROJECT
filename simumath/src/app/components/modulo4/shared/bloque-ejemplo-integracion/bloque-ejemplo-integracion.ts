import { Component, computed, input, signal } from '@angular/core';
import { IterationTable } from '../../../../shared/domain/iteration-table/iteration-table';
import { GraficoMetodo } from '../../../../shared/domain/grafico-metodo/grafico-metodo';
import { PasosControl } from '../../../../shared/domain/pasos-control/pasos-control';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import { FormulaMatematica } from '../../../../shared/practica-guiada/formula-matematica';
import { MathFormula } from '../../../../shared/math/math';
import type { Columna, DibujarMetodo } from '../../../../shared/models/metodo.model';
import type { EjemploModulo4 } from '../../modelos/modulo4.model';
import type { IntegracionVista } from '../integracion-vista';
import { numero } from '../formato';

/**
 * Tarjeta de un ejemplo resuelto del Módulo 4.
 *
 * ── Qué reutiliza y qué agrega ────────────────────────────────────────
 * Reutiliza el motor de presentación de todos los módulos: la tabla
 * (`iteration-table`), el gráfico (`grafico-metodo`) y el visor de pasos
 * (`pasos-control`). Lo propio de este módulo es que la tabla tiene
 * coeficientes (1, 2 para trapecio; 1, 4, 2 para Simpson) y que el
 * gráfico muestra el ÁREA, no solo la curva.
 *
 * ── La tabla y el área se calculan ────────────────────────────────────
 * El ejemplo aporta textos y datos (función, a, b, n). Las filas y el
 * valor de la integral salen de correr el algoritmo del método. Así el
 * ejemplo no puede mentir: si el motor cambia, la pantalla cambia con él.
 */
@Component({
  selector: 'app-bloque-ejemplo-integracion',
  standalone: true,
  imports: [IterationTable, GraficoMetodo, PasosControl, UiCard, FormulaMatematica, MathFormula],
  templateUrl: './bloque-ejemplo-integracion.html',
  styleUrl: './bloque-ejemplo-integracion.scss',
})
export class BloqueEjemploIntegracion {
  /** El ejemplo a mostrar, con su texto y sus datos. */
  readonly ejemplo = input.required<EjemploModulo4>();

  /** El resultado ya calculado por el servicio del método. */
  readonly estado = input.required<IntegracionVista>();

  /** Las columnas de la tabla de trabajo. */
  readonly columnas = input<Columna[]>([]);

  /** La curva a dibujar: f(x). */
  readonly funcion = input.required<(x: number) => number>();

  /** Rango visible del eje x. */
  readonly rango = input({ min: -5, max: 5 });

  /** Capa de relleno del método (se dibuja antes de la curva). */
  readonly dibujarAntes = input<DibujarMetodo | undefined>(undefined);

  /** Capa de marcas del método (se dibuja después de la curva). */
  readonly dibujarMetodo = input<DibujarMetodo | undefined>(undefined);

  readonly leyenda = input('');

  readonly tituloTabla = input('Tabla de trabajo');

  /** Qué paso se está viendo. Lo mueven los botones de pasos. */
  readonly pasoActual = signal(0);

  /** ¿Es una casuística? (para mostrar enunciado y extracción de datos). */
  readonly esCasuistica = computed(() => this.ejemplo().tipo === 'casuistica');

  /** El texto del paso que se está viendo. */
  protected textoPaso(indice: number): string {
    const pasos = this.ejemplo().pasos;
    if (pasos.length === 0) return '';
    return pasos[Math.min(indice, pasos.length - 1)] ?? '';
  }

  protected alCambiarPaso(nuevo: number): void {
    this.pasoActual.set(nuevo);
  }

  /** h formateado, para el resumen del ejemplo. */
  protected readonly hTexto = computed(() => numero(this.estado().h, 6));

  /** Integral formateada. */
  protected readonly integralTexto = computed(() => numero(this.estado().integral, 6));

  /** Error absoluto formateado, o cadena vacía si no hay valor exacto. */
  protected readonly errorTexto = computed(() => {
    const e = this.estado();
    return e.errorAbs === undefined ? '' : numero(e.errorAbs, 6);
  });
}
