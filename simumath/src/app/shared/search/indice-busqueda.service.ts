import { Injectable, signal } from '@angular/core';
import { MODULOS, PESTANAS_METODO, type MetodoCatalogo } from './catalogo';
import { FUENTES_CONTENIDO } from './fuentes-contenido';
import { expandirTokens, fragmentoCoincidente, normalizar, puntuarEntrada } from './normalizacion';
import type { EntradaBusqueda, GrupoResultados, ResultadoBusqueda, TipoEntrada } from './modelos';

/**
 * ÍNDICE DE BÚSQUEDA GLOBAL.
 *
 * ── De dónde sale ────────────────────────────────────────────────────
 * 1. La ESTRUCTURA (módulos, submódulos, métodos, pestañas, material
 *    general) se deriva de los registros y del catálogo. Es síncrona y
 *    pesa poco.
 * 2. El CONTENIDO (conceptos, ejercicios, recursos) se carga aparte, en
 *    diferido, la primera vez que alguien busca. Así la portada no paga
 *    el precio de indexar 15 métodos que quizá nadie abra.
 *
 * ── El ranking ───────────────────────────────────────────────────────
 * Primero se exige que aparezcan TODOS los tokens de la consulta (AND).
 * Si eso no devuelve nada, se reintenta en modo tolerante (OR) y se
 * ordena por puntaje. Cada campo pesa distinto: título exacto > título
 * parcial > palabras clave > descripción > cuerpo. La ruta completa se
 * muestra siempre, para que el alumno sepa dónde va antes de entrar.
 */

/** Orden de los grupos en el desplegable. */
const ORDEN_GRUPOS: readonly TipoEntrada[] = [
  'modulo',
  'submodulo',
  'metodo',
  'pestana',
  'ejercicio',
  'concepto',
  'recurso',
  'seccion',
];

const ETIQUETAS: Record<TipoEntrada, string> = {
  modulo: 'Módulos',
  submodulo: 'Submódulos',
  metodo: 'Métodos',
  pestana: 'Pestañas',
  ejercicio: 'Ejercicios',
  concepto: 'Conceptos',
  recurso: 'Recursos',
  seccion: 'Material del portal',
};

@Injectable({ providedIn: 'root' })
export class IndiceBusquedaService {
  /** Entradas de estructura: disponibles desde el primer render. */
  private readonly estructurales = construirEntradasEstructurales();

  /** Entradas de contenido: se agregan cuando termina la carga diferida. */
  private readonly deContenido = signal<EntradaBusqueda[]>([]);

  readonly cargando = signal(false);
  readonly contenidoListo = signal(false);

  private cargaEnCurso: Promise<void> | null = null;

  /** Dispara la carga diferida una sola vez; las siguientes llamadas la reutilizan. */
  asegurarContenido(): Promise<void> {
    if (this.contenidoListo()) return Promise.resolve();
    if (this.cargaEnCurso) return this.cargaEnCurso;

    this.cargando.set(true);
    this.cargaEnCurso = Promise.all(
      FUENTES_CONTENIDO.map((fuente) =>
        fuente
          .cargar()
          .then((contenido) => entradasDeContenido(fuente.clave, contenido))
          .catch((error) => {
            // Una fuente rota no puede tumbar el buscador: se registra y
            // se sigue con las demás.
            console.warn(`[busqueda] No se pudo indexar "${fuente.clave}".`, error);
            return [] as EntradaBusqueda[];
          }),
      ),
    )
      .then((porFuente) => {
        this.deContenido.set(porFuente.flat());
        this.contenidoListo.set(true);
      })
      .finally(() => {
        this.cargando.set(false);
        this.cargaEnCurso = null;
      });

    return this.cargaEnCurso;
  }

  /** Busca y devuelve los resultados agrupados por tipo. */
  buscar(consulta: string): GrupoResultados[] {
    const texto = consulta.trim();
    if (normalizar(texto).length < 2) return [];

    const tokens = expandirTokens(texto);
    if (tokens.length === 0) return [];

    const entradas = [...this.estructurales, ...this.deContenido()];

    let puntuados = puntuarTodas(entradas, tokens, texto, true);
    if (puntuados.length === 0) {
      puntuados = puntuarTodas(entradas, tokens, texto, false);
    }

    const deduplicados = deduplicar(puntuados);

    const porTipo = new Map<TipoEntrada, ResultadoBusqueda[]>();
    for (const resultado of deduplicados) {
      const lista = porTipo.get(resultado.tipo) ?? [];
      lista.push(resultado);
      porTipo.set(resultado.tipo, lista);
    }

    return ORDEN_GRUPOS.filter((tipo) => (porTipo.get(tipo)?.length ?? 0) > 0).map((tipo) => ({
      tipo,
      etiqueta: ETIQUETAS[tipo],
      resultados: (porTipo.get(tipo) ?? []).slice(0, 8),
    }));
  }
}

