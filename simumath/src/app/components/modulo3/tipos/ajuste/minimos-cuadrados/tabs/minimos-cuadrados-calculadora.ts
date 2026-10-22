import { Component, computed, inject, signal } from '@angular/core';
import {
  CAMPOS_CALCULADORA_MINIMOS_CUADRADOS,
  COLUMNAS_MINIMOS_CUADRADOS,
} from '../minimos-cuadrados.config';
import { MinimosCuadradosService } from '../minimos-cuadrados.service';
import { crearDibujoMinimosCuadrados } from '../minimos-cuadrados.grafico';
import { PanelCalculadoraDatos } from '../../../../shared/panel-calculadora-datos/panel-calculadora-datos';
import { IterationTable } from '../../../../../../shared/domain/iteration-table/iteration-table';
import { PasosControl } from '../../../../../../shared/domain/pasos-control/pasos-control';
import { GraficoMetodo } from '../../../../../../shared/domain/grafico-metodo/grafico-metodo';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import type { DibujarMetodo } from '../../../../../../shared/models/metodo.model';

/**
 * PESTAÑA DE CALCULADORA de Mínimos Cuadrados.
 *
 * El panel junta los datos; el servicio ajusta la recta y devuelve la
 * tabla de trabajo, la bondad del ajuste y la predicción. Acá solo se
 * reparte el resultado entre el gráfico, el visor de pasos y la tabla.
 */
@Component({
  selector: 'app-minimos-cuadrados-calculadora',
  standalone: true,
  imports: [PanelCalculadoraDatos, IterationTable, PasosControl, GraficoMetodo, UiCard],
  templateUrl: './minimos-cuadrados-calculadora.html',
  styleUrl: '../../../../shared/estilos/calculadora.scss',
})
export class MinimosCuadradosCalculadora {
  private readonly servicio = inject(MinimosCuadradosService);

  readonly campos = CAMPOS_CALCULADORA_MINIMOS_CUADRADOS;
  readonly columnas = COLUMNAS_MINIMOS_CUADRADOS;

  protected readonly estado = this.servicio.resultado;
  protected readonly valores = signal<Record<string, string>>({});
  protected readonly paso = signal(0);
  protected readonly funcion = signal<(x: number) => number>(() => 0);
  protected readonly rango = signal<{ min: number; max: number }>({ min: -5, max: 5 });
  protected readonly dibujo = signal<DibujarMetodo | undefined>(undefined);

  /** Cuántos datos hay, para el visor de pasos. */
  protected readonly total = computed(() => this.estado()?.filas.length ?? 0);

  protected alCalcular(escrito: Record<string, string>): void {
    const evaluarEn = aNumeroOpcional(escrito['evaluarEn']);
    const estado = this.servicio.calcularDesdeTexto({
      puntosTexto: escrito['puntos'] ?? '',
      evaluarEn,
      etiqueta: 'Datos ingresados',
    });

    this.funcion.set(this.servicio.rectaDe(estado.datos));
    this.rango.set(this.servicio.rangoPara(estado.datos));
    this.dibujo.set(
      crearDibujoMinimosCuadrados({
        evaluarEn: estado.evaluadoEn,
        prediccion: estado.prediccion,
      }),
    );
    this.paso.set(0);
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
   * La explicación del dato que se está mirando, con su residuo.
   * Sale de la misma fila que usa el gráfico, así no pueden discrepar.
   */
  protected readonly textoDelPaso = computed(() => {
    const e = this.estado();
    if (!e) return '';
    const fila = e.filas[this.paso()];
    if (!fila) return '';

    const i = fila['i'];
    const xi = fila['xi'];
    const yi = fila['yi'];
    const yhat = fila['yhat'];
    const residuo = fila['residuo'];

    return (
      `Dato ${i}: xᵢ = ${xi}, yᵢ = ${yi}. La recta predice ŷᵢ = ${yhat}, ` +
      `así que el residuo es rᵢ = yᵢ − ŷᵢ = ${residuo}.`
    );
  });
}

function aNumeroOpcional(texto: string | undefined): number | undefined {
  if (texto === undefined || texto.trim() === '') return undefined;
  const n = Number(texto);
  return Number.isFinite(n) ? n : undefined;
}
