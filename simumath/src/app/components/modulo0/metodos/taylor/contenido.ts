import type { Columna, PreguntaCuestionarioAuto } from '../../../../shared/models/metodo.model';
import type {
  CampoCalculadoraError,
  EjemploError,
  EjercicioError,
  RespuestaCalculadoraError,
  TeoriaError,
} from '../../modelos/modulo0.model';
import { numero, parsearEntero, parsearNumero, porcentaje } from '../../algoritmos/formato';
import {
  taylorExp,
  type ResultadoTaylor,
  type TerminoTaylor,
} from '../../algoritmos/errores.algoritmos';

/* ------------------------------------------------------------------ */
/* Tabla                                                               */
/* ------------------------------------------------------------------ */

export const COLUMNAS_TAYLOR: Columna[] = [
  { key: 'k', label: 'Término k', align: 'right', monoespaciado: true },
  { key: 'termino', label: 'Aporte del término', align: 'right', monoespaciado: true },
  { key: 'suma', label: 'Suma acumulada', align: 'right', monoespaciado: true },
  { key: 'errorAbs', label: 'Error absoluto', align: 'right', monoespaciado: true },
];

function filaTermino(t: TerminoTaylor): Record<string, number | string> {
  return {
    k: String(t.k),
    termino: numero(t.termino, 10),
    suma: numero(t.acumulado, 10),
    errorAbs: numero(t.errorAbsoluto, 8),
  };
}

function filasTaylor(resultado: ResultadoTaylor): Record<string, number | string>[] {
  return resultado.terminos.map(filaTermino);
}

/* ------------------------------------------------------------------ */
/* Teoría                                                              */
/* ------------------------------------------------------------------ */

const NORMAL = taylorExp(1, 0, 4);
const CASO = taylorExp(0.5, 0, 3);

const TEORIA_NORMAL: EjemploError = {
  id: 'taylor-teoria-numerico',
  titulo: 'Aproximar e¹ con cuatro términos de Taylor',
  tipo: 'numerico',
  planteamiento:
    'Se desarrolla e^x alrededor de a = 0 y se corta en el término de grado 4. Hay que estimar e¹ y comparar con la referencia numérica.',
  parametros: [
    { etiqueta: 'x', valor: '1' },
    { etiqueta: 'Centro a', valor: '0' },
    { etiqueta: 'Grado n', valor: '4' },
  ],
  interpretacion:
    'El polinomio suma 1 + x + x²/2! + x³/3! + x⁴/4!. En x = 1 suma 2,708333; la referencia numérica de e es 2,718282. El resto es lo que queda afuera al cortar la serie.',
  pasos: [
    'Escribir los términos hasta k = 4: 1, 1, 1/2, 1/6 y 1/24.',
    'Sumar: 1 + 1 + 0,5 + 0,166667 + 0,041667 = 2,708333.',
    'Restar la referencia: 2,718282 − 2,708333 = 0,009948.',
    'Acotar el resto: e^ξ · 1⁵/5!, con ξ entre 0 y 1; el máximo es e/120 ≈ 0,02265.',
    'Verificar que el error observado queda por debajo de la cota.',
  ],
  algoritmo:
    'Se evalúan los términos (x−a)^k/k! de forma acumulada y se suma hasta el grado pedido. La cota de Lagrange usa la derivada siguiente en el intervalo.',
  criterio:
    'El error real no se conoce sin evaluar e^x; la cota permite afirmar que el resto no supera e/120 sin depender de ese dato.',
  conclusion: `La aproximación es ${numero(NORMAL.suma)} y la referencia numérica es ${numero(NORMAL.real)}. El error absoluto es ${numero(NORMAL.errorAbsoluto)} y la cota del resto es ${numero(NORMAL.cotaResto)}.`,
  tabla: { columnas: COLUMNAS_TAYLOR, filas: filasTaylor(NORMAL) },
};

