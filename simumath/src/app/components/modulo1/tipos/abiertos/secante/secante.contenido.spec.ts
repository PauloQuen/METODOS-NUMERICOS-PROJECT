import { ejecutarSecante } from './secante.algoritmo';
import {
  TEORIA_SECANTE,
  EJEMPLOS_SECANTE,
  EJERCICIOS_SECANTE,
} from './secante.contenido';
import { parsearFuncion } from '../../../../../shared/domain/numerico/evaluador-funciones';

/**
 * Tests del contenido de la Secante.
 *
 * ── Para qué sirve este archivo ───────────────────────────────────────
 * El contenido (ejemplos, ejercicios, teoría) tiene un contrato con el
 * algoritmo: cada bloque dice "con estos datos sale tal resultado". Si
 * alguien cambia un número del enunciado sin recalcular, o escribe una
 * iteración de más en el texto, estos tests lo detectan.
 *
 * La idea es que el contenido NO se escriba a ojo: los números salen de
 * correr el motor, y el texto se escribe después mirando esos números.
 */

/** Un bloque de contenido con los datos para poder calcularlo. */
interface Bloque {
  id: string;
  titulo: string;
  tipo: string;
  criterio: string;
  conclusion: string;
  interpretacion: string;
  algoritmo: string;
  pasos: string[];
  parametros: { etiqueta: string; valor: string }[];
  enunciado?: string;
  pista?: string;
  extraccion?: { busqueda: string; datos: unknown[]; formulacion: string };
  calculo?: {
    funcion: string;
    x0?: number;
    x1?: number;
    tol?: number;
    maxIter?: number;
  };
}

/** Todos los bloques del método, de las tres secciones. */
const BLOQUES: Bloque[] = [
  ...(EJEMPLOS_SECANTE as Bloque[]),
  ...(EJERCICIOS_SECANTE as Bloque[]),
  { ...TEORIA_SECANTE.ejemploNormal } as Bloque,
  { ...TEORIA_SECANTE.ejemploCasuistica } as Bloque,
];

const CON_CALCULO = BLOQUES.filter((b) => b.calculo?.funcion);

/* ------------------------------------------------------------------ */
/* Lectores de los números escritos en el texto                         */
/* ------------------------------------------------------------------ */

/**
 * Convierte superíndices, signos tipográficos y tildes a ASCII normal.
 *
 * El contenido escribe las potencias como "10⁻⁶", donde ⁻ es U+207B y ⁶
 * es U+2076, no un guion y un 6. Sin esta conversión, ninguna regex
 * encuentra los números y los tests pasan por alto lo que prometen.
 * Las tildes de "iteración" también rompen los patrones, y el guion
 * largo/en-dash de los números negativos tipográficos también.
 */
function aAscii(texto: string): string {
  const superindices: Record<string, string> = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
    '⁻': '-', '⁺': '+',
  };
  return texto
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, (c) => superindices[c] ?? c)
    .replace(/[–−]/g, '-')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Saca el número de iteraciones que promete el texto.
 *
 * Ojo: los textos también comparan con Newton, bisección y regla falsa
 * ("la bisección necesitó 17 iteraciones"), por eso el patrón de
 * "iteración N" viene primero: agarra la promesa del propio bloque.
 * Devuelve null si el texto no menciona cantidad de iteraciones.
 */
function iteracionesAnunciadas(texto: string): number | null {
  const plano = aAscii(texto);
  const patrones = [
    /iteracion\s+(\d+)/i,
    /(?:en|hacen\s+falta)\s+(\d+)\s+iteracion(?:es)?/i,
    /(\d+)\s+iteracion(?:es)?/i,
    /(\d+)\s+pasos?/i,
  ];
  for (const p of patrones) {
    const m = plano.match(p);
    if (m) return Number(m[1]);
  }
  return null;
}

/**
 * Saca la respuesta que la conclusión presenta como resultado.
 *
 * Acepta "x ≈ 1.5214", "Δ ≈ −2.8951", "λ ≈ 1.3267". El guion puede
 * ser -, – o el signo unicode −.
 */
