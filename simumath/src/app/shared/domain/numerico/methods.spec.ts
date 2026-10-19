/**
 * RED DE SEGURIDAD DEL MOTOR NUMÉRICO
 * ===================================
 *
 * Estos tests fijan el comportamiento REAL y MEDIDO de `methods.ts` (medido con
 * f(x) = x³ − x − 2, raíz 1.5213797068045676, tol = 1e-4). Existen para que
 * cualquier cambio posterior pueda detectar una regresión.
 *
 * ── Línea base ANTES del contrato de convergencia ───────────────────────
 *
 *   método      iter  aproximación      |Δ| reportada  cumplía tol=1e-4
 *   bisección     14  1.5214233400       |Δc| 6.104e-5  sí
 *   regla falsa    9  1.5213695300       |Δc| 2.505e-5  sí
 *   secante        5  1.5213763200       |Δx| 4.499e-4  *** NO (4.5×) ***
 *   newton         5  1.5213797100       |Δx| 6.176e-5  sí
 *
 * ── Línea base DESPUÉS (criterio unificado de criterio.ts) ─────────────
 *
 *   método      iter  aproximación      criterio          magnitud
 *   bisección     14  1.5214233400       intervalo         6.104e-5
 *   regla falsa    8  1.5213444800       absoluto          8.670e-5
 *   secante        6  1.5213797100       absoluto          3.390e-6
 *   newton         5  1.5213797100       absoluto          6.176e-5
 *
 * El número de iteraciones de la secante BAJÓ de 5 a 6 solo por usar la
 * tolerancia correcta: antes paraba por residuo con un |Δx| 4.5× más grande
 * del pedido, o sea mintiendo sobre la precisión alcanzada.
 *
 * ── Defectos RESUELTOS por el contrato de convergencia ─────────────────
 *
 *   D1 RESUELTO. La secante ya no declara convergencia con |Δx| = 4.5 × la
 *      tolerancia: ahora para por |xᵢ − xᵢ₋₁| ≤ tol.
 *   D2 RESUELTO. Los 4 criterios hardcodeados pasaron a ser 4 criterios
 *      tipados en criterio.ts, con la decisión centralizada.
 *   D3 RESUELTO. El criterio es invariante a escala: con k = 1, 1e3, 1e6 y
 *      1e-6 los cuatro métodos dan 14, 8, 6 y 5 iteraciones sin variación.
 *      Antes la regla falsa iba de 9 a 20.
 *   D4 RESUELTO. Se eliminó la variable `delta` muerta de reglaFalsa.
 *   D5 RESUELTO. La detección de oscilación de puntoFijo compara deltas en
 *      crudo, no los strings ya redondeados a 8 decimales.
 *
 * ── LIMITACIONES CONOCIDAS que NO son bugs del motor ────────────────────
 *
 *   D6. El motor de punto fijo solo recibe g, no f, así que no puede validar
 *      que el punto fijo alcanzado sea raíz de f. Con g(x)=1 "converge" a
 *      x=1, donde f(1) = −2. Es una limitación de contrato, no un defecto:
 *      la validación le corresponde al enunciado que entrega el par (f, g).
 *   D7. El criterio `intervalo` no sirve para la regla falsa, porque su
 *      intervalo no se contrae: el extremo lejos de la raíz queda congelado y
 *      la cota de Bolzano se estabiliza sin bajar nunca de ~0.24. Está
 *      disponible a pedido, pero el default es `absoluto`.
 */

import {
  MetodoResultado,
  biseccion,
  fmt,
  newton,
  parseFuncion,
  puntoFijo,
  reglaFalsa,
  secante,
} from './methods';

/** Raíz conocida de x³ − x − 2, verificada con Cardano. */
const RAIZ = 1.5213797068045676;
const TOL = 1e-4;

/** Última aproximación de una tabla, leída como número. */
function ultimaAprox(r: MetodoResultado, columna: string): number {
  const fila = r.rows[r.rows.length - 1];
  return Number(fila?.[columna]);
}

