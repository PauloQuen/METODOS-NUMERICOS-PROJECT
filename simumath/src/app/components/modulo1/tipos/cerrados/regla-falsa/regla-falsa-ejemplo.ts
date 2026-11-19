import { Component, computed, input, signal } from '@angular/core';
import type { Ejemplo } from '../../../../../shared/models/metodo.model';
import { escalaGrafico, VIEW_GRAFICO } from '../../../../../shared/domain/escala-grafico';
import { reglaFalsa } from './regla-falsa.algoritmo';
import { PASOS_REGLA_FALSA } from './regla-falsa-pasos';

@Component({
  selector: 'app-regla-falsa-ejemplo',
  standalone: true,
  templateUrl: './regla-falsa-ejemplo.html',
  styleUrls: ['./tabs/regla-falsa-teoria.scss', './regla-falsa-ejemplo.scss'],
})
export class ReglaFalsaEjemplo {
  readonly ejemplo = input.required<Ejemplo>();
  readonly funcion = input.required<(x: number) => number>();
  readonly rango = input.required<{ min: number; max: number }>();
  readonly paso = signal(0);
  readonly tolerancia = computed(() => this.ejemplo().calculo.tol ?? 0.00001);
  readonly pasos = PASOS_REGLA_FALSA;
  readonly vista = VIEW_GRAFICO;
  readonly escala = computed(() => escalaGrafico(this.funcion(), this.rango()));
  readonly resultado = computed(() => {
    const datos = this.ejemplo().calculo;
    return reglaFalsa({
      f: this.funcion(), a: datos.a!, b: datos.b!, tol: this.tolerancia(),
      maxIter: datos.maxIter, criterio: 'absoluto',
    });
  });
  readonly filas = computed(() => this.resultado().filas.slice(0, this.paso()));
  readonly actual = computed(() => this.filas().at(-1));
  readonly terminado = computed(() => this.paso() >= this.resultado().filas.length);
  readonly extremoFijo = computed(() => {
    const anterior = this.filas().at(-2);
    const actual = this.actual();
    if (!anterior || !actual) return '—';
    if (actual.a === anterior.a && actual.b !== anterior.b) return 'a (sin cambiar)';
    if (actual.b === anterior.b && actual.a !== anterior.a) return 'b (sin cambiar)';
    return '—';
  });
  readonly mensaje = computed(() => {
    const fila = this.actual();
    if (!fila) return this.resultado().mensaje ?? 'Pulsa «Siguiente paso» para encontrar el primer cruce de la cuerda con el eje x.';
    if (this.terminado()) {
      if (!this.resultado().convergio) return this.resultado().mensaje ?? 'Se alcanzó el límite de iteraciones sin cumplir el criterio.';
      if (fila.fc === 0) return `f(c) = 0: raíz encontrada en c = ${this.formato(fila.c)}.`;
      return `Criterio cumplido: raíz aproximada ≈ ${this.formato(fila.c)}; cambio absoluto ${this.formato(fila.delta)}.`;
    }
    const mitad = this.funcion()(fila.a) * fila.fc < 0 ? '[a, c]' : '[c, b]';
    return `Paso ${fila.n}: f(c) = ${this.formato(fila.fc)}. Conservamos ${mitad} en la siguiente iteración.${fila.delta === undefined ? ' Aún no hay una aproximación anterior para comparar.' : ''}`;
  });
  readonly errores = computed(() => this.filas().flatMap(fila =>
    fila.delta === undefined ? [] : [{ n: fila.n, error: fila.delta }]));
  // Escala logarítmica estable para todo el recorrido de cada ejemplo.
  readonly limitesError = computed(() => {
    const valores = [this.tolerancia(), ...this.resultado().filas.map(f => f.delta ?? 0)]
      .filter(v => Number.isFinite(v) && v > 0);
    return { min: Math.floor(Math.log10(Math.min(...valores))) - 1,
      max: Math.ceil(Math.log10(Math.max(...valores))) + 1 };
  });
  yError(error: number): number {
    const { min, max } = this.limitesError();
    return error <= 0 ? 112 : 112 - 82 * (Math.max(min, Math.min(max, Math.log10(error))) - min) / (max - min);
  }
  xError(indice: number): number { return 36 + (indice + 0.5) * 540 / Math.max(1, this.errores().length); }
  anchoError(): number { return Math.min(36, 500 / Math.max(1, this.errores().length)); }
  formato(valor: number | undefined): string {
    return valor === undefined || !Number.isFinite(valor) ? '—'
      : valor.toLocaleString('es-PE', { maximumFractionDigits: 6, useGrouping: false });
  }
  siguiente(): void { if (!this.terminado()) this.paso.update(paso => paso + 1); }
  reiniciar(): void { this.paso.set(0); }
}