function raizAnunciada(texto: string): number | null {
  const m = texto.match(/≈\s*(-?[−–-]?\d+\.?\d*)/);
  if (!m) return null;
  return Number(m[1].replace(/[−–]/g, '-'));
}

/**
 * Busca un número inmediatamente después de una palabra concreta de la
 * conclusión: "el desplazamiento final fue de X" o "la tolerancia de Y".
 *
 * Es frase-concreta a propósito: la conclusión trae varios números
 * (raíz, desplazamiento, tolerancia, iteraciones de otros métodos) y
 * asociar el equivocado haría el test mudo.
 *
 * La notación científica se arma por string ("9.7e-6"), no multiplicando:
 * 9.7 * 1e-6 da un ulp distinto de Number("9.7e-6") y el `<=` truena.
 */
function numeroDespuesDe(texto: string, palabra: string): number | null {
  const plano = aAscii(texto);
  const i = plano.toLowerCase().indexOf(palabra.toLowerCase());
  if (i < 0) return null;

  const resto = plano.slice(i + palabra.length);
  const m = resto.match(/(\d+(?:\.\d+)?)(?:\s*[×x·*]\s*10\s*(-?\d+))?/);
  if (!m) return null;

  return m[2] !== undefined ? Number(`${m[1]}e${m[2]}`) : Number(m[1]);
}

/**
 * Saca la DIFERENCIA con la raíz verdadera que promete la conclusión.
 *
 * El contenido de la secante NO usa esta frase (habla de "la diferencia
 * con el valor exacto", que no promete nada al test); se deja el lector
 * por paridad con los demás métodos, y devuelve null cuando no aparece.
 */