/* ------------------------------------------------------------------ */
/* Puntuación                                                          */
/* ------------------------------------------------------------------ */

function puntuarTodas(
  entradas: readonly EntradaBusqueda[],
  tokens: readonly string[],
  consulta: string,
  exigirTodos: boolean,
): ResultadoBusqueda[] {
  const resultado: ResultadoBusqueda[] = [];

  for (const entrada of entradas) {
    const puntaje = puntuarEntrada(
      {
        titulo: entrada.titulo,
        claves: entrada.claves,
        descripcion: entrada.descripcion,
        cuerpo: entrada.cuerpo,
        rutaTexto: entrada.rutaTexto,
      },
      tokens,
      consulta,
      exigirTodos,
    );
    if (puntaje <= 0) continue;

    const fragmento =
      fragmentoCoincidente(entrada.descripcion, tokens) ??
      fragmentoCoincidente(entrada.cuerpo ?? '', tokens);

    // Copia mutable: el resultado se expone a la vista y no debe compartir
    // la lista de tokens con la consulta original.
    resultado.push({ ...entrada, puntaje, fragmento, tokens: [...tokens] });
  }

  return resultado.sort((a, b) => b.puntaje - a.puntaje);
}

/**
 * Quita duplicados de contenido entre páginas que comparten ejercicios
 * (hoy: `lagrange` y `lagrange-nuevo`). Se conserva el de mayor puntaje.
 */
function deduplicar(resultados: readonly ResultadoBusqueda[]): ResultadoBusqueda[] {
  const vistos = new Set<string>();
  const salida: ResultadoBusqueda[] = [];

  for (const resultado of resultados) {
    if (resultado.tipo === 'ejercicio' || resultado.tipo === 'concepto') {
      const clave = `${resultado.tipo}|${resultado.titulo}|${resultado.descripcion}`;
      if (vistos.has(clave)) continue;
      vistos.add(clave);
    }
    salida.push(resultado);
  }

  return salida;
}

/* ------------------------------------------------------------------ */
/* Construcción de la estructura                                       */
/* ------------------------------------------------------------------ */

function construirEntradasEstructurales(): EntradaBusqueda[] {
  const entradas: EntradaBusqueda[] = [];

  for (const modulo of MODULOS) {
    entradas.push({
      id: `${modulo.id}:modulo`,
      tipo: 'modulo',
      titulo: `${modulo.etiqueta} · ${modulo.nombre}`,
      descripcion: modulo.descripcion,
      ruta: modulo.ruta,
      rutaTexto: `${modulo.etiqueta} › ${modulo.nombre}`,
      claves: [modulo.nombre, modulo.subtitulo, ...modulo.claves],
      cuerpo: `${modulo.subtitulo}. ${modulo.descripcion}`,
    });

    for (const familia of modulo.familias) {
      entradas.push({
        id: `${modulo.id}:${familia.key}`,
        tipo: 'submodulo',
        titulo: familia.nombre,
        descripcion: `${familia.principio} ${familia.descripcion}`,
        ruta: familia.ruta,
        rutaTexto: `${modulo.etiqueta} › ${familia.nombre}`,
        claves: [familia.principio, modulo.nombre, ...modulo.claves],
        cuerpo: familia.descripcion,
      });

      for (const metodo of familia.metodos) {
        entradas.push({
          id: `${modulo.id}:${metodo.key}`,
          tipo: 'metodo',
          titulo: metodo.nombre,
          descripcion: metodo.idea,
          ruta: metodo.rutaBase ? `${metodo.rutaBase}/teoria` : null,
          rutaTexto: `${modulo.etiqueta} › ${familia.nombre} › ${metodo.nombre} › Teoría`,
          claves: [metodo.key, metodo.formula, metodo.nombre, familia.nombre, modulo.nombre],
          cuerpo: `${metodo.idea} ${metodo.formula}`,
        });

        if (!metodo.rutaBase) continue;

        for (const pestana of PESTANAS_METODO) {
          entradas.push({
            id: `${modulo.id}:${metodo.key}:${pestana.ruta}`,
            tipo: 'pestana',
            titulo: `${metodo.nombre} · ${pestana.texto}`,
            descripcion: descripcionDePestana(metodo, pestana.texto),
            ruta: `${metodo.rutaBase}/${pestana.ruta}`,
            rutaTexto: `${modulo.etiqueta} › ${familia.nombre} › ${metodo.nombre} › ${pestana.texto}`,
            claves: [pestana.texto, metodo.nombre, metodo.key],
            cuerpo: metodo.idea,
          });
        }
      }
    }

    for (const seccion of modulo.secciones) {
      entradas.push({
        id: `${modulo.id}:${seccion.id}`,
        tipo: 'seccion',
        titulo: seccion.titulo,
        descripcion: seccion.descripcion,
        ruta: seccion.ruta,
        rutaTexto: `${modulo.etiqueta} › ${seccion.titulo}`,
        claves: [...seccion.claves, modulo.nombre],
        cuerpo: seccion.descripcion,
      });
    }
  }

  return entradas;
}

