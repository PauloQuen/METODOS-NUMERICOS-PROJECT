import { Component, computed, input, signal } from '@angular/core';
import { IterationTable } from '../../../../shared/domain/iteration-table/iteration-table';
import { GraficoMetodo } from '../../../../shared/domain/grafico-metodo/grafico-metodo';
import { PasosControl } from '../../../../shared/domain/pasos-control/pasos-control';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import { MathTexto } from '../../../../shared/math/math-texto';
import { MathFormula } from '../../../../shared/math/math';
import type { Columna, DibujarMetodo } from '../../../../shared/models/metodo.model';
import type { EjemploModulo5 } from '../../modelos/modulo5.model';
import type { EdoVista } from '../edo-vista';
import { numero } from '../edo';

/** Curva vacía: cuando no hay solución exacta, el gráfico solo muestra
 *  la poligonal de la aproximación. */
const sinCurva = () => NaN;

/**
 * Tarjeta de un ejemplo resuelto del Módulo 5.
 *
 * Reutiliza la tabla de iteraciones, el gráfico compartido y el visor de
 * pasos. Lo propio del módulo es que la tabla tiene tₙ, yₙ y las
 * pendientes kᵢ, y que el gráfico dibuja la POLIGONAL de la aproximación
 * contra la curva exacta.
 *
 * Toda la matemática pasa por `app-math-texto`: el contenido escribe
 * `$…$` y acá se renderiza con KaTeX.
 */
@Component({
  selector: 'app-bloque-ejemplo-edo',
  standalone: true,
  imports: [IterationTable, GraficoMetodo, PasosControl, UiCard, MathTexto, MathFormula],
  templateUrl: './bloque-ejemplo-edo.html',
  styleUrl: './bloque-ejemplo-edo.scss',
})
export class BloqueEjemploEdo {
  readonly ejemplo = input.required<EjemploModulo5>();
  readonly estado = input.required<EdoVista>();
  readonly columnas = input<Columna[]>([]);

  /** Solución exacta, para la curva del gráfico. */
  readonly exacta = input<((t: number) => number) | undefined>(undefined);

  readonly rango = input({ min: -1, max: 1 });
  readonly rangoY = input<{ min: number; max: number } | undefined>(undefined);
  readonly dibujo = input<DibujarMetodo | undefined>(undefined);
  readonly leyenda = input('');
  readonly tituloTabla = input('Tabla de pasos');

  readonly pasoActual = signal(0);

  readonly esCasuistica = computed(() => this.ejemplo().tipo === 'casuistica');

  readonly sinCurva = sinCurva;

  protected textoPaso(indice: number): string {
    const pasos = this.ejemplo().pasos;
    if (pasos.length === 0) return '';
    return pasos[Math.min(indice, pasos.length - 1)] ?? '';
  }

  protected alCambiarPaso(nuevo: number): void {
    this.pasoActual.set(nuevo);
  }

  readonly hTexto = computed(() => numero(this.estado().h, 6));
  readonly finalTexto = computed(() => numero(this.estado().yFinal, 8));
  readonly exactaTexto = computed(() => {
    const e = this.estado();
    return e.exactaFinal === undefined ? '' : numero(e.exactaFinal, 8);
  });
  readonly errorTexto = computed(() => {
    const e = this.estado();
    return e.errorFinal === undefined ? '' : numero(e.errorFinal, 8);
  });

  readonly filasOcultas = computed(() => this.estado().filasOcultas ?? 0);
}
