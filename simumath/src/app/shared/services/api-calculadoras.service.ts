/**
 * CLIENTE REST DE LAS CALCULADORAS — frontend ↔ API de backend (FastAPI).
 *
 * ── ESTADO ACTUAL ────────────────────────────────────────────────────────
 * La API ya expone Bisección (endpoint `POST /metodos/biseccion`) y este
 * servicio la consume: manda el body tipado, recibe el JSON del backend y
 * lo mapea a `MetodoResultado` (el formato que ya entiende la tabla de
 * iteraciones del front). Si el backend NO responde (red/CORS/500), la
 * calculadora cae al motor local (shared/domain/numerico) para que la
 * demo nunca se rompa.
 *
 * ADVERTENCIA CORS: tu FastAPI debe incluir el origen del dev server en el
 * CORSMiddleware. Hoy permite `http://localhost:4444` pero NO la variante
 * `http://127.0.0.1:4444` (uvicorn escucha en ambas). Corregir en main.py:
 *
 *   app.add_middleware(
 *     CORSMiddleware,
 *     allow_origins=["http://localhost:4444", "http://127.0.0.1:4444"],
 *     ...
 *   )
 *
 * ── CONTRATO DEL BACKEND (Bisección) ─────────────────────────────────────
 *   POST /metodos/biseccion
 *   body: { funcion, a, b, max_iteraciones, tolerancia }   (a y b NÚMEROS)
 *   resp: ver `BiseccionResponse` más abajo (coincide 1:1 con el JSON
 *         real del backend; ej. modulos/modulo1-info/response_*.json).
 *
 * ── PENDIENTE (para cuando existan los endpoints) ────────────────────────
 * Los otros 4 métodos están declarados abajo como stubs documentados
 * (`calcularNewtonApi`, `calcularReglaFalsaApi`, `calcularSecanteApi`,
 * `calcularPuntoFijoApi`): completalos copiando el patrón de Bisección
 * apenas la API los exponga. El front los sigue resolviendo con el motor
 * local mientras tanto (ver `calcular()` en calculadoras.ts).
 */

import { MetodoResultado, IterRow, fmt } from '../domain/numerico/methods';
import { razonDeParada } from '../domain/numerico/criterio';

/**
 * Error del cliente API con un `tipo` que permite decidir qué hacer:
 *  - 'conexion': no se llegó al backend (red/CORS apagado) → el front
 *    puede caer al motor local sin romper la demo.
 *  - 'backend':  el backend SÍ respondió, pero rechazó el cálculo
 *    (422 de Pydantic, 400, 500) → conviene mostrar el detalle al usuario.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly tipo: 'conexion' | 'backend',
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Base de la API. Cambiá acá el origen si deployás el backend a otro host.
 * Usá `localhost` (no `127.0.0.1`) para que CORS pase con la config actual.
 */
export const API_BASE_URL = 'http://localhost:8000';

/* ------------------------------------------------------------------ */
/* DTOs de entrada (body de los endpoints)                             */
/* ------------------------------------------------------------------ */

/** Body de `POST /metodos/biseccion` — a y b son NÚMEROS (no strings). */
export interface BiseccionRequestBody {
  /** Expresión f(x) en la notación del portal, p. ej. 'x^3 - x - 2'. */
  funcion: string;
  /** Extremo inferior del intervalo [a, b]. */
  a: number;
  /** Extremo superior del intervalo [a, b]. */
  b: number;
  /** Límite de iteraciones (el motor local usa 50). */
  max_iteraciones: number;
  /** Tolerancia de parada |Δc| ≤ tol. */
  tolerancia: number;
}

/* ------------------------------------------------------------------ */
/* DTOs de salida (response del backend)                               */
/* ------------------------------------------------------------------ */

/** Una fila del historial de iteraciones que devuelve el backend. */
export interface BiseccionIteracionApi {
  iteracion: number;
  a: number;
  b: number;
  xm: number;
  fxm: number;
  /** f(a)·f(xm): criterio de Bolzano aplicado en cada paso. */
  prod_signo: number;
  /** Error relativo porcentual de la iteración. null en la primera. */
  error_porcentual: number | null;
}

/** Respuesta completa de `POST /metodos/biseccion`. */
export interface BiseccionResponse {
  funcion: string;
  a_inicial: number;
  b_inicial: number;
  tolerancia: number;
  max_iteraciones: number;
  convergio: boolean;
  /** 'tolerancia' | 'max_iteraciones' (por qué se detuvo). */
  criterio_parada: string;
  raiz_aproximada: number;
  f_raiz: number;
  iteraciones_realizadas: number;
  iteraciones: BiseccionIteracionApi[];
}

/* ------------------------------------------------------------------ */
/* Bisección — ENDPOINT ACTIVO                                         */
/* ------------------------------------------------------------------ */

/**
 * Llama a `POST /metodos/biseccion` con fetch.
 * Lanza Error con mensaje legible si la red falla, el backend devuelve
 * un error de validación (400/422) o un 500.
 */