function diferenciaRealAnunciada(conclusion: string): number | null {
  const plano = aAscii(conclusion);

  const frase = plano.match(
    /diferencia\s+real\s*(?:es\s*(?:de|=)?\s*)?([\d.]+(?:\s*[×x·*]\s*10\s*-?\d+)?)/i,
  );
  if (!frase) return null;

  const [, numero] = frase;
  const cientifica = numero.match(/^(\d+(?:\.\d+)?)\s*[×x·*]\s*10\s*(-?\d+)$/);
  if (cientifica) {
    return Number(`${cientifica[1]}e${cientifica[2]}`);
  }
  return Number(numero);
}

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe('contenido de la Secante', () => {
  it('está el contenido completo: 2+ ejemplos, 3+ ejercicios, teoría', () => {
    expect(EJEMPLOS_SECANTE.length).toBeGreaterThanOrEqual(2);
    expect(EJERCICIOS_SECANTE.length).toBeGreaterThanOrEqual(3);

    const numericos = EJEMPLOS_SECANTE.filter((e) => e.tipo === 'numerico');
    const casuisticas = EJEMPLOS_SECANTE.filter((e) => e.tipo === 'casuistica');
    expect(numericos.length).toBeGreaterThanOrEqual(2);
    expect(casuisticas.length).toBeGreaterThanOrEqual(2);
  });

  CON_CALCULO.forEach((bloque) => {
    describe(`${bloque.id}: ${bloque.titulo}`, () => {
      const { funcion, x0, x1, tol, maxIter } = bloque.calculo!;
      const f = () => parsearFuncion(funcion)!;
      const correr = () =>
        ejecutarSecante({ f: f(), x0: x0!, x1: x1!, tol: tol!, maxIter });

      it('la función del contenido se parsea', () => {
        expect(parsearFuncion(funcion)).not.toBeNull();
        expect(typeof f()).toBe('function');
      });

      it('la función se evalúa sin lanzar en un punto cualquiera', () => {
        expect(() => f()(0.5)).not.toThrow();
      });

      it('las dos semillas son distintas y no dan el mismo f', () => {
        // La secante necesita x₀ ≠ x₁ y, además, f(x₀) ≠ f(x₁): si
        // coincidieran, la cuerda sería horizontal y el método no
        // podría dar el paso. Un ejemplo mal planteado se rompería acá.
        expect(Math.abs(x1! - x0!)).withContext(`${x0} vs ${x1}`).toBeGreaterThan(1e-3);
        const diferencia = Math.abs(f()(x1!) - f()(x0!));
        expect(diferencia)
          .withContext(`f(${x1}) − f(${x0}) = ${diferencia}`)
          .toBeGreaterThan(1e-3);
      });

      it('el algoritmo converge con los datos declarados', () => {
        expect(correr().convergio).toBe(true);
      });

      it('respeta el máximo de iteraciones declarado', () => {
        const r = correr();
        expect(r.iteraciones).toBeLessThanOrEqual(maxIter ?? 100);
      });

      it('el error final es menor o igual que la tolerancia declarada', () => {
        const r = correr();
        expect(r.error!).toBeLessThanOrEqual(tol!);
      });

      it('la raíz verdadera hace f(raíz) ≈ 0', () => {
        const r = correr();
        expect(Math.abs(f()(r.raiz!))).toBeLessThan(1e-2);
      });

      it('el número de iteraciones del texto coincide con el motor', () => {
        const r = correr();
        const n =
          iteracionesAnunciadas(bloque.criterio) ??
          iteracionesAnunciadas(bloque.algoritmo) ??
          iteracionesAnunciadas(bloque.conclusion) ??
          iteracionesAnunciadas(bloque.interpretacion);

        expect(n)
          .withContext(`"${bloque.titulo}" no dice cuántas iteraciones`)
          .not.toBeNull();
        expect(r.iteraciones).withContext(`el texto dice ${n}`).toBe(n!);
      });

      it('la raíz de la conclusión coincide con el motor', () => {
        const r = correr();
        const anunciada = raizAnunciada(bloque.conclusion);

        expect(anunciada)
          .withContext(`la conclusión de "${bloque.titulo}" no da una raíz`)
          .not.toBeNull();
        // El texto redondea a 8 decimales, así que se compara con margen.
        expect(Math.abs(r.raiz! - anunciada!))
          .withContext(`el texto dice ${anunciada}, el motor da ${r.raiz}`)
          .toBeLessThan(1e-4);
      });

      it('si la conclusión promete un desplazamiento, el motor lo logra', () => {
        // "el desplazamiento final fue de X": el error real tiene que
        // ser menor o igual que X. Es la promesa más fácil de arruinar
        // sin querer (redondear mal el número del texto).
        const r = correr();
        const prometido = numeroDespuesDe(bloque.conclusion, 'desplazamiento');

        if (prometido !== null) {
          expect(r.error!)
            .withContext(
              `la conclusión promete desplazamiento ${prometido}, el motor logró ${r.error}`,
            )
            .toBeLessThanOrEqual(prometido);
        }
      });

      it('si la conclusión promete una tolerancia, el motor la respeta', () => {
        const r = correr();
        const prometida = numeroDespuesDe(bloque.conclusion, 'tolerancia');

        if (prometida !== null) {
          expect(r.error!)
            .withContext(
              `la conclusión promete tolerancia ${prometida}, el motor logró ${r.error}`,
            )
            .toBeLessThanOrEqual(prometida);
        }
      });

      it('si el texto promete una diferencia real, es menor que el error', () => {
        const r = correr();
        const diferencia = diferenciaRealAnunciada(bloque.conclusion);

        if (diferencia !== null) {
          expect(r.error!).withContext('la frase solo aparece con error > 0').toBeGreaterThan(0);
          expect(diferencia)
            .withContext(`el texto promete una diferencia de ${diferencia}`)
            .toBeLessThan(r.error!);
        }
      });
    });
  });

  /* ---------------------------------------------------------------- */
  /* Estructura                                                        */
  /* ---------------------------------------------------------------- */

  describe('teoría', () => {
    it('tiene las cuatro secciones obligatorias', () => {
      expect(TEORIA_SECANTE.concepto.length).toBeGreaterThan(80);
      expect(TEORIA_SECANTE.fundamento.length).toBeGreaterThan(80);
      expect(TEORIA_SECANTE.cuandoFalla.length).toBeGreaterThan(80);
      expect(TEORIA_SECANTE.ordenConvergencia.length).toBeGreaterThan(80);
    });

    it('la fórmula es la de la secante', () => {
      // xₙ₊₁ = xₙ − f(xₙ)(xₙ − xₙ₋₁)/(f(xₙ) − f(xₙ₋₁)): tiene que
      // aparecer el punto siguiente (xₙ₊₁) y el anterior (xₙ₋₁), que
      // es lo que la secante usa en lugar de la derivada.
      expect(TEORIA_SECANTE.algoritmo.formula).toContain('xₙ₊₁');
      expect(TEORIA_SECANTE.algoritmo.formula).toContain('xₙ₋₁');
    });

    it('declara los 7 pasos del algoritmo', () => {
      expect(TEORIA_SECANTE.algoritmo.pasos.length).toBe(7);
    });

    it('documenta los cuatro criterios de convergencia', () => {
      const criterios = TEORIA_SECANTE.algoritmo.criterios;
      expect(criterios.length).toBeGreaterThanOrEqual(4);
      expect(criterios.some((c) => c.nombre.includes('Bolzano'))).toBe(true);
      criterios.forEach((c) => expect(c.explicacion.length).toBeGreaterThan(40));
    });

    it('lista ventajas, limitaciones y recomendaciones', () => {
      const a = TEORIA_SECANTE.algoritmo;
      expect(a.ventajas.length).toBeGreaterThanOrEqual(4);
      expect(a.limitaciones.length).toBeGreaterThanOrEqual(4);
      expect(a.recomendaciones.length).toBeGreaterThanOrEqual(4);
    });

    it('explica por qué la cota de Bolzano no aplica', () => {
      // A diferencia de bisección, la secante no acota: el texto tiene
      // que decir que la cota necesita un intervalo con cambio de signo,
      // y este método arranca de dos semillas sueltas.
      const bolzano = TEORIA_SECANTE.algoritmo.criterios.find((c) =>
        c.nombre.includes('Bolzano'),
      );
      expect(bolzano?.explicacion).toContain('intervalo');
    });

    it('explica qué hace el criterio de residuo', () => {
      const residuo = TEORIA_SECANTE.algoritmo.criterios.find((c) =>
        c.nombre.includes('Residuo'),
      );
      expect(residuo?.explicacion).toContain('1000');
    });
  });

  describe('ejemplos y ejercicios', () => {
    it('todos tienen las secciones completas', () => {
      BLOQUES.forEach((e) => {
        expect(e.interpretacion.length).withContext(`${e.id} interpretacion`).toBeGreaterThan(60);
        expect(e.pasos.length).withContext(`${e.id} pasos`).toBeGreaterThanOrEqual(4);
        expect(e.algoritmo.length).withContext(`${e.id} algoritmo`).toBeGreaterThan(50);
        expect(e.criterio.length).withContext(`${e.id} criterio`).toBeGreaterThan(40);
        expect(e.conclusion.length).withContext(`${e.id} conclusion`).toBeGreaterThan(60);
        expect(e.parametros.length).withContext(`${e.id} parametros`).toBeGreaterThanOrEqual(2);
      });
    });

    it('cada uno muestra la primera iteración con la cuenta escrita', () => {
      BLOQUES.forEach((e) => {
        // "Paso 0" es la evaluación en las dos semillas: f(x₀) y f(x₁).
        expect(e.pasos[0]).withContext(`${e.id} paso 0`).toContain('Paso 0');
        expect(e.pasos[0]).withContext(`${e.id} paso 0 sin f(`).toMatch(/[a-zA-Zπ]\(/);
        // "Paso 1" arranca con la primera cuenta: x₂, o el símbolo de la
        // incógnita del problema (T, Δ, λ, π). El primer valor que
        // calcula la secante es x₂, no x₁.
        expect(e.pasos[1]).withContext(`${e.id} paso 1`).toMatch(/(?:x|T|Δ|λ|π)₂\s*=/);
      });
    });

    it('los ids son únicos', () => {
      const ids = BLOQUES.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('los ejercicios son resolubles y traen pista', () => {
      EJERCICIOS_SECANTE.forEach((e) => {
        const r = ejecutarSecante({
          f: parsearFuncion(e.calculo.funcion)!,
          x0: e.calculo.x0!,
          x1: e.calculo.x1!,
          tol: e.calculo.tol!,
        });
        expect(r.convergio).withContext(e.titulo).toBe(true);
        expect(e.pista).withContext(`${e.titulo} sin pista`).toBeTruthy();
        expect(e.pista!.length).toBeGreaterThan(40);
      });
    });

    it('hay al menos un ejercicio de casuística', () => {
      const casuisticas = EJERCICIOS_SECANTE.filter((e) => e.tipo === 'casuistica');
      expect(casuisticas.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('casuísticas', () => {
    const casuisticas: Bloque[] = [
      ...(EJEMPLOS_SECANTE.filter((e) => e.tipo === 'casuistica') as Bloque[]),
      ...(EJERCICIOS_SECANTE.filter((e) => e.tipo === 'casuistica') as Bloque[]),
      { ...TEORIA_SECANTE.ejemploCasuistica } as Bloque,
    ];

    it('hay al menos dos, y todas explican de dónde salen los datos', () => {
      expect(casuisticas.length).toBeGreaterThanOrEqual(2);
      casuisticas.forEach((c) => {
        expect(c.enunciado).withContext(`${c.id} sin enunciado`).toBeTruthy();
        expect(c.enunciado!.length).toBeGreaterThan(80);
        expect(c.extraccion).withContext(`${c.id} sin extracción`).toBeTruthy();
        expect(c.extraccion!.busqueda.length).toBeGreaterThan(40);
        expect(c.extraccion!.datos.length).toBeGreaterThanOrEqual(2);
        expect(c.extraccion!.formulacion.length).toBeGreaterThan(60);
      });
    });

    it('la formulación de cada casuística declara las semillas', () => {
      // La secante no pide cambio de signo: pide DOS semillas. Cada
      // casuística tiene que decir de dónde salieron (x₀ y x₁, o sus
      // equivalentes T₀/T₁, λ₀/λ₁, Δ₀/Δ₁).
      casuisticas.forEach((c) => {
        expect(c.extraccion!.formulacion)
          .withContext(`${c.id} no menciona las semillas`)
          .toMatch(/semilla|₀|₁|x₀|x₁|T₀|T₁|λ₀|λ₁|Δ₀|Δ₁/i);
      });
    });

    it('cada dato de la extracción dice qué es', () => {
      casuisticas.forEach((c) => {
        c.extraccion!.datos.forEach((d) => {
          const dato = d as { simbolo?: string; queEs?: string };
          expect(dato.simbolo).toBeTruthy();
          expect(dato.queEs).withContext(`${c.id}: ${dato.simbolo}`).toBeTruthy();
          expect(dato.queEs!.length).toBeGreaterThan(10);
        });
      });
    });
  });

  describe('higiene del texto', () => {
    it('no tiene caracteres de otros alfabetos', () => {
      BLOQUES.forEach((b) => {
        const todo = [b.titulo, b.interpretacion, b.algoritmo, b.criterio, b.conclusion]
          .concat(b.pasos)
          .join(' ');
        const sospechosos = todo.match(/[\u4e00-\u9fff\u0400-\u04ff]/g);
        expect(sospechosos).withContext(`${b.id}: ${sospechosos?.join(' ')}`).toBeNull();
      });
    });

    it('no deja palabras en inglés que se coló', () => {
      BLOQUES.forEach((b) => {
        const todo = [b.titulo, b.interpretacion, b.algoritmo, b.criterio, b.conclusion]
          .concat(b.pasos)
          .join(' ');
        ['Written', 'famous', 'Shoul', 'serie as', 'SOURCE'].forEach((palabra) => {
          expect(todo).not.toContain(palabra);
        });
      });
    });

    it('todos los bloques tienen título y son presentables', () => {
      BLOQUES.forEach((b) => {
        expect(b.titulo.length).withContext(b.id).toBeGreaterThan(10);
        expect(b.titulo).not.toMatch(/^(Ejemplo|Ejercicio|Test)\s*$/);
      });
    });
  });
});
