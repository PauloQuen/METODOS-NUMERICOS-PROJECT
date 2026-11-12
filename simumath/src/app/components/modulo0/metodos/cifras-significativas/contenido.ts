import type { Columna, PreguntaCuestionarioAuto } from '../../../../shared/models/metodo.model';
import type {
  CampoCalculadoraError,
  EjemploError,
  EjercicioError,
  RespuestaCalculadoraError,
  TeoriaError,
} from '../../modelos/modulo0.model';
import {
  numero,
  parsearEntero,
  parsearNumero,
  porcentaje,
  relativoTexto,
} from '../../algoritmos/formato';
import {
  redondearCifrasSignificativas,
  type ResultadoCifras,
} from '../../algoritmos/errores.algoritmos';

/* ------------------------------------------------------------------ */
/* Tabla                                                               */
/* ------------------------------------------------------------------ */

export const COLUMNAS_CIFRAS: Columna[] = [
  { key: 'valor', label: 'Valor original', align: 'right', monoespaciado: true },
  { key: 'redondeado', label: 'Redondeado', align: 'right', monoespaciado: true },
  { key: 'errorAbs', label: 'Error absoluto', align: 'right', monoespaciado: true },
  { key: 'errorRel', label: 'Error relativo', align: 'right', monoespaciado: true },
];

function filaCifras(valor: number, resultado: ResultadoCifras): Record<string, number | string> {
  return {
    valor: numero(valor, 10),
    redondeado: numero(resultado.redondeado, 10),
    errorAbs: numero(resultado.errorAbsoluto, 10),
    errorRel: porcentaje(resultado.errorRelativo),
  };
}

/** Media unidad de la última cifra conservada. */
function mediaUnidad(redondeado: number, cifras: number): number {
  if (redondeado === 0) return Number.NaN;
  const exponente = Math.floor(Math.log10(Math.abs(redondeado))) - (cifras - 1);
  return Math.pow(10, exponente) / 2;
}

/* ------------------------------------------------------------------ */
/* Teoría                                                              */
/* ------------------------------------------------------------------ */

const NORMAL = redondearCifrasSignificativas(123.456789, 4);
const CASO = redondearCifrasSignificativas(0.00314159, 3);

const TEORIA_NORMAL: EjemploError = {
  id: 'cifras-teoria-numerico',
  titulo: 'Redondear 123,456789 a cuatro cifras significativas',
  tipo: 'numerico',
  planteamiento:
    'Se quiere conservar cuatro cifras significativas del número 123,456789. Las cifras son 1, 2, 3 y 4; la siguiente es 5, así que la última conservada sube.',
  parametros: [
    { etiqueta: 'Valor', valor: '123,456789' },
    { etiqueta: 'Cifras significativas', valor: '4' },
  ],
  interpretacion:
    'El resultado no es “más exacto” que el dato: es una versión con menos cifras. El error mide cuánto se apartó esa versión del valor original.',
  pasos: [
    'Contar desde el primer dígito distinto de cero: 1, 2, 3, 4.',
    'Mirar la cifra que sigue: es 5, entonces la cuarta cifra (4) sube a 5.',
    'Escribir el número con las cifras conservadas: 123,5.',
    'Calcular el error absoluto: |123,456789 − 123,5| = 0,043211.',
    'Dividir por el valor original para obtener el error relativo: 0,00035, o 0,035 %.',
  ],
  algoritmo:
    'Se multiplica o divide por una potencia de 10 hasta dejar n cifras delante de la coma, se redondea al entero más cercano y se deshace el desplazamiento.',
  criterio:
    'El error absoluto no debe superar media unidad de la última cifra conservada: 0,05 para 123,5.',
  conclusion: `El valor redondeado es ${numero(NORMAL.redondeado)} y el error absoluto es ${numero(NORMAL.errorAbsoluto)}. Es menor que 0,05, así que la cuarta cifra es confiable dentro de la convención de redondeo.`,
  tabla: { columnas: COLUMNAS_CIFRAS, filas: [filaCifras(123.456789, NORMAL)] },
};

