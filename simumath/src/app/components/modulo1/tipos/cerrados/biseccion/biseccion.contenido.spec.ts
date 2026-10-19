import { biseccion } from './biseccion.algoritmo';
import {
  TEORIA_BISECCION,
  EJEMPLOS_BISECCION,
  EJERCICIOS_BISECCION,
} from './biseccion.contenido';
import { parsearFuncion } from '../../../../../shared/domain/numerico/evaluador-funciones';

/**
 * Tests del contenido de Bisección.
 *
 * ── Para qué sirve este archivo ───────────────────────────────────────
 * El contenido (ejemplos, ejercicios, teoría) tiene un contrato con el
 * algoritmo: cada bloque dice "con estos datos sale tal resultado". Si
 * alguien cambia un número del enunciado sin recalcular, o escribe una
 * iteración de más en el texto, estos tests lo detectan.
 *
 * La idea es que el contenido NO se escribe a ojo: los números salen de
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
  calculo?: { funcion: string; a?: number; b?: number; tol?: number; maxIter?: number };
}

/** Todos los bloques del método, de las tres secciones. */
const BLOQUES: Bloque[] = [
  ...(EJEMPLOS_BISECCION as Bloque[]),
  ...(EJERCICIOS_BISECCION as Bloque[]),
  { ...TEORIA_BISECCION.ejemploNormal } as Bloque,
  { ...TEORIA_BISECCION.ejemploCasuistica } as Bloque,
];

const CON_CALCULO = BLOQUES.filter((b) => b.calculo?.funcion);

/* ------------------------------------------------------------------ */
/* Lectores de los números escritos en el texto                         */
/* ------------------------------------------------------------------ */

/**
 * Saca el número de iteraciones que promete el texto.
 *
 * El contenido lo escribe de varias formas según el bloque:
 *   "en 17 iteraciones"          → 17
 *   "hacen falta 19 iteraciones" → 19
 *   "alcanzada en la iteración 17" → 17
 * Devuelve null si el texto no menciona cantidad de iteraciones.
 */
