/**
 * FUENTES DE CONTENIDO DEL BUSCADOR.
 *
 * ── Por qué no se indexa todo al arrancar ────────────────────────────
 * Los archivos `*.contenido.ts` son los más pesados del portal (cada uno
 * ronda las 1 000 líneas). Importarlos en la portada castigaría a todos
 * los alumnos para servir una función que usan algunos. Acá se cargan
 * con `import()` recién en la primera búsqueda, y el resultado se guarda
 * en memoria durante la sesión.
 *
 * ── Cómo se mantiene actualizado ─────────────────────────────────────
 * El módulo, la familia, el método y sus pestañas salen de los registros
 * (`catalogo.ts`), así que un método nuevo aparece solo. Lo único que se
 * declara en este archivo es DE QUÉ ARCHIVO sale su contenido: una línea
 * por método. Es el contrato mínimo que no se puede deducir sin leer el
 * sistema de archivos en tiempo de ejecución.
 *
 * Los `import()` van con ruta literal a propósito: un import dinámico
 * construido con una variable no lo puede resolver el bundler.
 */

import type { RecursoTeoria } from '../models/metodo.model';

export interface TeoriaResumen {
  concepto: string;
  fundamento: string;
  cuandoFalla: string;
  tercera: string;
  recursos: readonly RecursoTeoria[];
}

export interface EjercicioResumen {
  id: string;
  titulo: string;
  /** El problema ya formulado, para el fragmento del resultado. */
  planteamiento: string;
  /** Enunciado de la casuística, si lo tiene. */
  enunciado?: string;
  pista?: string;
}

export interface ContenidoMetodo {
  teoria: TeoriaResumen;
  ejercicios: EjercicioResumen[];
}

export interface FuenteContenido {
  /** `moduloId/familiaId/metodoId`. */
  clave: string;
  cargar: () => Promise<ContenidoMetodo>;
}

/* ------------------------------------------------------------------ */
/* Adaptadores                                                         */
/* ------------------------------------------------------------------ */

interface EjercicioConTexto {
  id: string;
  titulo: string;
  enunciado?: string;
  pista?: string;
  ecuacion?: string;
  planteamiento?: string;
}

function resumenEjercicio(e: EjercicioConTexto): EjercicioResumen {
  return {
    id: e.id,
    titulo: e.titulo,
    planteamiento: e.ecuacion ?? e.planteamiento ?? '',
    enunciado: e.enunciado,
    pista: e.pista,
  };
}

/**
 * La tercera idea se llama distinto en cada módulo: "orden de
 * convergencia" en el M1 y el M2, "precisión" en el M3. El índice no
 * necesita saber cuál es: toma la que exista.
 */
interface TeoriaConTercera {
  concepto: string;
  fundamento: string;
  cuandoFalla: string;
  precision?: string;
  ordenConvergencia?: string;
  recursos?: readonly RecursoTeoria[];
}

function contenidoDe(
  teoria: TeoriaConTercera,
  ejercicios: readonly EjercicioConTexto[],
): ContenidoMetodo {
  return {
    teoria: {
      concepto: teoria.concepto,
      fundamento: teoria.fundamento,
      cuandoFalla: teoria.cuandoFalla,
      tercera: teoria.precision ?? teoria.ordenConvergencia ?? '',
      recursos: teoria.recursos ?? [],
    },
    ejercicios: ejercicios.map(resumenEjercicio),
  };
}

/* ------------------------------------------------------------------ */
/* Fuentes                                                             */
/* ------------------------------------------------------------------ */

