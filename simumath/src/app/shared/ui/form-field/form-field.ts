import { Component, input, model, output } from '@angular/core';

/**
 * Campo de entrada con etiqueta y helper.
 * Binding bidireccional del valor con [(value)].
 * Emite `enter` para disparar acciones desde la tecla Enter.
 */
@Component({
  selector: 'app-form-field',
  standalone: true,
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
})
export class FormField {
  private static counter = 0;

  /** Identificador nativo del input (para el label). */
  readonly id = input(`app-form-field-${++FormField.counter}`);
  readonly label = input.required<string>();
  readonly placeholder = input('Ej: 0.0001');
  readonly type = input<'text' | 'number'>('text');
  /**
   * Por qué el template pone `step="any"` en los campos de número.
   *
   * Un `<input type="number">` tiene un `step` implícito de 1, así que el
   * navegador considera INVÁLIDO cualquier decimal. Si el alumno escribe
   * una tolerancia de 0.000001, el form entero queda inválido y el botón
   * Calcular deja de disparar el submit: no hay excepción, no sale nada en
   * la consola, el botón simplemente no hace nada. Es el tipo de bug que
   * hace perder una tarde.
   *
   * En métodos numéricos casi todo lo que se escribe es decimal, así que
   * en los campos numéricos el paso va en "any". Vive acá y no como input
   * porque es una consecuencia del `type`, no algo que cada método pueda
   * decidir distinto.
   */
  readonly hint = input('');

  /**
   * ¿El campo es de varias líneas?
   *
   * El Módulo 2 escribe una MATRIZ, y una matriz se escribe en varias
   * filas: "3 1 2" arriba, "1 -1 1" abajo. En un `<input>` de una sola
   * línea eso no entra. Con esta bandera el campo se dibuja como un
   * `<textarea>` y el alumno ve la matriz como la ve en el cuaderno.
   */
  readonly multilinea = input(false);

  /** Cuántas filas tiene el área de texto (solo si `multilinea`). */
  readonly filas = input(4);

  /** Valor del campo, en dos direcciones ([(value)]). */
  readonly value = model('');

  /** Enter presionado dentro del campo. */
  readonly enter = output<void>();

  onInput(event: Event): void {
    const destino = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value.set(destino.value);
  }
}