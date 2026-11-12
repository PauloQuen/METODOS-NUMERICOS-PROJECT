import type { PasoGuia } from '../../../shared/autoevaluacion-mejorada/solucion-guiada/solucion-guiada';
import type { EjercicioModulo3, PreguntaCuestionarioM3 } from '../modelos/modulo3.model';
import { lagrange, baseLagrange } from '../tipos/interpolacion/lagrange/lagrange.algoritmo';
import { minimosCuadrados } from '../tipos/ajuste/minimos-cuadrados/minimos-cuadrados.algoritmo';

/**
 * BANCO DE AUTOEVALUACIÓN DEL MÓDULO 3.
 *
 * A los seis ejercicios históricos de cada tema se les suman dieciocho
 * casos nuevos. El banco conserva los ejercicios anteriores y amplía
 * cada uno con preguntas de cálculo, interpretación y validación.
 *
 * `PracticaM3Service` elige una tanda de seis (tres numéricos y tres de
 * aplicación), recorta el cuestionario a cuatro preguntas y baraja
 * preguntas y opciones. La guía de cada ejercicio trae una comprobación
 * por paso.
 */

export type TemaBanco = 'lagrange' | 'minimos-cuadrados';

export type EjercicioBancoM3 = EjercicioModulo3 & {
  guia: readonly PasoGuia[];
};

const f = (n: number) => Number(n.toFixed(6)).toString();

function pregunta(
  id: string,
  enunciado: string,
  correcta: string,
  distractores: string[],
  explicacion: string,
): PreguntaCuestionarioM3 {
  return {
    id,
    tipo: 'opcion-multiple',
    enunciado,
    correcta: 'a',
    explicacion,
    opciones: [correcta, ...distractores].map((texto, i) => ({
      id: String.fromCharCode(97 + i),
      texto,
    })),
  };
}

function numero(
  id: string,
  texto: string,
  valor: number,
  explicacion: string,
): PreguntaCuestionarioM3 {
  const salto = Math.max(0.5, Math.abs(valor) * 0.2);
  return pregunta(
    id,
    texto,
    f(valor),
    [f(valor + salto), f(valor - salto), f(valor + 2 * salto)],
    explicacion,
  );
}

// Cada fila propone un problema diferente: nodos irregulares, grados 1–3,
// datos negativos, extrapolación, pendientes negativas y ajustes deficientes.
// [título, pares (x,y), objetivo, contexto opcional]. Datos didácticos simulados.
type Caso = [string, [number, number][], number, string?];

const CASOS_LAGRANGE: Caso[] = [
  ['Interpolación lineal', [[0, 2], [4, 10]], 1.5],
  ['Nodos negativos', [[-3, 10], [-1, 2], [2, 5]], 0],
  ['Cuatro nodos cúbicos', [[-1, 1], [0, 1], [1, 1], [3, 25]], 2],
  ['Nodos no equidistantes', [[0, 1], [2, 5], [5, 26]], 3],
  ['Evaluación en un nodo', [[1, 4], [3, 8], [6, 20]], 3],
  ['Extrapolación corta', [[0, 0], [1, 1], [2, 8], [3, 27]], 3.5],
  ['Valores fraccionarios', [[0, 1], [0.5, 1.25], [1.5, 3.25]], 1],
  ['Tendencia decreciente', [[0, 12], [2, 8], [5, 2]], 3],
  ['Cambio de signo', [[-2, 4], [0, -2], [2, 0]], 1],
  ['Calibración de un termómetro', [[10, 10.2], [20, 20.5], [40, 41.8]], 30, 'Un laboratorio dispone de tres referencias de temperatura y lecturas de un sensor (°C). Estima la lectura intermedia.'],
  ['Altura de un depósito', [[0, 0], [2, 1.6], [5, 3.25]], 3, 'Una tabla de llenado relaciona el tiempo (min) con la altura (m). Estima la altura a los 3 min.'],
  ['Posición de un móvil', [[0, 2], [1, 5], [3, 17]], 2, 'Una trayectoria tabulada registra tiempo (s) y posición (m). Estima la posición a los 2 s.'],
  ['Densidad de una mezcla', [[10, 1.02], [30, 1.12], [60, 1.42]], 45, 'Una tabla relaciona concentración (%) y densidad (g/mL). Estima la densidad al 45 %.'],
  ['Caudal de un canal', [[0.5, 0.8], [1, 2.1], [2, 7.4]], 1.5, 'Se tabulan altura (m) y caudal (m³/s) de un canal. Estima el caudal para 1.5 m.'],
  ['Potencia de una turbina', [[2, 8], [4, 64], [6, 216], [8, 512]], 5, 'Una tabla relaciona velocidad del viento (m/s) y potencia (W). Usa los cuatro datos para estimar en 5 m/s.'],
  ['Volumen de una pieza', [[1, 3], [2, 10], [4, 36]], 3, 'El diseño tabula longitud (cm) y volumen (cm³). Estima el volumen para una longitud de 3 cm.'],
  ['Enfriamiento tabulado', [[0, 90], [5, 70], [15, 45]], 10, 'Una tabla de tiempo (min) y temperatura (°C) describe un enfriamiento. Estima a los 10 min.'],
  ['Proyección fuera de la tabla', [[1, 2.5], [2, 4], [4, 10]], 5, 'Una tabla relaciona tiempo (h) y masa (g). Estima a las 5 h e identifica el riesgo de extrapolar.'],
];

