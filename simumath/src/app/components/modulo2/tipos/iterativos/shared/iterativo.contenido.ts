import type { TeoriaPlantillaVista } from '../../../../../shared/models/metodo.model';
import type { EjercicioSistema } from '../../../../../shared/models/sistema.model';
import { pregunta, preguntaNumero, type ConGuia, type CuentaPractica, type EtapaPractica } from '../../../../../shared/practica-guiada/modelos';
import { CONFIG_ITERATIVOS, numero, vector } from './iterativo.config';
import { resolverIterativo, residuos, type MetodoIterativo } from './iterativo.algoritmo';

export function cuentasIteracion(A: number[][], b: number[], anterior: number[], nuevo: number[], metodo: MetodoIterativo): CuentaPractica[] {
  return A.map((f, i) => ({ etiqueta: `Despejar x${i + 1}`,
    expresion: `x${i + 1} = (${numero(b[i])} − (${f.flatMap((a, j) => i === j ? [] : [`(${numero(a)})*(${numero(metodo === 'gauss-seidel' && j < i ? nuevo[j] : anterior[j])})`]).join(' + ') || '0'}))/(${numero(f[i])})` }));
}

export function teoriaIterativa(metodo: MetodoIterativo): TeoriaPlantillaVista & { precision: string } {
  const jacobi = metodo === 'jacobi';
  return {
    concepto: CONFIG_ITERATIVOS[metodo].resumen + ' Ambos métodos resuelven A·x = b a partir de un vector inicial, repitiendo barridas hasta cumplir una tolerancia. No son eliminación gaussiana ni factorización LU.',
    fundamento: 'Al despejar cada incógnita se obtiene una iteración x⁽ᵏ⁺¹⁾ = T·x⁽ᵏ⁾ + c. Converge desde cualquier semilla si el radio espectral ρ(T) es menor que 1. La dominancia diagonal estricta por filas garantiza la convergencia de ambos métodos: |aᵢᵢ| > Σⱼ≠ᵢ |aᵢⱼ|.' +
      (jacobi ? ' Que A sea simétrica definida positiva, por sí solo, no garantiza la convergencia de Jacobi.' : ' Gauss-Seidel también converge si A es simétrica definida positiva, aunque no tenga dominancia diagonal.'),
    cuandoFalla: 'Una entrada diagonal nula impide despejar esa incógnita. Reordenar las ecuaciones puede ayudar, pero hay que comprobar la nueva diagonal. Una matriz sin dominancia estricta puede converger o divergir: la ausencia de esa condición suficiente no demuestra divergencia. Un límite de iteraciones o un resultado no finito requiere revisar el sistema; no certifica una solución.',
    precision: 'Se controlan dos medidas: δ = ‖x⁽ᵏ⁺¹⁾ − x⁽ᵏ⁾‖∞ / max(1, ‖x⁽ᵏ⁺¹⁾‖∞) y η = ‖Ax⁽ᵏ⁺¹⁾ − b‖∞ / ‖b‖∞. Si b = 0, el residuo se divide por ‖A‖∞. Se exige δ ≤ tol y η ≤ tol. Estas medidas no son el error real ‖x − x*‖: un sistema mal condicionado puede amplificar un residuo pequeño. La convergencia suele ser lineal y depende del sistema y del orden de las ecuaciones.',
    recursos: [
      { titulo: jacobi ? 'Jacobi: actualización simultánea' : 'Gauss-Seidel: actualización sucesiva', tipo: 'lectura', url: `https://netlib.org/linalg/html_templates/${jacobi ? 'node12' : 'node14'}.html`, descripcion: 'Templates for the Solution of Linear Systems: algoritmo, interpretación y pseudocódigo (en inglés).' },
      { titulo: 'Cómo decidir cuándo detener una iteración', tipo: 'lectura', url: 'https://netlib.org/linalg/html_templates/node83.html', descripcion: 'Criterios de parada, residuo y límites de precisión. Netlib (en inglés).' },
    ],
    algoritmo: {
      formula: CONFIG_ITERATIVOS[metodo].formula,
      pasos: [
        'Comprueba que A sea cuadrada, b y x⁽⁰⁾ tengan el tamaño correcto y la diagonal no tenga ceros.',
        'Elige el vector inicial, una tolerancia positiva y un máximo entero de iteraciones.',
        jacobi ? 'Guarda una copia del vector anterior. Calcula todas las componentes nuevas únicamente con esa copia.' : 'Recorre las incógnitas de arriba hacia abajo: usa las componentes nuevas a la izquierda y las anteriores a la derecha.',
        'Calcula el cambio escalado y el residuo relativo usando el sistema original.',
        'Acepta la aproximación cuando ambas medidas cumplen la tolerancia. Si no, repite sin redondear los valores internos.',
      ],
      criterios: [
        { nombre: 'Dominancia diagonal estricta', explicacion: 'Una garantía suficiente: en cada fila el módulo de la diagonal supera la suma de los módulos de los otros coeficientes.' },
        { nombre: 'Cambio y residuo', explicacion: 'Un vector que cambia poco puede seguir sin resolver el sistema. Por eso esta implementación comprueba ambas medidas.' },
        { nombre: 'Límite de iteraciones', explicacion: 'Protege frente a una iteración lenta o no convergente; conserva la última aproximación sin etiquetarla como solución.' },
      ],
      ventajas: [jacobi ? 'Las componentes de cada barrida son independientes y se pueden calcular en paralelo.' : 'Reutiliza las actualizaciones inmediatamente y puede necesitar menos barridas que Jacobi.', 'No requiere factorizar A. Una barrida cuesta O(n²) para una matriz densa; con almacenamiento disperso depende de sus elementos no nulos.'],
      limitaciones: ['Necesita una diagonal no nula y condiciones de convergencia adecuadas.', 'Puede converger lentamente, oscilar o crecer. Gauss-Seidel no siempre mejora a Jacobi para cualquier matriz.', 'La calculadora didáctica almacena A de forma densa y conserva las iteraciones: admite hasta 20 ecuaciones y 5000 barridas.'],
      recomendaciones: ['Conserva la precisión interna y redondea al presentar los resultados.', 'Compara ambos métodos con exactamente A, b, x⁽⁰⁾, tolerancia y límite iguales.', 'Comprueba el residuo con el sistema original y distingue la última aproximación de una solución validada.'],
    },
  };
}