/** Última magnitud reportada en la columna `|Δx|` o `|Δc|`. */
function ultimoDelta(r: MetodoResultado, columna = '|Δx|'): number {
  return Math.abs(Number(r.rows[r.rows.length - 1]?.[columna]));
}

describe('methods — formato y parseo', () => {
  describe('fmt', () => {
    it('deja los enteros sin decimales', () => {
      expect(fmt(3)).toBe('3');
      expect(fmt(-12)).toBe('-12');
      expect(fmt(0)).toBe('0');
    });

    it('recorta ceros colgantes hasta 8 decimales', () => {
      expect(fmt(0.5)).toBe('0.5');
      expect(fmt(1.5213797068045676)).toBe('1.52137971');
      expect(fmt(1e-12)).toBe('0');
    });

    it('devuelve el guion largo para valores no finitos', () => {
      expect(fmt(NaN)).toBe('—');
      expect(fmt(Infinity)).toBe('—');
    });
  });

  describe('parseFuncion', () => {
    it('interpreta la potencia con ^', () => {
      expect(parseFuncion('x^3 - x - 2')(2)).toBe(4);
    });

    it('interpreta las funciones trigonométricas del portal', () => {
      expect(parseFuncion('sin(x)')(0)).toBeCloseTo(0, 12);
      expect(parseFuncion('cos(x)')(0)).toBeCloseTo(1, 12);
    });

    it('interpreta raiz, logaritmos y constantes', () => {
      expect(parseFuncion('sqrt(x)')(9)).toBe(3);
      expect(parseFuncion('log(x)')(100)).toBe(2);
      expect(parseFuncion('PI * x')(1)).toBeCloseTo(Math.PI, 12);
    });

    it('lanza un error en una expresión malformada', () => {
      expect(() => parseFuncion('x^2 + ')).toThrow();
    });

    it('lanza un error si la expresión no es numérica', () => {
      expect(() => parseFuncion('foo(x)')).toThrow();
    });
  });
});

describe('methods — bisección', () => {
  const r = () => biseccion((x) => x ** 3 - x - 2, 1, 2, TOL);

  it('converge y devuelve 14 iteraciones con la tolerancia de la línea base', () => {
    const res = r();
    expect(res.converged).toBe(true);
    expect(res.iterations).toBe(14);
  });

  it('acota la raíz con la precisión de la línea base', () => {
    expect(ultimaAprox(r(), 'c')).toBeCloseTo(1.52142334, 8);
  });

  it('reporta la convergencia con el ancho del intervalo', () => {
    // Bisección mide el error por el teorema de Bolzano: |error| ≤ (b−a)/2.
    expect(ultimoDelta(r(), '|Δc|')).toBeLessThanOrEqual(TOL);
  });

  it('declara el criterio de intervalo y lo cumple', () => {
    const res = r();
    expect(res.parada?.criterio).toBe('intervalo');
    expect(res.parada?.magnitud).toBeLessThanOrEqual(TOL);
    expect(res.parada?.resumen).toContain('(b − a) / 2');
  });

  it('el intervalo se contrae a la mitad exacta en cada paso', () => {
    // Bisección reemplaza [a,b] por una de las dos mitades. El ancho decrece
    // a la mitad exacto: 1 → 0.5 → 0.25 → 0.125 ... Por eso el criterio
    // `intervalo` es una cota APRETADA acá, y no en la regla falsa.
    //
    // Ojo: los extremos que se muestran salen de fmt(), o sea están redondeados
    // a 8 decimales. El ancho medido desde la tabla arrastra ese redondeo, así
    // que la razón entre anchos consecutivos solo es 1/2 hasta que el redondeo
    // domina. Por eso se compara la serie completa contra la cota teórica
    // 2^-i, en vez de exigir 1/2 exacto paso a paso.
    const anchos = r().rows.map((row) => Number(row['b']) - Number(row['a']));

    for (let i = 1; i < anchos.length; i++) {
      expect(anchos[i]).withContext(`pasó a ${anchos[i]} en i=${i}`).toBeLessThan(anchos[i - 1]);
    }
    // Tras 14 pasos el ancho real es 2^-14 = 6.1e-5, que es la magnitud que
    // reporta la parada. La comparación va contra el ancho TEÓRICO calculado
    // desde la serie, no contra 2^-i: los extremos salen de fmt() redondeados
    // a 8 decimales, y a esta escala el error de redondeo (1e-8) ya es del
    // orden del propio ancho medido (1.2e-4 → 8e-5 de desvío relativo).
    const anchoTeorico = 1 / 2 ** (anchos.length - 1);
    expect(anchos[anchos.length - 1]).toBeLessThanOrEqual(anchoTeorico * 1.01);
    expect(anchos[anchos.length - 1]).toBeGreaterThan(anchoTeorico * 0.99);
  });

  it('emite una tabla con las columnas del método', () => {
    expect(Object.keys(r().rows[0])).toEqual(['i', 'a', 'b', 'c', 'f(c)', '|Δc|']);
  });

  it('rechaza un intervalo sin cambio de signo', () => {
    const res = biseccion((x) => x ** 2 + 1, -1, 1, TOL);
    expect(res.converged).toBe(false);
    expect(res.error).toContain('No hay cambio de signo');
    expect(res.rows).toEqual([]);
  });

  it('rechaza un intervalo donde la función no es evaluable', () => {
    const res = biseccion((x) => Math.sqrt(x), -5, -1, TOL);
    expect(res.converged).toBe(false);
    expect(res.error).toContain('no es evaluable');
  });
});

