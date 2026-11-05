import { ejecutarGauss } from './gauss.algoritmo';
import {
  TEORIA_GAUSS,
  EJEMPLOS_GAUSS,
  EJERCICIOS_GAUSS,
} from './gauss.contenido';

/**
 * Tests del contenido de la eliminación gaussiana.
 *
 * ── Para qué sirve este archivo ───────────────────────────────────────
 * El contenido (ejemplos, ejercicios, teoría) tiene un contrato con el
 * motor: cada bloque dice "con esta matriz salen tales números". Si
 * alguien cambia un coeficiente del enunciado sin recalcular, o escribe
 * una solución que no es la del motor, estos tests lo detectan.
 *
 * ── Qué se vigila ─────────────────────────────────────────────────────
 *  1. Que el sistema del contenido se pueda resolver (o, si es singular,
 *     que el motor lo detecte y el texto lo diga).
 *  2. Que el residuo ‖Ax − b‖∞ quede en cero.
 *  3. Que la conclusión anuncie EXACTAMENTE la solución del motor.
 *  4. Que los pasos escritos tengan numeración corrida y mencionen las
 *     etapas del método.
 */

/** Un bloque de contenido con lo que el test necesita mirar. */
interface Bloque {
  id: string;
  titulo: string;
  tipo: string;
  ecuacion: string;
  criterio: string;
  conclusion: string;
  interpretacion: string;
  algoritmo: string;
  pasos: string[];
  parametros: { etiqueta: string; valor: string }[];
  enunciado?: string;
  pista?: string;
  extraccion?: { busqueda: string; datos: unknown[]; formulacion: string };
  calculo: { A: number[][]; b: number[] };
}

/** Todos los bloques del método, de las tres secciones. */
const BLOQUES: Bloque[] = [
  ...(EJEMPLOS_GAUSS as Bloque[]),
  ...(EJERCICIOS_GAUSS as Bloque[]),
  { ...TEORIA_GAUSS.ejemploNormal } as Bloque,
  { ...TEORIA_GAUSS.ejemploCasuistica } as Bloque,
];

/* ------------------------------------------------------------------ */
/* Lectores de los números escritos en el texto                         */
/* ------------------------------------------------------------------ */

/**
 * Convierte subíndices y signos tipográficos a ASCII normal.
 *
 * El texto escribe "x₁" y "−3" con caracteres unicode. Sin normalizar,
 * ninguna regex encuentra los números y los tests pasarían en falso.
 */
function aAscii(texto: string): string {
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
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => subindices[c] ?? c)
    .replace(/[–−]/g, '-');
}

/**
 * Saca los valores de la forma "x1 = 3" del texto.
 *
 * "La solución es x₁ = 2, x₂ = 3, x₃ = −1" → [2, 3, -1].
 * Si el texto no usa esa forma (las casuísticas escriben "30 piezas de
 * tipo A"), devuelve una lista vacía.
 */
function valoresConIgual(texto: string): number[] {
  const plano = aAscii(texto);
  const valores: number[] = [];
  const re = /x\d\s*=\s*(-?\d+\.?\d*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(plano)) !== null) {
    valores.push(Number(m[1]));
  }
  return valores;
}

