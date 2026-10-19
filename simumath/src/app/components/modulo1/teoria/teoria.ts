import { Component } from '@angular/core';
import { UiCard } from '../../../shared/ui/ui-card/ui-card';
import { Badge } from '../../../shared/ui/badge/badge';
import { Btn } from '../../../shared/ui/btn/btn';

/* ------------------------------------------------------------------ */
/* Datos de teoría: errores, fundamentos, métodos y comparación.       */
/* Fuente: teoria_errores_ecuaciones_no_lineales.md (apuntes del tema) */
/* ------------------------------------------------------------------ */

interface ConceptoError {
  titulo: string;
  variante: 'navy' | 'amber' | 'teal' | 'amber-solid' | 'outline';
  formula: string;
  texto: string;
}

interface Metodo {
  nombre: string;
  variante: 'navy' | 'amber' | 'teal' | 'amber-solid';
  orden: string;
  titulo: string;
  formula: string;
  texto: string;
  algoritmo: string[];
  ventajas: string[];
  limitaciones: string[];
}

const CONCEPTOS_ERROR: ConceptoError[] = [
  {
    titulo: 'Error Absoluto',
    variante: 'navy',
    formula: 'E<sub>a</sub> = |x̄ − x|',
    texto:
      'Diferencia entre el valor verdadero (o de referencia) x̄ y la aproximación x. Se expresa en las mismas unidades que la magnitud medida y puede originarse por exceso o por defecto.',
  },
  {
    titulo: 'Error Relativo',
    variante: 'amber',
    formula: 'E<sub>r</sub> = E<sub>a</sub> / |x̄|',
    texto:
      'Normaliza el error absoluto por la magnitud del valor de referencia. No depende de la escala del problema, lo que permite comparar la calidad de aproximaciones de magnitudes muy distintas. Si x̄ = 0, no está definido.',
  },
  {
    titulo: 'Error Porcentual',
    variante: 'teal',
    formula: 'E<sub>%</sub> = E<sub>r</sub> × 100',
    texto:
      'El error relativo expresado en porcentaje: la forma más habitual de comunicar tolerancias en ingeniería. Es el criterio que sigue la guía del proyecto al comparar contra una referencia.',
  },
  {
    titulo: 'Truncamiento y Redondeo',
    variante: 'amber-solid',
    formula: 'R ⊂ ℚ',
    texto:
      'El de truncamiento nace al cortar un proceso infinito (una serie de Taylor, una sucesión). El de redondeo, al representar reales con precisión finita. Ambos conviven en todo programa.',
  },
];

const CONCEPTOS_EXTRA: ConceptoError[] = [
  {
    titulo: 'Exactitud',
    variante: 'navy',
    formula: '≈ x̄',
    texto:
      'Qué tan cerca está una aproximación del valor verdadero. Se evalúa contra una referencia independiente.',
  },
  {
    titulo: 'Precisión',
    variante: 'amber',
    formula: 'σ pequeño',
    texto:
      'Qué tan cerca están entre sí varias aproximaciones repetidas. Alta precisión no implica exactitud: se puede repetir el mismo error sistemáticamente.',
  },
  {
    titulo: 'Residuo',
    variante: 'teal',
    formula: 'r = |f(x<sub>n</sub>)|',
    texto:
      'El valor que devuelve la función en la aproximación actual. Un residuo pequeño NO garantiza un error pequeño en la raíz: ambos deben reportarse por separado.',
  },
  {
    titulo: 'Cifras significativas',
    variante: 'amber-solid',
    formula: 'E<sub>a</sub> ≤ 0.5 × 10<sup>−n+1</sup>',
    texto:
      'Criterio de Scarborough: una aproximación tiene n cifras significativas correctas si su error absoluto cumple esa cota. De él se deduce cuántas iteraciones pedir.',
  },
];

const FUNDAMENTOS = [
  {
    titulo: 'Formulación estándar f(x) = 0',
    texto:
      'Cualquier ecuación g(x) = c puede reescribirse restando c a ambos lados para obtener la forma estándar. Por ejemplo, la calibración x³ − x = 2 se convierte en f(x) = x³ − x − 2 = 0. Trabajar siempre con f(x) = 0 permite aplicar el mismo aparato teórico a cualquier problema.',
  },
  {
    titulo: 'Teorema de Bolzano (localización)',
    texto:
      'Si f es continua en [a, b] y f(a)·f(b) < 0, entonces existe al menos una raíz x* ∈ (a, b) con f(x*) = 0. En la práctica se localiza evaluando f en una tabla y buscando el subintervalo donde cambia de signo.',
  },
  {
    titulo: 'Límites del cambio de signo',
    texto:
      '1) Si la función toca el eje sin cruzarlo (raíz de multiplicidad par), no hay cambio de signo aunque exista raíz. 2) Si hay un número par de raíces dentro del intervalo, tampoco se detecta cambio de signo en los extremos.',
  },
  {
    titulo: 'Intervalo vs. aproximación inicial',
    texto:
      'Los métodos de intervalo (Bisección, Regula Falsi) parten de [a, b] con cambio de signo y garantizan encierro. Los métodos de punto (Newton, Secante, Punto Fijo) parten de uno o dos valores x₀ y no garantizan convergencia: una mala elección puede divergir u oscilar.',
  },
];