export async function calcularBiseccionApi(
  body: BiseccionRequestBody,
): Promise<BiseccionResponse> {
  let resp: Response;
  try {
    resp = await fetch(`${API_BASE_URL}/metodos/biseccion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // fetch solo falla por red/CORS; el backend puede estar apagado, el
    // origen desautorizado (ver ADVERTENCIA CORS arriba) o sin internet.
    throw new ApiError(
      `No se pudo conectar con la API (${API_BASE_URL}). ` +
        '¿Está corriendo el backend? ¿El origen está permitido en CORS?',
      'conexion',
    );
  }

  if (!resp.ok) {
    // FastAPI responde { detail: "..." } en validaciones (400/422) y errores.
    let detalle = `HTTP ${resp.status}`;
    try {
      const err = (await resp.json()) as { detail?: unknown };
      if (typeof err.detail === 'string') detalle = err.detail;
      else if (Array.isArray(err.detail)) {
        // 422 de Pydantic: lista de errores de validación de campos.
        detalle = err.detail
          .map((d) => {
            const loc = (d as { loc?: unknown[] }).loc ?? [];
            return `'${loc[loc.length - 1]}': ${(d as { msg?: string }).msg ?? ''}`;
          })
          .join('; ');
      }
    } catch {
      /* el cuerpo no era JSON: nos quedamos con el código HTTP */
    }
    throw new ApiError(`El backend rechazó el cálculo: ${detalle}`, 'backend');
  }

  return (await resp.json()) as BiseccionResponse;
}

/**
 * Mapea la respuesta del backend al `MetodoResultado` que usa la UI.
 * Traducción de columnas:
 *   iteracion → i      | xm → c        | a → a       | b → b
 *   fxm → f(c)         | prod_signo → f(a)·f(c)      | error_porcentual → Error %
 * La columna |Δc| (ancho del nuevo intervalo) no viaja en el JSON: se
 * deduce de la misma fila con |b − a| / 2 (a y b del intervalo partido),
 * idéntico a como lo calcula el motor local.
 * Los valores se formatean con fmt() (8 decimales, '—' si no es finito)
 * para que la tabla se vea igual que con el cálculo local.
 *
 * SOBRE LA RAZÓN DE PARADA: el backend trae `criterio_parada` como texto libre
 * ('tolerancia' | 'max_iteraciones') y `tolerancia`, pero no trae la magnitud
 * que midió. Para que `parada` diga lo mismo que el motor local, acá se
 * RECONSTRUYE desde los datos que sí viajan:
 *   - la magnitud es el |Δc| de la última fila, o sea (b − a)/2 del intervalo
 *     final, que es la cota de Bolzano que el propio backend usó para parar;
 *   - el criterio es 'intervalo', el mismo default que el motor local para
 *     bisección.
 * Si el backend se detuvo por max_iteraciones, no hay razón de convergencia que
 * informar, así que `parada` va ausente igual que en el motor local.
 */
export function mapearBiseccionApi(resp: BiseccionResponse): MetodoResultado {
  const rows: IterRow[] = resp.iteraciones.map((it) => ({
    i: it.iteracion,
    a: fmt(it.a),
    b: fmt(it.b),
    c: fmt(it.xm),
    'f(c)': fmt(it.fxm),
    '|Δc|': fmt(Math.abs(it.b - it.a) / 2),
    // Columnas extra que solo aporta el backend:
    'f(a)·f(c)': fmt(it.prod_signo),
    'Error %': it.error_porcentual === null ? '—' : fmt(it.error_porcentual),
  }));

  // SeStopped por tolerancia: el backend paró porque (b−a)/2 ≤ tolerancia.
  const paroPorTolerancia =
    resp.convergio && resp.criterio_parada.toLowerCase().includes('toleran');

  const ultima = resp.iteraciones[resp.iteraciones.length - 1];
  const magnitudFinal = ultima ? Math.abs(ultima.b - ultima.a) / 2 : undefined;

  return {
    rows,
    converged: resp.convergio,
    iterations: resp.iteraciones_realizadas,
    parada:
      paroPorTolerancia && magnitudFinal !== undefined
        ? razonDeParada('intervalo', { semiancho: magnitudFinal }, resp.tolerancia, false)
        : undefined,
    error: resp.convergio
      ? undefined
      : `No convergió: se detuvo por ${resp.criterio_parada} ` +
        `tras ${resp.iteraciones_realizadas} iteraciones.`,
  };
}

/* ------------------------------------------------------------------ */
/* Los 4 métodos restantes — STUBS DOCUMENTADOS                        */
/* ------------------------------------------------------------------ */
/* Copiá el patrón de Bisección apenas la API los exponga. Mientras no   */
/* existan, calculadoras.ts los resuelve con el motor local.            */

/**
 * @todo Cuando exista `POST /metodos/newton`.
 * Body probable (validar contra el docs de tu API):
 *   { funcion, semilla, max_iteraciones, tolerancia }
 */
export async function calcularNewtonApi(
  _body: unknown,
): Promise<BiseccionResponse> {
  throw new Error('El endpoint newton aún no está disponible en la API.');
}

/**
 * @todo Cuando exista `POST /metodos/regla_falsa`.
 * Body probable: { funcion, a, b, max_iteraciones, tolerancia }
 */
export async function calcularReglaFalsaApi(
  _body: unknown,
): Promise<BiseccionResponse> {
  throw new Error('El endpoint regla_falsa aún no está disponible en la API.');
}

/**
 * @todo Cuando exista `POST /metodos/secante`.
 * Body probable: { funcion, x0, x1, max_iteraciones, tolerancia }
 */
export async function calcularSecanteApi(
  _body: unknown,
): Promise<BiseccionResponse> {
  throw new Error('El endpoint secante aún no está disponible en la API.');
}

/**
 * @todo Cuando exista `POST /metodos/punto_fijo`.
 * Body probable: { funcion (es g(x)), semilla, max_iteraciones, tolerancia }
 */
export async function calcularPuntoFijoApi(
  _body: unknown,
): Promise<BiseccionResponse> {
  throw new Error('El endpoint punto_fijo aún no está disponible en la API.');
}