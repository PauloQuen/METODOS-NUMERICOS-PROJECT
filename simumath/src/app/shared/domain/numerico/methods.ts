/**
 * NÚCLEO NUMÉRICO DEL MÓDULO 1 — funciones puras, sin Angular.
 *
 * Este archivo es el motor matemático del front y la hoja de ruta 1:1 del
 * backend futuro: cada método se replica en la API REST con su MISMA firma
 * (entradas → MetodoResultado). Lo consumen:
 *   - Calculadoras  → ejecuta los 5 métodos sobre los datos del estudiante.
 *   - Ejemplos      → tipa las filas de las tablas (IterRow).
 *   - Gráficos      → pinta curva e iteraciones de los ejemplos fijos.
 *
 * ── Criterio de convergencia ────────────────────────────────────────────
 * La parada la decide `criterio.ts`, NO este archivo. Cada método declara sus
 * magnitudes (`|Δx|`, `(b−a)/2`, `|f(x)|`) y el contrato evalúa. El criterio
 * por defecto es siempre un error sobre x (absoluto o relativo), lo que
 * garantiza dos cosas que el motor anterior no tenía:
 *   - INVARIANCIA A ESCALA: multiplicar f por una constante no cambia su
 *     raíz, así que no debe cambiar el número de iteraciones.
 *   - RESPETO DE LA TOLERANCIA: el método para cuando la magnitud medida
 *     cumple lo pedido, no antes por un residuo engañoso.
 *
 * La firma pública de los 5 métodos NO cambia: siguen siendo
 * (f, a, b, tol, maxIter) → MetodoResultado. El criterio es un parámetro
 * opcional al final, así que las llamadas existentes de la UI siguen
 * funcionando sin tocarlas.
 *
 * ── Contrato de API ─────────────────────────────────────────────────────
 * La respuesta de TODOS los endpoints es MetodoResultado (rows, converged,
 * iterations, error?). Los bodies tipados están más abajo en este archivo:
 *
 *   POST /api/modulo1/calculadoras/biseccion   body: IntervaloRequest
 *   POST /api/modulo1/calculadoras/reglaFalsa  body: IntervaloRequest
 *   POST /api/modulo1/calculadoras/newton      body: SemillaRequest
 *   POST /api/modulo1/calculadoras/secante     body: SecanteRequest
 *   POST /api/modulo1/calculadoras/puntoFijo   body: PuntoFijoRequest
 *
 * Los valores del body llegan como STRING (vienen de inputs del front); el
 * backend debe parsearlos con Number() y validarlos ANTES de llamar al
 * algoritmo. parseFuncion es el parseo de expresiones que el backend debe
 * replicar (ver su JSDoc).
 */

import {
  CriterioKey,
  CRITERIO_POR_DEFECTO,
  CRITERIO_POR_DEFECTO_INTERVALO,
  Magnitudes,
  RazonParada,
  cumple,
  esRaizExacta,
  razonDeParada,
} from './criterio';
import { parsearFuncion } from './evaluador-funciones';

export type IterRow = Record<string, string | number>;

export interface IterResult {
  rows: IterRow[];
  converged: boolean;
  iterations: number;
  /** Mensaje de error si el método no pudo ejecutarse. */
  error?: string;
  /** Por qué se detuvo, si se detuvo. La interfaz lo muestra al alumno. */
  parada?: RazonParada;
}

/** Formatea un número con hasta 8 decimales, sin ceros colgantes.
 *  Exportado para que la adaptación API (api-calculadoras.service) muestre
 *  los valores del backend con el MISMO formato que el motor local. */
export function fmt(v: number): string {
  if (!Number.isFinite(v)) return '—';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(8).replace(/\.?0+$/, '');
}

export interface MetodoResultado {
  rows: IterRow[];
  converged: boolean;
  iterations: number;
  error?: string;
  /**
   * Por qué se detuvo el método y con qué magnitud. La interfaz lo muestra
   * para que el alumno vea la razón, no solo el hecho.
   * Ausente si el cálculo falló antes de iterar.
   */
  parada?: RazonParada;
}

