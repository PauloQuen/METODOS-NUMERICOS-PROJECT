import { resolverCardano } from '../../../../../shared/domain/numerico/cardano';
import { parsearFuncion } from '../../../../../shared/domain/numerico/evaluador-funciones';

/**
 * Tests del motor de Cardano.
 *
 * ── A diferencia de los métodos iterativos ────────────────────────────
 * Cardano NO itera: recupera los coeficientes de la cúbica, hace el
 * cambio x = t + m para llegar a la deprimida t³ + p·t + q, calcula el
 * discriminante Δ y, según su signo, resuelve por radicales (Δ>0), por
 * raíces múltiples (Δ≈0) o por Viète trigonométrico (Δ<0). Por eso no
 * hay tolerancia, ni semilla, ni conteo de iteraciones: lo que hay que
 * vigilar es el álgebra (p, q, Δ, m) y que las raíces cierren f(x)≈0.
 *
 * La función que recibe NO es la cúbica normalizada: el motor la sondea
 * en varios puntos para recuperar a,b,c,d. Por eso en los tests se le
 * pasa la expresión original con su `a`, no una dividida.
 */

/** Evalúa f en un punto con la misma f que resolvería el método. */
function fDe(expr: string): (x: number) => number {
  const f = parsearFuncion(expr);
  if (!f) throw new Error(`no se pudo parsear "${expr}"`);
  return f;
}