const TEORIA_CASO: EjemploError = {
  id: 'taylor-teoria-casuistica',
  titulo: 'Crecimiento continuo: aproximar e^0,5 con tres términos',
  tipo: 'casuistica',
  enunciado:
    'Un modelo de crecimiento usa e^0,5 para proyectar un factor. Para una estimación rápida se corta la serie de Taylor en el término de grado 3. ¿Cuánto se pierde?',
  planteamiento:
    'Aproximar e^0,5 con el desarrollo centrado en 0 hasta grado 3 y acotar el resto.',
  parametros: [
    { etiqueta: 'x', valor: '0,5' },
    { etiqueta: 'Centro a', valor: '0' },
    { etiqueta: 'Grado n', valor: '3' },
  ],
  extraccion: {
    busqueda: 'El exponente que aparece en el factor de crecimiento y el grado de corte.',
    datos: [
      { simbolo: 'x', valor: '0,5', queEs: 'exponente del factor' },
      { simbolo: 'a', valor: '0', queEs: 'centro del desarrollo' },
      { simbolo: 'n', valor: '3', queEs: 'último grado incluido' },
    ],
    formulacion: 'e^0,5 ≈ 1 + 0,5 + 0,5²/2! + 0,5³/3!; el resto se acota con Lagrange.',
  },
  interpretacion:
    'El término de grado 3 ya es pequeño (0,020833). La cota del resto es del orden de 0,0043, así que la aproximación sirve para una estimación de pocas cifras.',
  pasos: [
    'Términos: 1; 0,5; 0,125; 0,020833.',
    'Suma: 1,645833.',
    'Referencia numérica: 1,648721.',
    'Error observado: 0,002888.',
    'Cota: e^0,5 · 0,5⁴/4! ≈ 0,004294.',
  ],
  algoritmo:
    'Se usa el mismo desarrollo; el centro y el grado se eligen según la precisión que se necesita.',
  criterio:
    'La cota debe ser mayor o igual que el error observado. Acá 0,004294 > 0,002888, como exige el teorema.',
  conclusion: `La aproximación es ${numero(CASO.suma)} frente a ${numero(CASO.real)} de referencia. El error absoluto es ${numero(CASO.errorAbsoluto)} y la cota del resto es ${numero(CASO.cotaResto)}.`,
  tabla: { columnas: COLUMNAS_TAYLOR, filas: filasTaylor(CASO) },
};