const CASOS_MC: Caso[] = [
  ['Recta exacta', [[0, 1], [1, 3], [2, 5], [3, 7]], 1.5],
  ['Pendiente negativa', [[0, 10], [1, 8.1], [2, 5.9], [3, 4.2]], 2.5],
  ['Datos centrados', [[-2, -3], [-1, -0.8], [0, 1.1], [1, 2.9], [2, 5.2]], 0.5],
  ['Relación débil', [[0, 4], [1, 1], [2, 5], [3, 2], [4, 4]], 2.5],
  ['Patrón curvo', [[-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4]], 1.5],
  ['Observación atípica', [[1, 3], [2, 5], [3, 7], [4, 9], [5, 25]], 3.5],
  ['Escala decimal', [[0.1, 2], [0.2, 2.4], [0.4, 3.1], [0.7, 4.5]], 0.5],
  ['Predicción en el promedio', [[2, 5], [4, 8], [6, 12], [8, 15]], 5],
  ['Señal decreciente ruidosa', [[1, 15], [2, 12], [4, 9], [6, 4]], 3],
  ['Consumo eléctrico', [[10, 32], [20, 41], [30, 53], [40, 62]], 25, 'Una planta registra producción (unidades) y consumo (kWh). Ajusta una recta y estima el consumo para 25 unidades.'],
  ['Desgaste de una herramienta', [[1, 0.2], [3, 0.5], [5, 0.9], [7, 1.2]], 6, 'Se mide el desgaste (mm) según horas de uso. Estima a las 6 h mediante una recta.'],
  ['Tarifa de transporte', [[2, 8], [5, 13], [8, 19], [11, 25]], 7, 'Se registran distancia (km) y tarifa (soles). Estima la tarifa de un recorrido de 7 km.'],
  ['Producción agrícola', [[1, 3.2], [2, 4.1], [3, 5.3], [4, 6], [5, 7.4]], 3.5, 'Se registra fertilizante (unidades por parcela) y rendimiento (t/ha). Estima para 3.5 unidades sin atribuir causalidad.'],
  ['Tiempo de descarga', [[10, 2], [20, 4.2], [40, 7.8], [60, 12.1]], 50, 'Se registran tamaño (MB) y tiempo de descarga (s). Estima el tiempo para 50 MB.'],
  ['Pérdida de temperatura', [[0, 80], [2, 72], [4, 65], [6, 57], [8, 50]], 5, 'Se registran tiempo (min) y temperatura (°C). Ajusta una recta local y estima a los 5 min.'],
  ['Demanda de agua', [[1, 12], [2, 15], [3, 17], [4, 21]], 6, 'Se registra población (miles) y demanda diaria (unidades de volumen). Proyecta para 6 mil habitantes e identifica la extrapolación.'],
  ['Calibración de una balanza', [[0, 0.2], [2, 2.3], [4, 4.1], [6, 6.4]], 3, 'Se registran masa patrón y lectura (kg). Estima la lectura para 3 kg e interpreta el intercepto.'],
  ['Costo de mantenimiento', [[1, 100], [2, 125], [4, 180], [6, 240]], 5, 'Se registran antigüedad (años) y costo anual (soles). Estima para 5 años e interpreta la pendiente.'],
];

