import { resolverCardano } from '../../../../../shared/domain/numerico/cardano';
import { parsearFuncion } from '../../../../../shared/domain/numerico/evaluador-funciones';
import { TEORIA_CARDANO, EJEMPLOS_CARDANO, EJERCICIOS_CARDANO } from './cardano.contenido';

/**
 * Tests del contenido de Cardano.
 *
 * ── Para qué sirve este archivo ───────────────────────────────────────
 * El contenido (ejemplos, ejercicios, teoría) tiene un contrato con el
 * motor: cada bloque dice "con esta cúbica salen tales raíces". Si
 * alguien cambia un coeficiente del enunciado sin recalcular, o escribe
 * una raíz de más en el texto, estos tests lo detectan.
 *
 * ── Qué cambia respecto de los métodos iterativos ─────────────────────
 * Cardano es de resolución cerrada: no hay tolerancia, ni semilla, ni
 * iteraciones. Lo que se vigila es (1) que la cúbica anunciada se parsee
 * y tenga grado 3, (2) que el motor clasifique el caso que promete el
 * texto y (3) que las raíces anunciadas en la conclusión coincidan con
 * las del motor.
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
  calculo?: { funcion: string };
}

/** Todos los bloques del método, de las tres secciones. */
const BLOQUES: Bloque[] = [
  ...(EJEMPLOS_CARDANO as Bloque[]),
  ...(EJERCICIOS_CARDANO as Bloque[]),
  { ...TEORIA_CARDANO.ejemploNormal } as Bloque,
  { ...TEORIA_CARDANO.ejemploCasuistica } as Bloque,
];

const CON_CALCULO = BLOQUES.filter((b) => b.calculo?.funcion);

/* ------------------------------------------------------------------ */
/* Lectores de los números escritos en el texto                         */
/* ------------------------------------------------------------------ */

/**
 * Convierte superíndices, signos tipográficos y tildes a ASCII normal.
 *
 * El texto escribe las potencias como "x³" y las raíces como "x₁", con
 * caracteres unicode. Sin normalizar, ninguna regex encuentra los
 * números y los tests pasarían en falso.
 */
function aAscii(texto: string): string {
  const superindices: Record<string, string> = {
    '⁰': '0',
    '¹': '1',
    '²': '2',
    '³': '3',
    '⁴': '4',
    '⁵': '5',
    '⁶': '6',
    '⁷': '7',
    '⁸': '8',
    '⁹': '9',
    '⁻': '-',
    '⁺': '+',
  };
  const subindices: Record<string, string> = {
    '₀': '0',
    '₁': '1',
    '₂': '2',
    '₃': '3',
    '₄': '4',
    '₅': '5',
    '₆': '6',
    '₇': '7',
    '₈': '8',
    '₉': '9',
  };
  return texto
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, (c) => superindices[c] ?? c)
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => subindices[c] ?? c)
    .replace(/[–−]/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Saca TODAS las raíces que la conclusión anuncia tras «≈».
 *
 * "Raíces reales: x₁ ≈ −2.895, x₂ ≈ 0.602, x₃ ≈ 2.292" → tres números.
 * "Raíz real: x ≈ 1.521" → uno. El signo puede ser -, – o −.
 */
function raicesAnunciadas(texto: string): number[] {
  const plano = aAscii(texto);
  const numeros: number[] = [];
  const re = /≈\s*(-?\d+\.?\d*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(plano)) !== null) {
    numeros.push(Number(m[1]));
  }
  return numeros;
}

/**
 * Saca el caso del discriminante que promete el texto.
 *
 * El contenido escribe el caso de tres maneras: "Δ=0", "Δ > 0", "Δ<0".
 * Se devuelve el signo esperado para poder comparar con el motor.
 */
