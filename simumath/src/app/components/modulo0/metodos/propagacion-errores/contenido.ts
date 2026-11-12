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
  filaDeError,
  nombreOperacion,
  parsearOperacion,
  propagarError,
  type ResultadoPropagacion,
} from '../../algoritmos/errores.algoritmos';

/* ------------------------------------------------------------------ */
/* Tabla                                                               */
/* ------------------------------------------------------------------ */

export const COLUMNAS_PROPAGACION: Columna[] = [
  { key: 'magnitud', label: 'Magnitud', align: 'left' },
  { key: 'valor', label: 'Valor', align: 'right', monoespaciado: true },
  { key: 'errorAbs', label: 'Error absoluto', align: 'right', monoespaciado: true },
  { key: 'errorRel', label: 'Error relativo', align: 'right', monoespaciado: true },
];

function relativoDe(valor: number, error: number): number {
  return valor === 0 ? Number.NaN : error / Math.abs(valor);
}

function filasPropagacion(
  resultado: ResultadoPropagacion,
  unidad = '',
  nombreX = 'x',
  nombreY = 'y',
): Record<string, number | string>[] {
  return [
    filaDeError(nombreX, resultado.x, resultado.dx, relativoDe(resultado.x, resultado.dx), unidad),
    filaDeError(nombreY, resultado.y, resultado.dy, relativoDe(resultado.y, resultado.dy), unidad),
    filaDeError(
      `f (${nombreOperacion(resultado.operacion)})`,
      resultado.f,
      resultado.errorAbsoluto,
      resultado.errorRelativo,
      unidad,
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* Teoría                                                              */
/* ------------------------------------------------------------------ */

const NORMAL = propagarError('producto', 12.5, 0.1, 4, 0.05);
const CASO = propagarError('producto', 12, 0.1, 0.5, 0.01);

const TEORIA_NORMAL: EjemploError = {
  id: 'propagacion-teoria-numerico',
  titulo: 'El área de un rectángulo de 12,5 × 4,0',
  tipo: 'numerico',
  planteamiento:
    'Un rectángulo mide 12,5 ± 0,1 en un lado y 4,0 ± 0,05 en el otro. Se quiere estimar el área y la incertidumbre que llega al resultado.',
  parametros: [
    { etiqueta: 'x', valor: '12,5 ± 0,1' },
    { etiqueta: 'y', valor: '4,0 ± 0,05' },
  ],
  interpretacion:
    'El área central es 50. Como es un producto, el error relativo del resultado se aproxima sumando los errores relativos de los factores: 0,008 + 0,0125 = 0,0205, o 2,05 %.',
  pasos: [
    'Área central: 12,5 · 4,0 = 50.',
    'Error absoluto: |4,0| · 0,1 + |12,5| · 0,05 = 0,4 + 0,625 = 1,025.',
    'Error relativo: 1,025 / 50 = 0,0205.',
    'Error porcentual: 2,05 %.',
    'Lectura: el área queda en 50 ± 1,025, aproximadamente.',
  ],
  algoritmo:
    'Para un producto f = xy, Δf ≈ |y|Δx + |x|Δy. Es la suma de las contribuciones absolutas de cada factor.',
  criterio:
    'La fórmula es de primer orden: supone errores pequeños frente a los valores. Si los errores son grandes, la linealización puede quedarse corta.',
  conclusion: `El área es ${numero(NORMAL.f)} ± ${numero(NORMAL.errorAbsoluto)}; el error relativo es ${porcentaje(NORMAL.errorRelativo)}.`,
  tabla: { columnas: COLUMNAS_PROPAGACION, filas: filasPropagacion(NORMAL) },
};

const TEORIA_CASO: EjemploError = {
  id: 'propagacion-teoria-casuistica',
  titulo: 'La potencia de un circuito: 12 V y 0,50 A',
  tipo: 'casuistica',
  enunciado:
    'Una fuente entrega 12,0 ± 0,1 V y el circuito consume 0,50 ± 0,01 A. Se quiere estimar la potencia P = V·I y su incertidumbre.',
  planteamiento: 'Propagar los errores de tensión y corriente al producto P = V·I.',
  parametros: [
    { etiqueta: 'V', valor: '12,0 ± 0,1 V' },
    { etiqueta: 'I', valor: '0,50 ± 0,01 A' },
  ],
  extraccion: {
    busqueda: 'La tensión, la corriente y sus errores absolutos.',
    datos: [
      { simbolo: 'V', valor: '12,0 ± 0,1 V', queEs: 'tensión medidas' },
      { simbolo: 'I', valor: '0,50 ± 0,01 A', queEs: 'corriente medida' },
    ],
    formulacion: 'P = V·I; ΔP ≈ |I|ΔV + |V|ΔI.',
  },
  interpretacion:
    'La potencia central es 6,0 W. La corriente aporta 0,12 W de incertidumbre y la tensión 0,05 W; la suma es 0,17 W, un 2,83 % del resultado.',
  pasos: [
    'P = 12,0 · 0,50 = 6,0 W.',
    'Contribución de V: |0,50| · 0,1 = 0,05 W.',
    'Contribución de I: |12,0| · 0,01 = 0,12 W.',
    'ΔP ≈ 0,05 + 0,12 = 0,17 W.',
    'Error relativo: 0,17 / 6,0 ≈ 0,02833, o 2,83 %.',
  ],
  algoritmo: 'Se aplica la regla del producto y se conservan las unidades de potencia.',
  criterio:
    'La corriente relativa (0,01/0,50 = 2 %) domina frente a la tensión relativa (0,1/12 ≈ 0,83 %).',
  conclusion: `La potencia es ${numero(CASO.f)} ± ${numero(CASO.errorAbsoluto)} W, con un error relativo de ${porcentaje(CASO.errorRelativo)}.`,
  tabla: {
    columnas: COLUMNAS_PROPAGACION,
    filas: filasPropagacion(CASO, 'W', 'V', 'I'),
  },
};

export const TEORIA_PROPAGACION: TeoriaError = {
  concepto:
    'Propagar errores es estimar cómo se transforman las incertidumbres de las entradas cuando se opera con ellas. Si un lado de un rectángulo tiene ±0,1 y el otro ±0,05, el área no tiene el mismo error absoluto: la multiplicación mezcla las dos escalas. La fórmula de primer orden usa derivadas parciales para pesar cada entrada según cuánto influye en el resultado.',
  fundamento:
    'Para una función f(x, y), una variación pequeña de las entradas se aproxima con la diferencial: df ≈ (∂f/∂x)dx + (∂f/∂y)dy. Como los errores pueden ir en cualquier dirección, se toma el peor caso y se suman los valores absolutos: Δf ≈ |fₓ|Δx + |f_y|Δy. En un producto, eso se simplifica a la suma de los errores relativos; en una suma, a la suma de los absolutos. La regla no es magia: es la linealización de la función alrededor del punto de trabajo.',
  cuandoFalla:
    'La fórmula supone errores pequeños y entradas independientes. Si los errores están correlacionados, sumar los valores absolutos puede ser demasiado pesimista. En una resta de números cercanos, el resultado es chico y el error relativo se dispara: hay cancelación. En un cociente, si el denominador se acerca a cero, la derivada explota. Para errores grandes, la linealización deja de ser confiable y conviene evaluar los extremos o simular.',
  precision:
    'La propagación de primer orden es una cota aproximada, no una distribución de probabilidad. Si se conocen las desviaciones estándar y las entradas son independientes, la varianza se combina en cuadratura: σf² ≈ Σ (∂f/∂xᵢ)² σᵢ². Este módulo trabaja con cotas absolutas y suma de valores absolutos, que es el caso conservador.',
  recursos: [
    {
      titulo: 'Propagación de la incertidumbre (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Propagaci%C3%B3n_de_la_incertidumbre',
      tipo: 'lectura',
      descripcion: 'La fórmula general, la combinación en cuadratura y los casos de suma y producto.',
    },
    {
      titulo: 'Número de condición (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/N%C3%BAmero_de_condici%C3%B3n',
      tipo: 'lectura',
      descripcion: 'Por qué algunos problemas amplifican el error de entrada y otros lo amortiguan.',
    },
  ],
  algoritmo: {
    formula: 'Δf ≈ Σᵢ |∂f/∂xᵢ| · Δxᵢ',
    criterios: [
      {
        nombre: 'Suma o resta',
        explicacion:
          'Los errores absolutos se suman: Δ(x ± y) = Δx + Δy. La resta no los resta.',
      },
      {
        nombre: 'Producto o cociente',
        explicacion:
          'Los errores relativos se suman: Δ(xy)/(xy) ≈ Δx/|x| + Δy/|y|. Para el cociente, lo mismo.',
      },
      {
        nombre: 'Tamaño del error',
        explicacion:
          'La regla es de primer orden. Con errores grandes hay que comparar con los extremos o simular.',
      },
    ],
    pasos: [
      'Escribir la función que relaciona el resultado con las entradas.',
      'Identificar las derivadas parciales o la regla particular de la operación.',
      'Multiplicar cada derivada por el error absoluto de su entrada.',
      'Sumar los valores absolutos de las contribuciones.',
      'Dividir por el resultado para obtener el error relativo.',
    ],
    ventajas: [
      'Convierte una pregunta de incertidumbre en una cuenta explícita.',
      'Muestra qué entrada domina el error del resultado.',
      'Se aplica a sumas, productos, cocientes y funciones más generales.',
    ],
    limitaciones: [
      'Es una aproximación de primer orden.',
      'El peor caso puede ser demasiado conservador.',
      'No modela correlaciones entre entradas.',
    ],
    recomendaciones: [
      'Compara las contribuciones relativas para saber dónde invertir en mejor instrumentación.',
      'No uses la regla si el denominador puede acercarse a cero.',
      'Para errores grandes, verifica con los valores extremos del intervalo.',
    ],
  },
  ejemploNormal: TEORIA_NORMAL,
  ejemploCasuistica: TEORIA_CASO,
};

/* ------------------------------------------------------------------ */
/* Ejemplos                                                            */
/* ------------------------------------------------------------------ */

const EJ1 = propagarError('suma', 100, 2, 220, 5);
const EJ2 = propagarError('producto', 8, 0.1, 5, 0.1);
const EJ3 = propagarError('cociente', 25, 0.1, 10, 0.1);
const EJ4 = propagarError('cociente', 150, 0.5, 9.7, 0.1);

export const EJEMPLOS_PROPAGACION: EjemploError[] = [
  {
    id: 'propagacion-ejemplo-1',
    titulo: 'Dos resistencias en serie: 100 ± 2 y 220 ± 5 Ω',
    tipo: 'numerico',
    planteamiento: 'Calcular la resistencia equivalente R = R₁ + R₂ y su error absoluto.',
    parametros: [
      { etiqueta: 'R₁', valor: '100 ± 2 Ω' },
      { etiqueta: 'R₂', valor: '220 ± 5 Ω' },
    ],
    interpretacion:
      'En una suma, los errores absolutos se suman. La resistencia equivalente queda en 320 Ω con una incertidumbre de 7 Ω.',
    pasos: [
      'R = 100 + 220 = 320 Ω.',
      'ΔR = 2 + 5 = 7 Ω.',
      'Error relativo: 7/320 ≈ 0,02188.',
      'Error porcentual: 2,19 %.',
    ],
    algoritmo: 'Para una suma, Δ(x+y) = Δx + Δy.',
    criterio: 'La incertidumbre absoluta se conserva en ohmios; el relativo baja porque la suma es mayor que cada parte.',
    conclusion: `R = ${numero(EJ1.f)} ± ${numero(EJ1.errorAbsoluto)} Ω; error relativo ${porcentaje(EJ1.errorRelativo)}.`,
    tabla: {
      columnas: COLUMNAS_PROPAGACION,
      filas: filasPropagacion(EJ1, 'Ω', 'R₁', 'R₂'),
    },
  },
  {
    id: 'propagacion-ejemplo-2',
    titulo: 'El área de 8,0 ± 0,1 por 5,0 ± 0,1',
    tipo: 'numerico',
    planteamiento: 'Calcular el área y su error absoluto para un producto de dos medidas.',
    parametros: [
      { etiqueta: 'x', valor: '8,0 ± 0,1' },
      { etiqueta: 'y', valor: '5,0 ± 0,1' },
    ],
    interpretacion:
      'Cada factor aporta su error relativo (1,25 % y 2 %). En un producto, esos porcentajes se suman: 3,25 %.',
    pasos: [
      'Área: 8,0 · 5,0 = 40.',
      'ΔA = 5,0 · 0,1 + 8,0 · 0,1 = 0,5 + 0,8 = 1,3.',
      'Error relativo: 1,3/40 = 0,0325.',
      'Error porcentual: 3,25 %.',
    ],
    algoritmo: 'Para un producto, Δ(xy) ≈ |y|Δx + |x|Δy.',
    criterio: 'La suma de errores relativos coincide con el cociente 1,3/40.',
    conclusion: `El área es ${numero(EJ2.f)} ± ${numero(EJ2.errorAbsoluto)}; error relativo ${porcentaje(EJ2.errorRelativo)}.`,
    tabla: { columnas: COLUMNAS_PROPAGACION, filas: filasPropagacion(EJ2) },
  },
  {
    id: 'propagacion-ejemplo-3',
    titulo: 'Densidad: 25,0 ± 0,1 g en 10,0 ± 0,1 cm³',
    tipo: 'casuistica',
    enunciado:
      'Una muestra tiene masa 25,0 ± 0,1 g y volumen 10,0 ± 0,1 cm³. Se calcula la densidad y se quiere saber cuánto pesa cada error en el resultado.',
    planteamiento: 'Calcular ρ = m/V y propagar los errores absolutos de masa y volumen.',
    parametros: [
      { etiqueta: 'm', valor: '25,0 ± 0,1 g' },
      { etiqueta: 'V', valor: '10,0 ± 0,1 cm³' },
    ],
    extraccion: {
      busqueda: 'La masa, el volumen y sus incertidumbres.',
      datos: [
        { simbolo: 'm', valor: '25,0 ± 0,1 g', queEs: 'masa' },
        { simbolo: 'V', valor: '10,0 ± 0,1 cm³', queEs: 'volumen' },
      ],
      formulacion: 'ρ = m/V; Δρ ≈ Δm/|V| + |m|ΔV/V².',
    },
    interpretacion:
      'La densidad central es 2,5 g/cm³. La masa aporta 0,01 y el volumen 0,025; el volumen pesa más porque su error relativo es mayor.',
    pasos: [
      'ρ = 25,0/10,0 = 2,5 g/cm³.',
      'Contribución de m: 0,1/10,0 = 0,01.',
      'Contribución de V: 25,0 · 0,1 / 100 = 0,025.',
      'Δρ ≈ 0,035 g/cm³.',
      'Error relativo: 1,4 %.',
    ],
    algoritmo: 'Para un cociente, Δ(x/y) ≈ Δx/|y| + |x|Δy/y².',
    criterio: 'La contribución del volumen es 2,5 veces la de la masa; ahí está la mayor fuente de error.',
    conclusion: `La densidad es ${numero(EJ3.f)} ± ${numero(EJ3.errorAbsoluto)} g/cm³; error relativo ${porcentaje(EJ3.errorRelativo)}.`,
    tabla: {
      columnas: COLUMNAS_PROPAGACION,
      filas: filasPropagacion(EJ3, 'g/cm³', 'm', 'V'),
    },
  },
  {
    id: 'propagacion-ejemplo-4',
    titulo: 'Velocidad: 150 ± 0,5 m en 9,7 ± 0,1 s',
    tipo: 'casuistica',
    enunciado:
      'Una medición de distancia y tiempo da 150 ± 0,5 m y 9,7 ± 0,1 s. ¿Cuál es la velocidad y qué incertidumbre tiene?',
    planteamiento: 'Calcular v = d/t y propagar los errores de distancia y tiempo.',
    parametros: [
      { etiqueta: 'd', valor: '150 ± 0,5 m' },
      { etiqueta: 't', valor: '9,7 ± 0,1 s' },
    ],
    extraccion: {
      busqueda: 'La distancia, el tiempo y sus errores absolutos.',
      datos: [
        { simbolo: 'd', valor: '150 ± 0,5 m', queEs: 'distancia' },
        { simbolo: 't', valor: '9,7 ± 0,1 s', queEs: 'tiempo' },
      ],
      formulacion: 'v = d/t; Δv ≈ Δd/|t| + |d|Δt/t².',
    },
    interpretacion:
      'La velocidad central es 15,464 m/s. El tiempo aporta más incertidumbre que la distancia porque su error relativo es mayor.',
    pasos: [
      'v = 150/9,7 ≈ 15,464 m/s.',
      'Contribución de d: 0,5/9,7 ≈ 0,05155.',
      'Contribución de t: 150 · 0,1 / 9,7² ≈ 0,15942.',
      'Δv ≈ 0,21097 m/s.',
      'Error relativo: 1,36 %.',
    ],
    algoritmo: 'Regla del cociente con los valores centrales.',
    criterio: 'La incertidumbre del tiempo domina; mejorar el cronómetro reduciría más el error que mejorar la cinta.',
    conclusion: `La velocidad es ${numero(EJ4.f)} ± ${numero(EJ4.errorAbsoluto)} m/s; error relativo ${porcentaje(EJ4.errorRelativo)}.`,
    tabla: {
      columnas: COLUMNAS_PROPAGACION,
      filas: filasPropagacion(EJ4, 'm/s', 'd', 't'),
    },
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

const E1 = propagarError('suma', 12.5, 0.1, 7.3, 0.05);
const E2 = propagarError('producto', 2.5, 0.02, 4, 0.05);
const E3 = propagarError('cociente', 0.5, 0.002, 2, 0.01);

export const EJERCICIOS_PROPAGACION: EjercicioError[] = [
  {
    id: 'propagacion-ejercicio-1',
    titulo: 'Sumar 12,5 ± 0,1 y 7,3 ± 0,05',
    tipo: 'numerico',
    planteamiento: 'Calcula el error absoluto del resultado de la suma.',
    parametros: [
      { etiqueta: 'x', valor: '12,5 ± 0,1' },
      { etiqueta: 'y', valor: '7,3 ± 0,05' },
    ],
    interpretacion: 'En una suma, los errores absolutos se suman; no se restan.',
    pasos: ['Δ(x+y) = 0,1 + 0,05.', 'Resultado: 0,15.'],
    algoritmo: 'Regla de la suma: Δ(x+y) = Δx + Δy.',
    criterio: 'El resultado central es 19,8 y el error absoluto 0,15.',
    conclusion: `La suma es ${numero(E1.f)} ± ${numero(E1.errorAbsoluto)}.`,
    tabla: { columnas: COLUMNAS_PROPAGACION, filas: filasPropagacion(E1) },
    pista: 'No importa que sea una suma: los errores absolutos siempre se suman.',
    cuestionario: [
      pregunta(
        'propagacion-e1-q1',
        '¿Cómo se combinan los errores absolutos en una suma?',
        [
          { id: 'a', texto: 'Se suman.' },
          { id: 'b', texto: 'Se restan.' },
          { id: 'c', texto: 'Se multiplican.' },
        ],
        'a',
        'Δ(x+y) = Δx + Δy: el peor caso es que ambos se equivoquen hacia el mismo lado.',
      ),
      pregunta(
        'propagacion-e1-q2',
        '¿Cuál es el error absoluto de la suma?',
        [
          { id: 'a', texto: '0,05' },
          { id: 'b', texto: '0,1' },
          { id: 'c', texto: '0,15' },
        ],
        'c',
        '0,1 + 0,05 = 0,15.',
      ),
    ],
    resolucion: {
      valorCorrecto: E1.errorAbsoluto,
      tolerancia: 1e-9,
      etiqueta: 'Error absoluto de la suma',
      respuestaFinalTexto: numero(E1.errorAbsoluto),
    },
    formatoRespuesta: 'escalar',
  },
  {
    id: 'propagacion-ejercicio-2',
    titulo: 'Fuerza: 2,50 ± 0,02 kg por 4,00 ± 0,05 m/s²',
    tipo: 'numerico',
    planteamiento: 'Calcula la fuerza central F = m·a.',
    parametros: [
      { etiqueta: 'm', valor: '2,50 ± 0,02 kg' },
      { etiqueta: 'a', valor: '4,00 ± 0,05 m/s²' },
    ],
    interpretacion: 'El producto de 2,50 por 4,00 da 10,0 N.',
    pasos: ['F = 2,50 · 4,00 = 10,0 N.', 'El error absoluto se calcula con la regla del producto.'],
    algoritmo: 'F = m·a; ΔF ≈ |a|Δm + |m|Δa.',
    criterio: 'La fuerza central es 10,0 N; su error absoluto es 0,205 N.',
    conclusion: `La fuerza central es ${numero(E2.f)} N y su error absoluto es ${numero(E2.errorAbsoluto)} N.`,
    tabla: { columnas: COLUMNAS_PROPAGACION, filas: filasPropagacion(E2, 'N', 'm', 'a') },
    pista: 'Primero multiplica los valores centrales; el error se propaga aparte.',
    cuestionario: [
      pregunta(
        'propagacion-e2-q1',
        '¿Cuál es la fuerza central?',
        [
          { id: 'a', texto: '6,50 N' },
          { id: 'b', texto: '10,0 N' },
          { id: 'c', texto: '0,205 N' },
        ],
        'b',
        '2,50 kg · 4,00 m/s² = 10,0 N.',
      ),
      pregunta(
        'propagacion-e2-q2',
        '¿Cómo se calcula el error absoluto de un producto?',
        [
          { id: 'a', texto: '|a|Δm + |m|Δa' },
          { id: 'b', texto: 'Δm + Δa' },
          { id: 'c', texto: 'Δm · Δa' },
        ],
        'a',
        'Cada error absoluto se multiplica por el otro factor y luego se suman las contribuciones.',
      ),
    ],
    resolucion: {
      valorCorrecto: E2.f,
      tolerancia: 1e-9,
      etiqueta: 'Fuerza central',
      unidad: 'N',
      respuestaFinalTexto: `${numero(E2.f)} N`,
    },
    formatoRespuesta: 'escalar',
  },
  {
    id: 'propagacion-ejercicio-3',
    titulo: 'Concentración: 0,500 ± 0,002 mol en 2,00 ± 0,01 L',
    tipo: 'casuistica',
    enunciado:
      'Se disuelven 0,500 ± 0,002 mol de soluto en 2,00 ± 0,01 L de disolución. Calcula la concentración central y su error absoluto.',
    planteamiento: 'Calcular c = n/V y propagar los errores de cantidad y volumen.',
    parametros: [
      { etiqueta: 'n', valor: '0,500 ± 0,002 mol' },
      { etiqueta: 'V', valor: '2,00 ± 0,01 L' },
    ],
    extraccion: {
      busqueda: 'La cantidad de sustancia, el volumen y sus errores.',
      datos: [
        { simbolo: 'n', valor: '0,500 ± 0,002 mol', queEs: 'cantidad de soluto' },
        { simbolo: 'V', valor: '2,00 ± 0,01 L', queEs: 'volumen de disolución' },
      ],
      formulacion: 'c = n/V; Δc ≈ Δn/|V| + |n|ΔV/V².',
    },
    interpretacion:
      'La concentración central es 0,250 mol/L. El volumen aporta 0,00125 y la cantidad 0,001; el volumen domina apenas.',
    pasos: [
      'c = 0,500/2,00 = 0,250 mol/L.',
      'Contribución de n: 0,002/2,00 = 0,001.',
      'Contribución de V: 0,500 · 0,01 / 4,00 = 0,00125.',
      'Δc ≈ 0,00225 mol/L.',
      'Error relativo: 0,9 %.',
    ],
    algoritmo: 'Regla del cociente con los valores centrales.',
    criterio: 'La concentración se informa como 0,250 ± 0,00225 mol/L; el error relativo es 0,9 %.',
    conclusion: `c = ${numero(E3.f)} ± ${numero(E3.errorAbsoluto)} mol/L.`,
    tabla: {
      columnas: COLUMNAS_PROPAGACION,
      filas: filasPropagacion(E3, 'mol/L', 'n', 'V'),
    },
    pista: 'En un cociente, el error absoluto combina Δn/V y n·ΔV/V².',
    cuestionario: [
      pregunta(
        'propagacion-e3-q1',
        '¿Cuál es la concentración central?',
        [
          { id: 'a', texto: '0,250 mol/L' },
          { id: 'b', texto: '0,500 mol/L' },
          { id: 'c', texto: '2,00 mol/L' },
        ],
        'a',
        '0,500 mol / 2,00 L = 0,250 mol/L.',
      ),
      pregunta(
        'propagacion-e3-q2',
        '¿Qué término corresponde a la contribución del volumen?',
        [
          { id: 'a', texto: 'Δn/|V|' },
          { id: 'b', texto: '|n|ΔV/V²' },
          { id: 'c', texto: 'Δn + ΔV' },
        ],
        'b',
        'La derivada de n/V respecto de V es −n/V²; en valor absoluto, la contribución es n·ΔV/V².',
      ),
    ],
    resolucion: {
      valorCorrecto: E3.f,
      tolerancia: 1e-9,
      etiqueta: 'Concentración central',
      unidad: 'mol/L',
      respuestaFinalTexto: `${numero(E3.f)} mol/L`,
    },
    formatoRespuesta: 'escalar',
  },
];

/* ------------------------------------------------------------------ */
/* Calculadora                                                         */
/* ------------------------------------------------------------------ */

export const CAMPOS_PROPAGACION: CampoCalculadoraError[] = [
  {
    key: 'operacion',
    etiqueta: 'Operación',
    ayuda: 'Escribe suma, producto o cociente. También se aceptan +, × y ÷.',
    requisito: 'suma, producto o cociente.',
    valorInicial: 'producto',
    tipo: 'text',
    placeholder: 'producto',
  },
  {
    key: 'x',
    etiqueta: 'Valor x',
    ayuda: 'Primer valor central, en las unidades que estés usando.',
    requisito: 'Número finito.',
    valorInicial: '12.5',
    tipo: 'text',
    placeholder: '12.5',
  },
  {
    key: 'dx',
    etiqueta: 'Error de x',
    ayuda: 'Error absoluto de x. Tiene que ser positivo o cero.',
    requisito: 'Número mayor o igual que 0.',
    valorInicial: '0.1',
    tipo: 'text',
    placeholder: '0.1',
  },
  {
    key: 'y',
    etiqueta: 'Valor y',
    ayuda: 'Segundo valor central. En un cociente, y no puede ser 0.',
    requisito: 'Número finito.',
    valorInicial: '4',
    tipo: 'text',
    placeholder: '4',
  },
  {
    key: 'dy',
    etiqueta: 'Error de y',
    ayuda: 'Error absoluto de y. Tiene que ser positivo o cero.',
    requisito: 'Número mayor o igual que 0.',
    valorInicial: '0.05',
    tipo: 'text',
    placeholder: '0.05',
  },
];

export function calcularPropagacion(
  valores: Record<string, string>,
): RespuestaCalculadoraError {
  const operacion = parsearOperacion(valores['operacion'] ?? '');
  const x = parsearNumero(valores['x'] ?? '');
  const dx = parsearNumero(valores['dx'] ?? '');
  const y = parsearNumero(valores['y'] ?? '');
  const dy = parsearNumero(valores['dy'] ?? '');

  if (!operacion) {
    return {
      exito: false,
      conclusion: 'La operación debe ser suma, producto o cociente.',
    };
  }
  if (x === null || dx === null || y === null || dy === null) {
    return {
      exito: false,
      conclusion: 'Escribe números válidos para los valores y sus errores.',
    };
  }

  try {
    const resultado = propagarError(operacion, x, dx, y, dy);
    const lectura = Number.isFinite(resultado.errorRelativo)
      ? `El error relativo del resultado es ${porcentaje(resultado.errorRelativo)}.`
      : 'El error relativo no está definido porque el resultado es 0.';

    const regla =
      operacion === 'suma'
        ? 'En una suma, los errores absolutos se suman.'
        : operacion === 'producto'
          ? 'En un producto, los errores relativos se suman aproximadamente.'
          : 'En un cociente, los errores relativos se suman aproximadamente.';

    return {
      exito: true,
      resultado: numero(resultado.f, 10),
      etiquetaResultado: `Resultado de la ${nombreOperacion(operacion)}`,
      detalle: numero(resultado.errorAbsoluto, 10),
      etiquetaDetalle: 'Error absoluto',
      conclusion: `${regla} ${lectura}`,
      filas: filasPropagacion(resultado),
      columnas: COLUMNAS_PROPAGACION,
    };
  } catch (error) {
    return {
      exito: false,
      conclusion: error instanceof Error ? error.message : 'No se pudo propagar el error.',
    };
  }
}

/** Se exporta para las pruebas de contenido. */
export { relativoTexto };