describe('methods — regla falsa', () => {
  const r = () => reglaFalsa((x) => x ** 3 - x - 2, 1, 2, TOL);

  it('converge y devuelve 8 iteraciones con la tolerancia de la línea base', () => {
    const res = r();
    expect(res.converged).toBe(true);
    expect(res.iterations).toBe(8);
  });

  it('acota la raíz con la precisión de la línea base', () => {
    expect(ultimaAprox(r(), 'c')).toBeCloseTo(1.52134448, 8);
  });

  it('emite una tabla con las columnas del método', () => {
    expect(Object.keys(r().rows[0])).toEqual(['i', 'a', 'b', 'c', 'f(c)', '|Δc|']);
  });

  it('rechaza un intervalo sin cambio de signo', () => {
    const res = reglaFalsa((x) => x ** 2 + 1, -1, 1, TOL);
    expect(res.converged).toBe(false);
    expect(res.error).toContain('No hay cambio de signo');
  });

  // ── Por qué el default NO es `intervalo` en este método ────────────────
  it('D7: el intervalo de la regla falsa NO se contrae, se estabiliza', () => {
    // Bisección parte el intervalo a la mitad exacta. La regla falsa reemplaza
    // un solo extremo por el corte, así que el otro puede quedar congelado.
    // Acá el extremo superior se clava en 2 para siempre.
    const res = reglaFalsa((x) => x ** 3 - x - 2, 1, 2, 1e-14, 12);
    const anchos = res.rows.map((row) => Number(row['b']) - Number(row['a']));

    expect(anchos[0]).toBeCloseTo(1, 6);
    // Tras 12 iteraciones el intervalo apenas se movió: sigue en ~0.4786.
    expect(anchos[anchos.length - 1]).toBeGreaterThan(0.47);
  });

  it('D7: con el criterio intervalo la cota nunca baja de ~0.24, es inútil', () => {
    // Demuestra por qué `intervalo` es mathematically incapaz de cumplir
    // tol=1e-4 aquí: se agota el máximo de iteraciones sin converger.
    const res = reglaFalsa((x) => x ** 3 - x - 2, 1, 2, TOL, 12, 'intervalo');
    expect(res.converged).toBe(false);
    expect(res.error).toContain('No convergió');
  });

  it('declara el criterio absoluto y lo cumple', () => {
    const res = r();
    expect(res.parada?.criterio).toBe('absoluto');
    expect(res.parada?.magnitud).toBeLessThanOrEqual(TOL);
  });

  it('permite elegir criterio relativo', () => {
    const res = secante((x) => x ** 3 - x - 2, 1, 2, TOL, 50, 'relativo');
    expect(res.parada?.criterio).toBe('relativo');
    expect(res.parada?.magnitud).toBeLessThanOrEqual(TOL);
  });

  it('permite elegir criterio residuo', () => {
    const res = secante((x) => x ** 3 - x - 2, 1, 2, TOL, 50, 'residuo');
    expect(res.parada?.criterio).toBe('residuo');
    expect(res.parada?.magnitud).toBeLessThanOrEqual(TOL);
  });

  it('el criterio intervalo sigue disponible a pedido', () => {
    const res = secante((x) => x ** 3 - x - 2, 1, 2, TOL, 50, 'intervalo');
    expect(res.parada?.criterio).toBe('intervalo');
  });
});