export const FUENTES_CONTENIDO: readonly FuenteContenido[] = [
  /* ── Módulo 0 ─────────────────────────────────────────────────── */
  {
    clave: 'modulo0/aritmetica/cifras-significativas',
    cargar: async () => {
      const m = await import(
        '../../components/modulo0/metodos/cifras-significativas/contenido'
      );
      return contenidoDe(m.TEORIA_CIFRAS, m.EJERCICIOS_CIFRAS);
    },
  },
  {
    clave: 'modulo0/medicion/error-absoluto-relativo',
    cargar: async () => {
      const m = await import(
        '../../components/modulo0/metodos/error-absoluto-relativo/contenido'
      );
      return contenidoDe(m.TEORIA_ERRORES, m.EJERCICIOS_ERRORES);
    },
  },
  {
    clave: 'modulo0/truncamiento/taylor',
    cargar: async () => {
      const m = await import('../../components/modulo0/metodos/taylor/contenido');
      return contenidoDe(m.TEORIA_TAYLOR, m.EJERCICIOS_TAYLOR);
    },
  },
  {
    clave: 'modulo0/propagacion/propagacion-errores',
    cargar: async () => {
      const m = await import(
        '../../components/modulo0/metodos/propagacion-errores/contenido'
      );
      return contenidoDe(m.TEORIA_PROPAGACION, m.EJERCICIOS_PROPAGACION);
    },
  },

  /* ── Módulo 1 ─────────────────────────────────────────────────── */
  {
    clave: 'modulo1/cerrados/biseccion',
    cargar: async () => {
      const m = await import(
        '../../components/modulo1/tipos/cerrados/biseccion/biseccion.contenido'
      );
      return contenidoDe(m.TEORIA_BISECCION, m.EJERCICIOS_BISECCION);
    },
  },
  {
    clave: 'modulo1/cerrados/regla-falsa',
    cargar: async () => {
      const m = await import(
        '../../components/modulo1/tipos/cerrados/regla-falsa/regla-falsa.contenido'
      );
      return contenidoDe(m.TEORIA_REGLA_FALSA, m.EJERCICIOS_REGLA_FALSA);
    },
  },
  {
    clave: 'modulo1/abiertos/newton-raphson',
    cargar: async () => {
      const m = await import(
        '../../components/modulo1/tipos/abiertos/newton-raphson/newton-raphson.contenido'
      );
      return contenidoDe(m.TEORIA_NEWTON, m.EJERCICIOS_NEWTON);
    },
  },
  {
    clave: 'modulo1/abiertos/secante',
    cargar: async () => {
      const m = await import(
        '../../components/modulo1/tipos/abiertos/secante/secante.contenido'
      );
      return contenidoDe(m.TEORIA_SECANTE, m.EJERCICIOS_SECANTE);
    },
  },
  {
    clave: 'modulo1/abiertos/punto-fijo',
    cargar: async () => {
      const m = await import(
        '../../components/modulo1/tipos/abiertos/punto-fijo/punto-fijo.contenido'
      );
      return contenidoDe(m.TEORIA_PUNTO_FIJO, m.EJERCICIOS_PUNTO_FIJO);
    },
  },
  {
    clave: 'modulo1/polinomios/cardano',
    cargar: async () => {
      const m = await import(
        '../../components/modulo1/tipos/polinomios/cardano/cardano.contenido'
      );
      return contenidoDe(m.TEORIA_CARDANO, m.EJERCICIOS_CARDANO);
    },
  },

  /* ── Módulo 2 ─────────────────────────────────────────────────── */
  {
    clave: 'modulo2/directos/gauss',
    cargar: async () => {
      const m = await import('../../components/modulo2/tipos/directos/gauss/gauss.contenido');
      return contenidoDe(m.TEORIA_GAUSS, m.EJERCICIOS_GAUSS);
    },
  },
  {
    clave: 'modulo2/directos/lu',
    cargar: async () => {
      const m = await import('../../components/modulo2/tipos/directos/lu/lu.contenido');
      return contenidoDe(m.TEORIA_LU, m.EJERCICIOS_LU);
    },
  },

  /* ── Módulo 3 ─────────────────────────────────────────────────── */
  {
    clave: 'modulo3/interpolacion/lagrange',
    cargar: async () => {
      const m = await import(
        '../../components/modulo3/tipos/interpolacion/lagrange/lagrange.contenido'
      );
      return contenidoDe(m.TEORIA_LAGRANGE, m.EJERCICIOS_LAGRANGE);
    },
  },
  {
    clave: 'modulo3/interpolacion/lagrange-nuevo',
    cargar: async () => {
      const m = await import(
        '../../components/modulo3/tipos/interpolacion/lagrange-nuevo/lagrange.contenido'
      );
      return contenidoDe(m.TEORIA_LAGRANGE, m.EJERCICIOS_LAGRANGE);
    },
  },
  {
    clave: 'modulo3/ajuste/minimos-cuadrados',
    cargar: async () => {
      const m = await import(
        '../../components/modulo3/tipos/ajuste/minimos-cuadrados/minimos-cuadrados.contenido'
      );
      return contenidoDe(m.TEORIA_MINIMOS_CUADRADOS, m.EJERCICIOS_MINIMOS_CUADRADOS);
    },
  },

  /*
   * Módulo 0 publicado: sus cuatro fuentes están arriba, una por método.
   * `catalogo.ts` ya lo declara `disponible`, así que el índice puede
   * enlazar sus páginas sin mandar a una ruta inexistente.
   */
] as const;
