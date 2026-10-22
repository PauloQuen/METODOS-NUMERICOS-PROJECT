import { Component, computed, inject, signal } from '@angular/core';
import { CAMPOS_CALCULADORA_LAGRANGE, COLUMNAS_LAGRANGE } from '../lagrange.config';
import { LagrangeService } from '../lagrange.service';
import { crearDibujoLagrange } from '../lagrange.grafico';
import { PanelCalculadoraDatos } from '../../../../shared/panel-calculadora-datos/panel-calculadora-datos';
import { IterationTable } from '../../../../../../shared/domain/iteration-table/iteration-table';
import { PasosControl } from '../../../../../../shared/domain/pasos-control/pasos-control';
import { GraficoMetodo } from '../../../../../../shared/domain/grafico-metodo/grafico-metodo';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import type { DibujarMetodo } from '../../../../../../shared/models/metodo.model';

/**
 * PESTAÑA DE CALCULADORA de Lagrange.
 *
 * ── Quién hace qué ───────────────────────────────────────────────────
 * `PanelCalculadoraDatos` solo junta lo que el alumno escribe. Este
 * componente recibe ese evento, se lo pasa al `LagrangeService` y
 * reparte el resultado entre la tabla, el visor de pasos y el gráfico.
 * La matemática vive en el servicio y en el algoritmo.
 *
 * ── Por qué el estado no es local ────────────────────────────────────
 * El resultado se lee del servicio, así que sobrevive al cambio de
 * pestaña: el alumno puede ir a Teoría, volver y seguir con su cuenta.
 */
@Component({
  selector: 'app-lagrange-calculadora',
  standalone: true,
  imports: [PanelCalculadoraDatos, IterationTable, PasosControl, GraficoMetodo, UiCard],
  templateUrl: './lagrange-calculadora.html',
  styleUrl: '../../../../shared/estilos/calculadora.scss',
})
export class LagrangeCalculadora {
  private readonly servicio = inject(LagrangeService);

  /** Los campos del formulario. */
  readonly campos = CAMPOS_CALCULADORA_LAGRANGE;

  /** Las columnas de la tabla de aportes. */
  readonly columnas = COLUMNAS_LAGRANGE;

  /** El resultado del último cálculo. */
  protected readonly estado = this.servicio.resultado;

  /** Lo que el alumno escribió. */
  protected readonly valores = signal<Record<string, string>>({});

  /** Qué punto está mostrando el visor de pasos. */
  protected readonly paso = signal(0);

  /** El polinomio interpolante, para el gráfico. */
  protected readonly funcion = signal<(x: number) => number>(() => 0);

  /** El rango del eje x, ajustado a los datos. */
  protected readonly rango = signal<{ min: number; max: number }>({ min: -5, max: 5 });

  /** El dibujo, que depende del punto de estimación calculado. */
  protected readonly dibujo = signal<DibujarMetodo | undefined>(undefined);

  /** Total de puntos, para el visor de pasos. */
  protected readonly total = computed(() => this.estado()?.filas.length ?? 0);

  /**
   * El alumno apretó Calcular.
   *
   * La conversión y el parseo van al servicio: el componente solo le
   * pasa el texto tal cual salió del formulario.
   */
  protected alCalcular(escrito: Record<string, string>): void {
    const evaluarEn = aNumeroOpcional(escrito['evaluarEn']);
    const estado = this.servicio.calcularDesdeTexto({
      puntosTexto: escrito['puntos'] ?? '',
      evaluarEn,
      etiqueta: 'Datos ingresados',
    });

    this.funcion.set(this.servicio.polinomioDe(estado.datos));
    this.rango.set(this.servicio.rangoPara(estado.datos));
    this.dibujo.set(
      crearDibujoLagrange({ evaluarEn: estado.evaluadoEn, valor: estado.valor }),
    );
    this.paso.set(0);
  }

  /** El visor de pasos pasó a otro punto. */
  protected alCambiarPaso(paso: number): void {
    this.paso.set(paso);
  }

  /** El alumno apretó Limpiar. */
  protected alLimpiar(): void {
    this.servicio.limpiar();
    this.valores.set({});
    this.paso.set(0);
    this.dibujo.set(undefined);
  }

  /**
   * La explicación del punto que se está mirando.
   *
   * Se arma con los números de la fila actual, así el texto y el
   * gráfico no pueden discrepar: salen de la misma fila.
   */
  protected readonly textoDelPaso = computed(() => {
    const e = this.estado();
    if (!e) return '';
    const fila = e.filas[this.paso()];
    if (!fila) return '';

    const i = fila['i'];
    const xi = fila['xi'];
    const yi = fila['yi'];
    const li = fila['li'];
    const aporte = fila['aporte'];
    const x = e.evaluadoEn;

    return (
      `Dato ${i}: xᵢ = ${xi}, yᵢ = ${yi}. Su base vale Lᵢ(${formatearCorto(x)}) = ${li}, ` +
      `así que su aporte al polinomio es yᵢ·Lᵢ = ${aporte}.`
    );
  });

}

/** Convierte el texto de un campo numérico opcional. */
function aNumeroOpcional(texto: string | undefined): number | undefined {
  if (texto === undefined || texto.trim() === '') return undefined;
  const n = Number(texto);
  return Number.isFinite(n) ? n : undefined;
}

function formatearCorto(v: number | undefined): string {
  if (v === undefined || !Number.isFinite(v)) return 'x*';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(3).replace(/\.?0+$/, '');
}
