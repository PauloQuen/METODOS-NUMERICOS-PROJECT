import { Component, computed, input, signal } from '@angular/core';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import { BloqueEjemploSistema } from '../bloque-ejemplo-sistema/bloque-ejemplo-sistema';
import type { Columna, DibujarMetodo } from '../../../../shared/models/metodo.model';
import type { EjemploModulo2, EjercicioModulo2 } from '../../modelos/modulo2.model';
import { matrizAumentada } from '../sistema';

/**
 * Bloque de ejercicio del Módulo 2 (Autoevaluación).
 *
 * Muestra el planteamiento y el sistema; la solución completa aparece al
 * presionar "Ver solución". El cálculo lo hace la pestaña del método y
 * se lo pasa ya resuelto, igual que en los ejemplos.
 */
@Component({
  selector: 'app-bloque-ejercicio-sistema',
  standalone: true,
  imports: [UiCard, BloqueEjemploSistema],
  templateUrl: './bloque-ejercicio-sistema.html',
  styleUrl: './bloque-ejercicio-sistema.scss',
})
export class BloqueEjercicioSistema {
  readonly ejercicio = input.required<EjercicioModulo2>();

  readonly filas = input<Record<string, number | string>[]>([]);
  readonly columnas = input<Columna[]>([]);
  readonly filaFinal = input<number | undefined>(undefined);
  readonly solucion = input<number[] | undefined>(undefined);
  readonly bondad = input('');
  readonly etiquetaBondad = input('Calidad');
  readonly pasos = input<string[] | undefined>(undefined);
  readonly funcion = input<((x: number) => number) | undefined>(undefined);
  readonly rango = input({ min: 0, max: 1 });
  readonly rangoY = input<{ min: number; max: number } | undefined>(undefined);
  readonly dibujarMetodo = input<DibujarMetodo | undefined>(undefined);
  readonly leyenda = input('');
  readonly tituloTabla = input('Tabla de trabajo');

  readonly mostrarSolucion = signal(false);

  readonly esCasuistica = computed(() => this.ejercicio().tipo === 'casuistica');

  readonly filasAumentadas = computed(() =>
    matrizAumentada(this.ejercicio().calculo.A, this.ejercicio().calculo.b),
  );

  readonly variables = computed(() =>
    Array.from({ length: this.ejercicio().calculo.A.length }, (_, i) => `x${subindice(i + 1)}`),
  );

  protected alternar(): void {
    this.mostrarSolucion.update((v) => !v);
  }

  /** El ejercicio convertido a Ejemplo para reutilizar el bloque completo. */
  protected comoEjemplo(): EjemploModulo2 {
    return { ...this.ejercicio() };
  }
}

function subindice(n: number): string {
  const digitos = '₀₁₂₃₄₅₆₇₈₉';
  return String(n)
    .split('')
    .map((d) => digitos[Number(d)] ?? d)
    .join('');
}