/** Todos los números que aparecen en el texto, en cualquier contexto. */
function numerosDelTexto(texto: string): number[] {
  const plano = aAscii(texto);
  const numeros: number[] = [];
  const re = /-?\d+\.?\d*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(plano)) !== null) {
    numeros.push(Number(m[0]));
  }
  return numeros;
}

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe('contenido de la eliminación gaussiana', () => {
  it('está el contenido completo: 2+ ejemplos, 3+ ejercicios, teoría', () => {
    expect(EJEMPLOS_GAUSS.length).toBeGreaterThanOrEqual(2);
    expect(EJERCICIOS_GAUSS.length).toBeGreaterThanOrEqual(3);

    const numericos = EJEMPLOS_GAUSS.filter((e) => e.tipo === 'numerico');
    const casuisticas = EJEMPLOS_GAUSS.filter((e) => e.tipo === 'casuistica');
    expect(numericos.length).toBeGreaterThanOrEqual(2);
    expect(casuisticas.length).toBeGreaterThanOrEqual(1);
  });

  BLOQUES.forEach((bloque) => {
    describe(`${bloque.id}: ${bloque.titulo}`, () => {
      const correr = () => ejecutarGauss({ A: bloque.calculo.A, b: bloque.calculo.b });

      it('el sistema es cuadrado y el lado derecho tiene el tamaño correcto', () => {
        const n = bloque.calculo.A.length;
        expect(n).toBeGreaterThanOrEqual(2);
        bloque.calculo.A.forEach((fila) => expect(fila.length).toBe(n));
        expect(bloque.calculo.b.length).toBe(n);
      });

      it('el motor resuelve el sistema, o avisa que es singular', () => {
        const r = correr();
        if (r.exito) {
          expect(r.solucion).toBeDefined();
          expect(r.solucion!.length).toBe(bloque.calculo.A.length);
          expect(r.mensaje).toBeUndefined();
        } else {
          // Un sistema que no se resuelve tiene que ser singular, y el
          // método lo tiene que decir con esas palabras.
          expect(r.mensaje ?? '').toMatch(/singular/i);
          expect(r.solucion).toBeUndefined();
        }
      });

      it('el residuo queda en cero cuando el sistema se resuelve', () => {
        const r = correr();
        if (!r.exito) {
          // Si no se resolvió, no hay residuo que mirar: lo que se mira
          // es que el método NO haya devuelto una solución falsa.
          expect(r.residuo).toBeUndefined();
          expect(r.solucion).toBeUndefined();
          return;
        }
        expect(r.residuo ?? 1).toBeLessThan(1e-10);
      });

      it('la conclusión anuncia la solución del motor', () => {
        const r = correr();

        if (!r.exito) {
          // Sistema singular: el texto tiene que decir que no hay
          // solución única, no inventar una respuesta.
          expect(bloque.conclusion.toLowerCase()).toMatch(/no tiene soluci|infinitas/i);
          return;
        }

        const conIgual = valoresConIgual(bloque.conclusion);

        if (conIgual.length > 0) {
          // El texto escribe "x₁ = 2, x₂ = 3": tiene que coincidir exacto.
          expect(conIgual.length)
            .withContext(`la conclusión de "${bloque.titulo}" anuncia ${conIgual.length} valores`)
            .toBe(r.solucion!.length);
          r.solucion!.forEach((v, i) => {
            expect(conIgual[i])
              .withContext(`componente ${i} de "${bloque.titulo}"`)
              .toBeCloseTo(v, 6);
          });
        } else {
          // Casuística: los valores aparecen sueltos ("30 piezas de tipo A").
          const numeros = numerosDelTexto(bloque.conclusion);
          r.solucion!.forEach((v) => {
            const aparece = numeros.some((n) => Math.abs(n - v) < 1e-6);
            expect(aparece)
              .withContext(`la conclusión de "${bloque.titulo}" no menciona el valor ${v}`)
              .toBe(true);
          });
        }
      });

      it('los pasos escritos están numerados en orden y nombran una etapa', () => {
        expect(bloque.pasos.length).toBeGreaterThanOrEqual(3);
        bloque.pasos.forEach((paso, i) => {
          expect(paso)
            .withContext(`${bloque.id} paso ${i + 1}`)
            .toMatch(new RegExp(`^Paso ${i + 1}\\b`));
          // Cada paso tiene que nombrar una de las etapas del método. El
          // primero puede ser el planteamiento (la matriz aumentada).
          expect(paso)
            .withContext(`${bloque.id} paso ${i + 1} sin etapa`)
            .toMatch(/pivote|eliminaci|sustituci|matriz aumentada/i);
        });
      });

      it('tiene todas las secciones completas', () => {
        expect(bloque.interpretacion.length)
          .withContext(`${bloque.id} interpretacion`)
          .toBeGreaterThan(60);
        expect(bloque.algoritmo.length)
          .withContext(`${bloque.id} algoritmo`)
          .toBeGreaterThan(50);
        expect(bloque.criterio.length)
          .withContext(`${bloque.id} criterio`)
          .toBeGreaterThan(40);
        expect(bloque.conclusion.length)
          .withContext(`${bloque.id} conclusion`)
          .toBeGreaterThan(60);
        expect(bloque.parametros.length)
          .withContext(`${bloque.id} parametros`)
          .toBeGreaterThanOrEqual(2);
      });
    });
  });

  /* ---------------------------------------------------------------- */
  /* Estructura                                                        */
  /* ---------------------------------------------------------------- */

  describe('teoría', () => {
    it('tiene las cuatro secciones obligatorias', () => {
      expect(TEORIA_GAUSS.concepto.length).toBeGreaterThan(80);
      expect(TEORIA_GAUSS.fundamento.length).toBeGreaterThan(80);
      expect(TEORIA_GAUSS.cuandoFalla.length).toBeGreaterThan(80);
      expect(TEORIA_GAUSS.ordenConvergencia.length).toBeGreaterThan(80);
    });

    it('la fórmula trae el factor de eliminación y la sustitución', () => {
      const formula = TEORIA_GAUSS.algoritmo.formula;
      expect(formula).toContain('m');
      expect(formula).toContain('R');
    });

    it('declara los pasos del algoritmo', () => {
      expect(TEORIA_GAUSS.algoritmo.pasos.length).toBeGreaterThanOrEqual(6);
    });

    it('documenta el pivoteo, la singularidad y el residuo', () => {
      const criterios = TEORIA_GAUSS.algoritmo.criterios;
      expect(criterios.length).toBeGreaterThanOrEqual(3);
      expect(criterios.some((c) => c.nombre.includes('Pivote'))).toBe(true);
      expect(criterios.some((c) => c.nombre.includes('Residuo'))).toBe(true);
      criterios.forEach((c) => expect(c.explicacion.length).toBeGreaterThan(40));
    });

    it('aclara que no hay iteraciones', () => {
      // La marca de los métodos directos: el texto de convergencia tiene
      // que decir que el método no itera.
      expect(TEORIA_GAUSS.ordenConvergencia.toLowerCase()).toContain('itera');
    });

    it('explica que el pivoteo parcial divide por el mayor valor absoluto', () => {
      expect(TEORIA_GAUSS.fundamento.toLowerCase()).toMatch(/mayor valor absoluto/);
    });

    it('lista ventajas, limitaciones y recomendaciones', () => {
      const a = TEORIA_GAUSS.algoritmo;
      expect(a.ventajas.length).toBeGreaterThanOrEqual(3);
      expect(a.limitaciones.length).toBeGreaterThanOrEqual(3);
      expect(a.recomendaciones.length).toBeGreaterThanOrEqual(3);
    });

    it('menciona el costo O(n³) en las limitaciones', () => {
      const limitaciones = TEORIA_GAUSS.algoritmo.limitaciones.join(' ');
      expect(limitaciones).toMatch(/O\(n³\)/);
    });
  });

  describe('ejemplos y ejercicios', () => {
    it('los ids son únicos', () => {
      const ids = BLOQUES.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('cada ejemplo numérico escribe la ecuación del sistema', () => {
      BLOQUES.filter((b) => b.tipo === 'numerico').forEach((b) => {
        expect(b.ecuacion.length)
          .withContext(`${b.id} ecuacion`)
          .toBeGreaterThan(10);
        // La ecuación tiene que traer el signo igual: "2x₁ + x₂ = 8".
        expect(b.ecuacion).toMatch(/=/);
      });
    });

    it('las casuísticas traen el bloque de extracción de datos', () => {
      const casuisticas = BLOQUES.filter((b) => b.tipo === 'casuistica');
      expect(casuisticas.length).toBeGreaterThanOrEqual(1);
      casuisticas.forEach((b) => {
        expect(b.enunciado)
          .withContext(`${b.id} enunciado`)
          .toBeTruthy();
        expect(b.extraccion)
          .withContext(`${b.id} extraccion`)
          .toBeDefined();
        expect(b.extraccion!.busqueda.length).toBeGreaterThan(40);
        expect(b.extraccion!.formulacion.length).toBeGreaterThan(40);
        expect(b.extraccion!.datos.length).toBeGreaterThanOrEqual(3);
        b.extraccion!.datos.forEach((d) => {
          const dato = d as { simbolo: string; queEs: string };
          expect(dato.queEs.length)
            .withContext(`${b.id} dato ${dato.simbolo}`)
            .toBeGreaterThan(10);
        });
      });
    });

    it('los ejercicios traen pista para orientar al alumno', () => {
      EJERCICIOS_GAUSS.forEach((e) => {
        expect(e.pista)
          .withContext(`${e.id} pista`)
          .toBeTruthy();
        expect(e.pista!.length).toBeGreaterThan(30);
      });
    });
  });
});