const METODOS: Metodo[] = [
  {
    nombre: 'Bisección',
    variante: 'amber-solid',
    orden: 'Lineal · r = 1',
    titulo: 'Acotación por intervalos',
    formula: 'xm = (a + b) / 2',
    texto:
      'Aplica Bolzano reiteradamente: divide el intervalo por la mitad y conserva la mitad que mantiene el cambio de signo. Siempre converge (robusta), pero el error solo se reduce a la mitad por iteración (~1 bit de precisión por paso).',
    algoritmo: [
      'Verificar f continua en [a, b] y f(a)·f(b) < 0.',
      'Calcular el punto medio xm = (a + b) / 2 y evaluar f(xm).',
      'Si f(a)·f(xm) < 0 → la raíz está en [a, xm]: b = xm. Si no, a = xm.',
      'Repetir hasta que el ancho (b−a)/2 ≤ tol o |f(xm)| sea pequeño.',
    ],
    ventajas: [
      'Siempre converge si se cumple la condición inicial (Bolzano).',
      'No usa derivadas: no puede “explotar” ni divergir.',
      'Cota de error conocida de antemano: |xm − x*| ≤ (b₀−a₀)/2ⁿ.',
      'Iteraciones necesarias: n ≥ log₂((b−a)/tol).',
    ],
    limitaciones: [
      'Requiere hallar un intervalo con cambio de signo.',
      'No detecta raíces de multiplicidad par.',
      'Convergencia lenta (lineal) frente a Newton.',
      'Si f(a)·f(b) ≥ 0 debe advertirse como entrada inválida, no forzarse.',
    ],
  },
  {
    nombre: 'Newton-Raphson',
    variante: 'navy',
    orden: 'Cuadrático · r = 2',
    titulo: 'Recta tangente',
    formula: 'x<sub>n+1</sub> = x<sub>n</sub> − f(x<sub>n</sub>) / f\'(x<sub>n</sub>)',
    texto:
      'Aproxima f cerca de xₙ con su recta tangente y corta el eje horizontal. Si x₀ está cerca de una raíz simple y f\' no se anula, el número de cifras correctas se DUPLICA en cada iteración: eₙ₊₁ ≈ [f″(x*)/2f\'(x*)]·eₙ².',
    algoritmo: [
      'Elegir x₀ razonablemente cerca de la raíz.',
      'Evaluar f(xₙ) y f\'(xₙ); verificar que f\' no sea cero ni casi cero.',
      'Calcular xₙ₊₁ = xₙ − f(xₙ)/f\'(xₙ).',
      'Verificar que xₙ₊₁ sea finito (detectar overflow).',
      'Repetir hasta |xₙ₊₁ − xₙ| < tol o |f(xₙ)| < tol.',
    ],
    ventajas: [
      'Convergencia cuadrática: muy pocas iteraciones.',
      'Solo necesita un punto de partida, no un intervalo.',
      'Criterio práctico del .md: si f″ no cambia de signo, buscar f(x₀)·f″(x₀) > 0.',
    ],
    limitaciones: [
      'Requiere f derivable y f\'(xₙ) ≠ 0 durante el proceso.',
      'Punto inicial alejado de la raíz → divergencia, oscilación o convergencia a otra raíz.',
      'Raíz múltiple (f\'(x*) = 0): la convergencia se degrada a lineal.',
      'Debe monitorear fallos explícitamente: derivada casi nula, valores no finitos.',
    ],
  },
  {
    nombre: 'Regla Falsa',
    variante: 'amber',
    orden: 'Lineal · r = 1',
    titulo: 'Cuerda de la secante',
    formula: 'xm = b − f(b)·(b − a) / (f(b) − f(a))',
    texto:
      'Como la bisección, parte de [a, b] con cambio de signo y conserva el encierro, pero el punto de prueba es la intersección de la cuerda entre (a, f(a)) y (b, f(b)) con el eje x. Aprovecha la forma de la función y suele avanzar más rápido en funciones casi lineales.',
    algoritmo: [
      'Verificar f(a)·f(b) < 0 (Bolzano).',
      'Calcular xm = b − f(b)·(b−a)/(f(b)−f(a)).',
      'Evaluar f(xm) y decidir la nueva mitad como en bisección.',
      'Repetir hasta |xm⁽ⁿ⁺¹⁾ − xm⁽ⁿ⁾| < tol o |f(xm)| < tol.',
    ],
    ventajas: [
      'Tan robusto como bisección (encierro garantizado).',
      'Normalmente necesita menos iteraciones que bisección.',
      'No requiere derivadas.',
    ],
    limitaciones: [
      'Extremo estancado: si la función es convexa/cóncava, un extremo puede quedar fijo y el intervalo no se cierra (la sucesión igual converge).',
      'Sin cota de error simple tipo (b−a)/2ⁿ.',
      'Mismas limitaciones de signo que bisección (multiplicidad par).',
    ],
  },
  {
    nombre: 'Secante',
    variante: 'teal',
    orden: 'Superlineal · p ≈ 1.618',
    titulo: 'Newton sin derivada',
    formula: 'x<sub>n+1</sub> = x<sub>n</sub> − f(x<sub>n</sub>)·(x<sub>n</sub>−x<sub>n−1</sub>) / (f(x<sub>n</sub>)−f(x<sub>n−1</sub>))',
    texto:
      'Reemplaza f\'(xₙ) por la pendiente de la secante que une las dos últimas aproximaciones. No exige cambio de signo ni derivada: usa los dos puntos más recientes, encierren o no la raíz. Convergencia superlineal con orden la razón áurea.',
    algoritmo: [
      'Elegir dos aproximaciones iniciales x₀ y x₁ (no necesitan encerrar la raíz).',
      'Calcular xₙ₊₁ con la recurrencia de la secante.',
      'Verificar que f(xₙ) ≠ f(xₙ₋₁) (secante horizontal).',
      'Verificar que xₙ₊₁ sea finito; desplazar índices (xₙ₋₁ ← xₙ, xₙ ← xₙ₊₁).',
    ],
    ventajas: [
      'No requiere calcular la derivada de f.',
      'Más rápida que los métodos de intervalo (p ≈ 1.618).',
      'Sin condición de encierro, partidas más flexibles.',
    ],
    limitaciones: [
      'No garantiza convergencia (puede divergir u oscilar).',
      'Falla si f(xₙ) = f(xₙ₋₁): división por cero.',
      'Requiere guardar y actualizar dos puntos por iteración.',
    ],
  },
  {
    nombre: 'Punto Fijo',
    variante: 'amber-solid',
    orden: 'Lineal · r = |g\'(x*)|',
    titulo: 'Iteración de aproximaciones sucesivas',
    formula: 'x<sub>n+1</sub> = g(x<sub>n</sub>)',
    texto:
      'Transforma f(x) = 0 en una forma equivalente x = g(x). Un punto fijo de g (x* = g(x*)) es raíz de f. La elección del despeje es DECISIVA: una misma ecuación admite despejes convergentes y divergentes. Converge si g mapea [a,b] en sí mismo y |g\'(x)| ≤ L < 1 (contracción).',
    algoritmo: [
      'Despejar x = g(x) de la ecuación f(x) = 0.',
      'Validar convergencia: g([a,b]) ⊆ [a,b] y L = max|g\'(x)| < 1.',
      'Elegir x₀ en el intervalo y calcular xₙ₊₁ = g(xₙ).',
      'Detener con |xₙ₊₁ − xₙ| < tol; verificar que xₙ no salga del dominio.',
    ],
    ventajas: [
      'Conceptualmente muy simple (una evaluación de g por iteración).',
      'No requiere derivada para iterar (solo para validar L).',
      'Permite razonar visualmente con diagramas de telaraña.',
    ],
    limitaciones: [
      'Exige encontrar y validar un despeje g; no siempre es evidente.',
      'Máx. lineal: más lento que Newton o Secante.',
      'Si |g\'(x)| ≥ 1 la sucesión DIVERGE aunque x₀ parezca razonable: validar siempre la condición de Lipschitz.',
    ],
  },
];

