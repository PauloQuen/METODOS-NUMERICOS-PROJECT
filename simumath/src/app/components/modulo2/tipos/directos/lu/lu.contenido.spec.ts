import { ejecutarLu } from './lu.algoritmo';
import {
  TEORIA_LU,
  EJEMPLOS_LU,
  EJERCICIOS_LU,
} from './lu.contenido';

/**
 * Tests del contenido de la factorización LU.
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

const BLOQUES: Bloque[] = [
  ...(EJEMPLOS_LU as Bloque[]),
  ...(EJERCICIOS_LU as Bloque[]),
  { ...TEORIA_LU.ejemploNormal } as Bloque,
  { ...TEORIA_LU.ejemploCasuistica } as Bloque,
];

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

describe('contenido de la factorización LU', () => {
  it('está el contenido completo: 3+ ejemplos, 3+ ejercicios, teoría', () => {
    expect(EJEMPLOS_LU.length).toBeGreaterThanOrEqual(3);
    expect(EJERCICIOS_LU.length).toBeGreaterThanOrEqual(3);

    const numericos = EJEMPLOS_LU.filter((e) => e.tipo === 'numerico');
    expect(numericos.length).toBeGreaterThanOrEqual(2);

    // La casuística está en la teoría (TEORIA_LU.ejemploCasuistica), no en EJEMPLOS_LU
    const casuisticas = BLOQUES.filter((b) => b.tipo === 'casuistica');
    expect(casuisticas.length).toBeGreaterThanOrEqual(1);
  });

  BLOQUES.forEach((bloque) => {
    describe(`${bloque.id}: ${bloque.titulo}`, () => {
      const correr = () => ejecutarLu({ A: bloque.calculo.A, b: bloque.calculo.b });

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
          expect(r.mensaje ?? '').toMatch(/singular/i);
          expect(r.solucion).toBeUndefined();
        }
      });

      it('el residuo queda en cero cuando el sistema se resuelve', () => {
        const r = correr();
        if (!r.exito) {
          expect(r.residuo).toBeUndefined();
          expect(r.solucion).toBeUndefined();
          return;
        }
        expect(r.residuo ?? 1).toBeLessThan(1e-10);
      });

      it('la conclusión anuncia la solución del motor', () => {
        const r = correr();

        if (!r.exito) {
          expect(bloque.conclusion.toLowerCase()).toMatch(/no tiene soluci|infinitas/i);
          return;
        }

        const conIgual = valoresConIgual(bloque.conclusion);

        if (conIgual.length > 0) {
          expect(conIgual.length)
            .withContext(`la conclusión de "${bloque.titulo}" anuncia ${conIgual.length} valores`)
            .toBe(r.solucion!.length);
          r.solucion!.forEach((v, i) => {
            expect(conIgual[i])
              .withContext(`componente ${i} de "${bloque.titulo}"`)
              .toBeCloseTo(v, 6);
          });
        } else {
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
          // El último es la comprobación final.
          expect(paso)
            .withContext(`${bloque.id} paso ${i + 1} sin etapa`)
            .toMatch(/descomposici|sustituci|matriz|comprobaci/i);
        });
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

  describe('teoría', () => {
    it('tiene las cuatro secciones obligatorias', () => {
      expect(TEORIA_LU.concepto.length).toBeGreaterThan(80);
      expect(TEORIA_LU.fundamento.length).toBeGreaterThan(80);
      expect(TEORIA_LU.cuandoFalla.length).toBeGreaterThan(80);
      expect(TEORIA_LU.ordenConvergencia.length).toBeGreaterThan(80);
    });

    it('la fórmula trae el multiplicador, L y las dos sustituciones', () => {
      const formula = TEORIA_LU.algoritmo.formula;
      expect(formula).toContain('m');
      expect(formula).toContain('L');
      expect(formula).toContain('U');
    });

    it('declara los pasos del algoritmo', () => {
      expect(TEORIA_LU.algoritmo.pasos.length).toBeGreaterThanOrEqual(6);
    });

    it('documenta el pivote, la reutilización y el residuo', () => {
      const criterios = TEORIA_LU.algoritmo.criterios;
      expect(criterios.length).toBeGreaterThanOrEqual(3);
      expect(criterios.some((c) => c.nombre.includes('Pivote'))).toBe(true);
      expect(criterios.some((c) => c.nombre.includes('Reutilización'))).toBe(true);
      expect(criterios.some((c) => c.nombre.includes('Residuo'))).toBe(true);
      criterios.forEach((c) => expect(c.explicacion.length).toBeGreaterThan(40));
    });

    it('aclara que no hay iteraciones', () => {
      expect(TEORIA_LU.ordenConvergencia.toLowerCase()).toContain('itera');
    });

    it('explica que la diagonal de L es de unos (Doolittle)', () => {
      expect(TEORIA_LU.fundamento.toLowerCase()).toMatch(/diagonal.*unidades|diagonal.*unos/i);
    });

    it('lista ventajas, limitaciones y recomendaciones', () => {
      const a = TEORIA_LU.algoritmo;
      expect(a.ventajas.length).toBeGreaterThanOrEqual(3);
      expect(a.limitaciones.length).toBeGreaterThanOrEqual(3);
      expect(a.recomendaciones.length).toBeGreaterThanOrEqual(3);
    });

    it('menciona el costo O(n³) en las limitaciones', () => {
      const limitaciones = TEORIA_LU.algoritmo.limitaciones.join(' ');
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
      EJERCICIOS_LU.forEach((e) => {
        expect(e.pista)
          .withContext(`${e.id} pista`)
          .toBeTruthy();
        expect(e.pista!.length).toBeGreaterThan(30);
      });
    });
  });