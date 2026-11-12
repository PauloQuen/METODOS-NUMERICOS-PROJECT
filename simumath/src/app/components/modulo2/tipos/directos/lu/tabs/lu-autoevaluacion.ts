import { Component, computed, inject, signal } from '@angular/core';
import { EJERCICIOS_LU } from '../lu.contenido';
import { COLUMNAS_LU } from '../lu.config';
import { LuService } from '../lu.service';
import { dibujarLu } from '../lu.grafico';
import { BloqueEjercicio } from '../../../../../../shared/domain/bloque-ejercicio/bloque-ejercicio';
import { GraficoSistema } from '../../../../../../shared/domain/grafico-sistema/grafico-sistema';
import { autoevaluacionMejoradaM2, politicaDeMetodoM2 } from '../../../../autoevaluacion.config';
import { AUTOEVALUACION_LU } from '../lu.autoevaluacion';

/**
 * Pestaña de AUTOEVALUACIÓN de la factorización LU.
 *
 * Tres ejercicios. Al principio solo se ve el planteamiento; la solución
 * se despliega con el botón "Ver solución" del bloque de ejercicio.
 *
 * ── Ojo con el paso actual ────────────────────────────────────────────
 * El bloque de ejercicio muestra primero solo el enunciado. El gráfico
 * de la solución recién existe cuando el alumno despliega la solución,
 * y desde ese momento el bloque de ejemplo (adentro) maneja el paso.
 * Por eso el índice de paso vive en un vector igual que en la pestaña
 * de ejemplos.
 */
@Component({
  selector: 'app-lu-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicio, GraficoSistema],
  templateUrl: './lu-autoevaluacion.html',
  styleUrl: './lu-autoevaluacion.scss',
})
export class LuAutoevaluacion {
  readonly ejercicios = EJERCICIOS_LU.map((e) => ({
    ...e,
    ...(AUTOEVALUACION_LU[e.id] ?? {}),
  }));

  readonly mejorada = autoevaluacionMejoradaM2('directos', 'lu');
  readonly desbloqueoBase = politicaDeMetodoM2('directos', 'lu');
  readonly columnas = COLUMNAS_LU;
  readonly dibujar = dibujarLu;

  private readonly servicio = inject(LuService);

  /** El estado calculado de cada ejercicio, en el mismo orden. */
  readonly estados = signal(
    this.ejercicios.map((e) => this.servicio.calcularEjemplo(e)),
  );

  /** El paso actual de cada ejercicio, en el mismo orden. */
  readonly pasos = signal<number[]>(this.ejercicios.map(() => 0));

  /** El rango del gráfico de cada ejercicio. */
  readonly rangos = computed(() =>
    this.estados().map((e) => this.servicio.rangoPara(e.sistema, e.solucion)),
  );

  /** El sistema triangular de cada ejercicio, para el paso en que está. */
  readonly extras = computed(() =>
    this.estados().map((e, i) => this.servicio.sistemasExtraDe(e, this.pasoDe(i))),
  );

  /** Avisa que el alumno cambió de paso en el ejercicio `indice`. */
  alCambiarPaso(indice: number, nuevo: number): void {
    this.pasos.update((todos) => {
      const copia = [...todos];
      copia[indice] = nuevo;
      return copia;
    });
  }

  /** El paso actual de un ejercicio. */
  pasoDe(indice: number): number {
    return this.pasos()[indice] ?? 0;
  }
}