export const TEORIA_TAYLOR: TeoriaError = {
  concepto:
    'La serie de Taylor reemplaza una función suave por un polinomio construido con sus derivadas en un punto. Para e^x es especialmente simple: todas las derivadas valen e^x, y en el centro a = 0 valen 1. Cortar la serie en el grado n deja un resto Rₙ, que es el error de truncamiento: no viene de la máquina, viene de haber decidido no sumar infinitos términos.',
  fundamento:
    'Cerca del centro, los términos (x−a)^k/k! se hacen cada vez más chicos y la suma se acerca a la función. El teorema de Taylor demuestra que la diferencia se puede escribir como el término siguiente evaluado en un punto ξ intermedio, no en el centro. Eso convierte “me quedé corto” en una cuenta concreta: para e^x, el resto es e^ξ · (x−a)^(n+1)/(n+1)!, y como e^ξ es creciente, se acota con el mayor de los extremos.',
  cuandoFalla:
    'El polinomio es una aproximación LOCAL. Si x está lejos del centro, el término (x−a)^(n+1) crece rápido y hacen falta muchos términos. Con x negativo, los términos alternan de signo y pueden cancelarse entre sí: la suma puede perder cifras por cancelación aunque el resto teórico sea chico. El error de truncamiento tampoco incluye el error de redondeo de cada operación; para valores muy grandes de x, ambos compiten.',
  precision:
    'Para e^x en el intervalo entre a y x, |Rₙ| ≤ e^max(a,x) · |x−a|^(n+1)/(n+1)!. La cota es conservadora: puede ser bastante mayor que el error real. No es una promesa de que el resultado tenga exactamente esa cantidad de cifras, sino un techo que el resto no supera si la aritmética fuera exacta.',
  recursos: [
    {
      titulo: 'Serie de Taylor (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Serie_de_Taylor',
      tipo: 'lectura',
      descripcion: 'La definición, los ejemplos y la relación con la aproximación local.',
    },
    {
      titulo: 'Teorema de Taylor (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Teorema_de_Taylor',
      tipo: 'lectura',
      descripcion: 'El resto de Lagrange y las formas de acotar el error de truncamiento.',
    },
  ],
  algoritmo: {
    formula: 'e^x ≈ Σₖ₌₀ⁿ (x−a)ᵏ/k!;  |Rₙ| ≤ e^max(a,x)·|x−a|ⁿ⁺¹/(n+1)!',
    criterios: [
      {
        nombre: 'Centro del desarrollo',
        explicacion:
          'Mientras más cerca esté x del centro, más rápido baja el término (x−a)^(n+1).',
      },
      {
        nombre: 'Grado del corte',
        explicacion:
          'Cada término adicional agrega una potencia y un factorial; el error baja, pero no gratis.',
      },
      {
        nombre: 'Cota del resto',
        explicacion:
          'Es un techo teórico. Se calcula con el máximo de la derivada siguiente en el intervalo, no con el valor en x.',
      },
    ],
    pasos: [
      'Elegir el centro a y el grado n.',
      'Calcular los términos (x−a)^k/k! de forma acumulada.',
      'Sumar hasta k = n.',
      'Acotar el resto con la derivada (n+1) y el intervalo.',
      'Comparar la cota con la precisión que pide el problema.',
    ],
    ventajas: [
      'Convierte una función complicada en sumas y productos.',
      'Da una cota explícita del error de truncamiento.',
      'Muestra por qué O(hⁿ) depende tanto de la distancia al centro.',
    ],
    limitaciones: [
      'La cota puede ser muy conservadora.',
      'Lejos del centro requiere muchos términos o un cambio de centro.',
      'No controla el error de redondeo de las operaciones.',
    ],
    recomendaciones: [
      'Desarrolla alrededor de un punto cercano al valor que vas a evaluar.',
      'No confundas el error observado con la cota: la cota es un techo.',
      'Para x negativo, revisa la cancelación además de la cota.',
    ],
  },
  ejemploNormal: TEORIA_NORMAL,
  ejemploCasuistica: TEORIA_CASO,
};

/* ------------------------------------------------------------------ */
/* Ejemplos                                                            */
/* ------------------------------------------------------------------ */

const EJ1 = taylorExp(2, 0, 5);
const EJ2 = taylorExp(-0.5, 0, 3);
const EJ3 = taylorExp(0.1, 0, 2);
const EJ4 = taylorExp(1.5, 0, 6);