function crearCaso(caso: Caso, tema: TemaBanco, i: number): EjercicioModulo3 {
  const [titulo, pares, evaluarEn, contexto] = caso;
  const puntos = pares.map(([x, y]) => ({ x, y }));
  return {
    id: `${tema}-banco-${i + 1}`,
    titulo,
    tipo: contexto ? 'casuistica' : 'numerico',
    enunciado: contexto ? `${contexto} Datos simulados para práctica.` : undefined,
    planteamiento: `${tema === 'lagrange' ? 'Construye el polinomio interpolante' : 'Ajusta la recta por mínimos cuadrados'} y evalúa en x = ${evaluarEn}. Redondea al final a seis decimales.`,
    parametros: [{ etiqueta: 'Evaluar en', valor: String(evaluarEn) }],
    interpretacion: contexto ?? 'Organiza los datos e identifica el modelo antes de operar.',
    pasos: [],
    algoritmo: '',
    criterio: '',
    conclusion: '',
    calculo: { puntos, evaluarEn, etiqueta: titulo },
  };
}

/** Amplía también las preguntas de los ejercicios anteriores, sin descartarlas. */
export function crearBanco(
  base: readonly EjercicioModulo3[],
  tema: TemaBanco,
): EjercicioBancoM3[] {
  const casos = tema === 'lagrange' ? CASOS_LAGRANGE : CASOS_MC;
  return [...base, ...casos.map((caso, i) => crearCaso(caso, tema, i))].map((e) =>
    enriquecer(e, tema),
  );
}

