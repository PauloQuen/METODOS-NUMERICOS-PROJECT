import { Component, effect, input, model, output } from '@angular/core';
import { FormField } from '../../../../shared/ui/form-field/form-field';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import type {
  CampoCalculadoraM3,
  RespuestaCalculadoraM3,
} from '../../modelos/modulo3.model';

/**
 * Panel de entrada y respuesta de una calculadora del Módulo 3.
 *
 * ── Por qué no se reutiliza `CalculadoraShell` del Módulo 1 ──────────
 * Porque su respuesta está rotulada para raíces: "Raíz aproximada",
 * "Iteraciones", "Error final". Acá el resultado es una estimación
 * P(x*) o una predicción ŷ(x*), y la medida de calidad es otra (error
 * en los nodos, r²). Reutilizarlo mostraría los números correctos bajo
 * etiquetas equivocadas, que es peor que no mostrarlos.
 *
 * Lo que sí comparte con el Módulo 1 son los componentes de `shared/ui`
 * (`ui-card`, `form-field`), que son la parte genérica.
 */
@Component({
  selector: 'app-panel-calculadora-datos',
  standalone: true,
  imports: [FormField, UiCard],
  templateUrl: './panel-calculadora-datos.html',
  styleUrl: './panel-calculadora-datos.scss',
})
export class PanelCalculadoraDatos {
  /** Los campos a mostrar, definidos por el método. */
  readonly campos = input<CampoCalculadoraM3[]>([]);

  /** Lo que el alumno escribió, con la clave de cada campo. */
  readonly valores = model<Record<string, string>>({});

  /** Título de la tarjeta de entrada. */
  readonly titulo = input('Parámetros del problema');

  /** La respuesta ya calculada, o null si todavía no calculó. */
  readonly respuesta = input<RespuestaCalculadoraM3 | null>(null);

  /** El alumno apretó Calcular. */
  readonly calcular = output<Record<string, string>>();

  /** El alumno apretó Limpiar. */
  readonly limpiar = output<void>();

  /**
   * Precarga los `valorInicial` de los campos, una sola vez.
   *
   * Sin esto, `CampoCalculadoraM3.valorInicial` sería configuración
   * muerta y el formulario abriría vacío. Solo precarga si `valores`
   * está vacío, así "Limpiar" vuelve a dejar los valores por defecto.
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
