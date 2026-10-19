import { Component } from '@angular/core';
import { UiCard } from '../../../shared/ui/ui-card/ui-card';
import { Badge } from '../../../shared/ui/badge/badge';

interface EjercicioAuto {
  numero: number;
  tema: string;
  variante: 'navy' | 'amber' | 'teal' | 'amber-solid';
  texto: string;
  solucion: string;
}

const EJERCICIOS_AUTO: EjercicioAuto[] = [
  {
    numero: 1,
    tema: 'Bisección',
    variante: 'amber-solid',
    texto:
      'Querés aproximar la raíz de f(x) = x³ − x − 2 en el intervalo [1, 2] ' +
      'exigiendo un error acotado con |Δc| ≤ 10⁻³. ' +
      '¿Cuántas iteraciones de <strong>Bisección</strong> son necesarias?',
    solucion:
      'Cada iteración divide el ancho del intervalo a la mitad: tras n pasos el ancho ' +
      'es 2⁻ⁿ. Se pide 2⁻ⁿ ≤ 10⁻³, o sea n ≥ log₂(10³) ≈ 9.97 → <strong>n = 10</strong> ' +
      '(2⁻¹⁰ ≈ 9.77 × 10⁻⁴ ≤ 10⁻³). Con 8 iteraciones (2⁻⁸ ≈ 3.9 × 10⁻³) todavía no se ' +
      'alcanza la tolerancia pedida.',
  },
  {
    numero: 2,
    tema: 'Errores',
    variante: 'amber',
    texto:
      'El valor verdadero de la raíz es x̄ = 1.5214 y un método devuelve x = 1.52. ' +
      'Calculá el <strong>error absoluto</strong>, el <strong>relativo</strong> y el ' +
      '<strong>porcentual</strong>.',
    solucion:
      'E<sub>a</sub> = |1.5214 − 1.52| = <strong>0.0014</strong>.<br />' +
      'E<sub>r</sub> = 0.0014 / 1.5214 ≈ <strong>9.20 × 10⁻⁴</strong>.<br />' +
      'E<sub>%</sub> = 9.20 × 10⁻⁴ × 100 ≈ <strong>0.092%</strong>.',
  },
  {
    numero: 3,
    tema: 'Newton-Raphson',
    variante: 'navy',
    texto:
      'Aplicá una iteración de <strong>Newton-Raphson</strong> a f(x) = x³ − x − 2 ' +
      'desde x₀ = 1.5. ¿Qué valor obtenés para x₁? (f\'(x) = 3x² − 1).',
    solucion:
      'f(1.5) = 3.375 − 1.5 − 2 = −0.125 y f\'(1.5) = 3·(2.25) − 1 = 5.75.<br />' +
      'x₁ = x₀ − f(x₀)/f\'(x₀) = 1.5 − (−0.125)/5.75 = 1.5 + 0.0217 ≈ <strong>1.5217</strong>.<br />' +
      'En una sola iteración ya estamos a ~4 × 10⁻⁴ de la raíz (1.5213797): ' +
      'así se ve la convergencia cuadrática.',
  },
  {
    numero: 4,
    tema: 'Secante',
    variante: 'teal',
    texto:
      'Con el método de la <strong>Secante</strong>, partiendo de x₀ = 1.4 y x₁ = 1.5 ' +
      'para f(x) = x³ − x − 2, calculá x₂ con la fórmula ' +
      'x₂ = x₁ − f(x₁)·(x₁−x₀)/(f(x₁)−f(x₀)).',
    solucion:
      'f(1.4) = 2.744 − 3.4 = −0.656 y f(1.5) = −0.125.<br />' +
      'x₂ = 1.5 − (−0.125)·(0.1)/(−0.125 + 0.656) = 1.5 − (−0.0125)/0.531 ≈ 1.5 + 0.0235 ' +
      '≈ <strong>1.5235</strong>.<br />Sin calcular ninguna derivada, la secante ya ' +
      'aproxima casi tan bien como Newton en el primer paso.',
  },
  {
    numero: 5,
    tema: 'Punto Fijo',
    variante: 'amber-solid',
    texto:
      'Despejá x³ = x + 2 en la forma <strong>x = g(x)</strong> y verificá si la ' +
      'iteración de punto fijo converge en el entorno de la raíz x* ≈ 1.52. ' +
      '(Recordá validar la condición de contracción |g\'(x)| ≤ L < 1.)',
    solucion:
      'Un despeje válido es g(x) = (x + 2)^(1/3), pues x³ = x + 2 → x = ³√(x + 2).<br />' +
      'g\'(x) = (1/3)·(x + 2)^(−2/3). En [1, 2], el máximo es en x = 1: ' +
      '|g\'(1)| = (1/3)·3^(−2/3) ≈ <strong>0.1605 &lt; 1</strong> → es contracción y ' +
      'la iteración converge (hacia x* = g(x*)).<br />Con x₀ = 1.5: g(1.5) = 3.5^(1/3) ≈ 1.5183, ' +
      'g(1.5183) ≈ 1.5204 → ya estamos a ~0.001 de la raíz.',
  },
  {
    numero: 6,
    tema: 'Regla Falsa',
    variante: 'amber',
    texto:
      '¿Por qué la <strong>Regla Falsa</strong> garantiza convergencia como la ' +
      'Bisección pero suele llegar antes a la tolerancia? ¿Qué fenómeno la frena ' +
      'cuando la función es muy convexa?',
    solucion:
      'Garantiza convergencia porque mantiene el <strong>encierro de Bolzano</strong>: ' +
      'en cada paso conserva la mitad del intervalo con cambio de signo.<br />' +
      'El punto de corte usa la <strong>cuerda</strong> en lugar del punto medio, por ' +
      'eso avanza más rápido en funciones suaves.<br />Pero si la función es muy ' +
      'convexa/cóncava sufre el <strong>extremo estancado</strong>: un extremo queda ' +
      'fijo en casi todas las iteraciones y la convergencia se degrada a casi lineal.',
  },
];

@Component({
  selector: 'app-autoevaluacion',
  imports: [UiCard, Badge],
  templateUrl: './autoevaluacion.html',
  styleUrl: './autoevaluacion.scss',
})
export class Autoevaluacion {
  readonly ejercicios = EJERCICIOS_AUTO;
}