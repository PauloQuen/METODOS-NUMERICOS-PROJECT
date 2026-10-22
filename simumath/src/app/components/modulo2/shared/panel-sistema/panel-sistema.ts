import { Component, effect, input, model, output } from '@angular/core';
import { FormField } from '../../../../shared/ui/form-field/form-field';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import type {
  CampoCalculadoraM2,
  RespuestaCalculadoraM2,
} from '../../modelos/modulo2.model';

/**
 * Panel de entrada y respuesta de una calculadora del Módulo 2.
 *
 * Junta la matriz A, el vector b y los parámetros del método. No sabe
 * resolver sistemas: solo muestra los campos, avisa cuando el alumno
 * aprieta Calcular y pinta la respuesta que le devuelve el servicio.
 */
@Component({
  selector: 'app-panel-sistema',
  standalone: true,
  imports: [FormField, UiCard],
  templateUrl: './panel-sistema.html',
  styleUrl: './panel-sistema.scss',
})
export class PanelSistema {
  readonly campos = input<CampoCalculadoraM2[]>([]);
  readonly valores = model<Record<string, string>>({});
  readonly titulo = input('Sistema de ecuaciones');
  readonly respuesta = input<RespuestaCalculadoraM2 | null>(null);

  readonly calcular = output<Record<string, string>>();
  readonly limpiar = output<void>();

  /**
   * Precarga los valores iniciales una sola vez. Si el alumno limpia,
   * `valores` vuelve a quedar vacío y este efecto repone los defaults.
   */
  private readonly precargar = effect(() => {
    const campos = this.campos();
    if (Object.keys(this.valores()).length > 0 || campos.length === 0) return;

    const inicial: Record<string, string> = {};
    for (const campo of campos) inicial[campo.key] = campo.valorInicial;
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
