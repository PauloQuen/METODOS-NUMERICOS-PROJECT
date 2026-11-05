import { Component, computed, input, output } from '@angular/core';
import type { ResolucionEjercicioM3 } from '../../modelos/modulo3.model';
import type { FormatoRespuesta } from '../../../../shared/autoevaluacion-mejorada/respuesta.strategy';
import {
  TOLERANCIA_RESOLUCION,
  type EstadoActividadEjercicio,
} from './actividades-ejercicio.service';

/**
 * PANEL COMPACTO DE RESOLUCIÓN.
 *
 * El alumno escribe su resultado numérico y lo verifica contra el valor
 * del ejercicio. El feedback no revela la cifra: para verla hay que
 * pedirla explícitamente con "Mostrar respuesta final". El desarrollo
 * paso a paso no se repite acá; sigue en "Ver solución".
 */
@Component({
  selector: 'app-resolucion-ejercicio',
  standalone: true,
  templateUrl: './resolucion-ejercicio.html',
  styleUrl: './resolucion-ejercicio.scss',
})
export class ResolucionEjercicio {
  readonly ejercicioId = input.required<string>();

  readonly resolucion = input.required<ResolucionEjercicioM3>();

  readonly estado = input.required<EstadoActividadEjercicio>();

  readonly formato = input<FormatoRespuesta>('escalar');

  readonly entradaChange = output<string>();

  readonly verificar = output<void>();

  readonly alternarRespuesta = output<void>();

  protected readonly tolerancia = computed(
    () => this.resolucion().tolerancia ?? TOLERANCIA_RESOLUCION,
  );

  protected readonly inputId = computed(() => `ae-res-${this.ejercicioId()}`);

  protected readonly ayudaId = computed(() => `ae-res-${this.ejercicioId()}-ayuda`);

  protected readonly respuestaId = computed(() => `ae-res-${this.ejercicioId()}-final`);

  protected readonly mensaje = computed(() => {
    switch (this.estado().verificacion) {
      case 'acierto':
        return '¡Correcto! Tu resultado está dentro de la tolerancia.';
      case 'casi':
        return 'Casi: estás muy cerca del valor correcto. Revisá los decimales o el redondeo.';
      case 'incorrecto':
        return 'Todavía no. Revisá el planteo y volvé a intentar.';
      case 'invalido':
        return 'Escribí un valor válido. Revisá el formato indicado debajo del campo.';
      default:
        return '';
    }
  });

  protected readonly ayuda = computed(() => {
    const tolerancia = this.tolerancia();
    switch (this.formato()) {
      case 'entero':
        return 'Escribí un número entero. Se compara por igualdad exacta.';
      case 'vector':
        return `Separá las componentes con punto y coma: 2; 3. Se compara componente a componente con ±${tolerancia}.`;
      case 'matriz':
        return `Separá las filas con punto y coma y las columnas con espacios: 1 2; 3 4. Tolerancia ±${tolerancia}.`;
      case 'polinomio':
        return `Escribí los coeficientes de menor a mayor grado, separados por punto y coma. Tolerancia ±${tolerancia}.`;
      case 'error':
        return `Escribí el error. Se compara de forma relativa con tolerancia ±${tolerancia}.`;
      default:
        return `Acepta coma o punto decimal. Se considera correcto dentro de ±${tolerancia}.`;
    }
  });

  protected readonly placeholder = computed(() => {
    switch (this.formato()) {
      case 'entero':
        return 'Ej: 10';
      case 'vector':
        return 'Ej: 2; 3';
      case 'matriz':
        return 'Ej: 1 2; 3 4';
      case 'polinomio':
        return 'Ej: -0,5; 0,928571';
      default:
        return 'Ej: 1,78125';
    }
  });

  protected readonly modoEntrada = computed(() =>
    this.formato() === 'escalar' || this.formato() === 'error' ? 'decimal' : 'text',
  );

  protected alEscribir(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.entradaChange.emit(input.value);
  }
}