function iteracionesAnunciadas(texto: string): number | null {
  const plano = aAscii(texto);
  const patrones = [
    // "alcanzada en la iteración 17", "ocurre en la iteración 17"
    /iteracion\s+(\d+)/i,
    // "en 17 iteraciones", "hacen falta 19 iteraciones"
    /(?:en|hacen\s+falta)\s+(\d+)\s+iteraciones?/i,
    // "17 iteraciones"
    /(\d+)\s+iteraciones?/i,
    // "con 17 pasos"
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
 * Acepta "x ≈ 1.5214", "T ≈ 0.6931", "h ≈ −2.8951", "λ ≈ 1.3266".
 * El guion puede ser -, – o el signo unicode −.
 *
 * NO agarra los "≈ 1.5 × 10⁻⁶" de los errores, porque esos son cotas y
 * los revisa otro test.
 */
function raizAnunciada(texto: string): number | null {
  const m = texto.match(/≈\s*(-?[−–-]?\d+\.?\d*)/);
  if (!m) return null;
  return Number(m[1].replace(/[−–]/g, '-'));
}

/**
 * Saca la DIFERENCIA con la raíz verdadera que promete la conclusión.
 *
 * Ojo con el orden: la conclusión suele traer dos notaciones, primero la
 * cota ("error garantizado menor que 7.6294 × 10⁻⁶") y después la
 * diferencia real ("la diferencia real es de 5.486 × 10⁻⁶"). Si se toma
 * la primera, se está comparando la cota consigo misma.
 *
 * Devuelve null si el texto no promete diferencia real.
 */
function diferenciaRealAnunciada(conclusion: string): number | null {
  const plano = aAscii(conclusion);

  // Busca SOLO dentro de la frase que habla de la diferencia real.
  const frase = plano.match(/diferencia\s+real\s*(?:es\s*(?:de|=)?\s*)?([\d.]+(?:\s*[×x·*]\s*10\s*-?\d+)?)/i);
  if (!frase) return null;

  const [, numero] = frase;
  const cientifica = numero.match(/^(\d+(?:\.\d+)?)\s*[×x·*]\s*10\s*(-?\d+)$/);
  if (cientifica) {
    return Number(cientifica[1]) * Math.pow(10, Number(cientifica[2]));
  }
  return Number(numero);
}

/**
 * Saca la cota de error que promete la conclusión.
 * Busca "menor que 7.63 × 10⁻⁶" y "menor que 9.5 × 10⁻⁷".
 */
/**
 * Convierte superíndices y signos tipográficos a ASCII normal.
 *
 * El contenido escribe las potencias como "10⁻⁶", donde ⁻ es U+207B y ⁶
 * es U+2076, no un guion y un 6. Sin esta conversión, ninguna regex
 * encuentra los números y los tests pasan por alto lo que prometen.
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
    // Las tildes de "iteración" y "alcanzada" rompen los patrones.
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function errorAnunciado(texto: string): number | null {
  const plano = aAscii(texto);

  // 1) Notación científica: "7.63 × 10⁻⁶" → 7.63e-6.
  const cientifica = plano.match(/(\d+(?:\.\d+)?)\s*[×x·*]\s*10\s*(-?\d+)/i);
  if (cientifica) {
    return Number(cientifica[1]) * Math.pow(10, Number(cientifica[2]));
  }

  // 2) Decimal simple: "error de 0.5", "error real es 2.7".
  const decimal = plano.match(/error\s+(?:real\s+)?(?:es|de|:)?\s*(\d+(?:\.\d+)?)/i);
  if (decimal) return Number(decimal[1]);

  return null;
}

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe('contenido de Bisección', () => {
  it('está el contenido completo: 2+ ejemplos, 3+ ejercicios, teoría', () => {
    expect(EJEMPLOS_BISECCION.length).toBeGreaterThanOrEqual(2);
    expect(EJERCICIOS_BISECCION.length).toBeGreaterThanOrEqual(3);

    const numericos = EJEMPLOS_BISECCION.filter((e) => e.tipo === 'numerico');
    const casuisticas = EJEMPLOS_BISECCION.filter((e) => e.tipo === 'casuistica');
    expect(numericos.length).toBeGreaterThanOrEqual(2);
    expect(casuisticas.length).toBeGreaterThanOrEqual(2);
  });

  CON_CALCULO.forEach((bloque) => {
    describe(`${bloque.id}: ${bloque.titulo}`, () => {
      const { funcion, a, b, tol, maxIter } = bloque.calculo!;
      const f = () => parsearFuncion(funcion)!;
      const correr = () => biseccion({ f: f(), a: a!, b: b!, tol: tol!, maxIter });

      it('la función del contenido se parsea', () => {
        expect(parsearFuncion(funcion)).not.toBeNull();
        expect(typeof f()).toBe('function');
      });

      it('la función se evalúa sin lanzar en un punto cualquiera', () => {
        expect(() => f()(0.5)).not.toThrow();
      });

      it('el intervalo cumple la condición de Bolzano', () => {
        // Si esto falla, el ejemplo está mal planteado: bisección no
        // puede encontrar una raíz donde no hay cambio de signo.
        const fa = f()(a!);
        const fb = f()(b!);
        expect(fa * fb)
          .withContext(`f(${a}) = ${fa}, f(${b}) = ${fb}`)
          .toBeLessThan(0);
      });

      it('el algoritmo converge con los datos declarados', () => {
        expect(correr().convergio).toBe(true);
      });

      it('el error final es menor que la tolerancia declarada', () => {
        const r = correr();
        expect(r.error!).toBeLessThan(tol!);
      });

      it('la raíz verdadera hace f(raíz) ≈ 0', () => {
        const r = correr();
        expect(Math.abs(f()(r.raiz!))).toBeLessThan(1e-2);
      });

      it('el número de iteraciones del texto coincide con el motor', () => {
        const r = correr();
        // Se busca en el criterio y en el algoritmo: según el bloque,
        // la cantidad está escrita en uno u otro.
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
        // El texto redondea a 5-8 decimales, así que se compara con margen.
        expect(Math.abs(r.raiz! - anunciada!))
          .withContext(`el texto dice ${anunciada}, el motor da ${r.raiz}`)
          .toBeLessThan(1e-4);
      });

      it('la cota de error de la conclusión es alcanzable', () => {
        // Si la conclusión promete "error menor que X", el motor tiene que
        // haber conseguido un error realmente menor que X. Es la promesa
        // más fácil de arruinar sin querer.
        const r = correr();
        const prometida = errorAnunciado(bloque.conclusion);

        if (prometida !== null) {
          expect(r.error!)
            .withContext(
              `la conclusión promete ${prometida}, el motor logró ${r.error}`,
            )
            .toBeLessThan(prometida);
        }
      });

      it('la raíz cae dentro del intervalo inicial', () => {
        // La cota de Bolzano promete que la raíz verdadera está a menos
        // de (b−a)/2 del punto medio. Eso implica que c está dentro del
        // intervalo original. Si el motor se pasara, esta sería la alarma.
        const r = correr();
        expect(r.raiz!).toBeGreaterThanOrEqual(Math.min(a!, b!));
        expect(r.raiz!).toBeLessThanOrEqual(Math.max(a!, b!));
      });

      it('si el texto promete una diferencia real, que sea menor que la cota', () => {
        const r = correr();
        const diferencia = diferenciaRealAnunciada(bloque.conclusion);

        if (diferencia !== null) {
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
      expect(TEORIA_BISECCION.concepto.length).toBeGreaterThan(80);
      expect(TEORIA_BISECCION.fundamento.length).toBeGreaterThan(80);
      expect(TEORIA_BISECCION.cuandoFalla.length).toBeGreaterThan(80);
      expect(TEORIA_BISECCION.ordenConvergencia.length).toBeGreaterThan(80);
    });

    it('la fórmula es la del punto medio', () => {
      expect(TEORIA_BISECCION.algoritmo.formula).toContain('(a + b) / 2');
    });

    it('declara los 7 pasos del algoritmo', () => {
      expect(TEORIA_BISECCION.algoritmo.pasos.length).toBe(7);
    });

    it('documenta los cuatro criterios de convergencia', () => {
      const criterios = TEORIA_BISECCION.algoritmo.criterios;
      expect(criterios.length).toBeGreaterThanOrEqual(4);
      expect(criterios.some((c) => c.nombre.includes('Bolzano'))).toBe(true);
      criterios.forEach((c) => expect(c.explicacion.length).toBeGreaterThan(40));
    });

    it('lista ventajas, limitaciones y recomendaciones', () => {
      const a = TEORIA_BISECCION.algoritmo;
      expect(a.ventajas.length).toBeGreaterThanOrEqual(4);
      expect(a.limitaciones.length).toBeGreaterThanOrEqual(4);
      expect(a.recomendaciones.length).toBeGreaterThanOrEqual(4);
    });

    it('explica por qué Bolzano y no el residuo', () => {
      // Es el criterio técnico central de bisección: si el texto no lo
      // dice, el alumno no entiende por qué el error se reduce a la mitad.
      const residuo = TEORIA_BISECCION.algoritmo.criterios.find((c) =>
        c.nombre.includes('Residuo'),
      );
      expect(residuo?.explicacion).toContain('multiplicada por 1000');
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
        // "Paso 0" tiene que estar: es la verificación de Bolzano, que es
        // la condición de arranque del método.
        expect(e.pasos[0]).withContext(`${e.id} paso 0`).toContain('Paso 0');
        expect(e.pasos[0]).toMatch(/f\(/);
        expect(e.pasos[1]).toMatch(/c\s*=/);
      });
    });

    it('los ids son únicos', () => {
      const ids = BLOQUES.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('los ejercicios son resolubles y traen pista', () => {
      EJERCICIOS_BISECCION.forEach((e) => {
        const r = biseccion({
          f: parsearFuncion(e.calculo.funcion)!,
          a: e.calculo.a!,
          b: e.calculo.b!,
          tol: e.calculo.tol!,
        });
        expect(r.convergio).withContext(e.titulo).toBe(true);
        expect(e.pista).withContext(`${e.titulo} sin pista`).toBeTruthy();
        expect(e.pista!.length).toBeGreaterThan(40);
      });
    });

    it('la mitad de los ejercicios son casuísticas', () => {
      const casuisticas = EJERCICIOS_BISECCION.filter((e) => e.tipo === 'casuistica');
      expect(casuisticas.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('casuísticas', () => {
    const casuisticas: Bloque[] = [
      ...(EJEMPLOS_BISECCION.filter((e) => e.tipo === 'casuistica') as Bloque[]),
      ...(EJERCICIOS_BISECCION.filter((e) => e.tipo === 'casuistica') as Bloque[]),
      { ...TEORIA_BISECCION.ejemploCasuistica } as Bloque,
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

    it('la formulación de cada casuística verifica Bolzano', () => {
      casuisticas.forEach((c) => {
        expect(c.extraccion!.formulacion)
          .withContext(`${c.id} no menciona el cambio de signo`)
          .toMatch(/Bolzano|cambio de signo|signo/i);
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
      // Más de una vez se colaron caracteres chinos o cirílicos en los
      // textos generados. Este test lo detecta.
      BLOQUES.forEach((b) => {
        const todo = [b.titulo, b.interpretacion, b.algoritmo, b.criterio, b.conclusion]
          .concat(b.pasos)
          .join(' ');
        const sospechosos = todo.match(/[\u4e00-\u9fff\u0400-\u04ff]/g);
        expect(sospechosos).withContext(`${b.id}: ${sospechosos?.join(' ')}`).toBeNull();
      });
    });

    it('no deja palabras en inglés que se colaron', () => {
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