/**
 * ¿Terminó esta iteración? Evalúa la raíz exacta primero (es el criterio más
 * fuerte y no depende de la tolerancia) y después el criterio pedido.
 * Devuelve la razón de parada para poder reportarla.
 */
function evaluarParada(
  criterio: CriterioKey,
  magnitudes: Magnitudes,
  tol: number,
): RazonParada | undefined {
  const exacta = esRaizExacta(magnitudes);
  if (exacta) return razonDeParada(criterio, magnitudes, tol, true);
  if (cumple(criterio, magnitudes, tol)) {
    return razonDeParada(criterio, magnitudes, tol, false);
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* DTOs de API — espejan los bodies de los endpoints REST y los        */
/* valores que manda el front (strings de inputs, sin parsear).        */
/* ------------------------------------------------------------------ */

/** Body de los métodos de intervalo: POST .../{biseccion | reglaFalsa}. */
export interface IntervaloRequest {
  /** Expresión f(x) en la notación del portal, p. ej. 'x^3 - x - 2'. */
  funcion: string;
  valorA: string;
  valorB: string;
  tolerancia: string;
}

/** Body de Newton y Punto Fijo: POST .../{newton | puntoFijo}. */
export interface SemillaRequest {
  /** Para puntoFijo esta función ES g(x), la iteración xₙ₊₁ = g(xₙ). */
  funcion: string;
  /** Semilla inicial x₀. */
  semilla: string;
  tolerancia: string;
}

/** Body de la Secante: POST .../secante. */
export interface SecanteRequest {
  funcion: string;
  /** Primera aproximación x₀. */
  semilla: string;
  /** Segunda aproximación x₁. */
  semilla2: string;
  tolerancia: string;
}

/** Respuesta de TODOS los endpoints: idéntica a MetodoResultado. */
export type CalculadoraResponse = MetodoResultado;

/** Convierte una expresión "x^3 - x - 2" en una función evaluable.
 *
 *  Delega en `evaluador-funciones.ts`, que arma un árbol de expresiones y
 *  lo recorre. Antes esta función usaba `new Function()`, es decir, capaz
 *  de ejecutar código arbitrario escrito por el alumno; el enunciado del
 *  TP lo prohíbe explícitamente y además rompe con una CSP estricta.
 *
 *  Ventaja extra del árbol: el gráfico puede recorrerlo para saber dónde
 *  la curva existe y dónde no, en vez de adivinar con try/catch.
 *
 *  @endpoint El backend DEBE replicar este parseo tal cual (y validar con
 *  los mismos puntos de prueba) para aceptar las expresiones del front. */
export function parseFuncion(expr: string): (x: number) => number {
  try {
    return parsearFuncion(expr);
  } catch (e) {
    // El mensaje del evaluador ya viene en español y explica qué falló.
    // Lo re-lanzamos como Error para no cambiar el contrato de esta función.
    throw e instanceof Error ? e : new Error('Expresión no válida.');
  }
}

/**
 * Método de Bisección (acotación por intervalos).
 *
 * Criterio por defecto: `intervalo`, la cota a posteriori de Bolzano. La raíz
 * está a distancia (b−a)/2 de xm, así que ese es el error ACOTADO y no una
 * diferencia entre iteraciones. Si el caller pide `absoluto` o `relativo`, se
 * mide sobre |xᵢ − xᵢ₋₁| igual que en cualquier otro método.
 *
 * Por qué el default NO es el residuo: |f(x)| escala con la constante que
 * multipliques f, así que un criterio por residuo haría que el número de
 * iteraciones dependiera de cómo se escribió el enunciado. El ancho del
 * intervalo no depende de f en absoluto.
 *
 * @endpoint POST /api/modulo1/calculadoras/biseccion — body: IntervaloRequest.
 */
export function biseccion(
  f: (x: number) => number,
  a: number,
  b: number,
  tol: number,
  maxIter = 50,
  criterio: CriterioKey = CRITERIO_POR_DEFECTO_INTERVALO,
): MetodoResultado {
  let fa = f(a);
  let fb = f(b);

  if (!Number.isFinite(fa) || !Number.isFinite(fb)) {
    return {
      rows: [],
      converged: false,
      iterations: 0,
      error: 'La función no es evaluable en el intervalo dado.',
    };
  }
  if (fa * fb >= 0) {
    return {
      rows: [],
      converged: false,
      iterations: 0,
      error: 'No hay cambio de signo en el intervalo (no aplica Bolzano).',
    };
  }

  const rows: IterRow[] = [];
  let iteracionesHechas = 0;
  let parada: RazonParada | undefined;
  let cAnterior: number | undefined;

  for (let i = 1; i <= maxIter; i++) {
    const c = (a + b) / 2;
    const fc = f(c);
    const semiancho = Math.abs((b - a) / 2); // cota de Bolzano
    const delta = cAnterior === undefined ? undefined : Math.abs(c - cAnterior);

    rows.push({
      i,
      a: fmt(a),
      b: fmt(b),
      c: fmt(c),
      'f(c)': fmt(fc),
      '|Δc|': fmt(semiancho),
    });
    iteracionesHechas = i;

    parada = evaluarParada(
      criterio,
      { delta, valor: c, semiancho, residuo: Math.abs(fc) },
      tol,
    );
    if (parada) break;

    cAnterior = c;
    if (fa * fc < 0) {
      b = c;
      fb = fc;
    } else {
      a = c;
      fa = fc;
    }
  }

  if (!parada) {
    return {
      rows,
      converged: false,
      iterations: maxIter,
      error: 'No convergió dentro del máximo de iteraciones.',
    };
  }
  return { rows, converged: true, iterations: iteracionesHechas, parada };
}

/**
 * Método de Regla Falsa: como la bisección, pero corta el intervalo con la
 * cuerda que une (a, f(a)) y (b, f(b)).
 *
 * Criterio por defecto: `absoluto`, o sea |xᵢ − xᵢ₋₁| ≤ tol. NO `intervalo`.
 *
 * POR QUÉ NO USA LA COTA DE BOLZANO (medido, no supuesto):
 * la bisección parte el intervalo a la mitad exacta, así que su ancho baja
 * 1 → 0.5 → 0.25 → 0.125 y el criterio de intervalo es una cota apretada:
 *
 *   bisección    i=1 [1, 2]            (b−a)/2 = 5.0e-1
 *                i=2 [1.5, 2]          (b−a)/2 = 2.5e-1
 *                i=4 [1.5, 1.625]      (b−a)/2 = 6.3e-2
 *
 * La regla falsa reemplaza UN extremo por el corte de la cuerda, y ese corte
 * cae cerca del extremo cuyo |f| es mayor. El otro extremo puede quedar
 * CONGELADO muchas iteraciones seguidas:
 *
 *   regla falsa  i=1 [1, 2]            (b−a)/2 = 5.0e-1
 *                i=4 [1.504, 2]        (b−a)/2 = 2.48e-1
 *                i=8 [1.5213, 2]       (b−a)/2 = 2.394e-1
 *                i=12 [1.5214, 2]      (b−a)/2 = 2.393e-1  ← congelado
 *
 * El extremo b se queda clavado en 2 para siempre, así que la cota se
 * estabiliza en ≈0.239 y NO BAJA. Con tol = 1e-4 el criterio de intervalo es
 * matemáticamente incapaz de cumplirse: la única salida sería una raíz exacta
 * por casualidad (que fue justo lo que pasó, en la iteración 30).
 *
 * Esa es también la lección clásica del método: la regla falsa tiene
 * CONVERGENCIA LINEAL y es susceptible de ESTANCAMIENTO DE EXTREMO, al
 * contrario que la bisección, que siempre reduce el intervalo a la mitad.
 *
 * NOTA sobre lo que se eliminó: la versión anterior paraba por |f(c)| ≤ tol y
 * calculaba una variable `delta` que siempre valía 0 y se descartaba con
 * `void delta`. El criterio por residuo era el causante de que este método
 * fuera el peor caso de invariancia a escala: con f escalada por 1e6 pasaba
 * de 9 a 20 iteraciones.
 *
 * @endpoint POST /api/modulo1/calculadoras/reglaFalsa — body: IntervaloRequest.
 */
export function reglaFalsa(
  f: (x: number) => number,
  a: number,
  b: number,
  tol: number,
  maxIter = 50,
  criterio: CriterioKey = CRITERIO_POR_DEFECTO,
): MetodoResultado {
  let fa = f(a);
  let fb = f(b);

  if (!Number.isFinite(fa) || !Number.isFinite(fb)) {
    return { rows: [], converged: false, iterations: 0, error: 'La función no es evaluable en el intervalo dado.' };
  }
if (fa * fb >= 0) {
    return { rows: [], converged: false, iterations: 0, error: 'No hay cambio de signo en el intervalo (no aplica Bolzano).' };
  }

  const rows: IterRow[] = [];
  let iteracionesHechas = 0;
  let parada: RazonParada | undefined;
  let cAnterior: number | undefined;

  for (let i = 1; i <= maxIter; i++) {
    const c = a - (fa * (b - a)) / (fb - fa);
    const fc = f(c);
    const semiancho = Math.abs((b - a) / 2);
    const delta = cAnterior === undefined ? undefined : Math.abs(c - cAnterior);

    rows.push({
      i,
      a: fmt(a),
      b: fmt(b),
      c: fmt(c),
      'f(c)': fmt(fc),
      '|Δc|': fmt(semiancho),
    });
    iteracionesHechas = i;

    parada = evaluarParada(
      criterio,
      { delta, valor: c, semiancho, residuo: Math.abs(fc) },
      tol,
    );
    if (parada) break;

    cAnterior = c;
    if (fa * fc < 0) {
      b = c;
      fb = fc;
    } else {
      a = c;
      fa = fc;
    }
  }

  if (!parada) {
    return { rows, converged: false, iterations: maxIter, error: 'No convergió dentro del máximo de iteraciones.' };
  }
  return { rows, converged: true, iterations: iteracionesHechas, parada };
}

/**
 * Método de la Secante: aproxima la derivada con las dos últimas iteraciones.
 * Orden superlineal (p ≈ 1.618). No requiere derivada explícita.
 *
 * Criterio por defecto: `absoluto`, o sea |xᵢ − xᵢ₋₁| ≤ tol.
 *
 * NOTA sobre lo que se corrigió: la versión anterior paraba con
 * `|f(x)| ≤ tol || |Δx| ≤ tol`. Como el residuo se cumplía primero, el método
 * declaraba convergencia con |Δx| = 4.5 × la tolerancia pedida: le mentía al
 * alumno sobre la precisión real de su respuesta. Ahora el residuo queda
 * informativo y decide el error en x.
 *
 * @endpoint POST /api/modulo1/calculadoras/secante — body: SecanteRequest.
 */
export function secante(
  f: (x: number) => number,
  x0: number,
  x1: number,
  tol: number,
  maxIter = 50,
  criterio: CriterioKey = CRITERIO_POR_DEFECTO,
): MetodoResultado {
  let xPrev = x0;
  let xCur = x1;
  let fPrev = f(xPrev);
  let fCur = f(xCur);
  const rows: IterRow[] = [];

  if (!Number.isFinite(fPrev) || !Number.isFinite(fCur)) {
    return { rows: [], converged: false, iterations: 0, error: 'La función no es evaluable en los valores iniciales.' };
  }
  if (fPrev === fCur) {
    return { rows: [], converged: false, iterations: 0, error: 'f(x₀) = f(x₁): la secante es horizontal y no puede cortar el eje.' };
  }

  let iteracionesHechas = 0;
  let parada: RazonParada | undefined;

  for (let i = 1; i <= maxIter; i++) {
    if (Math.abs(fCur - fPrev) < 1e-14) {
      return { rows, converged: false, iterations: i - 1, error: 'f(xₙ) ≈ f(xₙ₋₁): secante casi horizontal, no puede avanzar.' };
    }
    const xNext = xCur - (fCur * (xCur - xPrev)) / (fCur - fPrev);
    const fNext = f(xNext);

    if (!Number.isFinite(fNext)) {
      return { rows, converged: false, iterations: i, error: 'La iteración produce un valor no finito (overflow o fuera de dominio).' };
    }

    const delta = Math.abs(xNext - xCur);

    rows.push({
      i,
      'xᵢ': fmt(xNext),
      'xᵢ₋₁': fmt(xCur),
      'f(xᵢ)': fmt(fNext),
      '|Δx|': fmt(delta),
    });
    iteracionesHechas = i;

    parada = evaluarParada(criterio, { delta, valor: xNext, residuo: Math.abs(fNext) }, tol);
    if (parada) break;

    xPrev = xCur;
    fPrev = fCur;
    xCur = xNext;
    fCur = fNext;
  }

  if (!parada) {
    return { rows, converged: false, iterations: maxIter, error: 'No convergió dentro del máximo de iteraciones.' };
  }
  return { rows, converged: true, iterations: iteracionesHechas, parada };
}

/**
 * Método de Punto Fijo: itera x_{n+1} = g(x_n).
 * Requiere que g cumpla la condición de contracción |g'(x)| < 1 en la región.
 *
 * Criterio por defecto: `absoluto`, o sea |xₙ₊₁ − xₙ| ≤ tol.
 *
 * NOTAS sobre lo que se corrigió:
 *  - La rama `|| |xNext - x| <= tol * 1e-3` era CÓDIGO MUERTO: `|xNext - x|`
 *    es el mismo `deltaX` de la condición de la izquierda, así que la segunda
 *    rama solo podía activarse si `deltaX ≤ tol`, que es exactamente lo que
 *    la primera ya cubre. Un umbral 1000 veces más estricto que nunca se
 *    alcanzaba.
 *  - La detección de oscilación leía `|Δx|` del STRING ya redondeado a 8
 *    decimales (`Number(rows[n]['|Δx|'])`), o sea comparaba magnitudes
 *    truncadas. Ahora lleva los deltas en crudo.
 *  - Se elimina `void esGp`, variable muerta.
 *
 * LIMITACIÓN DEL CONTRATO (importante para el material): este método recibe
 * `g`, no `f`, así que NO puede verificar que el punto fijo alcanzado sea raíz
 * de f. Con g(x) = 1 "converge" en dos iteraciones a x = 1, donde f(1) = −2.
 * Esa validación le corresponde al enunciado que entrega el par (f, g), no al
 * motor: es la misma responsabilidad que en el método analítico.
 *
 * @endpoint POST /api/modulo1/calculadoras/puntoFijo — body: PuntoFijoRequest
 * (la `funcion` del body ES g(x), no f(x)).
 */
export function puntoFijo(
  g: (x: number) => number,
  x0: number,
  tol: number,
  maxIter = 50,
  criterio: CriterioKey = CRITERIO_POR_DEFECTO,
): MetodoResultado {
  let x = x0;
  const rows: IterRow[] = [];
  let iteracionesHechas = 0;
  let parada: RazonParada | undefined;

  let gx = g(x);
  if (!Number.isFinite(gx)) {
    return { rows: [], converged: false, iterations: 0, error: 'g(x₀) no es evaluable (fuera de dominio).' };
  }

  /** Deltas EN CRUDO, para la detección de oscilación. La tabla guarda el
   *  string formateado, pero comparar strings redondeados pierde precisión
   *  justamente en los casos donde más hace falta: cuando |Δx| ~ 1e-9. */
  const deltasCrudos: number[] = [];

  for (let i = 1; i <= maxIter; i++) {
    if (!Number.isFinite(gx)) {
      return { rows, converged: false, iterations: i - 1, error: 'g(xₙ) no es finito: la iteración sale de la región válida.' };
    }

    const xNext = gx;
    const delta = Math.abs(xNext - x);
    deltasCrudos.push(delta);

    rows.push({
      i,
      'xᵢ': fmt(xNext),
      'g(xᵢ)': fmt(g(xNext)),
      '|Δx|': fmt(delta),
    });
    iteracionesHechas = i;

    // Raíz exacta de g: g(xᵢ) − xᵢ === 0, que es lo que este método puede
    // afirmar sin conocer f.
    const esPuntoFijoExacto = Math.abs(g(xNext) - xNext) === 0;
    parada = evaluarParada(
      criterio,
      { delta, valor: xNext, residuo: esPuntoFijoExacto ? 0 : undefined },
      tol,
    );
    if (parada) break;

    // Detección de oscilación/divergencia sobre los deltas CRUDOS: dos saltos
    // crecientes consecutivos con |Δx| > tol~|g'(x)| ≥ 1, es decir no contrae.
    if (deltasCrudos.length >= 3) {
      const prev = deltasCrudos[deltasCrudos.length - 2];
      const prev2 = deltasCrudos[deltasCrudos.length - 3];
      if (delta > prev * 1.5 && delta > tol && prev > prev2 * 1.1) {
        return {
          rows,
          converged: false,
          iterations: i,
          error: 'La sucesión oscila y no estabiliza (probable |g\'(x)| ≥ 1): verificá la condición de contracción.',
        };
      }
    }

    x = xNext;
    gx = g(x);
  }

  if (!parada) {
    return { rows, converged: false, iterations: maxIter, error: 'No convergió dentro del máximo de iteraciones.' };
  }
  return { rows, converged: true, iterations: iteracionesHechas, parada };
}
/**
 * Método de Newton-Raphson: xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ) con derivada central
 * numérica. Convergencia cuadrática si x₀ está cerca de la raíz.
 *
 * Criterio por defecto: `absoluto`, o sea |xᵢ − xᵢ₋₁| ≤ tol.
 *
 * NOTA sobre la derivada: es central NUMÉRICA, no analítica. Para x³ − x − 2
 * el error relativo contra f'(x) = 3x² − 1 es de 3e-9 %, o sea despreciable
 * para el curso. Pero si el enunciado pide la derivada analítica (que es lo
 * que la autoevaluación hace), el alumno tiene que escribirla a mano: la
 * tabla muestra f'(xᵢ) para que pueda compararla con la suya.
 *
 * @endpoint POST /api/modulo1/calculadoras/newton — body: SemillaRequest.
 */
export function newton(
  f: (x: number) => number,
  x0: number,
  tol: number,
  maxIter = 50,
  criterio: CriterioKey = CRITERIO_POR_DEFECTO,
): MetodoResultado {
  const df = (x: number): number => {
    const h = 1e-6 * Math.max(1, Math.abs(x));
    return (f(x + h) - f(x - h)) / (2 * h);
  };

  let x = x0;
  let fx = f(x);
  const rows: IterRow[] = [];
  let iteracionesHechas = 0;
  let parada: RazonParada | undefined;

  if (!Number.isFinite(fx)) {
    return { rows: [], converged: false, iterations: 0, error: 'La función no es evaluable en la semilla.' };
  }

  for (let i = 1; i <= maxIter; i++) {
    const fp = df(x);
    if (Math.abs(fp) < 1e-12) {
      return { rows, converged: false, iterations: i - 1, error: 'Derivada casi nula en la iteración: el método no puede avanzar.' };
    }

    const xNext = x - fx / fp;
    const fNext = f(xNext);

    if (!Number.isFinite(fNext)) {
      return { rows, converged: false, iterations: i, error: 'La iteración produce un valor no finito (overflow o fuera de dominio).' };
    }

    const delta = Math.abs(xNext - x);

    rows.push({
      i,
      'xᵢ': fmt(xNext),
      'f(xᵢ)': fmt(fNext),
      "f'(xᵢ)": fmt(fp),
      '|Δx|': fmt(delta),
    });
    iteracionesHechas = i;

    fx = fNext;
    parada = evaluarParada(criterio, { delta, valor: xNext, residuo: Math.abs(fNext) }, tol);
    if (parada) break;

    x = xNext;
  }

  if (!parada) {
    return { rows, converged: false, iterations: maxIter, error: 'No convergió dentro del máximo de iteraciones.' };
  }
  return { rows, converged: true, iterations: iteracionesHechas, parada };
}