function construir(metodo: MetodoIterativo, id: string, titulo: string, A: number[][], exacta: number[], tipo: 'numerico' | 'casuistica', enunciado?: string, x0 = A.map(() => 0)): ConGuia<EjercicioSistema> {
  const b = A.map(f => f.reduce((s, a, j) => s + a * exacta[j], 0));
  const calculo = { A, b, x0, tol: 1e-6, maxIter: 500 };
  const resultado = resolverIterativo(calculo, metodo);
  if (!resultado.convergio || !resultado.solucion) throw new Error(`El ejercicio ${id} debe converger.`);
  const config = CONFIG_ITERATIVOS[metodo];
  const q = [
    preguntaNumero('dimension', '¿Cuántas incógnitas tiene el sistema?', A.length, 'Cuenta las columnas de A.'),
    preguntaNumero('coeficiente', '¿Cuál es el coeficiente a₁₁?', A[0][0], 'Es el primer coeficiente de la primera ecuación.'),
    preguntaNumero('termino', '¿Cuál es el primer término independiente?', b[0], 'Lee el primer componente de b.'),
    preguntaNumero('semilla', '¿Cuál es la primera componente del vector inicial?', x0[0], 'La semilla se lee antes de iniciar las barridas.'),
    preguntaNumero('tolerancia', '¿Qué tolerancia se ha pedido?', calculo.tol, 'Debe cumplirse en el cambio escalado y en el residuo relativo.'),
    pregunta('actualizar', `¿Qué valores usa ${config.nombre} al actualizar una incógnita?`, metodo === 'jacobi' ? 'Solo las componentes del vector anterior.' : 'Las componentes nuevas ya calculadas y las anteriores que aún faltan.', ['El vector solución exacto desde el principio.', metodo === 'jacobi' ? 'Siempre todas las componentes recién calculadas.' : 'Únicamente el vector anterior, sin reutilizar ninguna componente.', 'Solo el término independiente.'], config.resumen),
    pregunta('diagonal', '¿Qué ocurre si una entrada diagonal es cero?', 'Ese despeje no puede realizarse; hay que revisar el orden de las ecuaciones.', ['Se divide por cero y se continúa.', 'El sistema siempre tiene solución cero.', 'La tolerancia corrige automáticamente la diagonal.'], 'La recurrencia divide entre el coeficiente diagonal.'),
    pregunta('garantia', '¿Cuál es una condición suficiente de convergencia para ambos métodos?', 'La dominancia diagonal estricta por filas.', ['Que todos los coeficientes sean positivos.', 'Que haya tres ecuaciones exactamente.', 'Que la semilla sea el vector cero.'], 'En cada fila debe cumplirse |aᵢᵢ| > Σⱼ≠ᵢ |aᵢⱼ|.'),
    pregunta('parada', '¿Cuándo acepta esta calculadora una aproximación?', 'Cuando el cambio escalado y el residuo relativo cumplen la tolerancia.', ['Cuando el vector cambia poco, sin revisar el residuo.', 'Siempre al terminar la tercera barrida.', 'Al llegar al máximo de iteraciones, aunque no converja.'], 'Se verifican las dos medidas para evitar aceptar una falsa convergencia.'),
    pregunta('limite', '¿Qué significa alcanzar el máximo sin cumplir los criterios?', 'Que esta ejecución todavía no ha validado la solución.', ['Que el último vector es exacto.', 'Que el sistema no tiene solución en ningún caso.', 'Que todas las incógnitas deben ser cero.'], 'Puede tratarse de convergencia lenta o de falta de convergencia.'),
    pregunta('validar', '¿Cómo se comprueba el vector final?', 'Sustituyéndolo en A·x − b con los datos originales.', ['Comparándolo solo con la semilla.', 'Exigiendo que todas sus componentes sean positivas.', 'Comprobando únicamente cuántas barridas se hicieron.'], 'Un residuo pequeño indica que las ecuaciones se satisfacen aproximadamente.'),
    pregunta('redondeo', '¿Cuándo conviene redondear los resultados?', 'Al mostrarlos, conservando la precisión durante las iteraciones.', ['Después de cada multiplicación, a un entero.', 'Antes de leer los coeficientes.', 'Al reemplazar la diagonal por números más sencillos.'], 'Redondear cada barrida puede producir estancamiento o cambiar el resultado.'),
  ];
  const guia: EtapaPractica[] = [{ titulo: 'Preparar el sistema', explicacion: `Aplicaremos ${config.nombre}. Identifica la diagonal, los términos independientes y el vector inicial.`,
    cuentas: [{ etiqueta: 'Criterios solicitados', expresion: `tol = ${calculo.tol}` }], resultado: `n = ${A.length}`, pregunta: q[0],
    matrices: [{ titulo: '[A | b]', valores: A.map((f, i) => [...f, b[i]]), aumentada: true }, { titulo: 'Vector inicial x⁽⁰⁾', valores: x0.map(v => [v]) }] }];
  for (const fila of resultado.iteracionesDetalle.slice(0, 3)) {
    const anterior = fila.k === 1 ? resultado.inicial! : resultado.iteracionesDetalle[fila.k - 2];
    const preguntaPaso = preguntaNumero(`barrida-${fila.k}`, `¿Cuál es la primera componente después de la barrida ${fila.k}?`, fila.x[0], 'Sustituye los valores de la barrida en la primera ecuación despejada.');
    q.push(preguntaPaso);
    guia.push({ titulo: `Barrida ${fila.k}`, explicacion: metodo === 'jacobi' ? 'Todas las componentes se calculan con el vector anterior; se reemplaza el vector completo al terminar.' : 'Se actualizan las componentes en orden. Cada valor nuevo se utiliza inmediatamente en las ecuaciones siguientes.',
      cuentas: cuentasIteracion(A, b, anterior.x, fila.x, metodo),
      resultado: `x = ${vector(fila.x)}`, pregunta: preguntaPaso,
      matrices: [{ titulo: `x anterior (k = ${fila.k - 1})`, valores: anterior.x.map(v => [v]) }, { titulo: `x nuevo (k = ${fila.k})`, valores: fila.x.map(v => [v]) }] });
  }
  const ultima = resultado.iteracionesDetalle.at(-1) ?? resultado.inicial!;
  guia.push({ titulo: 'Continuar hasta cumplir ambos criterios', explicacion: 'Las primeras barridas ilustran el procedimiento. El motor continúa con las mismas reglas, sin redondear los valores internos.',
    cuentas: [{ etiqueta: 'Cambio escalado final', expresion: `δ = ${numero(ultima.cambioRelativo)}` }, { etiqueta: 'Residuo relativo final', expresion: `η = ${numero(ultima.residuoRelativo)}` }],
    resultado: `Iteraciones = ${resultado.iteraciones}`, pregunta: q[8] });
  guia.push({ titulo: 'Comprobar en el sistema original', explicacion: 'Calcula el residuo con A y b originales. El residuo no es el error real respecto del vector exacto.',
    cuentas: [{ etiqueta: 'Residuo absoluto final', expresion: `||Ax − b|| = ${numero(ultima.residuo)}` }], resultado: `x ≈ ${vector(ultima.x)}`, pregunta: q[10],
    matrices: [{ titulo: 'Aproximación validada x', valores: ultima.x.map(v => [v]) }, { titulo: 'Residuo Ax − b', valores: residuos(A, b, ultima.x).map(v => [v]) }] });
  return {
    id, titulo, tipo, enunciado, calculo, guia, cuestionario: q,
    ecuacion: A.map((f, i) => f.map((a, j) => `(${a})x${j + 1}`).join(' + ') + ` = ${b[i]}`).join('\n'),
    parametros: [{ etiqueta: 'Matriz A', valor: JSON.stringify(A) }, { etiqueta: 'Vector b', valor: JSON.stringify(b) }, { etiqueta: 'Vector inicial', valor: JSON.stringify(x0) }, { etiqueta: 'Tolerancia', valor: '0.000001' }],
    interpretacion: tipo === 'casuistica' ? 'Cada columna representa una cantidad desconocida y cada fila un balance de recursos. Los coeficientes y totales son datos simulados para practicar.' : 'Cada fila es una ecuación; las columnas conservan el mismo orden de incógnitas en todos los vectores.',
    pasos: [], algoritmo: config.formula, criterio: 'Exigir δ ≤ tol y η ≤ tol; detenerse si se alcanza el límite, aparece un valor no finito o hay estancamiento.',
    conclusion: `La aproximación x ≈ ${vector(ultima.x)} cumple los criterios en ${resultado.iteraciones} barridas. Residuo relativo η ≈ ${numero(ultima.residuoRelativo)}.`,
    formatoRespuesta: 'vector', resolucion: { valorCorrecto: exacta, tolerancia: 1e-4, etiqueta: 'Vector x, en orden', respuestaFinalTexto: `x = ${vector(exacta)}. Sustituye cada componente en el sistema original.` },
  };
}