function enriquecer(e: EjercicioModulo3, tema: TemaBanco): EjercicioBancoM3 {
  const puntos = e.calculo.puntos;
  const x = e.calculo.evaluarEn!;
  const n = puntos.length;
  const dentro =
    x >= Math.min(...puntos.map((p) => p.x)) &&
    x <= Math.max(...puntos.map((p) => p.x));

  const q: PreguntaCuestionarioM3[] = [
    numero('b-n', '¿Cuántos pares de datos intervienen?', n, `La tabla contiene ${n} pares; cuenta filas, no columnas.`),
    pregunta(
      'b-rango',
      `¿Cómo clasificas la estimación en x = ${x}?`,
      dentro
        ? 'Dentro del intervalo de datos (incluye sus extremos).'
        : 'Extrapolación fuera del intervalo de datos.',
      [
        dentro
          ? 'Extrapolación fuera del intervalo de datos.'
          : 'Dentro del intervalo de datos (incluye sus extremos).',
        'No depende del rango de x.',
        'No se puede clasificar con esta tabla.',
      ],
      `El intervalo de x va de ${Math.min(...puntos.map((p) => p.x))} a ${Math.max(...puntos.map((p) => p.x))}. Fuera de él la predicción requiere mayor cautela.`,
    ),
    pregunta(
      'b-precision',
      '¿Cómo conviene manejar el redondeo?',
      'Conservar precisión durante las cuentas y redondear al final.',
      [
        'Redondear cada producto a un entero.',
        'Eliminar los decimales de los datos.',
        'Redondear las x antes de calcular.',
      ],
      'Redondear demasiado pronto acumula error.',
    ),
  ];

  let guia: PasoGuia[];
  let pasos: string[];
  let conclusion: string;
  let valor: number;

  if (tema === 'lagrange') {
    const r = lagrange(e.calculo);
    valor = r.valor!;
    const l0 = baseLagrange(puntos, 0, x);
    const denominador = puntos.slice(1).reduce((a, p) => a * (puntos[0].x - p.x), 1);
    q.push(
      numero(
        'b-grado',
        '¿Cuál es el grado máximo del interpolante único de esta tabla?',
        n - 1,
        `${n} nodos distintos determinan un polinomio de grado a lo sumo ${n - 1}; puede ser menor.`,
      ),
      numero(
        'b-den',
        '¿Cuál es el denominador de la primera base, ∏(x₁ − xⱼ), j ≠ 1?',
        denominador,
        `Multiplica las diferencias desde x₁ = ${puntos[0].x}: ${puntos.slice(1).map((p) => `(${puntos[0].x} − ${p.x})`).join(' · ')} = ${f(denominador)}.`,
      ),
      numero(
        'b-base',
        `¿Cuánto vale L₁(${x})?`,
        l0,
        `L₁(${x}) = ∏((${x} − xⱼ)/(${puntos[0].x} − xⱼ)) = ${f(l0)}.`,
      ),
      numero(
        'b-aporte',
        '¿Cuál es el aporte del primer dato y₁L₁(x*)?',
        puntos[0].y * l0,
        `${puntos[0].y} · ${f(l0)} = ${f(puntos[0].y * l0)}.`,
      ),
      numero(
        'b-suma',
        `¿Cuánto vale la suma de las bases en x = ${x}?`,
        1,
        'Las bases forman una partición de la unidad: ΣLᵢ(x) = 1.',
      ),
      numero(
        'b-nodo',
        `¿Qué valor debe reproducir P(${puntos[0].x})?`,
        puntos[0].y,
        'En un nodo su base vale 1 y las demás valen 0.',
      ),
      pregunta(
        'b-metodo',
        '¿Qué propiedad debe cumplir el modelo?',
        'Reproducir todos los pares de la tabla.',
        [
          'Minimizar solamente el error en el primer dato.',
          'Ser siempre una recta.',
          'Tener todas las bases positivas.',
        ],
        'El interpolante reproduce los nodos; algunas bases pueden ser negativas.',
      ),
      pregunta(
        'b-error',
        '¿Qué garantiza el error nulo en los nodos?',
        'Reproducción de los datos, sin asegurar error nulo entre ellos.',
        [
          'Error nulo en todo número real.',
          'Que se conoce la función real.',
          'Que extrapolar siempre es seguro.',
        ],
        'Para acotar el error fuera de los nodos hace falta información adicional de la función.',
      ),
    );

    pasos = r.filas.map(
      (row) => `L${row.i}(${x}) = ${f(row.li)}; aporte = ${row.yi} · ${f(row.li)} = ${f(row.aporte)}.`,
    );
    pasos.push(`Sumar los aportes: P(${x}) = ${f(valor)}. ${r.polinomio}`);

    conclusion = `${r.polinomio}; P(${x}) ≈ ${f(valor)}. ${q[1].explicacion} La coincidencia en los nodos no garantiza exactitud entre ellos.`;

    guia = [
      {
        titulo: 'Identificar los datos y el grado',
        explicacion: `Usaremos ${n} nodos distintos y evaluaremos en x = ${x}.`,
        pregunta: q[3],
      },
      {
        titulo: 'Construir la primera base',
        explicacion:
          'Lᵢ(x) = ∏ⱼ≠ᵢ (x − xⱼ)/(xᵢ − xⱼ). Primero calcula el denominador, respetando los signos.',
        pregunta: q[4],
      },
      {
        titulo: 'Evaluar la base',
        explicacion: q[4].explicacion,
        pregunta: q[5],
      },
      {
        titulo: 'Ponderar por el dato',
        explicacion: q[5].explicacion,
        pregunta: q[6],
      },
      {
        titulo: 'Completar las bases y sumar',
        explicacion:
          'Repite el cálculo para los demás nodos. Observa cómo cada aporte participa en la suma que construye el polinomio.',
        pregunta: q[7],
      },
      {
        titulo: 'Validar e interpretar',
        explicacion: `Comprueba que el polinomio reproduce cada nodo. ${q[1].explicacion}`,
        pregunta: q[10],
      },
    ];
  } else {
    const r = minimosCuadrados(e.calculo);
    valor = r.prediccion!;
    const den = n * r.sumX2 - r.sumX * r.sumX;
    q.push(
      numero('b-sx', '¿Cuánto vale Σx?', r.sumX, `Suma las x: Σx = ${f(r.sumX)}.`),
      numero(
        'b-sxy',
        '¿Cuánto vale Σ(xᵢyᵢ)?',
        r.sumXY,
        `Multiplica dentro de cada fila y luego suma: Σxy = ${f(r.sumXY)}; no es (Σx)(Σy).`,
      ),
      numero(
        'b-den',
        '¿Cuánto vale nΣx² − (Σx)²?',
        den,
        `${n} · ${f(r.sumX2)} − (${f(r.sumX)})² = ${f(den)}.`,
      ),
      numero(
        'b-pendiente',
        '¿Cuál es la pendiente a₁?',
        r.a1,
        `a₁ = (nΣxy − ΣxΣy)/(nΣx² − (Σx)²) = ${f(r.a1)}.`,
      ),
      numero(
        'b-intercepto',
        '¿Cuál es la ordenada a₀?',
        r.a0,
        `a₀ = ȳ − a₁x̄ = ${f(r.mediaY)} − (${f(r.a1)}) · ${f(r.mediaX)} = ${f(r.a0)}.`,
      ),
      numero(
        'b-residuo',
        `¿Cuál es el residuo del primer dato (${puntos[0].x}; ${puntos[0].y})?`,
        puntos[0].y - r.a0 - r.a1 * puntos[0].x,
        'El residuo es observado menos estimado: eᵢ = yᵢ − (a₀ + a₁xᵢ).',
      ),
      pregunta(
        'b-objetivo',
        '¿Qué cantidad minimiza el ajuste?',
        'Σ(yᵢ − ŷᵢ)²',
        ['Σ(yᵢ − ŷᵢ)', 'La pendiente al cuadrado.', 'El mayor valor de x.'],
        'Elevar al cuadrado evita la cancelación de residuos positivos y negativos.',
      ),
      pregunta(
        'b-validacion',
        `Con r² = ${f(r.r2)}, ¿qué revisión corresponde?`,
        'Examinar también los residuos y el rango de predicción.',
        [
          'Aceptar el modelo solo por obtener una recta.',
          'Interpretar correlación como causalidad.',
          'Suponer que no hay error de medición.',
        ],
        'Un r² alto no sustituye la inspección de los residuos ni justifica extrapolaciones lejanas.',
      ),
      numero(
        'b-media',
        `¿Por qué valor de y pasa la recta cuando x = x̄ = ${f(r.mediaX)}?`,
        r.mediaY,
        'Con intercepto libre, la recta de mínimos cuadrados pasa por (x̄, ȳ).',
      ),
    );

    pasos = [
      `Σx = ${f(r.sumX)}, Σy = ${f(r.sumY)}, Σx² = ${f(r.sumX2)}, Σxy = ${f(r.sumXY)}.`,
      q[6].explicacion,
      q[7].explicacion,
      `ŷ(${x}) = ${f(r.a0)} + (${f(r.a1)}) · ${x} = ${f(valor)}.`,
    ];

    conclusion = `${r.recta}; ŷ(${x}) ≈ ${f(valor)}. r² = ${f(r.r2)}, error estándar = ${f(r.errorEstandar)}. ${q[1].explicacion} Examina si los residuos presentan un patrón antes de aceptar el modelo.`;

    guia = [
      {
        titulo: 'Organizar las sumatorias',
        explicacion: `Hay ${n} mediciones. Prepara columnas x, y, x² y xy.`,
        pregunta: q[4],
      },
      {
        titulo: 'Preparar el denominador',
        explicacion: pasos[0],
        pregunta: q[5],
      },
      {
        titulo: 'Calcular la pendiente',
        explicacion: q[5].explicacion + ' Usa a₁ = (nΣxy − ΣxΣy)/(nΣx² − (Σx)²).',
        pregunta: q[6],
      },
      {
        titulo: 'Calcular el intercepto',
        explicacion: q[6].explicacion + ' Usa a₀ = ȳ − a₁x̄.',
        pregunta: q[7],
      },
      {
        titulo: 'Predecir y calcular residuos',
        explicacion:
          'Sustituye el valor objetivo en la recta. Después compara cada observación con su estimación: los segmentos verticales del gráfico representan esos residuos.',
        pregunta: q[8],
      },
      {
        titulo: 'Evaluar la validez del modelo',
        explicacion: `${r.recta}. r² = ${f(r.r2)}; error estándar = ${f(r.errorEstandar)}. ${q[1].explicacion}`,
        pregunta: q[10],
      },
    ];
  }

  return {
    ...e,
    pasos,
    algoritmo:
      tema === 'lagrange'
        ? 'Construir las bases, ponderarlas por yᵢ y sumar.'
        : 'Calcular sumatorias, pendiente, intercepto, predicción y residuos.',
    conclusion,
    criterio:
      tema === 'lagrange'
        ? 'Verificar P(xᵢ) = yᵢ en todos los nodos.'
        : 'Examinar r², error estándar y patrón de residuos.',
    cuestionario: [...(e.cuestionario ?? []), ...q],
    guia,
    resolucion: {
      ...(e.resolucion ?? { respuestaFinalTexto: '' }),
      valorCorrecto: valor,
      tolerancia: 0.0001,
      etiqueta: `${tema === 'lagrange' ? 'P' : 'ŷ'}(${x})`,
      respuestaFinalTexto: conclusion,
    },
  };
}
