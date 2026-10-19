import { Component, effect, input, model, output } from '@angular/core';
import { FormField } from '../../ui/form-field/form-field';
import { UiCard } from '../../ui/ui-card/ui-card';
import type { CampoCalculadora, RespuestaCalculadora } from '../../models/metodo.model';

/**
 * Panel de entrada y respuesta de una calculadora de método.
 *
 * ── Qué sabe y qué no sabe ───────────────────────────────────────────
 * NO sabe qué método está corriendo. Solo dibuja los campos que le
 * pasan, guarda lo que el alumno escribe y avisa cuándo aprieta Calcular
 * o Limpiar. El componente de cada método es el que recibe esos valores,
 * corre SU algoritmo y devuelve la respuesta.
 *
 * Es la diferencia entre "el formulario" y "la matemática": el formulario
 * es siempre igual, la matemática cambia en cada método.
 */
@Component({
  selector: 'app-calculadora-shell',
  standalone: true,
  imports: [FormField, UiCard],
  templateUrl: './calculadora-shell.html',
  styleUrl: './calculadora-shell.scss',
})
export class CalculadoraShell {
  /** Los campos a mostrar, definidos por el método. */
  readonly campos = input<CampoCalculadora[]>([]);

  /**
   * Lo que el alumno escribió, con la clave de cada campo.
   *
   * Es un `model` (dos direcciones) para que el componente del método
   * pueda precargar valores o limpiarlos sin romper el binding.
   */
  readonly valores = model<Record<string, string>>({});

  /**
   * Precarga los `valorInicial` de los campos, una sola vez.
   *
   * Sin esto, `CampoCalculadora.valorInicial` sería configuración muerta:
   * el formulario abriría en blanco aunque cada campo declare con qué
   * valor debería arrancar. Y el alumno vería una pantalla vacía con un
   * botón que sí funciona, lo cual es peor que no prellenar.
   *
   * Solo se precarga si `valores` sigue vacío. Así el padre puede
   * mandar sus propios valores con `[valores]`, y "Limpiar" (que vacía
   * el registro) vuelve a dejar los defaults, que es lo esperado.
   *
   * Va en un `effect` porque depende de un `input`, que no existe
   * durante el constructor. La guarda del principio evita el bucle:
   * al escribir, `valores` deja de estar vacío y el efecto sale.
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

  /** La respuesta ya calculada, o null si todavía no calculó. */
  readonly respuesta = input<RespuestaCalculadora | null>(null);

  /** El alumno apretó Calcular: se le pasa todo lo que escribió. */
  readonly calcular = output<Record<string, string>>();

  /** El alumno apretó Limpiar. */
  readonly limpiar = output<void>();

  /** Un campo cambió. Se emite por si el método quiere reaccionar. */
  readonly valorCambiado = output<{ clave: string; valor: string }>();

  /** Valor de un campo, o cadena vacía si el alumno no escribió nada. */
  protected valorDe(clave: string): string {
    return this.valores()[clave] ?? '';
  }

  protected alCambiar(clave: string, valor: string): void {
    this.valores.update((v) => ({ ...v, [clave]: valor }));
    this.valorCambiado.emit({ clave, valor });
  }

  protected alCalcular(): void {
    this.calcular.emit({ ...this.valores() });
  }

  protected alLimpiar(): void {
    this.limpiar.emit();
  }
}
