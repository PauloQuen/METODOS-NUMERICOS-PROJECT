/**
 * NORMALIZACIÓN Y PUNTUACIÓN DE LA BÚSQUEDA GLOBAL.
 *
 * ── El problema del español ──────────────────────────────────────────
 * Quien busca "interpolacion" tiene que encontrar "Interpolación". Eso
 * obliga a quitar tildes y mayúsculas ANTES de comparar, pero también a
 * poder volver al texto original para resaltar la coincidencia sin
 * romper la tilde. Por eso `normalizarConMapa` conserva la posición de
 * cada carácter Normalizado: sin ese mapa, `ó` (que pasa a `o`) correría
 * todos los índices y el resaltado marcaría la letra equivocada.
 *
 * ── Sinónimos ────────────────────────────────────────────────────────
 * No son un lujo: el mismo concepto se busca como "fase 0", "módulo 0",
 * "M0" o "errores". El diccionario traduce variantes a un grupo común y
 * el motor compara contra ese grupo. Se mantiene corto y explícito: un
 * sinónimo inventado es peor que no tenerlo.
 */

/** Quita tildes, pasa a minúsculas y colapsa separadores. */
export function normalizar(texto: string): string {
  return normalizarConMapa(texto).normalizado;
}

export interface TextoNormalizado {
  normalizado: string;
  /** `mapa[i]` = índice del carácter original que produjo `normalizado[i]`. */
  mapa: number[];
}

export function normalizarConMapa(texto: string): TextoNormalizado {
  const original = texto ?? '';
  let normalizado = '';
  const mapa: number[] = [];

  for (let i = 0; i < original.length; i++) {
    const caracter = original[i];

    // Se descompone en base + marcas y se descartan las marcas.
    for (const base of caracter.normalize('NFD')) {
      if (/\p{M}/u.test(base)) continue;

      const limpio = base
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        // Convierte los símbolos matemáticos frecuentes en palabras
        // buscables: "10⁻³" se puede escribir "10^-3".
        .replace(/\u00b2/g, '2')
        .replace(/\u00b3/g, '3');

      for (const c of limpio) {
        normalizado += c;
        mapa.push(i);
      }
    }
  }

  // Colapsa espacios repetidos para que "error   relativo" sea igual a
  // "error relativo". Se rehace el mapa en el mismo paso.
  let colapsado = '';
  const mapaColapsado: number[] = [];
  let anteriorEspacio = true;
  for (let i = 0; i < normalizado.length; i++) {
    const c = normalizado[i];
    if (c === ' ') {
      if (anteriorEspacio) continue;
      anteriorEspacio = true;
    } else {
      anteriorEspacio = false;
    }
    colapsado += c;
    mapaColapsado.push(mapa[i]);
  }

  return { normalizado: colapsado.trim(), mapa: mapaColapsado };
}

/* ------------------------------------------------------------------ */
/* Sinónimos                                                           */
/* ------------------------------------------------------------------ */

/**
 * Cada grupo es una lista de formas equivalentes. Al comparar, todas se
 * reducen a la primera (la forma canónica). Las claves ya vienen
 * normalizadas (sin tildes, en minúsculas).
 */
const GRUPOS_SINONIMOS: readonly (readonly string[])[] = [
  ['modulo 0', 'fase 0', 'modulo cero', 'fase cero', 'm0'],
  ['modulo 1', 'fase 1', 'm1'],
  ['modulo 2', 'fase 2', 'm2'],
  ['modulo 3', 'fase 3', 'm3'],
  ['newton raphson', 'newton', 'raphson'],
  ['error absoluto', 'ea', 'error abs'],
  ['error relativo', 'er', 'error rel'],
  ['error porcentual', 'error percentual', 'error en porcentaje'],
  ['cifras significativas', 'cifras', 'digitos significativos', 'sig figs'],
  ['redondeo', 'redondear', 'redondeado'],
  ['truncamiento', 'truncar', 'truncado'],
  ['punto flotante', 'coma flotante', 'flotante'],
  ['epsilon de maquina', 'epsilon maquina', 'epsilon'],
  ['propagacion de errores', 'propagacion', 'propagacion del error'],
  ['numero de condicion', 'condicionamiento', 'condicion'],
  ['serie de taylor', 'taylor'],
  ['criterio de parada', 'criterio de convergencia', 'tolerancia'],
  ['autoevaluacion', 'ejercicios', 'practica'],
  ['calculadora', 'calculadoras', 'herramienta'],
];

/** Forma canónica de cada variante. */
const CANONICO = new Map<string, string>();
for (const grupo of GRUPOS_SINONIMOS) {
  for (const forma of grupo) CANONICO.set(forma, grupo[0]);
}

/** Expande los tokens de una consulta con sus sinónimos. */
export function expandirTokens(consulta: string): string[] {
  const base = normalizar(consulta)
    .split(' ')
    .filter((t) => t.length > 1 || /^\d$/.test(t));

  const tokens = new Set(base);

  // Frases de dos y tres palabras ("fase 0", "error relativo").
  for (let i = 0; i < base.length; i++) {
    const dos = base.slice(i, i + 2).join(' ');
    if (dos && CANONICO.has(dos)) tokens.add(CANONICO.get(dos)!);
    const tres = base.slice(i, i + 3).join(' ');
    if (tres && CANONICO.has(tres)) tokens.add(CANONICO.get(tres)!);
  }

  for (const token of base) {
    const canonico = CANONICO.get(token);
    if (canonico) tokens.add(canonico);
  }

  // "modulo0" escrito sin espacio.
  const compacto = base.join(' ');
  const sinEspacio = compacto.replace(/modulo (\d)/g, 'modulo $1');
  if (sinEspacio !== compacto) tokens.add(sinEspacio);

  return [...tokens];
}

