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
  parsearNumero,
  porcentaje,
  relativoTexto,
} from '../../algoritmos/formato';
import {
  calcularErrores,
  type ResultadoErrores,
} from '../../algoritmos/errores.algoritmos';

/* ------------------------------------------------------------------ */
/* Tabla                                                               */
/* ------------------------------------------------------------------ */

export const COLUMNAS_ERRORES: Columna[] = [
  { key: 'verdadero', label: 'Valor de referencia', align: 'right', monoespaciado: true },
  { key: 'aproximado', label: 'Aproximación', align: 'right', monoespaciado: true },
  { key: 'errorAbs', label: 'Error absoluto', align: 'right', monoespaciado: true },
  { key: 'errorRel', label: 'Error relativo', align: 'right', monoespaciado: true },
  { key: 'errorPct', label: 'Error porcentual', align: 'right', monoespaciado: true },
];

function filaErrores(resultado: ResultadoErrores): Record<string, number | string> {
  return {
    verdadero: numero(resultado.verdadero, 10),
    aproximado: numero(resultado.aproximado, 10),
    errorAbs: numero(resultado.errorAbsoluto, 10),
    errorRel: relativoTexto(resultado.errorRelativo, 8),
    errorPct: porcentaje(resultado.errorRelativo),
  };
}

/* ------------------------------------------------------------------ */
/* Teoría                                                              */
/* ------------------------------------------------------------------ */

const NORMAL = calcularErrores(Math.PI, 3.14);
const CASO = calcularErrores(101.325, 101.2);

const TEORIA_NORMAL: EjemploError = {
  id: 'errores-teoria-numerico',
  titulo: 'Comparar π con la aproximación 3,14',
  tipo: 'numerico',
  planteamiento:
    'Se toma π = 3,141592653589793 como valor de referencia y 3,14 como aproximación. Hay que medir la diferencia en forma absoluta, relativa y porcentual.',
  parametros: [
    { etiqueta: 'Valor de referencia', valor: 'π ≈ 3,141592653589793' },
    { etiqueta: 'Aproximación', valor: '3,14' },
  ],
  interpretacion:
    'El error absoluto dice cuánto se apartó la aproximación en las mismas unidades. El relativo lo compara con el tamaño del valor verdadero; el porcentual es ese cociente multiplicado por 100.',
  pasos: [
    'Restar y tomar valor absoluto: |π − 3,14| ≈ 0,0015926536.',
    'Dividir por |π|: 0,0015926536 / 3,1415926536 ≈ 0,00050696.',
    'Multiplicar por 100: 0,050696 %.',
    'Leer: la aproximación se aparta poco más de cinco diezmilésimas del valor de referencia.',
  ],
  algoritmo:
    'Eₐ = |x − x̄|; Eᵣ = Eₐ / |x̄|; E% = 100 · Eᵣ. La barra sobre x indica el valor de referencia.',
  criterio:
    'No hay un umbral universal: que un error sea aceptable depende del problema. Lo que sí se puede afirmar es que 0,0507 % es pequeño frente al valor, aunque el error absoluto parezca “chico”.',
  conclusion: `Eₐ = ${numero(NORMAL.errorAbsoluto)}; Eᵣ = ${relativoTexto(NORMAL.errorRelativo, 8)}; E% = ${porcentaje(NORMAL.errorRelativo)}.`,
  tabla: { columnas: COLUMNAS_ERRORES, filas: [filaErrores(NORMAL)] },
};