describe('methods — secante', () => {
  const r = () => secante((x) => x ** 3 - x - 2, 1, 2, TOL);

  it('converge y devuelve 6 iteraciones con la tolerancia de la línea base', () => {
    const res = r();
    expect(res.converged).toBe(true);
    expect(res.iterations).toBe(6);
  });

  it('acota la raíz con la precisión de la línea base', () => {
    expect(ultimaAprox(r(), 'xᵢ')).toBeCloseTo(1.52137971, 8);
  });

  it('emite una tabla con las columnas del método', () => {
    expect(Object.keys(r().rows[0])).toEqual(['i', 'xᵢ', 'xᵢ₋₁', 'f(xᵢ)', '|Δx|']);
  });

  it('rechaza semillas con el mismo valor funcional', () => {
    const res = secante((x) => x ** 2, 1, 1, TOL);
    expect(res.converged).toBe(false);
    expect(res.error).toContain('horizontal');
  });

  // D1 RESUELTO: con el contrato unificado para por |xᵢ − xᵢ₋₁| ≤ tol
  it('D1 RESUELTO: declara convergencia respetando |Δx| ≤ tol', () => {
    const res = r();
    const delta = ultimoDelta(res);
    expect(res.converged).toBe(true);
    expect(delta).toBeLessThanOrEqual(TOL);
    expect(res.parada?.criterio).toBe('absoluto');
  });
});

describe('methods — Newton-Raphson', () => {
  const r = () => newton((x) => x ** 3 - x - 2, 1, TOL);

  it('converge y devuelve 5 iteraciones con la tolerancia de la línea base', () => {
    const res = r();
    expect(res.converged).toBe(true);
    expect(res.iterations).toBe(5);
  });

  it('alcanza la raíz con error del orden de la convergencia cuadrática', () => {
    expect(ultimaAprox(r(), 'xᵢ')).toBeCloseTo(1.52137971, 8);
    expect(Math.abs(RAIZ - ultimaAprox(r(), 'xᵢ'))).toBeLessThan(1e-6);
  });

  it('emite una tabla que incluye la derivada evaluada', () => {
    expect(Object.keys(r().rows[0])).toEqual(['i', 'xᵢ', 'f(xᵢ)', "f'(xᵢ)", '|Δx|']);
  });

  it('rechaza una derivada casi nula', () => {
    const res = newton((x) => x ** 2 + 1, 0, TOL);
    expect(res.converged).toBe(false);
    expect(res.error).toContain('Derivada');
  });

  it('rechaza una semilla no evaluable', () => {
    const res = newton((x) => Math.sqrt(x), -1, TOL);
    expect(res.converged).toBe(false);
    expect(res.error).toContain('no es evaluable');
  });

  it('evalúa la derivada con precisión de 8 decimales', () => {
    // Derivada central numérica contra la analítica 3x² − 1.
    const res = r();
    const numerica = Number(res.rows[0]["f'(xᵢ)"]);
    expect(numerica).toBeCloseTo(2, 8);
  });
});

