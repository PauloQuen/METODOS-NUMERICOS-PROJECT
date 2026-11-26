import { Component, computed, inject, signal } from '@angular/core';
import { CAMPOS_CALCULADORA_SIMPSON, COLUMNAS_SIMPSON } from '../simpson.config';
import { SimpsonService } from '../simpson.service';
import { crearDibujoSimpson } from '../simpson.grafico';
import { PanelCalculadoraIntegracion } from '../../../../shared/panel-calculadora-integracion/panel-calculadora-integracion';
import { IterationTable } from '../../../../../../shared/domain/iteration-table/iteration-table';
import { PasosControl } from '../../../../../../shared/domain/pasos-control/pasos-control';
import { GraficoMetodo } from '../../../../../../shared/domain/grafico-metodo/grafico-metodo';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import type { DibujarMetodo } from '../../../../../../shared/models/metodo.model';

/**
 * PESTAÑA DE CALCULADORA de Simpson.
 *
 * Además de calcular, el panel muestra el error cuando n es impar: en
 * ese caso el servicio devuelve un estado de fallo con el mensaje que
 * sugiere el par más cercano. No se corrige n en silencio.
 */
@Component({
  selector: 'app-simpson-calculadora',
  standalone: true,
  imports: [
    PanelCalculadoraIntegracion,
    IterationTable,
    PasosControl,
    GraficoMetodo,
    UiCard,
  ],
  templateUrl: './simpson-calculadora.html',
  styleUrl: '../../../../shared/estilos/calculadora.scss',
})
export class SimpsonCalculadora {
  private readonly servicio = inject(SimpsonService);

  readonly campos = CAMPOS_CALCULADORA_SIMPSON;
  readonly columnas = COLUMNAS_SIMPSON;

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
      this.dibujo.set(crearDibujoSimpson());
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
   * Texto del paso actual. En la fila Σ se explica la multiplicación
   * final por h/3; en las demás, el bloque de dos subintervalos.
   */
  protected readonly textoDelPaso = computed(() => {
    const e = this.estado();
    if (!e) return '';
    const fila = e.filas[this.paso()];
    if (!fila) return '';

    if (fila['i'] === 'Σ') {
      return (
        `Suma ponderada Σ = ${fila['aporte']}. La integral es (h/3)·Σ = ` +
        `(${e.h.toFixed(6)}/3)·${fila['aporte']} = ${e.integral.toFixed(6)}.`
      );
    }

    // Cada bloque de Simpson abarca dos subintervalos: se muestra el par
    // al que pertenece el nodo que se está mirando.
    const indice = Number(fila['i']);
    const inicio = Math.floor(indice / 2) * 2;
    const p0 = e.filas[inicio];
    const p1 = e.filas[inicio + 1];
    const p2 = e.filas[inicio + 2];
    if (!p0 || !p1 || !p2 || p2['i'] === 'Σ') return '';

    return (
      `Parábola entre x = ${p0['xi']} y x = ${p2['xi']}, con los tres nodos ` +
      `f = ${p0['fxi']}, ${p1['fxi']} y ${p2['fxi']}. Su área es ` +
      `(h/3)·[f₀ + 4f₁ + f₂] = (${e.h.toFixed(6)}/3)·(${p0['fxi']} + 4·${p1['fxi']} + ${p2['fxi']}).`
    );
  });
}
