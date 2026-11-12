import { Component, computed, input, signal } from '@angular/core';
import {
  PanelCalculadoraDatos,
} from '../../../modulo3/shared/panel-calculadora-datos/panel-calculadora-datos';
import { IterationTable } from '../../../../shared/domain/iteration-table/iteration-table';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import type { Columna } from '../../../../shared/models/metodo.model';
import type {
  CampoCalculadoraError,
  RespuestaCalculadoraError,
} from '../../modelos/modulo0.model';

/**
 * CALCULADORA DE UN MÉTODO DEL MÓDULO 0.
 *
 * ── Qué se reutiliza ─────────────────────────────────────────────────
 * El panel de entrada y respuesta es el mismo del Módulo 3
 * (`app-panel-calculadora-datos`): campos, validación, botones Calcular
 * y Limpiar, y el bloque de respuesta con etiqueta y detalle. Acá los
 * rótulos hablan de errores ("Error absoluto", "Error relativo"),
 * porque la respuesta se arma en el método, no en el panel.
 *
 * ── Quién calcula ────────────────────────────────────────────────────
 * La función `calcular` llega por `data` desde el archivo de rutas del
 * método (junto con los campos). Este componente no contiene ninguna
 * fórmula: solo conecta el formulario con el cálculo y muestra la tabla
 * de cuentas.
 */
@Component({
  selector: 'app-m0-calculadora-error',
  standalone: true,
  imports: [PanelCalculadoraDatos, IterationTable, UiCard],
  templateUrl: './calculadora-error.html',
  // La grilla de la calculadora es la misma del M3.
  styleUrl: '../../../modulo3/shared/estilos/calculadora.scss',
})
export class CalculadoraErrorVista {
  readonly campos = input.required<CampoCalculadoraError[]>();
  readonly columnas = input<Columna[]>([]);
  readonly titulo = input('Calculadora');
  readonly intro = input('');
  readonly calcular = input.required<
    (valores: Record<string, string>) => RespuestaCalculadoraError
  >();

  /** Lo que el alumno escribió. */
  protected readonly valores = signal<Record<string, string>>({});

  /** Última respuesta, o null si todavía no calculó. */
  protected readonly respuesta = signal<RespuestaCalculadoraError | null>(null);

  /** Filas de la última cuenta. */
  protected readonly filas = computed(() => this.respuesta()?.filas ?? []);

  /** Columnas: las de la respuesta o las del método. */
  protected readonly columnasTabla = computed(
    () => this.respuesta()?.columnas ?? this.columnas(),
  );

  /**
   * La respuesta adaptada al panel compartido.
   *
   * El panel del M3 llama "bondad" a la segunda lectura; acá esa segunda
   * lectura es el error relativo, que es igual de informativo.
   */
  protected readonly respuestaParaPanel = computed(() => {
    const r = this.respuesta();
    if (!r) return null;
    return {
      exito: r.exito,
      resultado: r.resultado,
      etiquetaResultado: r.etiquetaResultado,
      bondad: r.detalle,
      etiquetaBondad: r.etiquetaDetalle,
      conclusion: r.conclusion,
    };
  });

  protected alCalcular(escrito: Record<string, string>): void {
    this.respuesta.set(this.calcular()(escrito));
  }

  protected alLimpiar(): void {
    this.respuesta.set(null);
    this.valores.set({});
  }
}