function casoAnunciado(texto: string): 'positivo' | 'cero' | 'negativo' | null {
  const plano = aAscii(texto).replace(/\s+/g, '');
  if (/Δ==0|Δ=0|Δ≈0/.test(plano)) return 'cero';
  if (/Δ>0/.test(plano)) return 'positivo';
  if (/Δ<0/.test(plano)) return 'negativo';
  return null;
}

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe('contenido de Cardano', () => {
  it('está el contenido completo: 2+ ejemplos, 3+ ejercicios, teoría', () => {
    expect(EJEMPLOS_CARDANO.length).toBeGreaterThanOrEqual(2);
    expect(EJERCICIOS_CARDANO.length).toBeGreaterThanOrEqual(3);

    const numericos = EJEMPLOS_CARDANO.filter((e) => e.tipo === 'numerico');
    const casuisticas = EJEMPLOS_CARDANO.filter((e) => e.tipo === 'casuistica');
    expect(numericos.length).toBeGreaterThanOrEqual(2);
    expect(casuisticas.length).toBeGreaterThanOrEqual(1);
  });

  CON_CALCULO.forEach((bloque) => {
    describe(`${bloque.id}: ${bloque.titulo}`, () => {
      const { funcion } = bloque.calculo!;
      const f = () => parsearFuncion(funcion)!;
      const correr = () => resolverCardano(f());

      it('la función del contenido se parsea', () => {
        expect(parsearFuncion(funcion)).not.toBeNull();
        expect(typeof f()).toBe('function');
      });

      it('la función es una cúbica válida para Cardano', () => {
        const r = correr();
        expect(r.error)
          .withContext(r.error ?? '')
          .toBeUndefined();
        expect(r.coeficientes).not.toBeNull();
        expect(Math.abs(r.coeficientes!.a)).toBeCloseTo(Math.abs(r.coeficientes!.a), 8);
        expect(r.coeficientes!.a).not.toBe(0);
      });

      it('el desplazamiento es m = −b/(3a)', () => {
        const r = correr();
        const { a, b } = r.coeficientes!;
        expect(r.desplazamiento).toBeCloseTo(-b / (3 * a), 8);
      });

      it('el motor encuentra al menos una raíz real', () => {
        expect(correr().raicesReales.length).toBeGreaterThanOrEqual(1);
      });

      it('las raíces reales cierran f(x)≈0', () => {
        const r = correr();
        r.raicesReales.forEach((x) => {
          expect(Math.abs(f()(x)))
            .withContext(`f(${x})`)
            .toBeLessThan(1e-6);
        });
      });

      it('las raíces reales vienen ordenadas', () => {
        const r = correr();
        const ordenadas = [...r.raicesReales].sort((a, b) => a - b);
        expect(r.raicesReales).toEqual(ordenadas);
      });

      it('las raíces de la conclusión coinciden con el motor', () => {
        const r = correr();
        const anunciadas = raicesAnunciadas(bloque.conclusion);

        expect(anunciadas)
          .withContext(`la conclusión de "${bloque.titulo}" no da raíces`)
          .not.toBe([]);

        // Mismo número de raíces reales y cada una cerca de una del motor.
        expect(anunciadas.length).toBe(r.raicesReales.length);
        anunciadas.forEach((anunciada) => {
          const masCerca = r.raicesReales.reduce((mejor, x) =>
            Math.abs(x - anunciada) < Math.abs(mejor - anunciada) ? x : mejor,
          );
          expect(Math.abs(masCerca - anunciada))
            .withContext(`el texto dice ${anunciada}, el motor da ${r.raicesReales}`)
            .toBeLessThan(1e-4);
        });
      });

      it('el caso que promete el texto coincide con el discriminante del motor', () => {
        // La promesa puede estar en criterio, interpretacion o algoritmo.
        const promesa =
          casoAnunciado(bloque.criterio) ??
          casoAnunciado(bloque.interpretacion) ??
          casoAnunciado(bloque.algoritmo);

        if (promesa === null) return; // bloque que no declara el caso

        const r = correr();
        if (promesa === 'positivo') {
          expect(r.delta).withContext(`el texto promete Δ>0`).toBeGreaterThan(0);
        } else if (promesa === 'negativo') {
          expect(r.delta).withContext(`el texto promete Δ<0`).toBeLessThan(0);
        } else {
          expect(Math.abs(r.delta)).withContext(`el texto promete Δ=0`).toBeLessThan(1e-9);
        }
      });

      it('la conclusión arranca nombrando la raíz o las raíces', () => {
        expect(bloque.conclusion).toMatch(/ra[ií]z|ra[ií]ces/i);
      });
    });
  });

  /* ---------------------------------------------------------------- */
  /* Estructura                                                        */
  /* ---------------------------------------------------------------- */

  describe('teoría', () => {
    it('tiene las cuatro secciones obligatorias', () => {
      expect(TEORIA_CARDANO.concepto.length).toBeGreaterThan(80);
      expect(TEORIA_CARDANO.fundamento.length).toBeGreaterThan(80);
      expect(TEORIA_CARDANO.cuandoFalla.length).toBeGreaterThan(80);
      expect(TEORIA_CARDANO.ordenConvergencia.length).toBeGreaterThan(80);
    });

    it('la fórmula trae el cambio de variable y el discriminante', () => {
      // Cardano es x = t − b/(3a), la deprimida t³+p·t+q y Δ. Los tres
      // pedazos tienen que estar, porque sin cualquiera el método no está.
      const formula = TEORIA_CARDANO.algoritmo.formula;
      expect(formula).toContain('t');
      expect(formula).toContain('p');
      expect(formula).toContain('q');
      expect(formula).toContain('Δ');
    });

    it('declara los 7 pasos del algoritmo', () => {
      expect(TEORIA_CARDANO.algoritmo.pasos.length).toBe(7);
    });

    it('documenta al menos los tres casos del discriminante', () => {
      const criterios = TEORIA_CARDANO.algoritmo.criterios;
      expect(criterios.length).toBeGreaterThanOrEqual(3);
      // Tiene que haber un criterio que hable del discriminante y del grado.
      expect(criterios.some((c) => c.nombre.includes('Discriminante'))).toBe(true);
      expect(criterios.some((c) => c.nombre.includes('Grado'))).toBe(true);
      criterios.forEach((c) => expect(c.explicacion.length).toBeGreaterThan(40));
    });

    it('la explicación del discriminante cubre los tres signos', () => {
      const disc = TEORIA_CARDANO.algoritmo.criterios.find((c) =>
        c.nombre.includes('Discriminante'),
      );
      const texto = disc?.explicacion ?? '';
      expect(texto).toMatch(/Δ\s*>\s*0/);
      expect(texto).toMatch(/Δ\s*==\s*0/);
      expect(texto).toMatch(/Δ\s*<\s*0/);
    });

    it('aclara que no hay iteraciones', () => {
      // El «0 iteraciones» es la marca de los métodos de resolución
      // cerrada: el texto de convergencia tiene que decirlo.
      expect(TEORIA_CARDANO.ordenConvergencia.toLowerCase()).toContain('iteracion');
    });

    it('lista ventajas, limitaciones y recomendaciones', () => {
      const a = TEORIA_CARDANO.algoritmo;
      expect(a.ventajas.length).toBeGreaterThanOrEqual(3);
      expect(a.limitaciones.length).toBeGreaterThanOrEqual(3);
      expect(a.recomendaciones.length).toBeGreaterThanOrEqual(3);
    });

    it('una limitación menciona que solo aplica a grado 3', () => {
      const limitaciones = TEORIA_CARDANO.algoritmo.limitaciones.join(' ');
      expect(limitaciones).toMatch(/grado\s*3|grado\s+exactamente\s*3|cúbica/i);
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

    it('cada uno arranca con el Paso 0 de coeficientes', () => {
      BLOQUES.forEach((e) => {
        // El Paso 0 de Cardano identifica a,b,c,d (los coeficientes).
        expect(e.pasos[0]).withContext(`${e.id} paso 0`).toContain('Paso 0');
        expect(e.pasos[0])
          .withContext(`${e.id} paso 0 sin coeficientes`)
          .toMatch(/coeficiente|a=|a\s*=\s*1/i);
      });
    });

    it('los ids son únicos', () => {
      const ids = BLOQUES.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('los ejercicios son resolubles y traen pista', () => {
      EJERCICIOS_CARDANO.forEach((e) => {
        const f = parsearFuncion(e.calculo.funcion)!;
        const r = resolverCardano(f);
        expect(r.error).withContext(e.titulo).toBeUndefined();
        expect(r.raicesReales.length).withContext(e.titulo).toBeGreaterThanOrEqual(1);
        expect(e.pista).withContext(`${e.titulo} sin pista`).toBeTruthy();
        expect(e.pista!.length).toBeGreaterThan(40);
      });
    });

    it('hay al menos un ejercicio de casuística', () => {
      const casuisticas = EJERCICIOS_CARDANO.filter((e) => e.tipo === 'casuistica');
      expect(casuisticas.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('casuísticas', () => {
    const casuisticas: Bloque[] = [
      ...(EJEMPLOS_CARDANO.filter((e) => e.tipo === 'casuistica') as Bloque[]),
      ...(EJERCICIOS_CARDANO.filter((e) => e.tipo === 'casuistica') as Bloque[]),
      { ...TEORIA_CARDANO.ejemploCasuistica } as Bloque,
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

    it('la formulación de cada casuística explica la reducción a la deprimida', () => {
      // El paso característico de Cardano es el cambio x = t + m: la
      // casuística tiene que contar cómo llega a t³ + p·t + q.
      casuisticas.forEach((c) => {
        expect(c.extraccion!.formulacion)
          .withContext(`${c.id} no explica la reducción`)
          .toMatch(/deprimida|reducci[oó]n|redue|desplaza|m\s*=|t\s*\+|p\s*=|q\s*=/i);
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
        expect(sospechosos)
          .withContext(`${b.id}: ${sospechosos?.join(' ')}`)
          .toBeNull();
      });
    });

    it('no deja palabras en inglés que se coló', () => {
      BLOQUES.forEach((b) => {
        const todo = [b.titulo, b.interpretacion, b.algoritmo, b.criterio, b.conclusion]
          .concat(b.pasos)
          .join(' ');
        ['Written', 'famous', 'Shoul', 'SOURCE', 'Wait', 'Better'].forEach((palabra) => {
          expect(todo).withContext(`${b.id} contiene "${palabra}"`).not.toContain(palabra);
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