describe('resolverCardano', () => {
  it('resuelve la cúbica clásica x³ − x − 2 con una raíz real', () => {
    const r = resolverCardano(fDe('x^3 - x - 2'));
    expect(r.error).toBeUndefined();
    expect(r.caso).toBe('una-real');
    expect(r.raicesReales.length).toBe(1);
    // La raíz real es la de Cardano: 1.5213797068045674.
    expect(r.raicesReales[0]).toBeCloseTo(1.5213797068045674, 6);
  });

  it('recupera los coeficientes (a,b,c,d) del polinomio', () => {
    const r = resolverCardano(fDe('x^3 - 6*x^2 + 11*x - 6'));
    expect(r.coeficientes).not.toBeNull();
    expect(r.coeficientes!.a).toBeCloseTo(1, 8);
    expect(r.coeficientes!.b).toBeCloseTo(-6, 8);
    expect(r.coeficientes!.c).toBeCloseTo(11, 8);
    expect(r.coeficientes!.d).toBeCloseTo(-6, 8);
  });

  it('recupera bien un coeficiente a distinto de 1', () => {
    // El motor sondea f, así que tiene que devolver a=2, no normalizado.
    const r = resolverCardano(fDe('2*x^3 + 3*x^2 - 11*x - 6'));
    expect(r.coeficientes!.a).toBeCloseTo(2, 8);
    expect(r.desplazamiento).toBeCloseTo(-0.5, 8);
  });

  it('el desplazamiento es m = −b/(3a)', () => {
    const r = resolverCardano(fDe('x^3 - 6*x^2 + 11*x - 6'));
    expect(r.desplazamiento).toBeCloseTo(-(-6) / 3, 8);
  });

  it('calcula p y q de la forma deprimida para a=1, m=0', () => {
    const r = resolverCardano(fDe('x^3 - x - 2'));
    expect(r.p).toBeCloseTo(-1, 8);
    expect(r.q).toBeCloseTo(-2, 8);
  });

  it('el discriminante coincide con (q/2)² + (p/3)³', () => {
    const r = resolverCardano(fDe('x^3 - x - 2'));
    const esperado = (r.q / 2) ** 2 + (r.p / 3) ** 3;
    expect(r.delta).toBeCloseTo(esperado, 8);
    expect(r.delta).toBeGreaterThan(0);
  });

  it('clasifica Δ>0 como una raíz real entre las tres de la cúbica', () => {
    const r = resolverCardano(fDe('x^3 - x - 2'));
    expect(r.caso).toBe('una-real');
    expect(r.raicesReales.length).toBe(1);
  });

  it('clasifica Δ<0 como tres raíces reales (Viète)', () => {
    const r = resolverCardano(fDe('x^3 - 7*x + 4'));
    expect(r.caso).toBe('tres-reales');
    expect(r.raicesReales.length).toBe(3);
    expect(r.delta).toBeLessThan(0);
  });

  it('clasifica Δ≈0 como raíces múltiples', () => {
    const r = resolverCardano(fDe('x^3 - 3*x + 2'));
    expect(r.caso).toBe('raices-multiples');
    // Raíz doble: x = 1 (dos veces) y x = −2.
    expect(r.raicesReales.length).toBeLessThanOrEqual(3);
  });

  it('las raíces reales cierran f(x)≈0 sobre su propia f', () => {
    const f = fDe('x^3 - 7*x + 4');
    const r = resolverCardano(f);
    r.raicesReales.forEach((x) => {
      expect(Math.abs(f(x)))
        .withContext(`f(${x})`)
        .toBeLessThan(1e-6);
    });
  });

  it('las raíces reales vienen ordenadas de menor a mayor', () => {
    const r = resolverCardano(fDe('x^3 - 6*x^2 + 11*x - 6'));
    const ordenadas = [...r.raicesReales].sort((a, b) => a - b);
    expect(r.raicesReales).toEqual(ordenadas);
  });

  it('las raíces de x³ − 6x² + 11x − 6 son 1, 2 y 3', () => {
    const r = resolverCardano(fDe('x^3 - 6*x^2 + 11*x - 6'));
    expect(r.raicesReales.length).toBe(3);
    expect(r.raicesReales[0]).toBeCloseTo(1, 6);
    expect(r.raicesReales[1]).toBeCloseTo(2, 6);
    expect(r.raicesReales[2]).toBeCloseTo(3, 6);
  });

  it('las raíces son coherentes con el cambio de variable x = t + m', () => {
    // La caja: m = 4, raíces t = −2 (doble) y t = 4 ⇒ x = 2 (doble) y 8.
    const r = resolverCardano(fDe('x^3 - 12*x^2 + 36*x - 32'));
    expect(r.desplazamiento).toBeCloseTo(4, 8);
    expect(r.raicesReales).toContain(8);

    // La raíz 2 aparece UNA vez en la lista (la tabla dibuja una marca,
    // no dos superpuestas), pero con multiplicidad 2: eso es lo que la
    // hace ser la raíz doble del polinomio.
    const indice = r.raicesReales.findIndex((x) => Math.abs(x - 2) < 1e-6);
    expect(indice).toBeGreaterThanOrEqual(0);
    expect(r.multiplicidades[indice]).toBe(2);
  });

  it('anuncia la multiplicidad de las raíces que se repiten', () => {
    // Raíz doble: el detalle de la fila lo dice, para que el alumno
    // no lea "x = 2" y se entere después de que era doble.
    const doble = resolverCardano(fDe('x^3 - 12*x^2 + 36*x - 32'));
    const filaDoble = doble.pasos.find((p) => p.valor !== null && Math.abs(p.valor! - 2) < 1e-6);
    expect(filaDoble).toBeDefined();
    expect(filaDoble!.detalle).toContain('doble');

    // Raíz triple: p = q = 0 ⇒ la deprimida es t³ = 0.
    const triple = resolverCardano(fDe('x^3 + 3*x^2 + 3*x + 1'));
    expect(triple.raicesReales.length).toBe(1);
    expect(triple.multiplicidades[0]).toBe(3);
    const filaTriple = triple.pasos.find((p) => p.valor !== null);
    expect(filaTriple!.detalle).toContain('triple');
  });

  it('las raíces simples se anuncian con multiplicidad 1', () => {
    const r = resolverCardano(fDe('x^3 - 7*x + 4'));
    expect(r.raicesReales.length).toBe(3);
    expect(r.multiplicidades).toEqual([1, 1, 1]);
    // Y ninguna fila de raíz usa las etiquetas de múltiple.
    r.pasos
      .filter((p) => p.valor !== null)
      .forEach((p) => {
        expect(p.detalle).not.toContain('doble');
        expect(p.detalle).not.toContain('triple');
      });
  });

  it('el desarrollo termina con una fila por raíz real, con su valor', () => {
    const r = resolverCardano(fDe('x^3 - 6*x^2 + 11*x - 6'));
    const filasConValor = r.pasos.filter((p) => p.valor !== null);
    expect(filasConValor.length).toBe(r.raicesReales.length);
    filasConValor.forEach((p) => {
      expect(r.raicesReales.some((x) => Math.abs(x - p.valor!) < 1e-6)).toBe(true);
    });
  });

  it('los pasos están numerados de forma creciente y sin huecos', () => {
    const r = resolverCardano(fDe('x^3 - 7*x + 4'));
    r.pasos.forEach((p, i) => {
      // La numeración arranca en 1, como en las tablas de los otros
      // métodos: el paso 1 es el primero que ve el alumno.
      expect(p.paso).toBe(i + 1);
      expect(p.etapa.length).toBeGreaterThan(0);
      expect(p.detalle.length).toBeGreaterThan(0);
    });
  });

  it('avisa con error si la función no es cúbica', () => {
    // Una parábola: grado 2, Cardano no aplica.
    const r = resolverCardano(fDe('x^2 - 1'));
    expect(r.error).toBeTruthy();
    expect(r.coeficientes).toBeNull();
    expect(r.raicesReales.length).toBe(0);
  });

  it('avisa con error si la función es trascendente, no polinómica', () => {
    const r = resolverCardano(fDe('sin(x) + x'));
    expect(r.error).toBeTruthy();
    expect(r.caso).toBeNull();
  });
});