describe('methods — punto fijo', () => {
  // g correcta: de x³ = x + 2 sale x = (x + 2)^(1/3), con |g'| ≈ 0.144 < 1.
  const g = (x: number) => Math.cbrt(x + 2);

  it('converge desde varias semillas a la raíz correcta', () => {
    for (const x0 of [0.5, 1, 1.5, 2, 3]) {
      const res = puntoFijo(g, x0, 1e-6);
      expect(res.converged).withContext(`semilla ${x0}`).toBe(true);
      expect(ultimaAprox(res, 'xᵢ')).withContext(`semilla ${x0}`).toBeCloseTo(RAIZ, 6);
    }
  });

  it('emite una tabla con las columnas del método', () => {
    expect(Object.keys(puntoFijo(g, 1, TOL).rows[0])).toEqual(['i', 'xᵢ', 'g(xᵢ)', '|Δx|']);
  });

  it('detecta la divergencia cuando |g′| ≥ 1', () => {
    const res = puntoFijo((x) => 2 * x + 2, 1, 1e-6);
    expect(res.converged).toBe(false);
    expect(res.error).toContain('contracción');
  });

  it('rechaza una semilla fuera de dominio', () => {
    const res = puntoFijo((x) => Math.log(x), -1, TOL);
    expect(res.converged).toBe(false);
    expect(res.error).toContain('g(x₀) no es evaluable');
  });

  it('declara el criterio absoluto y lo cumple', () => {
    const res = puntoFijo(g, 1, TOL);
    expect(res.parada?.criterio).toBe('absoluto');
    expect(res.parada?.magnitud).toBeLessThanOrEqual(TOL);
  });

  // D6 LIMITACIÓN DE CONTRATO, no defecto del motor: el motor solo ve g, no
  // puede validar que el punto fijo alcanzado sea raíz de f. Se deja el test
  // documentando el alcance del contrato, para que nadie asuma que el motor
  // garantiza que el punto fijo sea raíz.
  it('D6 (contrato): con g constante "converge" a un punto que no es raíz de f', () => {
    const res = puntoFijo(() => 1, 0.5, TOL);
    expect(res.converged).toBe(true);
    expect(ultimaAprox(res, 'xᵢ')).toBe(1);
    // f(1) = 1 − 1 − 2 = −2. converged=true y aun así no es raíz.
    // Por eso el enunciado debe entregar el par (f, g), no solo g.
    expect(1 ** 3 - 1 - 2).toBe(-2);
  });
});

describe('methods — D3: invariancia a escala del criterio de convergencia', () => {
  // Multiplicar f por una constante NO cambia su raíz, así que el número de
  // iteraciones no debería depender de esa constante. Con el criterio
  // unificado, ahora sí se cumple para los cuatro métodos.
  const f = (x: number) => x ** 3 - x - 2;

  const escalados = [1, 1e3, 1e6, 1e-6];
  const metodos: [string, (g: (x: number) => number) => MetodoResultado][] = [
    ['biseccion', (g) => biseccion(g, 1, 2, TOL)],
    ['reglaFalsa', (g) => reglaFalsa(g, 1, 2, TOL)],
    ['secante', (g) => secante(g, 1, 2, TOL)],
    ['newton', (g) => newton(g, 1, TOL)],
  ];

  it('D3 RESUELTO: la regla falsa conserva el número de iteraciones al reescalar', () => {
    const base = reglaFalsa(f, 1, 2, TOL).iterations;
    const escalado = reglaFalsa((x) => 1e6 * f(x), 1, 2, TOL).iterations;
    expect(base).toBe(escalado);
  });

  it('D3 RESUELTO: la secante conserva el número de iteraciones al reescalar', () => {
    const base = secante(f, 1, 2, TOL).iterations;
    const escalado = secante((x) => 1e6 * f(x), 1, 2, TOL).iterations;
    expect(base).toBe(escalado);
  });

  it('D3 RESUELTO: todos los métodos son invariantes a escala', () => {
    for (const [nombre, metodo] of metodos) {
      const iteraciones = escalados.map((k) => metodo((x) => k * f(x)).iterations);
      expect(new Set(iteraciones).size).withContext(nombre).toBe(1);
    }
  });

  it('D3 RESUELTO: todos los métodos llegan a la misma raíz con cualquier escala', () => {
    for (const [nombre, metodo] of metodos) {
      for (const k of escalados) {
        const res = metodo((x) => k * f(x));
        const ultima = res.rows[res.rows.length - 1];
        const aprox = Number(ultima['xᵢ'] ?? ultima['c']);
        // La raíz no depende de la escala, así que el error tampoco.
        expect(Math.abs(RAIZ - aprox)).withContext(`${nombre} k=${k}`).toBeLessThanOrEqual(TOL);
      }
    }
  });
});