const CRITERIOS_PARADA = [
  {
    titulo: 'Residuo',
    texto:
      '|f(xᵢ)| ≤ tol — la función está lo bastante cerca de cero. OJO: es un residuo, no el error de la raíz (§ exactitud).',
  },
  {
    titulo: 'Incremento',
    texto:
      '|xₙ₊₁ − xₙ| ≤ tol — la aproximación ya no se mueve significativamente entre iteraciones.',
  },
  {
    titulo: 'Encierro (métodos por intervalos)',
    texto: '(b − a)/2 ≤ tol — la cota teórica de error de bisección queda acotada.',
  },
  {
    titulo: 'Máximo de iteraciones',
    texto:
      'Agotamiento del límite: se reporta como TAL, nunca como convergencia. Alcanzar maxIter no prueba convergencia.',
  },
];

const TOLERANCIAS = [
  {
    titulo: 'Tolerancia de parada interna',
    texto: 'El umbral que usa el algoritmo para decidir cuándo dejar de iterar (ej.: |xₙ₊₁ − xₙ| < 10⁻⁶).',
  },
  {
    titulo: 'Tolerancia de comparación con referencia',
    texto: 'Umbral solo para verificar contra otra vía (Octave, cálculo manual). No forma parte del algoritmo. Se combina: tol = tol_abs + tol_rel·|referencia|.',
  },
  {
    titulo: 'Decimales mostrados',
    texto: 'Decisión de presentación únicamente: NO debe confundirse con la precisión real alcanzada internamente.',
  },
];

