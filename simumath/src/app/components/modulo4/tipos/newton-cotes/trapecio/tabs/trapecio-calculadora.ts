import { Component, computed, inject, signal } from '@angular/core';
import {
  CAMPOS_CALCULADORA_TRAPECIO,
  COLUMNAS_TRAPECIO,
} from '../trapecio.config';
import { TrapecioService } from '../trapecio.service';
import { crearDibujoTrapecio } from '../trapecio.grafico';
import { PanelCalculadoraIntegracion } from '../../../../shared/panel-calculadora-integracion/panel-calculadora-integracion';
import { IterationTable } from '../../../../../../shared/domain/iteration-table/iteration-table';
import { PasosControl } from '../../../../../../shared/domain/pasos-control/pasos-control';
import { GraficoMetodo } from '../../../../../../shared/domain/grafico-metodo/grafico-metodo';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import type { DibujarMetodo } from '../../../../../../shared/models/metodo.model';

/**
 * PESTAÑA DE CALCULADORA del trapecio.
 *
 * El panel junta f(x), a, b, n y el valor exacto opcional; el servicio
 * corre el algoritmo y devuelve la tabla y el error. Acá solo se reparte
 * el resultado entre el gráfico (área + trapecio activo), el visor de
 * pasos y la tabla.
 */
@Component({
  selector: 'app-trapecio-calculadora',
  standalone: true,
  imports: [
    PanelCalculadoraIntegracion,
    IterationTable,
    PasosControl,
    GraficoMetodo,
    UiCard,
  ],
  templateUrl: './trapecio-calculadora.html',
  styleUrl: '../../../../shared/estilos/calculadora.scss',
})
export class TrapecioCalculadora {
  private readonly servicio = inject(TrapecioService);

  readonly campos = CAMPOS_CALCULADORA_TRAPECIO;
  readonly columnas = COLUMNAS_TRAPECIO;

  protected readonly estado = this.servicio.resultado;
  protected readonly valores = signal<Record<string, string>>({});
  protected readonly paso = signal(0);
  protected readonly funcion = signal<(x: number) => number>(() => NaN);
  protected readonly rango = signal<{ min: number; max: number }>({ min: -1, max: 1 });
  protected readonly dibujo = signal<{ antes: DibujarMetodo; despues: DibujarMetodo } | undefined>(
    undefined,
  );

  protected readonly total = computed(() => this.estado()?.filas.length ?? 0);

  protected alCalcular(escrito: Record<string, string>): void {
    const estado = this.servicio.calcularDesdeTexto({
      funcion: escrito['funcion'] ?? '',
      a: escrito['a'] ?? '',
      b: escrito['b'] ?? '',
      n: escrito['n'] ?? '',
      valorExacto: escrito['valorExacto'],
    });

    if (estado.filas.length > 0) {
      this.funcion.set(this.servicio.funcionDe(estado.datos));
      this.rango.set(this.servicio.rangoPara(estado.datos));
      this.dibujo.set(crearDibujoTrapecio());
      this.paso.set(0);
    } else {
      this.dibujo.set(undefined);
    }
  }

  protected alCambiarPaso(paso: number): void {
    this.paso.set(paso);
  }

  protected alLimpiar(): void {
    this.servicio.limpiar();
    this.valores.set({});
    this.paso.set(0);
    this.dibujo.set(undefined);
  }

  /**
   * Texto del paso actual. El último renglón de la tabla es Σ, así que
   * ahí se explica la multiplicación final por h/2 en vez de un trapecio.
   */
  protected readonly textoDelPaso = computed(() => {
    const e = this.estado();
    if (!e) return '';
    const fila = e.filas[this.paso()];
    if (!fila) return '';

    if (fila['i'] === 'Σ') {
      return (
        `Suma ponderada Σ = ${fila['aporte']}. La integral es (h/2)·Σ = ` +
        `(${e.h.toFixed(6)}/2)·${fila['aporte']} = ${e.integral.toFixed(6)}.`
      );
    }

    const siguiente = e.filas[this.paso() + 1];
    if (!siguiente || siguiente['i'] === 'Σ') return '';

    return (
      `Trapecio ${Number(fila['i']) + 1}: entre x = ${fila['xi']} y x = ${siguiente['xi']}, ` +
      `con alturas f = ${fila['fxi']} y ${siguiente['fxi']}. Su área es ` +
      `(h/2)·(f izquierda + f derecha) = ` +
      `(${e.h.toFixed(6)}/2)·(${fila['fxi']} + ${siguiente['fxi']}).`
    );
  });
}