function descripcionDePestana(metodo: MetodoCatalogo, pestana: string): string {
  switch (pestana) {
    case 'Teoría':
      return `Concepto, fundamento, criterios y recursos de ${metodo.nombre}.`;
    case 'Ejemplos':
      return `Ejemplos resueltos de ${metodo.nombre}, con las cuentas paso a paso.`;
    case 'Autoevaluación':
      return `Ejercicios de ${metodo.nombre} con cuestionario y resolución verificable.`;
    default:
      return `Calculadora interactiva de ${metodo.nombre}.`;
  }
}

/* ------------------------------------------------------------------ */
/* Construcción del contenido                                          */
/* ------------------------------------------------------------------ */

function entradasDeContenido(
  clave: string,
  contenido: import('./fuentes-contenido').ContenidoMetodo,
): EntradaBusqueda[] {
  const partes = clave.split('/');
  const [moduloId, familiaId, metodoId] = partes;

  const modulo = MODULOS.find((m) => m.id === moduloId);
  const familia = modulo?.familias.find((f) => f.key === familiaId);
  const metodo = familia?.metodos.find((m) => m.key === metodoId);
  if (!modulo || !familia || !metodo || !metodo.rutaBase) return [];

  const rutaTeoria = `${metodo.rutaBase}/teoria`;
  const rutaAuto = `${metodo.rutaBase}/autoevaluacion`;
  const prefijo = `${modulo.etiqueta} › ${familia.nombre} › ${metodo.nombre}`;
  const base = {
    claves: [metodo.nombre, metodo.key, metodo.formula, familia.nombre, modulo.nombre],
    rutaTexto: `${prefijo} › Teoría`,
  };
  const entradas: EntradaBusqueda[] = [];

  const secciones = [
    { sufijo: 'concepto', titulo: 'Concepto', texto: contenido.teoria.concepto },
    { sufijo: 'fundamento', titulo: 'Fundamento', texto: contenido.teoria.fundamento },
    { sufijo: 'cuando-falla', titulo: 'Cuándo falla', texto: contenido.teoria.cuandoFalla },
    { sufijo: 'precision', titulo: contenido.teoria.tercera, texto: contenido.teoria.tercera },
  ];

  for (const seccion of secciones) {
    entradas.push({
      ...base,
      id: `${clave}:concepto:${seccion.sufijo}`,
      tipo: 'concepto',
      titulo: `${metodo.nombre} · ${seccion.titulo}`,
      descripcion: recortar(seccion.texto, 220),
      ruta: rutaTeoria,
      cuerpo: seccion.texto,
    });
  }

  contenido.teoria.recursos.forEach((recurso, i) => {
    entradas.push({
      ...base,
      id: `${clave}:recurso:${i}`,
      tipo: 'recurso',
      titulo: recurso.titulo,
      descripcion: recurso.descripcion,
      ruta: rutaTeoria,
      rutaTexto: `${prefijo} › Teoría › Recursos`,
      claves: [...base.claves, recurso.tipo, 'recurso', 'video', 'lectura'],
      cuerpo: `${recurso.titulo}. ${recurso.descripcion}`,
    });
  });

  for (const ejercicio of contenido.ejercicios) {
    entradas.push({
      ...base,
      id: `${clave}:ejercicio:${ejercicio.id}`,
      tipo: 'ejercicio',
      titulo: ejercicio.titulo,
      descripcion: recortar(ejercicio.planteamiento || ejercicio.enunciado || '', 220),
      // El ancla la usa la pestaña para llevar al ejercicio concreto.
      ruta: `${rutaAuto}#ejercicio-${ejercicio.id}`,
      rutaTexto: `${prefijo} › Autoevaluación › ${ejercicio.titulo}`,
      claves: [...base.claves, 'autoevaluacion', 'ejercicio', ejercicio.id],
      cuerpo: [ejercicio.enunciado, ejercicio.pista].filter(Boolean).join(' '),
    });
  }

  return entradas;
}

function recortar(texto: string, maximo: number): string {
  if (texto.length <= maximo) return texto;
  return texto.slice(0, maximo - 1).trimEnd() + '…';
}
