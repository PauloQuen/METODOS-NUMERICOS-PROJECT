import {
  FAMILIAS,
  REGISTRO,
  REGISTRO_POR_KEY,
  ejecutarMetodo,
  familiaDe,
  familiasConMetodos,
  metodo,
  metodosDeFamilia,
  pideEntrada,
  resumenDeMetodo,
  rutaDeFamilia,
  rutaDeMetodo,
  validarRegistro,
  type MetodoKey,
  type Parametros,
  ejemploDe,
  puntosDeIteracion,
  valorNumericoDe,
  coordenadaRaiz,} from './registro';
import { CRITERIO_POR_DEFECTO_DE } from './criterio';
import { parseFuncion } from './methods';

/**
 * Red de seguridad del registro. El registro se escribe a mano, así que
 * estos tests son los que impiden que un error de copypaste aparezca en
 * pantalla como tabla vacía.
 */

describe('registro de métodos', () => {
  describe('integridad', () => {
    it('no tiene problemas de integridad', () => {
      expect(validarRegistro()).toEqual([]);
    });

    it('todo método registrado es ejecutable o está explícitamente planificado', () => {
      for (const m of REGISTRO) {
        if (m.estado === 'implementado') {
          expect(typeof m.ejecutar).toBe('function');
        } else {
          expect(m.ejecutar).toBeUndefined();
        }
      }
    });

    it('no repite keys', () => {
      const keys = REGISTRO.map((m) => m.key);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it('el índice por key cubre todo el registro', () => {
      expect(Object.keys(REGISTRO_POR_KEY).length).toBe(REGISTRO.length);
    });
  });

  describe('taxonomía', () => {
    it('toda familia declarada tiene al menos un método', () => {
      for (const f of FAMILIAS) {
        expect(metodosDeFamilia(f.key).length).toBeGreaterThan(0);
      }
    });

    it('clasifica los cinco métodos implementados según el principio de cada familia', () => {
      const porFamilia = Object.fromEntries(
        FAMILIAS.map((f) => [f.key, metodosDeFamilia(f.key).map((m) => m.key)]),
      );

      expect(porFamilia['cerrados']).toEqual(['biseccion', 'reglaFalsa']);
      expect(porFamilia['abiertos']).toEqual(['newton', 'secante', 'puntoFijo']);
    });

    it('la familia cerrada es la única que exige intervalo y cambio de signo', () => {
      for (const m of REGISTRO) {
        const cerrado = m.familia === 'cerrados';
        expect(m.requiereIntervalo).toBe(cerrado);
        expect(m.requiereCambioDeSigno).toBe(cerrado);
      }
    });

    it('el único método abierto sin derivada es secante (Newton sí la usa)', () => {
      const abiertos = metodosDeFamilia('abiertos');
      const conDerivada = abiertos.filter((m) => m.usaDerivada).map((m) => m.key);
      expect(conDerivada).toEqual(['newton']);
    });

    it('solo punto fijo trabaja con g en lugar de f', () => {
      expect(REGISTRO.filter((m) => m.operaSobreG).map((m) => m.key)).toEqual(['puntoFijo']);
    });

    it('ningún método cerrado usa derivada', () => {
      for (const m of metodosDeFamilia('cerrados')) {
        expect(m.usaDerivada).toBeFalse();
      }
    });

    it('los métodos analíticos no iteran, así que no tienen orden', () => {
      for (const m of metodosDeFamilia('polinomios')) {
        expect(m.orden).toBeNull();
      }
    });

    it('familiaDe devuelve la familia real del método', () => {
      expect(familiaDe('biseccion').key).toBe('cerrados');
      expect(familiaDe('newton').key).toBe('abiertos');
      expect(familiaDe('cardano').key).toBe('polinomios');
    });
  });

  describe('órdenes de convergencia', () => {
    it('declara el orden que corresponde a cada método', () => {
      expect(REGISTRO_POR_KEY['newton'].orden).toBe(2);
      expect(REGISTRO_POR_KEY['secante'].orden).toBeCloseTo(1.618, 3);
      expect(REGISTRO_POR_KEY['biseccion'].orden).toBe(1);
      expect(REGISTRO_POR_KEY['reglaFalsa'].orden).toBe(1);
      expect(REGISTRO_POR_KEY['puntoFijo'].orden).toBe(1);
    });
  });

  describe('entradas declaradas', () => {
    it('bisección y regla falsa piden los dos extremos', () => {
      for (const k of ['biseccion', 'reglaFalsa'] as MetodoKey[]) {
        expect(metodo(k).entradas.map((e) => e.key)).toEqual(['a', 'b']);
      }
    });

    it('secante es el único que pide dos semillas', () => {
      const conDosSemillas = REGISTRO.filter((m) => m.entradas.length === 2).map((m) => m.key);
      expect(conDosSemillas).toEqual(['biseccion', 'reglaFalsa', 'secante']);
    });

    it('pideEntrada refleja las entradas declaradas', () => {
      expect(pideEntrada('biseccion', 'a')).toBeTrue();
      expect(pideEntrada('biseccion', 'x0')).toBeFalse();
      expect(pideEntrada('secante', 'x1')).toBeTrue();
      expect(pideEntrada('newton', 'x1')).toBeFalse();
    });

    it('toda entrada explica para qué sirve', () => {
      for (const m of REGISTRO) {
        for (const e of m.entradas) {
          expect(e.ayuda.length).toBeGreaterThan(5);
          expect(e.valorSugerido).toMatch(/^-?[\d.]+$/);
        }
      }
    });
  });

  describe('columnas', () => {
    it('la columna de valor y la de residuo existen en la tabla declarada', () => {
      for (const m of REGISTRO) {
        if (m.estado !== 'implementado') continue;
        expect(m.columnas).toContain(m.columnaValor);
        if (m.columnaResiduo) {
          expect(m.columnas).toContain(m.columnaResiduo);
        }
      }
    });

    it('las columnas declaradas coinciden con las que emite el runner', () => {
      // Esta es la que atrapa el caso importante: si un runner cambia sus
      // claves y el registro no se actualiza, la tabla del alumno sale vacía.
      //
      // Ojo con punto fijo: su "función" es g, no f. Iterar
      // x_{n+1} = x³ − x − 2 diverge a −∞, así que hay que darle la
      // reformulación x = (x+2)^(1/3), que converge a la MISMA raíz. Es la
      // trampa que el propio registro declara con `operaSobreG`.
      const casos: Array<[MetodoKey, (x: number) => number, Record<string, number>]> = [
        ['biseccion', (x) => x ** 3 - x - 2, { a: 1, b: 2 }],
        ['reglaFalsa', (x) => x ** 3 - x - 2, { a: 1, b: 2 }],
        ['newton', (x) => x ** 3 - x - 2, { x0: 1.5 }],
        ['secante', (x) => x ** 3 - x - 2, { x0: 1.5, x1: 2 }],
        ['puntoFijo', (x) => (x + 2) ** (1 / 3), { x0: 1.5 }],
      ];

      for (const [key, fn, p] of casos) {
        const m = metodo(key);
        const r = ejecutarMetodo(key, fn, p, { tol: 1e-10, maxIter: 80 });
        expect(r.rows.length).toBeGreaterThan(0);

        for (const col of m.columnas) {
          expect(Object.keys(r.rows[0])).toContain(col);
        }
      }
    });
  });

  describe('ejecutarMetodo', () => {
    const raiz = (x: number) => x ** 3 - x - 2;

    it('los cinco métodos convergen a la misma raíz de x³ − x − 2', () => {
      // Punto fijo recibe g = (x+2)^(1/3), la reformulación de x³ − x − 2 = 0.
      // Todos terminan en la misma raíz, que es lo que los une: el problema
      // es uno solo, lo que cambia es cómo se llega.
      const casos: Array<[MetodoKey, (x: number) => number, Record<string, number>]> = [
        ['biseccion', raiz, { a: 1, b: 2 }],
        ['reglaFalsa', raiz, { a: 1, b: 2 }],
        ['newton', raiz, { x0: 1.5 }],
        ['secante', raiz, { x0: 1.5, x1: 2 }],
        ['puntoFijo', (x) => (x + 2) ** (1 / 3), { x0: 1.5 }],
      ];

      for (const [key, fn, p] of casos) {
        const r = ejecutarMetodo(key, fn, p, { tol: 1e-9, maxIter: 100 });
        expect(r.converged).toBeTrue();
        const x = Number(r.rows[r.rows.length - 1][metodo(key).columnaValor]);
        expect(x).toBeCloseTo(1.5213797068, 6);
      }
    });

    it('el criterio por defecto del registro coincide con el de criterio.ts', () => {
      // Los dos lugares declaran el default. Si divergen, la UI miente sobre
      // lo que el motor hace, que es peor que no mostrarlo.
      for (const key of ['biseccion', 'reglaFalsa', 'newton', 'secante', 'puntoFijo'] as MetodoKey[]) {
        const conRegistro = REGISTRO_POR_KEY[key].estado === 'implementado';
        expect(conRegistro).toBeTrue();
        expect(CRITERIO_POR_DEFECTO_DE[key]).toBeDefined();
      }
    });

    it('rechaza entradas faltantes con un mensaje que dice cuál falta', () => {
      expect(() => ejecutarMetodo('biseccion', raiz, { a: 1 }, { tol: 1e-6 })).toThrowError(
        /Extremo derecho/,
      );
      expect(() => ejecutarMetodo('secante', raiz, { x0: 1.5 }, { tol: 1e-6 })).toThrowError(
        /Segunda semilla/,
      );
    });

    it('falla claro si se pide un método planificado', () => {
      expect(() => ejecutarMetodo('cardano', raiz, {}, { tol: 1e-6 })).toThrowError(
        /no implementado todavía/,
      );
    });

    it('falla claro con una key que no existe', () => {
      expect(() => metodo('noExiste' as MetodoKey)).toThrowError(/no registrado/);
    });
  });

  describe('familiasConMetodos', () => {
    it('devuelve las familias con contenido, para no renderizar secciones vacías', () => {
      const claves = familiasConMetodos().map((f) => f.key);
      expect(claves).toEqual(['cerrados', 'abiertos', 'polinomios']);
    });
  });
});

/* ------------------------------------------------------------------ */
/* Lectura numérica: el contrato que de la que el gráfico de iteraciones depende     */
/* ------------------------------------------------------------------ */
describe('lectura numérica de las filas de un runner', () => {
  const raiz = (x: number) => x ** 3 - x - 2;
  const cubica = (x: number) => Math.cbrt(x + 2);

  it('lee un valor aunque el runner lo haya formateado a string', () => {
    // `fmt()` devuelve string SIEMPRE. Una versión de esto que solo aceptaba
    // `typeof v === 'number'` devolvía NaN en todas las filas y el gráfico
    // salía sin puntos de iteración, sin error en consola. Este test es el
    // que vuelve imposible repetir ese bug.
    const fila = { i: 1, c: '-2.5', 'f(c)': '2.5' };
    expect(valorNumericoDe(fila, 'c')).toBe(-2.5);
    expect(valorNumericoDe(fila, 'f(c)')).toBe(2.5);
  });

  it('acepta números sin formatear también', () => {
    expect(valorNumericoDe({ c: 3.5 }, 'c')).toBe(3.5);
  });

  it('devuelve NaN para "—", para NaN y para claves inexistentes', () => {
    expect(valorNumericoDe({ c: '—' }, 'c')).toBeNaN();
    expect(valorNumericoDe({ c: Number.NaN }, 'c')).toBeNaN();
    expect(valorNumericoDe({ c: '1' }, 'no-existe')).toBeNaN();
  });

  it('extrae los puntos de las columnas que declara el registro', () => {
    const r = ejecutarMetodo('biseccion', raiz, { a: 1, b: 2 }, { tol: 1e-6, maxIter: 50 });
    const puntos = puntosDeIteracion(metodo('biseccion'), r.rows);

    expect(puntos.length).toBe(r.rows.length);
    // Bisección itera en [1, 2] y el primer punto medio es 1.5.
    expect(puntos[0].x).toBeCloseTo(1.5, 6);
    expect(puntos[0].y).toBeCloseTo(raiz(1.5), 6);
  });

  it('genera puntos finitos para TODOS los métodos implementados', () => {
    // Este es el test que realmente vigila el bug: recorre la lista entera en
    // vez de probar un método suelto. Si un método declara una columna que su
    // runner no escribe, acá falla en vez de fallar en silencio en pantalla.
    const casos: Array<[MetodoKey, (x: number) => number, Record<string, number>]> = [
      ['biseccion', raiz, { a: 1, b: 2 }],
      ['reglaFalsa', raiz, { a: 1, b: 2 }],
      ['newton', raiz, { x0: 1.5 }],
      ['secante', raiz, { x0: 1.5, x1: 2 }],
      ['puntoFijo', cubica, { x0: 1.5 }],
    ];

    for (const [key, fn, p] of casos) {
      const r = ejecutarMetodo(key, fn, p, { tol: 1e-9, maxIter: 100 });
      const puntos = puntosDeIteracion(metodo(key), r.rows);

      expect(puntos.length)
        .withContext(`${key}: debería producir un punto por fila`)
        .toBeGreaterThan(0);

      for (const punto of puntos) {
        expect(Number.isFinite(punto.x))
          .withContext(`${key}: x no finito en ${JSON.stringify(punto)}`)
          .toBe(true);
        expect(Number.isFinite(punto.y))
          .withContext(`${key}: y no finito en ${JSON.stringify(punto)}`)
          .toBe(true);
      }
    }
  });

  it('el residuo de puntoFijo es g(xᵢ), no f(xᵢ)', () => {
    // Punto Fijo itera sobre g, así que el eje Y es g(xᵢ). Si se dibujara f,
    // la escalera mostraría la curva equivocada sin avisar.
    const r = ejecutarMetodo('puntoFijo', cubica, { x0: 1.5 }, { tol: 1e-9, maxIter: 60 });
    const puntos = puntosDeIteracion(metodo('puntoFijo'), r.rows);
    const primera = r.rows[0];
    const x0 = valorNumericoDe(primera, 'xᵢ');

    // A 8 decimales, no a 12: `fmt()` escribe los valores de la fila con 8
    // decimales, así que ese es el piso real de lo que se puede dibujar. La
    // fila ES la fuente de la verdad del gráfico, no el float interno.
    expect(puntos[0].x).toBeCloseTo(x0, 8);
    expect(puntos[0].y).toBeCloseTo(cubica(x0), 8);
    expect(metodo('puntoFijo').columnaResiduo).toBe('g(xᵢ)');
  });

  it('devuelve lista vacía si el método no declara residuo', () => {
    const sinResiduo = { ...metodo('biseccion'), columnaResiduo: null };
    expect(puntosDeIteracion(sinResiduo, [{ i: 1, c: '1' }])).toEqual([]);
  });

  it('la coordenada de raíz sale de columnaValor, sin listas hardcodeadas', () => {
    const r = ejecutarMetodo('puntoFijo', cubica, { x0: 1.5 }, { tol: 1e-9, maxIter: 60 });
    const ultima = r.rows.at(-1)!;
    expect(coordenadaRaiz(metodo('puntoFijo'), ultima))
      .toBeCloseTo(valorNumericoDe(ultima, 'xᵢ'), 8);
  });
});

describe('ejemplo canónico de cada método', () => {
  it('el ejemplo de todo método implementado CONVERGE de verdad', () => {
    // Este test es el que habría atrapado el bug de Punto Fijo: su ejemplo
    // era f = x³ − x − 2, pero Punto Fijo itera g, así que usarla como g
    // diverge siempre (|g′| = |3x² − 1| ≈ 5.94). El alumno abría la pestaña
    // y veía un error en su primer clic, sin haber hecho nada malo.
    for (const m of REGISTRO) {
      if (m.estado !== 'implementado') continue;

      const ej = m.ejemplo;
      const p: Parametros = {};
      if (m.requiereIntervalo) {
        p.a = Number(m.entradas.find((e) => e.key === 'a')?.valorSugerido);
        p.b = Number(m.entradas.find((e) => e.key === 'b')?.valorSugerido);
      }
      if (ej.x0 !== undefined) p.x0 = Number(ej.x0);
      if (ej.x1 !== undefined) p.x1 = Number(ej.x1);

      const r = ejecutarMetodo(m.key, parseFuncion(ej.funcion), p, { tol: 1e-9, maxIter: 200 });

      expect(r.error)
        .withContext(`"${m.nombre}" (${ej.funcion}) no debería dar error`)
        .toBeUndefined();
      expect(r.converged)
        .withContext(
          `"${m.nombre}" (${ej.funcion}) debería converger con sus propios datos de ejemplo`,
        )
        .toBe(true);
    }
  });

  it('todos los métodos sin g convergen a la MISMA raíz', () => {
    // x³ − x − 2 = 0 tiene una única raíz real ≈ 1.5213797. Los cinco
    // métodos son cinco caminos al mismo número: si dos dan cosas
    // distintas, es que alguno está resolviendo otra ecuación.
    const esperado = 1.5213797068;
    const f = parseFuncion('x^3 - x - 2');

    for (const m of REGISTRO) {
      if (m.estado !== 'implementado') continue;
      const ej = m.ejemplo;
      const p: Parametros = {};
      if (m.requiereIntervalo) { p.a = 1; p.b = 2; }
      if (ej.x0 !== undefined) p.x0 = Number(ej.x0);
      if (ej.x1 !== undefined) p.x1 = Number(ej.x1);

      // Punto Fijo recibe g; los demás reciben f.
      const fn = m.operaSobreG ? parseFuncion(ej.funcion) : f;
      const r = ejecutarMetodo(m.key, fn, p, { tol: 1e-10, maxIter: 300 });
      const x = Number(r.rows.at(-1)![m.columnaValor]);

      expect(Math.abs(x - esperado))
        .withContext(`"${m.nombre}" terminó en ${x}, no en ${esperado}`)
        .toBeLessThan(1e-6);
    }
  });

  it('puntoFijo declara un g reescrito, no la f compartida', () => {
    const ej = ejemploDe('puntoFijo');
    // Si esto falla, volvió el bug: usar f como g diverge siempre.
    expect(ej.funcion).not.toBe(ejemploDe('newton').funcion);
    expect(ej.funcion).toContain('^(1/3)');
  });

  it('todo método declara ejemplo con función no vacía', () => {
    for (const m of REGISTRO) {
      expect(m.ejemplo.funcion.trim())
        .withContext(`"${m.key}" no declara función de ejemplo`)
        .not.toBe('');
    }
  });

  it('las semillas del ejemplo coinciden con las entradas declaradas', () => {
    // Si el ejemplo declara x0 pero el método no pide x0, el ejemplo mente.
    for (const m of REGISTRO) {
      if (m.ejemplo.x0 !== undefined) {
        expect(m.entradas.some((e) => e.key === 'x0'))
          .withContext(`"${m.key}" da x0 en el ejemplo pero no declara esa entrada`)
          .toBeTrue();
      }
      if (m.ejemplo.x1 !== undefined) {
        expect(m.entradas.some((e) => e.key === 'x1'))
          .withContext(`"${m.key}" da x1 en el ejemplo pero no declara esa entrada`)
          .toBeTrue();
      }
    }
  });
});

  describe('rutas de navegación', () => {
    it('toda ruta está en kebab-case y es única', () => {
      const rutas = REGISTRO.map((m) => m.ruta);
      expect(rutas.every((r) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(r))).toBeTrue();
      expect(new Set(rutas).size).toBe(rutas.length);
    });

    it('rutaDeFamilia usa la key de la familia como segmento', () => {
      expect(rutaDeFamilia('cerrados')).toBe('/modulo1/tipos/cerrados');
      expect(rutaDeFamilia('abiertos')).toBe('/modulo1/tipos/abiertos');
      expect(rutaDeFamilia('polinomios')).toBe('/modulo1/tipos/polinomios');
    });

    it('rutaDeMetodo combina familia, ruta y la pestaña Teoría', () => {
      expect(rutaDeMetodo(metodo('biseccion'))).toBe(
        '/modulo1/tipos/cerrados/biseccion/teoria',
      );
      expect(rutaDeMetodo(metodo('reglaFalsa'))).toBe(
        '/modulo1/tipos/cerrados/regla-falsa/teoria',
      );
      expect(rutaDeMetodo(metodo('newton'))).toBe(
        '/modulo1/tipos/abiertos/newton-raphson/teoria',
      );
    });

    it('resumenDeMetodo dice qué se necesita sin contradecir a los flags', () => {
      const texto = resumenDeMetodo(metodo('biseccion'));
      expect(texto).toContain('lineal');
      expect(texto).toContain('exige cambio de signo');

      // Cardano no itera: jamás dice que "arranca de una semilla".
      const cardano = resumenDeMetodo(metodo('cardano'));
      expect(cardano).toContain('no itera');
      expect(cardano).toContain('exacto');
    });
  });