export const EJEMPLOS_TAYLOR: EjemploError[] = [
  {
    id: 'taylor-ejemplo-1',
    titulo: 'e² con cinco términos',
    tipo: 'numerico',
    planteamiento: 'Aproximar e² con el desarrollo centrado en 0 hasta grado 5.',
    parametros: [
      { etiqueta: 'x', valor: '2' },
      { etiqueta: 'Centro', valor: '0' },
      { etiqueta: 'Grado', valor: '5' },
    ],
    interpretacion:
      'Los términos crecen hasta k = 2 y después empiezan a bajar. La suma de seis términos se acerca a e², pero la cota del resto todavía es grande.',
    pasos: [
      'Términos: 1, 2, 2, 1,333333, 0,666667 y 0,266667.',
      'Suma: 7,266667.',
      'Referencia numérica: 7,389056.',
      'Error: 0,122389.',
      'Cota: e² · 2⁶/6! ≈ 0,6568.',
    ],
    algoritmo: 'Suma acumulada de (2)^k/k! para k = 0..5.',
    criterio: 'La cota 0,6568 es mayor que el error observado 0,1224.',
    conclusion: `La aproximación es ${numero(EJ1.suma)} y el error observado ${numero(EJ1.errorAbsoluto)}. La cota del resto es ${numero(EJ1.cotaResto)}.`,
    tabla: { columnas: COLUMNAS_TAYLOR, filas: filasTaylor(EJ1) },
  },
  {
    id: 'taylor-ejemplo-2',
    titulo: 'e^(−0,5) con tres términos',
    tipo: 'numerico',
    planteamiento: 'Aproximar e^(−0,5) centrado en 0 hasta grado 3.',
    parametros: [
      { etiqueta: 'x', valor: '−0,5' },
      { etiqueta: 'Centro', valor: '0' },
      { etiqueta: 'Grado', valor: '3' },
    ],
    interpretacion:
      'Los términos alternan de signo. La suma queda en 0,604167, un poco por debajo de la referencia 0,606531.',
    pasos: [
      'Términos: 1; −0,5; 0,125; −0,020833.',
      'Suma: 0,604167.',
      'Referencia: 0,606531.',
      'Error: 0,002364.',
      'Cota: e⁰ · 0,5⁴/4! = 0,002604.',
    ],
    algoritmo: 'Se evalúa (x−a)^k/k! con x negativo; el signo alterna.',
    criterio: 'La cota 0,002604 supera apenas al error 0,002364.',
    conclusion: `La aproximación es ${numero(EJ2.suma)}; el error absoluto es ${numero(EJ2.errorAbsoluto)} y la cota ${numero(EJ2.cotaResto)}.`,
    tabla: { columnas: COLUMNAS_TAYLOR, filas: filasTaylor(EJ2) },
  },
  {
    id: 'taylor-ejemplo-3',
    titulo: 'e^0,1 con dos términos',
    tipo: 'casuistica',
    enunciado:
      'Para estimar el interés continuo de un periodo corto se usa e^0,1. Se quiere una aproximación de dos términos y saber si alcanza para tres cifras.',
    planteamiento: 'Aproximar e^0,1 con el desarrollo centrado en 0 hasta grado 2.',
    parametros: [
      { etiqueta: 'x', valor: '0,1' },
      { etiqueta: 'Centro', valor: '0' },
      { etiqueta: 'Grado', valor: '2' },
    ],
    extraccion: {
      busqueda: 'El exponente del factor y el grado de la aproximación.',
      datos: [
        { simbolo: 'x', valor: '0,1', queEs: 'exponente' },
        { simbolo: 'n', valor: '2', queEs: 'grado' },
      ],
      formulacion: 'e^0,1 ≈ 1 + 0,1 + 0,1²/2.',
    },
    interpretacion:
      'Con x cerca de 0, el término cuadrático ya es 0,005 y el cúbico 0,000167. La aproximación de grado 2 deja un error del orden de 0,00017.',
    pasos: [
      'Términos: 1, 0,1 y 0,005.',
      'Suma: 1,105.',
      'Referencia: 1,105170.',
      'Error: 0,000170.',
      'Cota: e^0,1 · 0,1³/6 ≈ 0,000184.',
    ],
    algoritmo: 'Se corta en grado 2; la cota usa la derivada tercera.',
    criterio: 'El error es menor que 0,0002, suficiente para tres decimales en este caso.',
    conclusion: `La aproximación ${numero(EJ3.suma)} deja un error de ${numero(EJ3.errorAbsoluto)}. La cota es ${numero(EJ3.cotaResto)}.`,
    tabla: { columnas: COLUMNAS_TAYLOR, filas: filasTaylor(EJ3) },
  },
  {
    id: 'taylor-ejemplo-4',
    titulo: 'e^1,5 con seis términos',
    tipo: 'casuistica',
    enunciado:
      'Un modelo de crecimiento evaluado en x = 1,5 necesita una aproximación de Taylor de grado 6. Se quiere ver cuánto mejora al agregar términos.',
    planteamiento: 'Aproximar e^1,5 centrado en 0 hasta grado 6.',
    parametros: [
      { etiqueta: 'x', valor: '1,5' },
      { etiqueta: 'Centro', valor: '0' },
      { etiqueta: 'Grado', valor: '6' },
    ],
    extraccion: {
      busqueda: 'El valor de x y el grado máximo del polinomio.',
      datos: [
        { simbolo: 'x', valor: '1,5', queEs: 'punto de evaluación' },
        { simbolo: 'n', valor: '6', queEs: 'grado del corte' },
      ],
      formulacion: 'e^1,5 ≈ Σₖ₌₀⁶ 1,5ᵏ/k!.',
    },
    interpretacion:
      'Al estar más lejos del centro que en los ejemplos anteriores, hacen falta más términos. La cota de grado 6 ya es del orden de 0,006, aunque el error observado es menor.',
    pasos: [
      'Calcular los siete términos y acumularlos.',
      'Comparar con la referencia numérica e^1,5.',
      'Calcular la cota con e^1,5 · 1,5⁷/7!.',
      'Verificar que la cota sea mayor que el error observado.',
    ],
    algoritmo: 'Misma suma acumulada, con x = 1,5 y n = 6.',
    criterio: 'La cota es un techo; no se exige que el error observado la iguale.',
    conclusion: `La aproximación es ${numero(EJ4.suma)}; el error absoluto ${numero(EJ4.errorAbsoluto)}; la cota ${numero(EJ4.cotaResto)}.`,
    tabla: { columnas: COLUMNAS_TAYLOR, filas: filasTaylor(EJ4) },
  },
];