export function ejemplosIterativos(metodo: MetodoIterativo): ConGuia<EjercicioSistema>[] {
  return [
    construir(metodo, `${metodo}-ej-1`, 'Dos incógnitas: observar la primera barrida', [[4, 1], [2, 3]], [1, 2], 'numerico'),
    construir(metodo, `${metodo}-ej-2`, 'Tres ecuaciones con signos diferentes', [[10, -1, 2], [-1, 11, -1], [2, -1, 10]], [1, 2, -1], 'numerico'),
    construir(metodo, `${metodo}-ej-3`, 'Producción de dos tipos de piezas', [[5, 1], [1, 4]], [12, 8], 'casuistica', 'Una pieza A consume 5 unidades de acero y 1 de pintura; una B consume 1 de acero y 4 de pintura. Hay 68 unidades de acero y 44 de pintura. ¿Qué producción utiliza ambos recursos? Datos simulados.'),
    construir(metodo, `${metodo}-ej-4`, 'Plan de producción con tres recursos', [[7, 1, 2], [1, 8, 1], [2, 1, 9]], [5, 3, 4], 'casuistica', 'Se fabrican tres productos. Cada fila del sistema indica su consumo de un recurso y la disponibilidad total. Encuentra las cantidades a producir usando todos los recursos. Datos simulados.', [1, 1, 1]),
  ];
}

