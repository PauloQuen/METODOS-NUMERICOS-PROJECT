import { Component, effect, input, model, output } from '@angular/core';
import { FormField } from '../../../../shared/ui/form-field/form-field';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import type {
  CampoCalculadoraM5,
  RespuestaCalculadoraM5,
} from '../../modelos/modulo5.model';

/**
 * Panel de entrada y respuesta de una calculadora del Módulo 5.
 *
 * Igual que el del Módulo 4, pero con los campos de un PVI (t₀, y₀, h,
 * t final y solución exacta opcional). Reutiliza `ui-card` y `form-field`.
 */
@Component({
  selector: 'app-panel-calculadora-edo',
  standalone: true,
  imports: [FormField, UiCard],
  templateUrl: './panel-calculadora-edo.html',
  styleUrl: './panel-calculadora-edo.scss',
})
export class PanelCalculadoraEdo {
  readonly campos = input<CampoCalculadoraM5[]>([]);

  readonly valores = model<Record<string, string>>({});

  readonly titulo = input('Parámetros del problema');

  readonly respuesta = input<RespuestaCalculadoraM5 | null>(null);

  readonly calcular = output<Record<string, string>>();

  readonly limpiar = output<void>();

  /** Precarga los valores iniciales si el formulario está vacío. */
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