/* ------------------------------------------------------------------ */
/* Ejercicios                                                          */
/* ------------------------------------------------------------------ */

function pregunta(
  id: string,
  enunciado: string,
  opciones: { id: string; texto: string }[],
  correcta: string,
  explicacion: string,
): PreguntaCuestionarioAuto {
  return { id, tipo: 'opcion-multiple', enunciado, opciones, correcta, explicacion };
}

const E1 = taylorExp(0.5, 0, 3);
const E2 = taylorExp(-1, 0, 4);
const E3 = taylorExp(2, 0, 4);

export const EJERCICIOS_TAYLOR: EjercicioError[] = [
  {
    id: 'taylor-ejercicio-1',
    titulo: 'Aproximar e^0,5 con grado 3',
    tipo: 'numerico',
    planteamiento: 'Suma los términos de Taylor de e^0,5 centrados en 0 hasta grado 3.',
    parametros: [
      { etiqueta: 'x', valor: '0,5' },
      { etiqueta: 'Centro', valor: '0' },
      { etiqueta: 'Grado', valor: '3' },
    ],
    interpretacion: 'La suma incluye k = 0, 1, 2 y 3.',
    pasos: ['1 + 0,5 + 0,125 + 0,020833.', 'Suma: 1,645833.'],
    algoritmo: 'Σ 0,5^k/k! para k = 0..3.',
    criterio: 'La referencia numérica es 1,648721; el error es 0,002888.',
    conclusion: `La aproximación es ${numero(E1.suma)}.`,
    tabla: { columnas: COLUMNAS_TAYLOR, filas: filasTaylor(E1) },
    pista: 'El término k = 3 es 0,5³/3! = 0,125/6.',
    cuestionario: [
      pregunta(
        'taylor-e1-q1',
        '¿Cuántos términos se suman si el grado es 3?',
        [
          { id: 'a', texto: 'Tres términos: k = 1, 2 y 3.' },
          { id: 'b', texto: 'Cuatro términos: k = 0, 1, 2 y 3.' },
          { id: 'c', texto: 'Solo el término de grado 3.' },
        ],
        'b',
        'La suma de Taylor empieza en k = 0, así que un grado 3 incluye cuatro términos.',
      ),
      pregunta(
        'taylor-e1-q2',
        '¿Cuál es el término de grado 3?',
        [
          { id: 'a', texto: '0,125' },
          { id: 'b', texto: '0,020833' },
          { id: 'c', texto: '0,5' },
        ],
        'b',
        '0,5³/3! = 0,125/6 ≈ 0,020833.',
      ),
    ],
    resolucion: {
      valorCorrecto: E1.suma,
      tolerancia: 1e-6,
      etiqueta: 'Aproximación de e^0,5',
      respuestaFinalTexto: numero(E1.suma),
    },
    formatoRespuesta: 'escalar',
  },
  {
    id: 'taylor-ejercicio-2',
    titulo: 'e^(−1) con cuatro términos',
    tipo: 'numerico',
    planteamiento: 'Aproxima e^(−1) con el desarrollo centrado en 0 hasta grado 4.',
    parametros: [
      { etiqueta: 'x', valor: '−1' },
      { etiqueta: 'Centro', valor: '0' },
      { etiqueta: 'Grado', valor: '4' },
    ],
    interpretacion: 'Los términos alternan: 1, −1, 0,5, −0,166667 y 0,041667.',
    pasos: ['Sumar con signos alternados.', 'Resultado: 0,375.'],
    algoritmo: 'Σ (−1)^k/k! para k = 0..4.',
    criterio: 'La referencia es 0,367879; el error es 0,007121.',
    conclusion: `La aproximación es ${numero(E2.suma)} y el error ${numero(E2.errorAbsoluto)}.`,
    tabla: { columnas: COLUMNAS_TAYLOR, filas: filasTaylor(E2) },
    pista: 'No olvides el signo: (−1)^k alterna entre + y −.',
    cuestionario: [
      pregunta(
        'taylor-e2-q1',
        '¿Por qué los términos cambian de signo?',
        [
          { id: 'a', texto: 'Porque x es negativo y las potencias alternan.' },
          { id: 'b', texto: 'Porque el factorial es negativo.' },
          { id: 'c', texto: 'Porque el centro no es cero.' },
        ],
        'a',
        'Con x = −1, x^k vale −1 en los impares y +1 en los pares.',
      ),
      pregunta(
        'taylor-e2-q2',
        '¿Qué término de grado 4 se suma?',
        [
          { id: 'a', texto: '−0,041667' },
          { id: 'b', texto: '0,041667' },
          { id: 'c', texto: '0,166667' },
        ],
        'b',
        '(−1)⁴/4! = 1/24 ≈ 0,041667; el signo es positivo.',
      ),
    ],
    resolucion: {
      valorCorrecto: E2.suma,
      tolerancia: 1e-6,
      etiqueta: 'Aproximación de e^(−1)',
      respuestaFinalTexto: numero(E2.suma),
    },
    formatoRespuesta: 'escalar',
  },
  {
    id: 'taylor-ejercicio-3',
    titulo: 'Una cota para e²',
    tipo: 'casuistica',
    enunciado:
      'Un equipo aproxima e² con Taylor de grado 4 centrado en 0. Antes de usar el resultado quiere saber qué techo teórico tiene el resto.',
    planteamiento: 'Calcular la cota de Lagrange del resto para x = 2, a = 0 y n = 4.',
    parametros: [
      { etiqueta: 'x', valor: '2' },
      { etiqueta: 'Centro', valor: '0' },
      { etiqueta: 'Grado', valor: '4' },
    ],
    extraccion: {
      busqueda: 'El punto de evaluación, el centro y el grado del corte.',
      datos: [
        { simbolo: 'x', valor: '2', queEs: 'punto de evaluación' },
        { simbolo: 'a', valor: '0', queEs: 'centro' },
        { simbolo: 'n', valor: '4', queEs: 'grado' },
      ],
      formulacion: '|R₄| ≤ e^2 · 2⁵/5!.',
    },
    interpretacion:
      'La cota usa el máximo de e^ξ en [0,2], que es e², y la distancia 2 elevada a 5.',
    pasos: ['e² ≈ 7,389056.', '2⁵ = 32.', '5! = 120.', 'Cota: 7,389056 · 32/120 ≈ 1,9704.'],
    algoritmo: 'Aplicar la fórmula del resto de Lagrange con la derivada quinta de e^x.',
    criterio: 'La cota es 1,9704; el error real de la suma de grado 4 es 0,389056.',
    conclusion: `La cota del resto es ${numero(E3.cotaResto)}; el error observado es ${numero(E3.errorAbsoluto)}.`,
    tabla: { columnas: COLUMNAS_TAYLOR, filas: filasTaylor(E3) },
    pista: 'En la cota va el máximo de e^ξ en el intervalo, no el valor en x = 0.',
    cuestionario: [
      pregunta(
        'taylor-e3-q1',
        '¿Qué valor de e^ξ se usa para acotar?',
        [
          { id: 'a', texto: 'e⁰ = 1, porque el centro es 0.' },
          { id: 'b', texto: 'e², porque es el máximo en [0, 2].' },
          { id: 'c', texto: 'e^0,5, porque ξ está en el medio.' },
        ],
        'b',
        'e^ξ es creciente; en [0,2] el máximo está en ξ = 2.',
      ),
      pregunta(
        'taylor-e3-q2',
        '¿Qué potencia de 2 aparece en la cota?',
        [
          { id: 'a', texto: '2⁴' },
          { id: 'b', texto: '2⁵' },
          { id: 'c', texto: '2⁶' },
        ],
        'b',
        'El resto de grado 4 usa la derivada quinta, entonces la potencia es n+1 = 5.',
      ),
    ],
    resolucion: {
      valorCorrecto: E3.cotaResto,
      tolerancia: 1e-3,
      etiqueta: 'Cota del resto',
      respuestaFinalTexto: numero(E3.cotaResto),
    },
    formatoRespuesta: 'escalar',
  },
];