const TEORIA_CASO: EjemploError = {
  id: 'errores-teoria-casuistica',
  titulo: 'Un manómetro de 101,2 kPa frente al patrón de 101,325 kPa',
  tipo: 'casuistica',
  enunciado:
    'Un manómetro indica 101,2 kPa. El laboratorio usa como referencia un patrón de 101,325 kPa. Se quiere reportar la diferencia de la lectura y su tamaño relativo.',
  planteamiento:
    'Calcular el error absoluto, relativo y porcentual de la lectura del manómetro respecto del patrón.',
  parametros: [
    { etiqueta: 'Patrón', valor: '101,325 kPa' },
    { etiqueta: 'Lectura', valor: '101,2 kPa' },
  ],
  extraccion: {
    busqueda: 'La lectura del instrumento y el valor del patrón que se toma como referencia.',
    datos: [
      { simbolo: 'x̄', valor: '101,325 kPa', queEs: 'valor de referencia' },
      { simbolo: 'x', valor: '101,2 kPa', queEs: 'lectura del manómetro' },
    ],
    formulacion: 'Eₐ = |x − x̄|; Eᵣ = Eₐ / |x̄|; E% = 100 · Eᵣ.',
  },
  interpretacion:
    'La lectura queda por debajo del patrón. El error absoluto conserva la unidad (kPa); el relativo es adimensional y permite comparar con otros instrumentos.',
  pasos: [
    'Diferencia: 101,325 − 101,2 = 0,125 kPa.',
    'Error relativo: 0,125 / 101,325 ≈ 0,0012336.',
    'Error porcentual: 0,12336 %.',
    'La lectura es un 0,123 % menor que el patrón.',
  ],
  algoritmo:
    'Se usa el patrón como x̄ y la lectura como x. El orden no cambia el error absoluto porque se toma valor absoluto.',
  criterio:
    'Para decidir si el instrumento es aceptable habría que comparar con su tolerancia nominal; este cálculo solo describe la diferencia observada.',
  conclusion: `Eₐ = ${numero(CASO.errorAbsoluto)} kPa; Eᵣ = ${relativoTexto(CASO.errorRelativo, 8)}; E% = ${porcentaje(CASO.errorRelativo)}.`,
  tabla: { columnas: COLUMNAS_ERRORES, filas: [filaErrores(CASO)] },
};

export const TEORIA_ERRORES: TeoriaError = {
  concepto:
    'El error es la diferencia entre un valor aproximado o medido y un valor de referencia. El error absoluto mide esa diferencia en las unidades del problema; el relativo la divide por el tamaño del valor de referencia, y el porcentual la expresa por cada 100. Los tres describen lo mismo, pero responden preguntas distintas.',
  fundamento:
    'Si una balanza se equivoca en 1 g al pesar 10 g, la diferencia es enorme (10 %). Si se equivoca en 1 g al pesar 10 kg, es pequeña (0,01 %). El error absoluto es el mismo, pero el relativo pone la diferencia en contexto. Por eso se usa el relativo para comparar instrumentos, iteraciones o magnitudes de distinto tamaño, y el absoluto cuando importa la diferencia física concreta.',
  cuandoFalla:
    'El error relativo no está definido si el valor de referencia es cero: no hay una escala contra la cual normalizar. Tampoco distingue un error sistemático (siempre hacia el mismo lado) de uno aleatorio (cambia de signo). Y comparar errores relativos de valores con signos distintos exige cuidado: se divide por el valor absoluto, pero la interpretación sigue dependiendo del contexto.',
  precision:
    'El error relativo es una medida de tamaño, no una garantía estadística. Un error de 1 % no significa que el próximo resultado vaya a fallar en 1 %; significa que esta comparación particular se apartó un 1 % del valor de referencia. Para hablar de incertidumbre hacen falta varias mediciones y un tratamiento estadístico, que excede este módulo.',
  recursos: [
    {
      titulo: 'Error de medición (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Error_de_medici%C3%B3n',
      tipo: 'lectura',
      descripcion: 'Error absoluto y relativo, exactitud, precisión e incertidumbre.',
    },
    {
      titulo: 'Análisis numérico (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/An%C3%A1lisis_num%C3%A9rico',
      tipo: 'lectura',
      descripcion: 'Dónde aparecen los errores de redondeo y truncamiento en los métodos.',
    },
  ],
  algoritmo: {
    formula: 'Eₐ = |x − x̄|;  Eᵣ = Eₐ/|x̄|;  E% = 100·Eᵣ',
    criterios: [
      {
        nombre: 'Valor de referencia',
        explicacion:
          'Puede ser un patrón, un valor analítico o la iteración anterior. La elección cambia la lectura y debe declararse.',
      },
      {
        nombre: 'Error absoluto',
        explicacion:
          'Conserva las unidades del problema. Sirve para decidir si la diferencia física importa.',
      },
      {
        nombre: 'Error relativo',
        explicacion:
          'Es adimensional. Sirve para comparar aproximaciones de magnitudes distintas o de distinto orden.',
      },
    ],
    pasos: [
      'Elegir y declarar el valor de referencia.',
      'Restar la aproximación y tomar valor absoluto.',
      'Dividir por el valor absoluto de la referencia.',
      'Multiplicar por 100 si se quiere expresar en porcentaje.',
      'Leer el resultado en el contexto del problema, no contra un umbral inventado.',
    ],
    ventajas: [
      'Vocabulario mínimo para comparar métodos y mediciones.',
      'El error relativo permite comparar escalas muy distintas.',
      'Es fácil de calcular y de auditar.',
    ],
    limitaciones: [
      'No distingue error sistemático de error aleatorio.',
      'El error relativo se indetermina cuando la referencia es cero.',
      'Un error pequeño en una muestra no garantiza un error pequeño en otra.',
    ],
    recomendaciones: [
      'Informa siempre qué valor usaste como referencia.',
      'Acompaña el porcentaje con el error absoluto y la unidad.',
      'No confundas error porcentual con puntos porcentuales.',
    ],
  },
  ejemploNormal: TEORIA_NORMAL,
  ejemploCasuistica: TEORIA_CASO,
};

