import { reglaFalsa } from './regla-falsa.algoritmo';

/**
 * Tests del algoritmo de Regla Falsa.
 *
 * Es una función pura (sin Angular), así que se puede probar directo.
 * La regla de los tests: si un número del enunciado del curso no coincide
 * con lo que sale acá, hay un error. Son los mismos números que el alumno
 * ve en la pestaña de Teoría.
 *
 * ── Semántica de las filas ────────────────────────────────────────────
 * Cada fila guarda el intervalo VIGENTE [a, b] al empezar la iteración, el
 * corte de la cuerda c (que es la aproximación nueva), f(c), y |Δc| = cuánto
 * se movió el corte respecto de la iteración anterior. En la iteración 1 no
 * hay corte anterior, así que |Δc| es `undefined` (no 0: no es que valga
 * cero, es que no existe todavía). El error final es el |Δc| de la última
 * fila.
 */
describe('reglaFalsa', () => {
  /** Raíz verdadera de x³ − x − 2, para comparar. */
  const RAIZ_CUBICA = 1.5213797068045676;

  it('encuentra la raíz de x^3 - x - 2 en [1, 2]', () => {
    // Este es el caso canónico: ≈ 1.5214. Con tol = 1e-5 el método para con
    // un error ~7e-6, así que la raíz queda correcta a 5 decimales: 1.52137|6
    // contra 1.52137|9. Pedir 6 decimales sería prometer más de lo que el
    // criterio de parada garantiza.
    const r = reglaFalsa({
      f: (x) => x ** 3 - x - 2,
      a: 1,
      b: 2,
      tol: 1e-5,
    });

    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeCloseTo(RAIZ_CUBICA, 5);
    expect(r.raiz).toBeCloseTo(1.5214, 4);
  });

  it('la raíz cumple f(raíz) ≈ 0', () => {
    const f = (x: number) => x ** 3 - x - 2;
    const r = reglaFalsa({ f, a: 1, b: 2, tol: 1e-10 });
    expect(Math.abs(f(r.raiz!))).toBeLessThan(1e-7);
  });

  it('la primera fila traza la cuerda de [1, 2] y anota su cruce', () => {
    // c = a − f(a)·(b − a)/(f(b) − f(a)) = 1 − (−2)·(1)/(4 − (−2)) = 1 + 2/6 = 1.3333…
    const r = reglaFalsa({
      f: (x) => x ** 3 - x - 2,
      a: 1,
      b: 2,
      tol: 1e-5,
    });

    const fila = r.filas[0];
    expect(fila.n).toBe(1);
    expect(fila.a).toBe(1);
    expect(fila.b).toBe(2);
    expect(fila.c).toBeCloseTo(1.33333333, 8);
    // f(1.3333…) = 2.3704 − 1.3333 − 2 = −0.9629…
    expect(fila.fc).toBeCloseTo(-0.96296296, 8);
    // En la iteración 1 no existe el corte anterior.
    expect(fila.delta).toBeUndefined();
  });

  it('la segunda fila descarta el extremo que no cambia de signo', () => {
    // f(1) = −2 y f(1.3333) = −0.9630 tienen el MISMO signo, así que la raíz
    // no está en [1, 1.3333]: el extremo izquierdo pasa a 1.3333 y el derecho
    // queda en 2. La nueva cuerda cruza en c ≈ 1.4627.
    const r = reglaFalsa({
      f: (x) => x ** 3 - x - 2,
      a: 1,
      b: 2,
      tol: 1e-5,
    });

    const fila = r.filas[1];
    expect(fila.n).toBe(2);
    expect(fila.a).toBeCloseTo(1.33333333, 8);
    expect(fila.b).toBe(2);
    expect(fila.c).toBeCloseTo(1.46268657, 8);
    expect(fila.fc).toBeCloseTo(-0.33333887, 8);
    expect(fila.delta).toBeCloseTo(0.12935323, 8);
  });

  it('el error final es el |Δc| de la última fila', () => {
    const r = reglaFalsa({
      f: (x) => x ** 3 - x - 2,
      a: 1,
      b: 2,
      tol: 1e-5,
    });

    const ultima = r.filas[r.filas.length - 1];
    expect(r.error).toBe(ultima.delta);
  });

  it('el error final es menor o igual que la tolerancia pedida', () => {
    // El contrato del método: nunca devuelve más precisión de la pedida.
    // (El motor usa <=: se detiene cuando |Δc| ≤ tol.)
    const tol = 1e-5;
    const r = reglaFalsa({ f: (x) => x ** 3 - x - 2, a: 1, b: 2, tol });
    expect(r.error!).toBeLessThanOrEqual(tol);
  });

  it('encuentra la raíz de x - cos(x) en [0, 1]', () => {
    // La "constante de Dottie": el único punto donde x = cos(x).
    const r = reglaFalsa({
      f: (x) => x - Math.cos(x),
      a: 0,
      b: 1,
      tol: 1e-6,
    });
    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeCloseTo(0.7390851332151607, 6);
  });

  it('encuentra la raíz de e^(-x) - x (la ecuación de Euler)', () => {
    // e^(−x) = x tiene raíz ≈ 0.5671: la misma de la bisección.
    const r = reglaFalsa({
      f: (x) => Math.exp(-x) - x,
      a: 0,
      b: 1,
      tol: 1e-6,
    });
    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeCloseTo(0.5671432904097838, 6);
  });

  it('acierta en una sola iteración cuando f es una recta', () => {
    // f(x) = 2x − 3 en [0, 5]: como la función es lineal, la cuerda ES la
    // función y su cruce con el eje es la raíz exacta. f(1.5) = 0.
    const r = reglaFalsa({ f: (x) => 2 * x - 3, a: 0, b: 5, tol: 1e-5 });
    expect(r.convergio).toBe(true);
    expect(r.iteraciones).toBe(1);
    expect(r.raiz).toBe(1.5);
    expect(r.error).toBe(0);
    expect(r.parada?.magnitud).toBe(0);
  });

  it('funciona con raíces negativas', () => {
    // x³ − 7x + 4 tiene una raíz negativa cerca de −2.9 dentro de [−3, −2].
    const r = reglaFalsa({
      f: (x) => x ** 3 - 7 * x + 4,
      a: -3,
      b: -2,
      tol: 1e-6,
    });
    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeLessThan(0);
    expect(r.raiz).toBeCloseTo(-2.8951065159, 6);
  });

  it('las filas van numeradas desde 1 y en orden', () => {
    const r = reglaFalsa({ f: (x) => x ** 3 - x - 2, a: 1, b: 2, tol: 1e-5 });
    r.filas.forEach((fila, i) => {
      expect(fila.n).toBe(i + 1);
    });
  });

  it('el intervalo de cada fila sigue conteniendo la raíz', () => {
    // La propiedad que define a un método cerrado: la raíz nunca se escapa
    // del intervalo vivo.
    const r = reglaFalsa({ f: (x) => x ** 3 - x - 2, a: 1, b: 2, tol: 1e-6 });
    r.filas.forEach((fila) => {
      expect(fila.a).toBeLessThanOrEqual(r.raiz!);
      expect(fila.b).toBeGreaterThanOrEqual(r.raiz!);
    });
  });

  it('más tolerancia da menos iteraciones', () => {
    const f = (x: number) => x ** 3 - x - 2;
    const fina = reglaFalsa({ f, a: 1, b: 2, tol: 1e-8 });
    const floja = reglaFalsa({ f, a: 1, b: 2, tol: 1e-2 });
    expect(floja.iteraciones).toBeLessThan(fina.iteraciones);
  });

  it('el número de iteraciones no depende de cuánto se escale f', () => {
    // Regla falsa calcula c = a − f(a)·(b−a)/(f(b)−f(a)): si la función se
    // multiplica por 1000, el numerador y el denominador escalan igual y el
    // cociente —el corte— no cambia. El |Δc| es un error sobre x.
    const f1 = (x: number) => x ** 3 - x - 2;
    const f2 = (x: number) => 1000 * (x ** 3 - x - 2);
    const r1 = reglaFalsa({ f: f1, a: 1, b: 2, tol: 1e-6 });
    const r2 = reglaFalsa({ f: f2, a: 1, b: 2, tol: 1e-6 });

    expect(r1.iteraciones).toBe(r2.iteraciones);
    expect(r2.raiz).toBeCloseTo(r1.raiz!, 8);
  });

  it('ordena el intervalo si el alumno da a > b', () => {
    // El método necesita a < b; en vez de fallar, los ordena solo.
    const r = reglaFalsa({ f: (x) => x ** 3 - x - 2, a: 2, b: 1, tol: 1e-5 });
    expect(r.convergio).toBe(true);
    expect(r.filas[0].a).toBe(1);
    expect(r.filas[0].b).toBe(2);
    expect(r.raiz).toBeCloseTo(RAIZ_CUBICA, 5);
  });

  it('se detiene en el máximo de iteraciones si no alcanza la tolerancia', () => {
    // Tol imposible de alcanzar en un solo paso: en la iteración 1 no hay
    // |Δc| todavía, así que el criterio no puede cumplirse y se agota el tope.
    const r = reglaFalsa({
      f: (x) => x ** 3 - x - 2,
      a: 1,
      b: 2,
      tol: 1e-12,
      maxIter: 1,
    });
    expect(r.convergio).toBe(false);
    expect(r.iteraciones).toBe(1);
    expect(r.mensaje).toContain('No se alcanzó la tolerancia');
  });

  it('rechaza un intervalo sin cambio de signo', () => {
    // f(x) = x² − 3 en [2, 3]: f(2) = 1 y f(3) = 6 son ambos positivos, no
    // hay cambio de signo y la cuerda no tiene una raíz garantizada que cruce.
    const r = reglaFalsa({ f: (x) => x * x - 3, a: 2, b: 3, tol: 1e-5 });
    expect(r.convergio).toBe(false);
    expect(r.mensaje).toContain('mismo signo');
    expect(r.filas.length).toBe(0);
  });

  it('rechaza un intervalo con a = b', () => {
    const r = reglaFalsa({ f: (x) => x ** 3 - x - 2, a: 1, b: 1, tol: 1e-5 });
    expect(r.convergio).toBe(false);
    expect(r.mensaje).toContain('a = b');
  });

  it('rechaza extremos que no son números', () => {
    const r = reglaFalsa({
      f: (x) => x ** 3 - x - 2,
      a: NaN,
      b: 2,
      tol: 1e-5,
    });
    expect(r.convergio).toBe(false);
    expect(r.mensaje).toContain('números');
    expect(r.filas.length).toBe(0);
  });
});