/* ------------------------------------------------------------------ */
/* Puntuación                                                          */
/* ------------------------------------------------------------------ */

export interface CamposPuntuables {
  titulo: string;
  claves?: readonly string[];
  descripcion?: string;
  cuerpo?: string;
  rutaTexto?: string;
}

/** Palabra completa dentro de un texto ya normalizado. */
function contienePalabra(texto: string, token: string): boolean {
  if (!texto || !token) return false;
  return ` ${texto} `.includes(` ${token} `);
}

function puntuarToken(campos: CamposPuntuables, token: string, consultaEntera: string): number {
  const titulo = normalizar(campos.titulo);
  const claves = (campos.claves ?? []).map(normalizar).join(' | ');
  const descripcion = normalizar(campos.descripcion ?? '');
  const cuerpo = normalizar(campos.cuerpo ?? '');
  const ruta = normalizar(campos.rutaTexto ?? '');

  let puntaje = 0;

  if (titulo === consultaEntera) puntaje += 1000;
  if (titulo.startsWith(consultaEntera)) puntaje += 400;
  if (contienePalabra(titulo, token)) puntaje += 220;
  else if (titulo.includes(token)) puntaje += 150;

  if (contienePalabra(claves, token)) puntaje += 90;
  else if (claves.includes(token)) puntaje += 55;

  if (contienePalabra(descripcion, token)) puntaje += 40;
  else if (descripcion.includes(token)) puntaje += 24;

  if (contienePalabra(cuerpo, token)) puntaje += 18;
  else if (cuerpo.includes(token)) puntaje += 10;

  if (contienePalabra(ruta, token)) puntaje += 12;

  return puntaje;
}

/**
 * Puntaje total de una entrada para una consulta.
 *
 * Se exige que TODOS los tokens aparezcan (AND); si eso deja el
 * resultado vacío, el llamador puede reintentar en modo tolerante (OR).
 * Esa progresión es lo que hace que "error relativo" no devuelva
 * cualquier página que diga "error".
 */
export function puntuarEntrada(
  campos: CamposPuntuables,
  tokens: readonly string[],
  consulta: string,
  exigirTodos = true,
): number {
  if (tokens.length === 0) return 0;

  const consultaEntera = normalizar(consulta);
  let total = 0;

  for (const token of tokens) {
    const p = puntuarToken(campos, token, consultaEntera);
    if (p === 0 && exigirTodos) return 0;
    total += p;
  }

  // Bonus por la frase completa en el título o las claves.
  const titulo = normalizar(campos.titulo);
  if (consultaEntera.length > 2 && titulo.includes(consultaEntera)) total += 300;
  if ((campos.claves ?? []).some((c) => normalizar(c) === consultaEntera)) total += 250;

  return total;
}

/* ------------------------------------------------------------------ */
/* Fragmento con la coincidencia resaltada                             */
/* ------------------------------------------------------------------ */

export interface FragmentoResaltado {
  antes: string;
  coincidencia: string;
  despues: string;
}

/**
 * Devuelve un recorte del texto con la primera coincidencia separada en
 * tres partes, para poder envolverla en `<mark>` sin `innerHTML`.
 */
export function fragmentoCoincidente(
  texto: string,
  tokens: readonly string[],
  maximo = 160,
): FragmentoResaltado | null {
  const { normalizado, mapa } = normalizarConMapa(texto);
  if (!normalizado) return null;

  let indice = -1;
  let largo = 0;

  for (const token of tokens) {
    const encontrado = normalizado.indexOf(token);
    if (encontrado !== -1 && (indice === -1 || encontrado < indice)) {
      indice = encontrado;
      largo = token.length;
    }
  }

  if (indice === -1) return null;

  const inicioOriginal = mapa[indice] ?? 0;
  const finOriginal = (mapa[indice + largo - 1] ?? inicioOriginal) + 1;

  // Recorte simétrico alrededor de la coincidencia, sin cortar palabras
  // si se puede evitar.
  const margen = Math.max(20, Math.floor((maximo - (finOriginal - inicioOriginal)) / 2));
  let desde = Math.max(0, inicioOriginal - margen);
  let hasta = Math.min(texto.length, finOriginal + margen);

  if (desde > 0) {
    const espacio = texto.indexOf(' ', desde);
    if (espacio !== -1 && espacio < inicioOriginal) desde = espacio + 1;
  }
  if (hasta < texto.length) {
    const espacio = texto.lastIndexOf(' ', hasta);
    if (espacio > finOriginal) hasta = espacio;
  }

  const prefijo = desde > 0 ? '… ' : '';
  const sufijo = hasta < texto.length ? ' …' : '';

  return {
    antes: prefijo + texto.slice(desde, inicioOriginal),
    coincidencia: texto.slice(inicioOriginal, finOriginal),
    despues: texto.slice(finOriginal, hasta) + sufijo,
  };
}
