import type { PreguntaCuestionarioM3, ResolucionEjercicioM3 } from '../../../modulo3/modelos/modulo3.model';
import type { FormatoRespuesta } from '../../../../shared/autoevaluacion-mejorada/respuesta.strategy';

export interface EjercicioAutoMejorado {
  id: string;
  numero: number;
  tema: string;
  variante: 'navy' | 'amber' | 'teal' | 'amber-solid';
  texto: string;
  solucion: string;
  cuestionario?: PreguntaCuestionarioM3[];
  resolucion?: ResolucionEjercicioM3;
  formatoRespuesta?: FormatoRespuesta;
  desbloqueo?: {
    politica?: 'cuestionario' | 'respuesta' | 'cualquiera' | 'ambos';
    umbralCuestionario?: number;
    intentosParaRendirse?: number;
  };
}

export const EJERCICIOS_AUTO_MEJORADOS: EjercicioAutoMejorado[] = [
  {
    id: 'm1-e1',
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
      '(2⁻¹⁰ ≈ 9.77 × 10⁻⁴ ≤ 10⁻³).',
    formatoRespuesta: 'entero',
    cuestionario: [
      {
        id: 'm1-e1-q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué asegura el método de Bisección para converger?',
        opciones: [
          { id: 'a', texto: 'Que f sea continua y f(a)·f(b) < 0' },
          { id: 'b', texto: 'Que exista derivada en todo el intervalo' },
          { id: 'c', texto: 'Que f sea monótona siempre' },
          { id: 'd', texto: 'Que el intervalo sea unitario' },
        ],
        correcta: 'a',
        explicacion: 'Teorema de Bolzano: cambio de signo + continuidad garantizan raíz en el intervalo.',
      },
      {
        id: 'm1-e1-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Cómo evoluciona el ancho del intervalo en Bisección?',
        opciones: [
          { id: 'a', texto: 'Se divide a la mitad en cada iteración' },
          { id: 'b', texto: 'Se multiplica por 2' },
          { id: 'c', texto: 'Permanece igual' },
          { id: 'd', texto: 'Se suma un error constante' },
        ],
        correcta: 'a',
        explicacion: 'b_{n}/2^n con b_0 = b-a.',
      },
      {
        id: 'm1-e1-q3',
        tipo: 'opcion-multiple',
        enunciado: 'Para |Δc| <= 10⁻³, ¿cuántas iteraciones mínimas son necesarias partiendo de [1,2]?',
        opciones: [
          { id: 'a', texto: '10' },
          { id: 'b', texto: '5' },
          { id: 'c', texto: '3' },
          { id: 'd', texto: '1' },
        ],
        correcta: 'a',
        explicacion: 'Con ancho inicial 1, el error es 1/2ⁿ. Se pide 1/2ⁿ ≤ 10⁻³, o sea 2ⁿ ≥ 1000: n ≥ 9.97, entonces n = 10.',
      },
    ],
    resolucion: {
      valorCorrecto: 10,
      tolerancia: 0,
      etiqueta: 'n (entero)',
      respuestaFinalTexto: 'Se requieren n = 10 iteraciones (criterio 2⁻ⁿ <= 10⁻³).',
    },
  },
  {
    id: 'm1-e2',
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
    cuestionario: [
      {
        id: 'm1-e2-q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Cómo se define el error absoluto?',
        opciones: [
          { id: 'a', texto: '|x̄ - x|' },
          { id: 'b', texto: '|x̄ - x| / |x|' },
          { id: 'c', texto: '(|x̄-x|/|x̄|)*100' },
          { id: 'd', texto: 'x - x̄' },
        ],
        correcta: 'a',
        explicacion: 'Error absoluto = |valor verdadero - valor aproximado|.',
      },
      {
        id: 'm1-e2-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuándo conviene usar error relativo?',
        opciones: [
          { id: 'a', texto: 'Cuando el valor verdadero es distinto de 0 y queremos comparar magnitudes' },
          { id: 'b', texto: 'Siempre da 0' },
          { id: 'c', texto: 'Solo con enteros' },
          { id: 'd', texto: 'Nunca conviene' },
        ],
        correcta: 'a',
        explicacion: 'El error relativo normaliza por la magnitud del valor verdadero/aproximado.',
      },
      {
        id: 'm1-e2-q3',
        tipo: 'opcion-multiple',
        enunciado: 'Para estos valores, ¿aproximadamente cuánto vale el error relativo?',
        opciones: [
          { id: 'a', texto: '9.2e-4' },
          { id: 'b', texto: '1.0' },
          { id: 'c', texto: '0.5' },
          { id: 'd', texto: '100' },
        ],
        correcta: 'a',
        explicacion: '0.0014/1.5214 ≈ 9.2×10⁻⁴.',
      },
    ],
    resolucion: {
      valorCorrecto: 0.00092,
      tolerancia: 0.00001,
      etiqueta: 'Error relativo',
      respuestaFinalTexto: 'E_r ≈ 9.20×10⁻⁴.',
    },
  },
  {
    id: 'm1-e3',
    numero: 3,
    tema: 'Newton-Raphson',
    variante: 'navy',
    texto:
      'Aplicá una iteración de <strong>Newton-Raphson</strong> a f(x) = x³ − x − 2 ' +
      'desde x₀ = 1.5. ¿Qué valor obtenés para x₁? (f\'(x) = 3x² − 1).',
    solucion:
      'f(1.5) = 3.375 − 1.5 − 2 = −0.125 y f\'(1.5) = 3·(2.25) − 1 = 5.75.<br />' +
      'x₁ = x₀ − f(x₀)/f\'(x₀) = 1.5 − (−0.125)/5.75 = 1.5 + 0.021739… ≈ <strong>1.5217</strong>.',
    cuestionario: [
      {
        id: 'm1-e3-q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuál es la fórmula de Newton-Raphson?',
        opciones: [
          { id: 'a', texto: 'x_{n+1} = x_n - f(x_n)/f\'(x_n)' },
          { id: 'b', texto: 'x_{n+1} = (a+b)/2' },
          { id: 'c', texto: 'x_{n+1}=x_n - f(x_n)(x_n-x_{n-1})/(f(x_n)-f(x_{n-1}))' },
          { id: 'd', texto: 'x_{n+1}=g(x_n)' },
        ],
        correcta: 'a',
        explicacion: 'Recta tangente en x_n que corta al eje x.',
      },
      {
        id: 'm1-e3-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué se necesita para aplicar Newton?',
        opciones: [
          { id: 'a', texto: 'f(x) y f\'(x)' },
          { id: 'b', texto: 'Solo dos puntos' },
          { id: 'c', texto: 'Solo un intervalo' },
          { id: 'd', texto: 'Solo f(x)' },
        ],
        correcta: 'a',
        explicacion: 'Requiere derivada (forma cerrada o aproximada).',
      },
      {
        id: 'm1-e3-q3',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué convergencia se espera cerca de raíz simple?',
        opciones: [
          { id: 'a', texto: 'Cuadrática' },
          { id: 'b', texto: 'Lineal siempre' },
          { id: 'c', texto: 'Sublineal' },
          { id: 'd', texto: 'Nula' },
        ],
        correcta: 'a',
        explicacion: 'Newton es cuadráticamente convergente para raíz simple bajo condiciones adecuadas.',
      },
    ],
    resolucion: {
      valorCorrecto: 1.521739,
      tolerancia: 0.0005,
      etiqueta: 'x₁',
      respuestaFinalTexto: 'x₁ = 1.5 - (-0.125)/5.75 ≈ 1.5217',
    },
  },
  {
    id: 'm1-e4',
    numero: 4,
    tema: 'Secante',
    variante: 'teal',
    texto:
      'Con el método de la <strong>Secante</strong>, partiendo de x₀ = 1.4 y x₁ = 1.5 ' +
      'para f(x) = x³ − x − 2, calculá x₂ con la fórmula ' +
      'x₂ = x₁ − f(x₁)·(x₁−x₀)/(f(x₁)−f(x₀)).',
    solucion:
      'f(1.4) = 2.744 − 1.4 − 2 = −0.656 y f(1.5) = 3.375 − 1.5 − 2 = −0.125.<br />' +
      'x₂ = 1.5 − (−0.125)·(0.1)/(−0.125 − (−0.656)) = 1.5 − (−0.0125)/(0.531) ≈ 1.5 + 0.02354 ≈ <strong>1.5235</strong>.',
    cuestionario: [
      {
        id: 'm1-e4-q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué diferencia hay entre Secante y Newton?',
        opciones: [
          { id: 'a', texto: 'Secante aproxima f\' por diferencia finita, no requiere derivada' },
          { id: 'b', texto: 'Siempre usa derivada' },
          { id: 'c', texto: 'Solo funciona con intervalo' },
          { id: 'd', texto: 'No usa función' },
        ],
        correcta: 'a',
        explicacion: 'Secante usa dos puntos en lugar de tangente.',
      },
      {
        id: 'm1-e4-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuántos puntos iniciales necesita Secante?',
        opciones: [
          { id: 'a', texto: 'Dos' },
          { id: 'b', texto: 'Uno' },
          { id: 'c', texto: 'Tres' },
          { id: 'd', texto: 'Ninguno' },
        ],
        correcta: 'a',
        explicacion: 'x0, x1 para generar x2.',
      },
      {
        id: 'm1-e4-q3',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué orden de convergencia tiene Secante (aprox)?',
        opciones: [
          { id: 'a', texto: '~1.618 (razón áurea)' },
          { id: 'b', texto: '2' },
          { id: 'c', texto: '1' },
          { id: 'd', texto: '3' },
        ],
        correcta: 'a',
        explicacion: 'Superlineal, entre lineal y cuadrático.',
      },
    ],
    resolucion: {
      valorCorrecto: 1.52354,
      tolerancia: 0.001,
      etiqueta: 'x₂',
      respuestaFinalTexto: 'x₂ ≈ 1.5235',
    },
  },
  {
    id: 'm1-e5',
    numero: 5,
    tema: 'Punto Fijo',
    variante: 'amber-solid',
    texto:
      'Despejá x³ = x + 2 en la forma <strong>x = g(x)</strong> y verificá si la ' +
      'iteración de punto fijo converge en el entorno de la raíz x* ≈ 1.52. ' +
      '(Recordá validar la condición de contracción |g\'(x)| ≤ L < 1.)',
    solucion:
      'Un despeje válido es g(x) = (x + 2)^(1/3), pues x³ = x + 2 → x = ³√(x + 2).<br />' +
      'g\'(x) = (1/3)(x+2)^(-2/3). |g\'(1)|≈0.1605 < 1 → contracción, converge.',
    cuestionario: [
      {
        id: 'm1-e5-q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué forma tiene Punto Fijo?',
        opciones: [
          { id: 'a', texto: 'x_{n+1}=g(x_n)' },
          { id: 'b', texto: 'x_{n+1}=x_n - f(x_n)/f\'(x_n)' },
          { id: 'c', texto: '(a+b)/2' },
          { id: 'd', texto: 'Cramer' },
        ],
        correcta: 'a',
        explicacion: 'Se reescribe f(x)=0 como x=g(x).',
      },
      {
        id: 'm1-e5-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuándo hay convergencia local (condición suficiente)?',
        opciones: [
          { id: 'a', texto: '|g\'(x)| < 1 en un entorno de x*' },
          { id: 'b', texto: '|g\'(x)| > 100' },
          { id: 'c', texto: 'g(x)=0' },
          { id: 'd', texto: 'Siempre converge' },
        ],
        correcta: 'a',
        explicacion: 'Teorema del punto fijo (contracción).',
      },
      {
        id: 'm1-e5-q3',
        tipo: 'opcion-multiple',
        enunciado: 'Para g(x)=(x+2)^(1/3), ¿es convergente cerca de 1.52?',
        opciones: [
          { id: 'a', texto: 'Sí, |g\'|<1' },
          { id: 'b', texto: 'No, diverge siempre' },
          { id: 'c', texto: 'Solo si x0=0' },
          { id: 'd', texto: 'No se puede saber' },
        ],
        correcta: 'a',
        explicacion: '|g\'(1.52)| pequeño < 1.',
      },
    ],
    resolucion: {
      valorCorrecto: 0.16,
      tolerancia: 0.01,
      etiqueta: '|g\'(1)|',
      respuestaFinalTexto: '|g\'(1)| ≈ 0.1605 < 1 (convergente).',
    },
  },
  {
    id: 'm1-e6',
    numero: 6,
    tema: 'Regla Falsa',
    variante: 'amber',
    texto:
      '¿Por qué la <strong>Regla Falsa</strong> garantiza convergencia como la ' +
      'Bisección pero suele llegar antes a la tolerancia? ¿Qué fenómeno la frena ' +
      'cuando la función es muy convexa?',
    solucion:
      'Garantiza convergencia porque mantiene el <strong>encierro de Bolzano</strong>.<br />' +
      'Usa la <strong>cuerda</strong> en lugar del punto medio → avanza más rápido.<br />' +
      'Pero con curvatura fuerte aparece el <strong>extremo estancado</strong> y la convergencia se degrada.',
    cuestionario: [
      {
        id: 'm1-e6-q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué propiedad comparten Bisección y Regla Falsa?',
        opciones: [
          { id: 'a', texto: 'Mantienen intervalo con cambio de signo (encierro)' },
          { id: 'b', texto: 'Usan derivada' },
          { id: 'c', texto: 'Necesitan un solo punto' },
          { id: 'd', texto: 'Siempre cuadráticas' },
        ],
        correcta: 'a',
        explicacion: 'Ambos son métodos de encierro (bracketing).',
      },
      {
        id: 'm1-e6-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué usa Regla Falsa para generar el punto?',
        opciones: [
          { id: 'a', texto: 'Interpolación lineal (cuerda)' },
          { id: 'b', texto: 'Tangente' },
          { id: 'c', texto: 'Ajuste cuadrático' },
          { id: 'd', texto: 'Serie de Taylor' },
        ],
        correcta: 'a',
        explicacion: 'Traza recta entre (a,f(a)) y (b,f(b)) y toma su raíz.',
      },
      {
        id: 'm1-e6-q3',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué fenómeno ralentiza Regla Falsa?',
        opciones: [
          { id: 'a', texto: 'Extremo estancado' },
          { id: 'b', texto: 'Error cero' },
          { id: 'c', texto: 'Convergencia cúbica' },
          { id: 'd', texto: 'Interpolación exacta' },
        ],
        correcta: 'a',
        explicacion: 'Un extremo queda fijo cuando la función es muy curva.',
      },
    ],
  },
];