const TEORIA_CASO: EjemploError = {
  id: 'cifras-teoria-casuistica',
  titulo: 'Una lectura de 0,00314159 m con tres cifras',
  tipo: 'casuistica',
  enunciado:
    'Un calibre reporta 0,00314159 m. El instrumento solo garantiza tres cifras significativas, así que no tiene sentido arrastrar todos los decimales a la hoja de cálculo.',
  planteamiento:
    'Redondear la lectura a tres cifras significativas e informar cuánto se perdió frente al valor leído.',
  parametros: [
    { etiqueta: 'Lectura', valor: '0,00314159 m' },
    { etiqueta: 'Cifras confiables', valor: '3' },
  ],
  extraccion: {
    busqueda: 'La lectura del instrumento y la cantidad de cifras que el instrumento garantiza.',
    datos: [
      { simbolo: 'x', valor: '0,00314159 m', queEs: 'lectura directa' },
      { simbolo: 'n', valor: '3', queEs: 'cifras significativas confiables' },
    ],
    formulacion: 'Redondear x a n cifras y comparar el resultado con la lectura original.',
  },
  interpretacion:
    'Los ceros a la izquierda no cuentan como cifras significativas. Las tres cifras son 3, 1 y 4; la siguiente es 1, así que no se sube la última.',
  pasos: [
    'Identificar las cifras significativas: 3, 1 y 4 (los ceros iniciales solo ubican la coma).',
    'Mirar la siguiente cifra: 1, menor que 5; la última cifra conservada no cambia.',
    'Escribir 0,00314 m.',
    'Calcular el error absoluto: |0,00314159 − 0,00314| = 0,00000159 m.',
    'Expresar el error relativo: 0,000506, aproximadamente 0,0506 %.',
  ],
  algoritmo:
    'Se aplica el mismo redondeo a n cifras significativas; el contexto del instrumento solo decide cuántas cifras tiene sentido conservar.',
  criterio:
    'La última cifra conservada es la de las centésimas de milímetro; media unidad de esa cifra es 0,000005 m. El error de 0,00000159 m queda por debajo.',
  conclusion: `La lectura se reporta como ${numero(CASO.redondeado, 10)} m. El error absoluto es ${numero(CASO.errorAbsoluto, 10)} m y el relativo es ${porcentaje(CASO.errorRelativo)}.`,
  tabla: { columnas: COLUMNAS_CIFRAS, filas: [filaCifras(0.00314159, CASO)] },
};