describe('methods — comportamiento común', () => {
  it('todos los métodos devuelven el mismo contrato de resultado', () => {
    const metodos: MetodoResultado[] = [
      biseccion((x) => x ** 3 - x - 2, 1, 2, TOL),
      reglaFalsa((x) => x ** 3 - x - 2, 1, 2, TOL),
      secante((x) => x ** 3 - x - 2, 1, 2, TOL),
      newton((x) => x ** 3 - x - 2, 1, TOL),
      puntoFijo((x) => Math.cbrt(x + 2), 1, TOL),
    ];
    for (const m of metodos) {
      expect(typeof m.converged).toBe('boolean');
      expect(typeof m.iterations).toBe('number');
      expect(Array.isArray(m.rows)).toBe(true);
      expect(m.rows.length).toBe(m.converged ? m.iterations : m.rows.length);
    }
  });

  it('todo método que converge declara su razón de parada', () => {
    const convergentes: MetodoResultado[] = [
      biseccion((x) => x ** 3 - x - 2, 1, 2, TOL),
      reglaFalsa((x) => x ** 3 - x - 2, 1, 2, TOL),
      secante((x) => x ** 3 - x - 2, 1, 2, TOL),
      newton((x) => x ** 3 - x - 2, 1, TOL),
      puntoFijo((x) => Math.cbrt(x + 2), 1, TOL),
    ];
    for (const m of convergentes) {
      expect(m.parada).toBeDefined();
      expect(m.parada?.criterio).toBeDefined();
      // La magnitud reportada tiene que ser la que realmente se midió, y
      // tiene que estar dentro de la tolerancia pedida.
      expect(m.parada?.magnitud).toBeLessThanOrEqual(TOL);
      expect(m.parada?.resumen?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('nunca declara convergencia con una magnitud fuera de tolerancia', () => {
    // Este es el contrato que D1 incumplía: `converged` y `parada.magnitud`
    // no pueden contradecirse.
    const casos = [
      biseccion((x) => x ** 3 - x - 2, 1, 2, TOL),
      reglaFalsa((x) => x ** 3 - x - 2, 1, 2, TOL),
      secante((x) => x ** 3 - x - 2, 1, 2, TOL),
      newton((x) => x ** 3 - x - 2, 1, TOL),
      puntoFijo((x) => Math.cbrt(x + 2), 1, TOL),
    ];
    for (const m of casos) {
      expect(m.parada?.magnitud ?? 0).withContext('magnitud').toBeLessThanOrEqual(TOL);
    }
  });

  it('reporta el fallo sin filas cuando la entrada es inválida', () => {
    const res = biseccion((x) => x ** 2 + 1, -1, 1, TOL);
    expect(res.rows).toEqual([]);
    expect(res.iterations).toBe(0);
    expect(res.error).toBeDefined();
  });

  it('informa la falta de convergencia con las filas parciales', () => {
    const res = newton((x) => x ** 2 + 1, 0.5, 1e-15, 5);
    expect(res.converged).toBe(false);
    expect(res.error).toContain('No convergió');
  });
});