export function crearBancoIterativo(metodo: MetodoIterativo): ConGuia<EjercicioSistema>[] {
  const contextos = [
    ['Plan de producción', 'Una planta fabrica varios productos; las filas describen los consumos por producto y el total disponible de cada recurso.'],
    ['Mezcla de ingredientes', 'Las columnas representan cantidades de ingredientes; cada fila registra el aporte a una característica de la mezcla y el total requerido.'],
    ['Precios de paquetes', 'Cada incógnita es el precio de un producto. Las filas indican cantidades compradas y el coste total de varios paquetes.'],
    ['Distribución de materiales', 'Las incógnitas son cantidades de lotes enviados. Las filas indican el consumo de materiales por lote y el total que debe distribuirse.'],
  ];
  return Array.from({ length: 24 }, (_, i) => {
    const aplicado = i >= 12;
    const n = aplicado ? 2 + i % 2 : 2 + i % 3;
    const A = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => r === c ? 0 : aplicado ? 1 + (i + r + c) % 3 : (i + 2 * r + c) % 5 - 2));
    A.forEach((f, r) => { f[r] = f.reduce((s, v) => s + Math.abs(v), 0) + 3 + i % 4; });
    const exacta = Array.from({ length: n }, (_, j) => aplicado ? 2 + (i + j) % 7 : (i + 2 * j) % 7 - 3);
    const [titulo, contexto] = contextos[(i - 12 + 12) % 4];
    return construir(metodo, `${metodo}-banco-${i + 1}`, aplicado ? `${titulo} · caso ${i - 11}` : `Sistema ${n} × ${n} · caso ${i + 1}`,
      A, exacta, aplicado ? 'casuistica' : 'numerico', aplicado ? `${contexto} Usa los balances indicados para calcular las cantidades desconocidas. Datos simulados.` : undefined,
      Array.from({ length: n }, () => i % 3 === 0 ? 1 : 0));
  });
}