/* ------------------------------------------------------------------ */
/* Ejemplos                                                            */
/* ------------------------------------------------------------------ */

const EJ1 = calcularErrores(Math.E, 2.72);
const EJ2 = calcularErrores(9.80665, 9.81);
const EJ3 = calcularErrores(2.7, 2.68);
const EJ4 = calcularErrores(0.502, 0.5);

export const EJEMPLOS_ERRORES: EjemploError[] = [
  {
    id: 'errores-ejemplo-1',
    titulo: 'e ≈ 2,718281828 frente a 2,72',
    tipo: 'numerico',
    planteamiento: 'Calcular los tres errores de la aproximación 2,72 respecto de e.',
    parametros: [
      { etiqueta: 'Referencia', valor: 'e ≈ 2,718281828' },
      { etiqueta: 'Aproximación', valor: '2,72' },
    ],
    interpretacion:
      'La aproximación queda por encima de e. El error absoluto es pequeño en unidades, pero el relativo permite decir qué fracción del valor representa.',
    pasos: [
      'Eₐ = |2,718281828 − 2,72| = 0,001718172.',
      'Eᵣ = 0,001718172 / 2,718281828 ≈ 0,0006321.',
      'E% ≈ 0,06321 %.',
      'La aproximación se aparta un 0,063 % del valor de referencia.',
    ],
    algoritmo: 'Restar, normalizar por el valor absoluto de la referencia y multiplicar por 100.',
    criterio: 'El error porcentual es menor que 0,1 %, pero eso no lo vuelve aceptable para cualquier uso.',
    conclusion: `Eₐ = ${numero(EJ1.errorAbsoluto)}; E% = ${porcentaje(EJ1.errorRelativo)}.`,
    tabla: { columnas: COLUMNAS_ERRORES, filas: [filaErrores(EJ1)] },
  },
  {
    id: 'errores-ejemplo-2',
    titulo: 'La gravedad: 9,80665 frente a 9,81 m/s²',
    tipo: 'numerico',
    planteamiento: 'Comparar la aproximación 9,81 m/s² con el valor 9,80665 m/s².',
    parametros: [
      { etiqueta: 'Referencia', valor: '9,80665 m/s²' },
      { etiqueta: 'Aproximación', valor: '9,81 m/s²' },
    ],
    interpretacion:
      'El error absoluto es de 0,00335 m/s². El relativo, 0,034 %, es la forma útil de compararlo con otras constantes.',
    pasos: [
      'Eₐ = |9,80665 − 9,81| = 0,00335 m/s².',
      'Eᵣ = 0,00335 / 9,80665 ≈ 0,0003416.',
      'E% ≈ 0,03416 %.',
      'Es un error relativo menor que 0,04 %.',
    ],
    algoritmo: 'Se conserva la unidad en el error absoluto y se elimina al dividir.',
    criterio: 'La comparación es descriptiva; la tolerancia aceptable depende del experimento.',
    conclusion: `Eₐ = ${numero(EJ2.errorAbsoluto)} m/s²; E% = ${porcentaje(EJ2.errorRelativo)}.`,
    tabla: { columnas: COLUMNAS_ERRORES, filas: [filaErrores(EJ2)] },
  },
  {
    id: 'errores-ejemplo-3',
    titulo: 'Densidad: 2,68 frente a 2,70 g/cm³',
    tipo: 'casuistica',
    enunciado:
      'Una probeta y una balanza dan una densidad experimental de 2,68 g/cm³. El valor de referencia para el material es 2,70 g/cm³.',
    planteamiento: 'Calcular el error absoluto y porcentual de la densidad experimental.',
    parametros: [
      { etiqueta: 'Referencia', valor: '2,70 g/cm³' },
      { etiqueta: 'Experimental', valor: '2,68 g/cm³' },
    ],
    extraccion: {
      busqueda: 'La densidad medida y el valor de referencia del material.',
      datos: [
        { simbolo: 'ρ̄', valor: '2,70 g/cm³', queEs: 'valor de referencia' },
        { simbolo: 'ρ', valor: '2,68 g/cm³', queEs: 'densidad experimental' },
      ],
      formulacion: 'Eₐ = |ρ − ρ̄|; E% = 100 · Eₐ/|ρ̄|.',
    },
    interpretacion:
      'La densidad experimental queda 0,02 g/cm³ por debajo. El error porcentual es 0,741 %, que puede ser relevante si el material se usa en control de calidad.',
    pasos: [
      'Eₐ = 0,02 g/cm³.',
      'Eᵣ = 0,02 / 2,70 ≈ 0,007407.',
      'E% ≈ 0,7407 %.',
      'La lectura es aproximadamente 0,74 % menor que la referencia.',
    ],
    algoritmo: 'Se usa el valor tabulado como referencia y la medición como aproximación.',
    criterio: 'Que 0,74 % sea aceptable depende de la tolerancia del proceso; el cálculo no la fija.',
    conclusion: `Error absoluto: ${numero(EJ3.errorAbsoluto)} g/cm³; error porcentual: ${porcentaje(EJ3.errorRelativo)}.`,
    tabla: { columnas: COLUMNAS_ERRORES, filas: [filaErrores(EJ3)] },
  },
  {
    id: 'errores-ejemplo-4',
    titulo: 'Corriente: 0,500 A frente a 0,502 A',
    tipo: 'casuistica',
    enunciado:
      'Un amperímetro de referencia marca 0,500 A. El instrumento bajo prueba indica 0,502 A. Se quiere expresar la diferencia en mA y en porcentaje.',
    planteamiento: 'Calcular el error absoluto en mA y el error porcentual.',
    parametros: [
      { etiqueta: 'Referencia', valor: '0,500 A' },
      { etiqueta: 'Lectura', valor: '0,502 A' },
    ],
    extraccion: {
      busqueda: 'La corriente de referencia y la lectura del instrumento.',
      datos: [
        { simbolo: 'Ī', valor: '0,500 A', queEs: 'amperímetro de referencia' },
        { simbolo: 'I', valor: '0,502 A', queEs: 'instrumento bajo prueba' },
      ],
      formulacion: 'Convertir la diferencia a mA y dividir por la referencia en A.',
    },
    interpretacion:
      'La diferencia es 0,002 A, es decir, 2 mA. El error relativo es 0,4 %, porque la referencia es 0,5 A.',
    pasos: [
      'Eₐ = 0,002 A = 2 mA.',
      'Eᵣ = 0,002 / 0,500 = 0,004.',
      'E% = 0,4 %.',
      'El instrumento lee 0,4 % por encima de la referencia.',
    ],
    algoritmo: 'Se calcula en la unidad base y luego se convierte el error absoluto a mA.',
    criterio: 'La comparación no decide si el instrumento aprueba; para eso falta su especificación.',
    conclusion: `Eₐ = ${numero(EJ4.errorAbsoluto)} A (2 mA); E% = ${porcentaje(EJ4.errorRelativo)}.`,
    tabla: { columnas: COLUMNAS_ERRORES, filas: [filaErrores(EJ4)] },
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

const E1 = calcularErrores(5, 4.9);
const E2 = calcularErrores(0.008, 0.0082);
const E3 = calcularErrores(343, 340);

export const EJERCICIOS_ERRORES: EjercicioError[] = [
  {
    id: 'errores-ejercicio-1',
    titulo: 'Una referencia de 5 y una lectura de 4,9',
    tipo: 'numerico',
    planteamiento: 'Calcula el error absoluto y el error porcentual de 4,9 respecto de 5.',
    parametros: [
      { etiqueta: 'Referencia', valor: '5' },
      { etiqueta: 'Aproximación', valor: '4,9' },
    ],
    interpretacion: 'La diferencia es 0,1; la referencia es 5.',
    pasos: ['Eₐ = 0,1.', 'Eᵣ = 0,1 / 5 = 0,02.', 'E% = 2 %.'],
    algoritmo: 'Eₐ = |5 − 4,9|; E% = 100 · Eₐ/5.',
    criterio: 'El error absoluto es 0,1 y el porcentual 2 %.',
    conclusion: `El error absoluto es ${numero(E1.errorAbsoluto)} y el error porcentual es ${porcentaje(E1.errorRelativo)}.`,
    tabla: { columnas: COLUMNAS_ERRORES, filas: [filaErrores(E1)] },
    pista: 'Primero resta; después divide por la referencia, no por la aproximación.',
    cuestionario: [
      pregunta(
        'errores-e1-q1',
        '¿Cuál es el error absoluto?',
        [
          { id: 'a', texto: '0,1' },
          { id: 'b', texto: '0,2' },
          { id: 'c', texto: '2' },
        ],
        'a',
        '|5 − 4,9| = 0,1. El 2 es el porcentaje, no el error absoluto.',
      ),
      pregunta(
        'errores-e1-q2',
        '¿Por cuál valor se divide para el error relativo?',
        [
          { id: 'a', texto: 'Por 4,9, la aproximación.' },
          { id: 'b', texto: 'Por 5, la referencia.' },
          { id: 'c', texto: 'Por 0,1, la diferencia.' },
        ],
        'b',
        'El error relativo se normaliza con el valor de referencia: 0,1/5 = 0,02.',
      ),
    ],
    resolucion: {
      valorCorrecto: E1.errorAbsoluto,
      tolerancia: 1e-9,
      etiqueta: 'Error absoluto',
      respuestaFinalTexto: numero(E1.errorAbsoluto),
    },
    formatoRespuesta: 'escalar',
  },
  {
    id: 'errores-ejercicio-2',
    titulo: 'El error de 0,0082 frente a 0,0080',
    tipo: 'numerico',
    planteamiento: 'Calcula el error relativo y exprésalo en porcentaje.',
    parametros: [
      { etiqueta: 'Referencia', valor: '0,0080' },
      { etiqueta: 'Aproximación', valor: '0,0082' },
    ],
    interpretacion: 'La diferencia absoluta es 0,0002; la referencia es 0,0080.',
    pasos: ['Eₐ = 0,0002.', 'Eᵣ = 0,0002 / 0,0080 = 0,025.', 'E% = 2,5 %.'],
    algoritmo: 'Dividir el error absoluto por |0,0080| y multiplicar por 100.',
    criterio: 'El error porcentual es 2,5 %.',
    conclusion: `Eᵣ = ${relativoTexto(E2.errorRelativo, 8)}; E% = ${porcentaje(E2.errorRelativo)}.`,
    tabla: { columnas: COLUMNAS_ERRORES, filas: [filaErrores(E2)] },
    pista: '0,0002 / 0,008 = 0,025. Al multiplicar por 100 queda 2,5 %.',
    cuestionario: [
      pregunta(
        'errores-e2-q1',
        '¿Por qué el error porcentual es grande aunque la diferencia sea chica?',
        [
          { id: 'a', texto: 'Porque la referencia también es muy chica.' },
          { id: 'b', texto: 'Porque el error absoluto está mal restado.' },
          { id: 'c', texto: 'Porque el porcentaje siempre es mayor que 100.' },
        ],
        'a',
        '0,0002 es el 2,5 % de 0,008; la escala de referencia es pequeña.',
      ),
      pregunta(
        'errores-e2-q2',
        '¿Cuál es el error relativo en forma decimal?',
        [
          { id: 'a', texto: '0,025' },
          { id: 'b', texto: '2,5' },
          { id: 'c', texto: '0,0002' },
        ],
        'a',
        'El porcentaje es 2,5 %; en forma decimal es 0,025.',
      ),
    ],
    resolucion: {
      valorCorrecto: E2.errorPorcentual,
      tolerancia: 1e-9,
      etiqueta: 'Error porcentual',
      unidad: '%',
      respuestaFinalTexto: porcentaje(E2.errorRelativo),
    },
    formatoRespuesta: 'escalar',
  },
  {
    id: 'errores-ejercicio-3',
    titulo: 'La velocidad del sonido: 340 frente a 343 m/s',
    tipo: 'casuistica',
    enunciado:
      'En una práctica se usa 340 m/s como velocidad del sonido. El valor de referencia a cierta temperatura es 343 m/s. Calcula el error absoluto de la aproximación.',
    planteamiento: 'Calcular Eₐ = |343 − 340| m/s y comentar el error relativo.',
    parametros: [
      { etiqueta: 'Referencia', valor: '343 m/s' },
      { etiqueta: 'Aproximación', valor: '340 m/s' },
    ],
    extraccion: {
      busqueda: 'El valor de referencia y la aproximación usada en la práctica.',
      datos: [
        { simbolo: 'v̄', valor: '343 m/s', queEs: 'valor de referencia' },
        { simbolo: 'v', valor: '340 m/s', queEs: 'aproximación de trabajo' },
      ],
      formulacion: 'Eₐ = |v − v̄|; E% = 100 · Eₐ/|v̄|.',
    },
    interpretacion: 'La diferencia es 3 m/s; el signo no importa porque se toma valor absoluto.',
    pasos: ['Eₐ = |340 − 343| = 3 m/s.', 'Eᵣ = 3/343 ≈ 0,008746.', 'E% ≈ 0,8746 %.'],
    algoritmo: 'Restar en el orden que sea y tomar valor absoluto.',
    criterio: 'El error absoluto es 3 m/s; el relativo, 0,875 %.',
    conclusion: `Eₐ = ${numero(E3.errorAbsoluto)} m/s; E% = ${porcentaje(E3.errorRelativo)}.`,
    tabla: { columnas: COLUMNAS_ERRORES, filas: [filaErrores(E3)] },
    pista: 'No importa si restas 343 − 340 o 340 − 343: el error absoluto usa valor absoluto.',
    cuestionario: [
      pregunta(
        'errores-e3-q1',
        '¿Cuál es el error absoluto?',
        [
          { id: 'a', texto: '−3 m/s' },
          { id: 'b', texto: '3 m/s' },
          { id: 'c', texto: '0,875 m/s' },
        ],
        'b',
        'El error absoluto es |340 − 343| = 3 m/s; no lleva signo.',
      ),
      pregunta(
        'errores-e3-q2',
        '¿Qué información agrega el error relativo?',
        [
          { id: 'a', texto: 'Que el error es el 0,875 % de la referencia.' },
          { id: 'b', texto: 'Que la velocidad real es 0,875 m/s.' },
          { id: 'c', texto: 'Que el error absoluto es más grande.' },
        ],
        'a',
        'El relativo normaliza los 3 m/s por 343 m/s y los expresa como fracción del valor de referencia.',
      ),
    ],
    resolucion: {
      valorCorrecto: E3.errorAbsoluto,
      tolerancia: 1e-9,
      etiqueta: 'Error absoluto',
      unidad: 'm/s',
      respuestaFinalTexto: `${numero(E3.errorAbsoluto)} m/s`,
    },
    formatoRespuesta: 'escalar',
  },
];

/* ------------------------------------------------------------------ */
/* Calculadora                                                         */
/* ------------------------------------------------------------------ */

export const CAMPOS_ERRORES: CampoCalculadoraError[] = [
  {
    key: 'verdadero',
    etiqueta: 'Valor de referencia',
    ayuda: 'El patrón, el valor analítico o la iteración anterior contra la que comparas.',
    requisito: 'Número finito. Puede ser negativo, pero no cero para el error relativo.',
    valorInicial: '3.141592653589793',
    tipo: 'text',
    placeholder: '3.141592653589793',
  },
  {
    key: 'aproximado',
    etiqueta: 'Aproximación o lectura',
    ayuda: 'El valor medido, redondeado o calculado que quieres evaluar.',
    requisito: 'Número finito.',
    valorInicial: '3.14',
    tipo: 'text',
    placeholder: '3.14',
  },
];

export function calcularErrorRelativo(
  valores: Record<string, string>,
): RespuestaCalculadoraError {
  const verdadero = parsearNumero(valores['verdadero'] ?? '');
  const aproximado = parsearNumero(valores['aproximado'] ?? '');

  if (verdadero === null || aproximado === null) {
    return {
      exito: false,
      conclusion: 'Escribe dos números válidos: el valor de referencia y la aproximación.',
    };
  }

  try {
    const resultado = calcularErrores(verdadero, aproximado);
    const relativo = Number.isFinite(resultado.errorRelativo)
      ? `${porcentaje(resultado.errorRelativo)} de error porcentual.`
      : 'El error relativo no está definido porque el valor de referencia es 0.';
    const signo =
      resultado.aproximado === resultado.verdadero
        ? 'La aproximación coincide con la referencia.'
        : resultado.aproximado > resultado.verdadero
          ? 'La aproximación queda por encima de la referencia.'
          : 'La aproximación queda por debajo de la referencia.';

    return {
      exito: true,
      resultado: numero(resultado.errorAbsoluto, 10),
      etiquetaResultado: 'Error absoluto',
      detalle: Number.isFinite(resultado.errorRelativo)
        ? porcentaje(resultado.errorRelativo)
        : 'No definido',
      etiquetaDetalle: 'Error relativo',
      conclusion: `${signo} ${relativo}`,
      filas: [filaErrores(resultado)],
      columnas: COLUMNAS_ERRORES,
    };
  } catch (error) {
    return {
      exito: false,
      conclusion: error instanceof Error ? error.message : 'No se pudo calcular el error.',
    };
  }
}