const COMPARACION_HEADERS = ['Bisección', 'Regula Falsi', 'Secante', 'Punto Fijo', 'Newton-Raphson'];
const COMPARACION = [
  { aspecto: 'Información inicial', valores: ['Intervalo [a,b] con signo', 'Intervalo [a,b] con signo', 'Dos puntos x₀, x₁', 'Un punto x₀ + g validada', 'Un punto x₀ cercano'] },
  { aspecto: '¿Necesita derivada?', valores: ['No', 'No', 'No (la aproxima)', 'No (para iterar)', 'Sí, f\'(x)'] },
  { aspecto: '¿Encierra la raíz?', valores: ['Sí, siempre', 'Sí, siempre', 'No', 'No', 'No'] },
  { aspecto: 'Garantía de convergencia', valores: ['Sí (con condición inicial)', 'Sí (con condición inicial)', 'No garantizada', 'Sí si g es contracción', 'No garantizada'] },
  { aspecto: 'Orden de convergencia', valores: ['Lineal (1/2)', 'Lineal (típ. < 1/2)', 'Superlineal (1.618)', 'Lineal (|g\'(x*)|)', 'Cuadrático'] },
  { aspecto: 'Velocidad típica', valores: ['Lenta, predecible', 'Moderada; extremo estancado', 'Rápida', 'Lenta a moderada', 'Muy rápida'] },
  { aspecto: 'Estimación de error', valores: ['(b−a)/2ⁿ exacta', '|xm⁽ⁿ⁺¹⁾ − xm⁽ⁿ⁾|', '|xₙ₊₁ − xₙ|', 'Lⁿ/(1−L)·|x₁−x₀|', '|xₙ₊₁ − xₙ|'] },
  { aspecto: 'Limitación principal', valores: ['Multiplicidad par', 'Extremo estancado', 'f(xₙ) = f(xₙ₋₁)', 'Despeje g inválido', 'f\'(x) ≈ 0 o x₀ malo'] },
];

/** En el caso base f(x) = x³ − x − 2 (x* ≈ 1.5213797068): */
const COMPARACION_CASO = [
  { metodo: 'Newton-Raphson', resultado: '2 iteraciones → 6 cifras decimales correctas', variante: 'navy' as const },
  { metodo: 'Secante', resultado: '6 iteraciones → 5 cifras decimales', variante: 'teal' as const },
  { metodo: 'Punto Fijo (g = (x+2)^(1/3))', resultado: '3 iteraciones → 3 cifras', variante: 'amber-solid' as const },
  { metodo: 'Regula Falsi', resultado: '4 iteraciones → 2 cifras (extremo b estancado)', variante: 'amber' as const },
];

@Component({
  selector: 'app-teoria',
  imports: [UiCard, Badge, Btn],
  templateUrl: './teoria.html',
  styleUrl: './teoria.scss',
})
export class Teoria {
  readonly conceptosError = CONCEPTOS_ERROR;
  readonly conceptosExtra = CONCEPTOS_EXTRA;
  readonly fundamentos = FUNDAMENTOS;
  readonly metodos = METODOS;
  readonly criterios = CRITERIOS_PARADA;
  readonly tolerancias = TOLERANCIAS;
  readonly comparacionHeaders = COMPARACION_HEADERS;
  readonly comparacion = COMPARACION;
  readonly caso = COMPARACION_CASO;
}