export const TEORIA_CIFRAS: TeoriaError = {
  concepto:
    'Las cifras significativas son las que aportan información sobre la magnitud: desde el primer dígito distinto de cero hasta la última cifra que el instrumento o el cálculo permiten defender. Redondear es reemplazar un número por otro cercano con menos cifras; truncar es cortar sin mirar la siguiente. No son lo mismo, y confundirlos inventa o destruye precisión.',
  fundamento:
    'Un número real casi nunca se puede guardar completo. La computadora usa una cantidad finita de bits y el instrumento tiene una resolución limitada. Al escribir 0,00314159 con tres cifras significativas se conserva 0,00314: la información que sobra se descarta, pero se informa cuánto se movió el valor. La convención “media unidad de la última cifra” traduce esa pérdida a una cota: si la última cifra es la de las diezmilésimas, el redondeo no debería mover el valor más de 0,00005.',
  cuandoFalla:
    'Redondear no arregla un dato mal medido: si el instrumento tiene dos cifras confiables, escribir seis decimales no las vuelve reales. También falla cuando se redondea varias veces en una cadena de cálculos: los errores se acumulan y el resultado final puede apartarse más de lo que sugiere la última cifra. Y los ceros son traicioneros: 2,50 tiene tres cifras significativas; 2,5 tiene dos, aunque numéricamente sean iguales.',
  precision:
    'Para n cifras significativas, el error absoluto de un redondeo correcto es, como máximo, media unidad de la última cifra conservada. El error relativo máximo es aproximadamente 0,5 · 10^(1−n) / |x| cuando se escribe en notación científica; por eso una cifra más reduce el error relativo en un factor cercano a 10.',
  recursos: [
    {
      titulo: 'Cifra significativa (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Cifra_significativa',
      tipo: 'lectura',
      descripcion: 'La definición, las reglas para contar cifras y los ceros que no cuentan.',
    },
    {
      titulo: 'Redondeo (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Redondeo',
      tipo: 'lectura',
      descripcion: 'Redondeo al par, redondeo hacia arriba y por qué las convenciones importan.',
    },
    {
      titulo: 'Coma flotante (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Coma_flotante',
      tipo: 'lectura',
      descripcion: 'Cómo guarda la computadora los reales y de dónde sale el error de representación.',
    },
  ],
  algoritmo: {
    formula: 'x̃ = flₙ(x);  |x − x̃| ≤ 0,5 · 10^(e−n+1)',
    criterios: [
      {
        nombre: 'Contar desde el primer dígito no nulo',
        explicacion:
          'Los ceros a la izquierda solo ubican la coma. Los ceros a la derecha sí cuentan si el instrumento los reporta.',
      },
      {
        nombre: 'Mirar la cifra siguiente',
        explicacion:
          'Si es 5 o más, la última cifra conservada sube; si es menor que 5, se queda igual. En el empate exacto se puede usar la regla del par.',
      },
      {
        nombre: 'Comparar con media unidad',
        explicacion:
          'La cota de error sirve para decidir si el redondeo fue razonable, no para afirmar que el dato original era exacto.',
      },
    ],
    pasos: [
      'Identificar el primer dígito distinto de cero.',
      'Contar n cifras desde ahí, incluyendo la última que se conserva.',
      'Mirar la cifra inmediatamente siguiente.',
      'Redondear y completar con ceros solo si son significativos.',
      'Calcular el error absoluto y relativo respecto del valor original.',
    ],
    ventajas: [
      'Comunica de inmediato cuánta precisión se puede defender.',
      'Evita arrastrar decimales que el instrumento nunca midió.',
      'Es una operación simple y repetible, fácil de auditar.',
    ],
    limitaciones: [
      'No corrige errores sistemáticos ni calibración defectuosa.',
      'Redondear en cada paso puede acumular una desviación mayor que la cota de un solo redondeo.',
      'La cantidad de cifras “correctas” depende del contexto y del instrumento, no solo del número.',
    ],
    recomendaciones: [
      'Conserva más cifras en los pasos intermedios y redondea al final.',
      'Reporta la unidad y la incertidumbre junto con el valor; un número sin escala dice poco.',
      'No escribas más cifras que las que el instrumento o el método pueden justificar.',
    ],
  },
  ejemploNormal: TEORIA_NORMAL,
  ejemploCasuistica: TEORIA_CASO,
};

/* ------------------------------------------------------------------ */
/* Ejemplos                                                            */
/* ------------------------------------------------------------------ */

const EJ1 = redondearCifrasSignificativas(9.87654, 3);
const EJ2 = redondearCifrasSignificativas(0.000123456, 4);
const EJ3 = redondearCifrasSignificativas(12.3456, 4);
const EJ4 = redondearCifrasSignificativas(230.67, 3);

