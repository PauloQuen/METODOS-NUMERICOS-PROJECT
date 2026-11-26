import { Component, effect, input, model, output } from '@angular/core';
import { FormField } from '../../../../shared/ui/form-field/form-field';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import type {
  CampoCalculadoraM4,
  RespuestaCalculadoraM4,
} from '../../modelos/modulo4.model';

/**
 * Panel de entrada y respuesta de una calculadora del Módulo 4.
 *
 * ── Por qué no se reutiliza el panel del Módulo 3 ────────────────────
 * Porque su respuesta está rotulada para modelos: "P(x*)", "ŷ(x*)",
 * "Coeficiente r²". Acá el resultado es una integral y la medida de
 * calidad es el error contra el valor exacto. Mostrar los números
 * correctos bajo etiquetas de otro módulo sería peor que no mostrarlos.
 *
 * Lo genérico sí se comparte: `ui-card` y `form-field`.
 */
@Component({
  selector: 'app-panel-calculadora-integracion',
  standalone: true,
  imports: [FormField, UiCard],
  templateUrl: './panel-calculadora-integracion.html',
  styleUrl: './panel-calculadora-integracion.scss',
})
export class PanelCalculadoraIntegracion {
  /** Los campos a mostrar, definidos por el método. */
  readonly campos = input<CampoCalculadoraM4[]>([]);

  /** Lo que el alumno escribió, con la clave de cada campo. */
  readonly valores = model<Record<string, string>>({});

  readonly titulo = input('Parámetros de la integral');

  /** La respuesta ya calculada, o null si todavía no calculó. */
  readonly respuesta = input<RespuestaCalculadoraM4 | null>(null);

  /** El alumno apretó Calcular. */
  readonly calcular = output<Record<string, string>>();

  /** El alumno apretó Limpiar. */
  readonly limpiar = output<void>();

  /**
   * Precarga los `valorInicial` una sola vez. Si `valores` está vacío
   * (primer render o después de "Limpiar"), vuelve a los valores por
   * defecto, así el formulario nunca abre en blanco.
   */
  private readonly precargar = effect(() => {
    const campos = this.campos();
    if (Object.keys(this.valores()).length > 0 || campos.length === 0) return;

    const inicial: Record<string, string> = {};
    for (const campo of campos) {
      inicial[campo.key] = campo.valorInicial;
    }
    this.valores.set(inicial);
  });

  protected valorDe(clave: string): string {
    return this.valores()[clave] ?? '';
  }

  protected alCambiar(clave: string, valor: string): void {
    this.valores.update((v) => ({ ...v, [clave]: valor }));
  }

  protected alCalcular(): void {
    this.calcular.emit({ ...this.valores() });
  }

  protected alLimpiar(): void {
    this.limpiar.emit();
  }
}