/* ------------------------------------------------------------------ */
/* Calculadora                                                         */
/* ------------------------------------------------------------------ */

export const CAMPOS_TAYLOR: CampoCalculadoraError[] = [
  {
    key: 'x',
    etiqueta: 'Valor de x',
    ayuda: 'El punto donde quieres evaluar e^x.',
    requisito: 'Número finito.',
    valorInicial: '1',
    tipo: 'text',
    placeholder: '1',
  },
  {
    key: 'centro',
    etiqueta: 'Centro a',
    ayuda: 'El punto alrededor del cual se desarrolla la serie. Para e^x se suele usar 0.',
    requisito: 'Número finito.',
    valorInicial: '0',
    tipo: 'text',
    placeholder: '0',
  },
  {
    key: 'grado',
    etiqueta: 'Grado n',
    ayuda: 'Último grado incluido. La suma va desde k = 0 hasta k = n.',
    requisito: 'Entero entre 0 y 12.',
    valorInicial: '4',
    tipo: 'number',
    placeholder: '4',
  },
];

export function calcularTaylor(valores: Record<string, string>): RespuestaCalculadoraError {
  const x = parsearNumero(valores['x'] ?? '');
  const centro = parsearNumero(valores['centro'] ?? '');
  const grado = parsearEntero(valores['grado'] ?? '');

  if (x === null || centro === null) {
    return { exito: false, conclusion: 'Escribe valores numéricos válidos para x y el centro.' };
  }
  if (grado === null || grado < 0 || grado > 12) {
    return { exito: false, conclusion: 'El grado debe ser un entero entre 0 y 12.' };
  }

  try {
    const resultado = taylorExp(x, centro, grado);
    return {
      exito: true,
      resultado: numero(resultado.suma, 10),
      etiquetaResultado: 'Aproximación de e^x',
      detalle: numero(resultado.errorAbsoluto, 10),
      etiquetaDetalle: 'Error absoluto',
      conclusion:
        `La referencia numérica es e^x ≈ ${numero(resultado.real, 10)}. ` +
        `La cota del resto es ${numero(resultado.cotaResto)} y el error relativo ${porcentaje(resultado.errorRelativo)}.`,
      filas: filasTaylor(resultado),
      columnas: COLUMNAS_TAYLOR,
    };
  } catch (error) {
    return {
      exito: false,
      conclusion: error instanceof Error ? error.message : 'No se pudo calcular la serie.',
    };
  }
}