export const EJEMPLOS_CIFRAS: EjemploError[] = [
  {
    id: 'cifras-ejemplo-1',
    titulo: '9,87654 con tres cifras significativas',
    tipo: 'numerico',
    planteamiento: 'Redondear 9,87654 a tres cifras significativas y medir la pérdida.',
    parametros: [
      { etiqueta: 'Valor', valor: '9,87654' },
      { etiqueta: 'Cifras', valor: '3' },
    ],
    interpretacion:
      'Las tres cifras son 9, 8 y 7. La siguiente es 6, así que la última conservada sube de 7 a 8.',
    pasos: [
      'Contar 9, 8 y 7.',
      'Mirar la cifra siguiente: 6 ≥ 5.',
      'Redondear: 9,88.',
      'Error absoluto: |9,87654 − 9,88| = 0,00346.',
      'Error relativo: 0,00346 / 9,87654 ≈ 0,000350, o 0,0350 %.',
    ],
    algoritmo: 'Redondear a tres cifras y comparar con el valor original.',
    criterio: 'Media unidad de la última cifra (centésimas) es 0,005; el error es menor.',
    conclusion: `El valor queda en ${numero(EJ1.redondeado)}; el error absoluto es ${numero(EJ1.errorAbsoluto)} y el relativo ${porcentaje(EJ1.errorRelativo)}.`,
    tabla: { columnas: COLUMNAS_CIFRAS, filas: [filaCifras(9.87654, EJ1)] },
  },
  {
    id: 'cifras-ejemplo-2',
    titulo: 'Un número pequeño: 0,000123456 con cuatro cifras',
    tipo: 'numerico',
    planteamiento:
      'Redondear 0,000123456 a cuatro cifras significativas. Los ceros iniciales no cuentan; las cifras son 1, 2, 3 y 4.',
    parametros: [
      { etiqueta: 'Valor', valor: '0,000123456' },
      { etiqueta: 'Cifras', valor: '4' },
    ],
    interpretacion:
      'La cifra siguiente es 5, así que la cuarta cifra (4) sube a 5. El resultado conserva el orden de magnitud.',
    pasos: [
      'Ubicar el primer dígito no nulo: el 1 después de los ceros.',
      'Contar cuatro cifras: 1, 2, 3, 4.',
      'Mirar la siguiente: 5; redondear hacia arriba.',
      'Resultado: 0,0001235.',
      'Error absoluto: 0,000000044; relativo: 0,000356, o 0,0356 %.',
    ],
    algoritmo: 'Se redondea a cuatro cifras significativas, no a cuatro decimales.',
    criterio: 'La última cifra es la de las diezmillonésimas; media unidad es 0,00000005.',
    conclusion: `El valor redondeado es ${numero(EJ2.redondeado, 10)}. El error absoluto es ${numero(EJ2.errorAbsoluto, 12)} y el relativo ${porcentaje(EJ2.errorRelativo)}.`,
    tabla: { columnas: COLUMNAS_CIFRAS, filas: [filaCifras(0.000123456, EJ2)] },
  },
  {
    id: 'cifras-ejemplo-3',
    titulo: 'Una masa de 12,3456 g con cuatro cifras',
    tipo: 'casuistica',
    enunciado:
      'Una balanza reporta 12,3456 g, pero su resolución efectiva permite confiar en cuatro cifras significativas. Se quiere informar la masa sin aparentar más precisión.',
    planteamiento: 'Redondear la masa a cuatro cifras significativas e informar la pérdida.',
    parametros: [
      { etiqueta: 'Masa', valor: '12,3456 g' },
      { etiqueta: 'Cifras confiables', valor: '4' },
    ],
    extraccion: {
      busqueda: 'La masa reportada y la cantidad de cifras que la balanza permite confiar.',
      datos: [
        { simbolo: 'm', valor: '12,3456 g', queEs: 'lectura de la balanza' },
        { simbolo: 'n', valor: '4', queEs: 'cifras significativas' },
      ],
      formulacion: 'Redondear m a n cifras significativas.',
    },
    interpretacion:
      'Las cifras son 1, 2, 3 y 4; la siguiente es 5, así que la cuarta sube a 5. La masa se reporta como 12,35 g.',
    pasos: [
      'Contar desde el 1: 1, 2, 3 y 4.',
      'La cifra siguiente es 5: subir la última conservada.',
      'Resultado: 12,35 g.',
      'Error absoluto: |12,3456 − 12,35| = 0,0044 g.',
      'Error relativo: 0,0044 / 12,3456 ≈ 0,000356, o 0,0356 %.',
    ],
    algoritmo: 'Redondear la lectura a cuatro cifras y conservar la unidad.',
    criterio: 'La última cifra es la de las centésimas de gramo; media unidad es 0,005 g.',
    conclusion: `La masa se informa como ${numero(EJ3.redondeado)} g; el error absoluto es ${numero(EJ3.errorAbsoluto)} g y el relativo ${porcentaje(EJ3.errorRelativo)}.`,
    tabla: { columnas: COLUMNAS_CIFRAS, filas: [filaCifras(12.3456, EJ3)] },
  },
  {
    id: 'cifras-ejemplo-4',
    titulo: 'Una tensión de 230,67 V con tres cifras',
    tipo: 'casuistica',
    enunciado:
      'Un multímetro muestra 230,67 V. En el rango usado, la lectura confiable es de tres cifras significativas. ¿Cómo se reporta y cuánto se pierde?',
    planteamiento: 'Redondear 230,67 V a tres cifras significativas.',
    parametros: [
      { etiqueta: 'Tensión', valor: '230,67 V' },
      { etiqueta: 'Cifras confiables', valor: '3' },
    ],
    extraccion: {
      busqueda: 'La lectura del multímetro y las cifras confiables del rango.',
      datos: [
        { simbolo: 'V', valor: '230,67 V', queEs: 'lectura del instrumento' },
        { simbolo: 'n', valor: '3', queEs: 'cifras significativas' },
      ],
      formulacion: 'Redondear V a tres cifras significativas.',
    },
    interpretacion:
      'Las tres cifras son 2, 3 y 0. La siguiente es 6, así que el 0 sube a 1 y se obtiene 231 V.',
    pasos: [
      'Contar 2, 3 y 0.',
      'Mirar la siguiente cifra: 6 ≥ 5.',
      'Redondear: 231 V.',
      'Error absoluto: |230,67 − 231| = 0,33 V.',
      'Error relativo: 0,33 / 230,67 ≈ 0,00143, o 0,143 %.',
    ],
    algoritmo: 'Se redondea a tres cifras significativas; el cero final del 230 no se conserva porque deja de ser significativo al redondear.',
    criterio: 'La última cifra es la de las unidades de voltio; media unidad es 0,5 V.',
    conclusion: `La tensión se reporta como ${numero(EJ4.redondeado)} V. El error absoluto es ${numero(EJ4.errorAbsoluto)} V y el relativo ${porcentaje(EJ4.errorRelativo)}.`,
    tabla: { columnas: COLUMNAS_CIFRAS, filas: [filaCifras(230.67, EJ4)] },
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

const E1 = redondearCifrasSignificativas(45.6789, 4);
const E2 = redondearCifrasSignificativas(0.0045678, 2);
const E3 = redondearCifrasSignificativas(37.456, 3);

export const EJERCICIOS_CIFRAS: EjercicioError[] = [
  {
    id: 'cifras-ejercicio-1',
    titulo: 'Redondear 45,6789 a cuatro cifras',
    tipo: 'numerico',
    planteamiento: 'Redondea 45,6789 a cuatro cifras significativas.',
    parametros: [
      { etiqueta: 'Valor', valor: '45,6789' },
      { etiqueta: 'Cifras', valor: '4' },
    ],
    interpretacion: 'Las cifras son 4, 5, 6 y 7; la siguiente es 8.',
    pasos: ['Contar cuatro cifras.', 'Mirar la siguiente: 8.', 'Redondear: 45,68.'],
    algoritmo: 'Redondear a n cifras significativas.',
    criterio: 'La última cifra conservada es la de las centésimas.',
    conclusion: `El resultado es ${numero(E1.redondeado)}; el error absoluto es ${numero(E1.errorAbsoluto)}.`,
    tabla: { columnas: COLUMNAS_CIFRAS, filas: [filaCifras(45.6789, E1)] },
    pista: 'La cifra que decide es la quinta: 8. Si es 5 o más, la cuarta sube.',
    cuestionario: [
      pregunta(
        'cifras-e1-q1',
        '¿Cuál es la cuarta cifra significativa de 45,6789?',
        [
          { id: 'a', texto: '5' },
          { id: 'b', texto: '7' },
          { id: 'c', texto: '8' },
        ],
        'b',
        'Las cifras son 4 (1.ª), 5 (2.ª), 6 (3.ª) y 7 (4.ª). El 8 es la siguiente.',
      ),
      pregunta(
        'cifras-e1-q2',
        '¿Qué pasa con la cuarta cifra al redondear?',
        [
          { id: 'a', texto: 'Se queda en 7 porque la siguiente es 8.' },
          { id: 'b', texto: 'Sube a 8 porque la siguiente es 8.' },
          { id: 'c', texto: 'Desaparece porque hay que dejar cuatro decimales.' },
        ],
        'b',
        'Como la cifra siguiente es 8, la última conservada sube: 45,68.',
      ),
    ],
    resolucion: {
      valorCorrecto: E1.redondeado,
      tolerancia: 1e-6,
      etiqueta: 'Valor redondeado',
      respuestaFinalTexto: numero(E1.redondeado),
    },
    formatoRespuesta: 'escalar',
  },
  {
    id: 'cifras-ejercicio-2',
    titulo: 'Dos cifras para 0,0045678',
    tipo: 'numerico',
    planteamiento: 'Redondea 0,0045678 a dos cifras significativas.',
    parametros: [
      { etiqueta: 'Valor', valor: '0,0045678' },
      { etiqueta: 'Cifras', valor: '2' },
    ],
    interpretacion: 'Los ceros iniciales no cuentan; las cifras son 4 y 5.',
    pasos: ['Ubicar el 4.', 'Contar 4 y 5.', 'La siguiente es 6: subir el 5.'],
    algoritmo: 'Redondear a dos cifras significativas.',
    criterio: 'La última cifra es la de las milésimas.',
    conclusion: `El resultado es ${numero(E2.redondeado, 10)}; el error absoluto es ${numero(E2.errorAbsoluto, 12)}.`,
    tabla: { columnas: COLUMNAS_CIFRAS, filas: [filaCifras(0.0045678, E2)] },
    pista: 'No cuentes los tres ceros de la izquierda. Empieza en el 4.',
    cuestionario: [
      pregunta(
        'cifras-e2-q1',
        '¿Cuántas cifras significativas tiene 0,0045678?',
        [
          { id: 'a', texto: 'Cuatro: 4, 5, 6 y 7.' },
          { id: 'b', texto: 'Siete: todos los dígitos.' },
          { id: 'c', texto: 'Tres: solo los ceros.' },
        ],
        'a',
        'Los ceros a la izquierda solo ubican la coma; las cifras son 4, 5, 6, 7 y 8.',
      ),
      pregunta(
        'cifras-e2-q2',
        'Al conservar dos cifras, ¿cuál es el resultado?',
        [
          { id: 'a', texto: '0,0045' },
          { id: 'b', texto: '0,0046' },
          { id: 'c', texto: '0,005' },
        ],
        'b',
        'Las dos primeras cifras son 4 y 5; la siguiente es 6, así que el 5 sube a 6: 0,0046.',
      ),
    ],
    resolucion: {
      valorCorrecto: E2.redondeado,
      tolerancia: 1e-9,
      etiqueta: 'Valor redondeado',
      respuestaFinalTexto: numero(E2.redondeado, 10),
    },
    formatoRespuesta: 'escalar',
  },
  {
    id: 'cifras-ejercicio-3',
    titulo: 'Informar una temperatura de 37,456 °C',
    tipo: 'casuistica',
    enunciado:
      'Un termómetro digital marca 37,456 °C, pero el fabricante garantiza tres cifras significativas. La ficha clínica solo necesita esa precisión.',
    planteamiento: 'Redondea la temperatura a tres cifras significativas e informa el error absoluto.',
    parametros: [
      { etiqueta: 'Temperatura', valor: '37,456 °C' },
      { etiqueta: 'Cifras confiables', valor: '3' },
    ],
    extraccion: {
      busqueda: 'La lectura del termómetro y las cifras que el fabricante garantiza.',
      datos: [
        { simbolo: 'T', valor: '37,456 °C', queEs: 'lectura del termómetro' },
        { simbolo: 'n', valor: '3', queEs: 'cifras significativas' },
      ],
      formulacion: 'Redondear T a tres cifras significativas.',
    },
    interpretacion: 'Las cifras son 3, 7 y 4; la siguiente es 5, así que el 4 sube a 5.',
    pasos: ['Contar 3, 7 y 4.', 'La siguiente es 5: subir.', 'Resultado: 37,5 °C.'],
    algoritmo: 'Redondear a tres cifras y conservar la unidad.',
    criterio: 'La última cifra es la de las décimas de grado; media unidad es 0,05 °C.',
    conclusion: `La temperatura se reporta como ${numero(E3.redondeado)} °C; el error absoluto es ${numero(E3.errorAbsoluto)} °C.`,
    tabla: { columnas: COLUMNAS_CIFRAS, filas: [filaCifras(37.456, E3)] },
    pista: 'El dato 37,456 tiene cinco cifras; solo conservas tres.',
    cuestionario: [
      pregunta(
        'cifras-e3-q1',
        '¿Cuál es la última cifra que se conserva al usar tres cifras significativas?',
        [
          { id: 'a', texto: 'El 3.' },
          { id: 'b', texto: 'El 7.' },
          { id: 'c', texto: 'El 4.' },
        ],
        'c',
        'En 37,456 las tres primeras cifras son 3, 7 y 4.',
      ),
      pregunta(
        'cifras-e3-q2',
        '¿Por qué se reporta 37,5 y no 37,456?',
        [
          { id: 'a', texto: 'Porque el instrumento solo garantiza tres cifras.' },
          { id: 'b', texto: 'Porque los decimales siempre se eliminan.' },
          { id: 'c', texto: 'Porque 37,456 es un número impar.' },
        ],
        'a',
        'Reportar más cifras de las confiables aparenta una precisión que el instrumento no tiene.',
      ),
    ],
    resolucion: {
      valorCorrecto: E3.redondeado,
      tolerancia: 1e-6,
      etiqueta: 'Temperatura redondeada',
      unidad: '°C',
      respuestaFinalTexto: `${numero(E3.redondeado)} °C`,
    },
    formatoRespuesta: 'escalar',
  },
];

/* ------------------------------------------------------------------ */
/* Calculadora                                                         */
/* ------------------------------------------------------------------ */

export const CAMPOS_CIFRAS: CampoCalculadoraError[] = [
  {
    key: 'valor',
    etiqueta: 'Valor original',
    ayuda: 'El número que quieres redondear. Puedes usar coma o punto decimal.',
    requisito: 'Número finito.',
    valorInicial: '123.456789',
    tipo: 'text',
    placeholder: '123.456789',
  },
  {
    key: 'cifras',
    etiqueta: 'Cifras significativas',
    ayuda: 'Cuántas cifras confiables quieres conservar, desde la primera distinta de cero.',
    requisito: 'Entero entre 1 y 15.',
    valorInicial: '4',
    tipo: 'number',
    placeholder: '4',
  },
];

export function calcularCifras(valores: Record<string, string>): RespuestaCalculadoraError {
  const valor = parsearNumero(valores['valor'] ?? '');
  const cifras = parsearEntero(valores['cifras'] ?? '');

  if (valor === null) {
    return { exito: false, conclusion: 'Escribe un valor numérico válido para redondear.' };
  }
  if (cifras === null || cifras < 1 || cifras > 15) {
    return {
      exito: false,
      conclusion: 'La cantidad de cifras significativas debe ser un entero entre 1 y 15.',
    };
  }

  try {
    const resultado = redondearCifrasSignificativas(valor, cifras);
    const limite = mediaUnidad(resultado.redondeado, cifras);
    const cabe = Number.isFinite(limite)
      ? resultado.errorAbsoluto <= limite + 1e-15
      : resultado.errorAbsoluto === 0;
    const lectura = Number.isFinite(resultado.errorRelativo)
      ? `${porcentaje(resultado.errorRelativo)} de error relativo.`
      : 'El error relativo no está definido porque el valor original es 0.';

    return {
      exito: true,
      resultado: numero(resultado.redondeado, 10),
      etiquetaResultado: 'Valor redondeado',
      detalle: numero(resultado.errorAbsoluto, 12),
      etiquetaDetalle: 'Error absoluto',
      conclusion:
        `${lectura} ` +
        (Number.isFinite(limite)
          ? `El error absoluto ${cabe ? 'no supera' : 'supera'} media unidad de la última cifra (${numero(limite, 12)}).`
          : 'No hay una última cifra distinta de cero para comparar.'),
      filas: [filaCifras(valor, resultado)],
      columnas: COLUMNAS_CIFRAS,
    };
  } catch (error) {
    return {
      exito: false,
      conclusion: error instanceof Error ? error.message : 'No se pudo completar el redondeo.',
    };
  }
}

/** Se exporta para las pruebas de contenido. */
export { relativoTexto };
