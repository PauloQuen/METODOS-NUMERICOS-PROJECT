import katex from 'katex';
import { eulerExplicito } from '../tipos/edo-clasicos/euler/euler.algoritmo';
import {
  EJEMPLOS_EULER,
  EJERCICIOS_EULER,
  TEORIA_EULER,
} from '../tipos/edo-clasicos/euler/euler.contenido';
import { rungeKutta4 } from '../tipos/edo-clasicos/rk4/rk4.algoritmo';
import {
  EJEMPLOS_RK4,
  EJERCICIOS_RK4,
  TEORIA_RK4,
} from '../tipos/edo-clasicos/rk4/rk4.contenido';
import type { DatosModulo5, EjemploModulo5 } from '../modelos/modulo5.model';
import { compilarExacta, compilarF } from './edo';

/**
 * Red de seguridad del CONTENIDO del Módulo 5.
 *
 * Los números escritos a mano en los ejemplos son la parte más frágil: se
 * copiaron valores exactos por aproximados y se invirtió la dirección de un
 * error. Acá cada cálculo se vuelve a ejecutar con el motor correspondiente,
 * y todo el TeX se pasa por KaTeX antes de publicarse.
 */

type Resultado = ReturnType<typeof eulerExplicito> | ReturnType<typeof rungeKutta4>;

const TOLERANCIA = 1e-6;

const FUENTES: [string, unknown][] = [
  ['Euler/teoria', TEORIA_EULER],
  ...EJEMPLOS_EULER.map((e) => [`Euler/ejemplo/${e.id}`, e] as [string, unknown]),
  ...EJERCICIOS_EULER.map((e) => [`Euler/ejercicio/${e.id}`, e] as [string, unknown]),
  ['RK4/teoria', TEORIA_RK4],
  ...EJEMPLOS_RK4.map((e) => [`RK4/ejemplo/${e.id}`, e] as [string, unknown]),
  ...EJERCICIOS_RK4.map((e) => [`RK4/ejercicio/${e.id}`, e] as [string, unknown]),
];

function correr(datos: DatosModulo5, metodo: 'euler' | 'rk4'): Resultado {
  const { f, error } = compilarF(datos.funcion);
  if (!f) throw new Error(`f no compila en ${datos.funcion}: ${error}`);
  const exacta = compilarExacta(datos.exacta);
  const comunes = {
    f,
    t0: datos.t0,
    y0: datos.y0,
    h: datos.h,
    tFin: datos.tFin,
    exacta,
  };
  return metodo === 'euler' ? eulerExplicito(comunes) : rungeKutta4(comunes);
}

const teoriaEuler = TEORIA_EULER;
const teoriaRk4 = TEORIA_RK4;
const ejemplos: [string, EjemploModulo5, 'euler' | 'rk4'][] = [
  ['eu-num-1', TEORIA_EULER.ejemploNormal, 'euler'],
  ['eu-cas-1', TEORIA_EULER.ejemploCasuistica, 'euler'],
  ...EJEMPLOS_EULER.map((e) => [e.id, e, 'euler'] as [string, EjemploModulo5, 'euler']),
  ...EJERCICIOS_EULER.map((e) => [e.id, e, 'euler'] as [string, EjemploModulo5, 'euler']),
  ['rk-num-1', TEORIA_RK4.ejemploNormal, 'rk4'],
  ['rk-cas-1', TEORIA_RK4.ejemploCasuistica, 'rk4'],
  ...EJEMPLOS_RK4.map((e) => [e.id, e, 'rk4'] as [string, EjemploModulo5, 'rk4']),
  ...EJERCICIOS_RK4.map((e) => [e.id, e, 'rk4'] as [string, EjemploModulo5, 'rk4']),
];

/** Valores de control, recalculados con los motores antes de escribirlos acá. */
const VALORES: Record<string, number> = {
  'eu-num-1': 2.5937424601,
  'eu-cas-1': 0.011529215046068488,
  'eu-num-2': 3.1874849202,
  'eu-cas-2': 0.07776,
  'eu-ej-1': 1.1,
  'eu-ej-2': 2.48832,
  'eu-ej-3': 5.0625,
  'eu-ej-4': 2.44140625,
  'eu-ej-5': 1.1,
  'eu-ej-6': 0.6328125,
  'rk-num-1': 2.718279744135166,
  'rk-cas-1': 0.018337497017779945,
  'rk-num-2': 3.43650227321187,
  'rk-cas-2': 2.718251137,
  'rk-ej-1': 1.1051708333333334,
  'rk-ej-2': 2.718279744135166,
  'rk-ej-3': 1.2428,
  'rk-ej-4': 0.0001727278847265976,
  'rk-ej-5': 1.1051708333333334,
  'rk-ej-6': 0.735788399,
};

describe('contenido del Módulo 5', () => {
  it('recalcula los 20 ejemplos y ejercicios sin errores de cálculo', () => {
    expect(ejemplos).toHaveSize(20);
    for (const [id, ejemplo, metodo] of ejemplos) {
      const r = correr(ejemplo.calculo, metodo);
      expectwithId(id, r.mensaje).toBeUndefined();
      expect(Number.isFinite(r.yFinal)).withContext(id).toBeTrue();
    }
  });

  it('cada valor final coincide con el recalculado por el motor', () => {
    for (const [id, ejemplo, metodo] of ejemplos) {
      const r = correr(ejemplo.calculo, metodo);
      const diferencia = Math.abs(r.yFinal - VALORES[id]);
      expect(diferencia)
        .withContext(id)
        .toBeLessThan(TOLERANCIA * Math.max(1, Math.abs(VALORES[id])));
    }
  });

  it('las 6 autoevaluaciones por método tienen cuestionario con una respuesta correcta', () => {
    for (const ejercicios of [EJERCICIOS_EULER, EJERCICIOS_RK4]) {
      expect(ejercicios).toHaveSize(6);
      for (const e of ejercicios) {
        expect(e.cuestionario?.length).toBeGreaterThan(0);
        for (const pregunta of e.cuestionario!) {
          expect(pregunta.opciones.map((o) => o.id)).toContain(pregunta.correcta);
        }
      }
    }
  });

  it('corrige la dirección del error en el enfriamiento de Euler', () => {
    const caso = teoriaEuler.ejemploCasuistica;
    const r = correr(caso.calculo, 'euler') as ReturnType<typeof eulerExplicito>;
    expect(r.yFinal!).toBeLessThan(r.exactaFinal!);
    expect(caso.interpretacion).toContain('subestima');
  });

  it('registra los primeros pasos de RK4 que antes copiaban el valor exacto', () => {
    const cas = teoriaRk4.ejemploCasuistica;
    expect(cas.formulaTex).toContain('0.6704');
    expect(cas.pasos.join(' ')).toContain('= 0.6704$');

    const tpy = EJEMPLOS_RK4.find((e) => e.id === 'rk-num-2')!;
    expect(tpy.formula).toContain('1.2428');
    expect(tpy.pasos.join(' ')).toContain('= 1.2428$');
    expect(tpy.pasos.join(' ')).not.toContain('1.221333');

    const drenaje = EJERCICIOS_RK4.find((e) => e.id === 'rk-ej-6')!;
    expect(drenaje.pasos.join(' ')).toContain('-0.77734375');
    expect(drenaje.pasos.join(' ')).toContain('1.557617188');
  });

  it('usa el valor correcto como base de los porcentajes en Euler', () => {
    const ej5 = EJERCICIOS_EULER.find((e) => e.id === 'eu-ej-5')!;
    expect(ej5.pasos.join(' ')).toContain('9.09');
    const ej6 = EJERCICIOS_EULER.find((e) => e.id === 'eu-ej-6')!;
    expect(ej6.pasos.join(' ')).toContain('13.99');
  });

  it('renderiza con KaTeX todas las fórmulas y los tramos entre $', () => {
    const errores: string[] = [];
    const textos = FUENTES.flatMap(([id, fuente]) => textosDe(fuente, id));
    expect(textos.length).toBeGreaterThan(100);
    for (const [id, texto] of textos) {
      for (const [tex, display] of extraerFormulas(texto)) {
        try {
          katex.renderToString(tex, { displayMode: display, throwOnError: true, strict: 'ignore', trust: false });
        } catch (error) {
          errores.push(`${id}: ${tex} → ${(error as Error).message}`);
        }
      }
    }
    expect(errores).toEqual([]);
  });

  it('toda fórmula Unicode tiene su equivalente TeX y lo renderiza KaTeX', () => {
    const pares = FUENTES.flatMap(([id, fuente]) => formulasTex(fuente, id));
    expect(pares.length).toBe(10);
    for (const [id, tex] of pares) {
      expect(() =>
        katex.renderToString(tex, { displayMode: true, throwOnError: true, strict: 'ignore', trust: false }),
      ).withContext(id).not.toThrow();
    }
  });

  it('el evaluador respeta y en expresiones con dos variables', () => {
    const f = compilarF('-2*y');
    expect(f.f!(0, 1)).toBeCloseTo(-2, 12);
    expect(f.f!(0, 3)).toBeCloseTo(-6, 12);
    const g = compilarF('t + y');
    expect(g.f!(0.1, 1.1)).toBeCloseTo(1.2, 12);
  });

  it('no deja matemática Unicode sin delimitar en los textos renderizados', () => {
    const sinDelimitar: string[] = [];
    const unicodeMath = /[₁₂₃₄₅ₙ₊ᵗ′λ≤≥≈⁴⁵]/;
    for (const [id, texto] of FUENTES.flatMap(([id, fuente]) => textosDe(fuente, id))) {
      const prosa = texto.replace(/\$\$[\s\S]*?\$\$/g, '').replace(/\$[^$]*\$/g, '');
      if (unicodeMath.test(prosa)) sinDelimitar.push(`${id}: ${prosa.slice(0, 100)}`);
    }
    expect(sinDelimitar).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/* Auxiliares                                                          */
/* ------------------------------------------------------------------ */

function expectwithId(id: string, valor: unknown): jasmine.Matchers<unknown> {
  return expect(valor).withContext(id);
}

/** Recorre todos los strings renderizados por app-math-texto / app-math. */
function textosDe(fuente: unknown, nombre: string): [string, string][] {
  const resultado: [string, string][] = [];
  const omitir = new Set([
    'id',
    'titulo',
    'tipo',
    'url',
    'videoUrl',
    'descripcion',
    'etiqueta',
    'funcion',
    'formula', // va directo a app-math como TeX; su par es `formulaTex`
    'exacta',
    'nombre',
    'correcta',
    'key',
    'valorInicial',
  ]);
  const recorrer = (valor: unknown, ruta: string): void => {
    if (typeof valor === 'string') {
      if (!omitir.has(ruta.split('.').at(-1)!)) resultado.push([`${nombre}/${ruta}`, valor]);
      return;
    }
    if (Array.isArray(valor)) {
      valor.forEach((v, i) => recorrer(v, `${ruta}[${i}]`));
      return;
    }
    if (valor && typeof valor === 'object') {
      for (const [clave, v] of Object.entries(valor)) recorrer(v, `${ruta}.${clave}`);
    }
  };
  recorrer(fuente, nombre);
  return resultado;
}

/** Busca los pares `formula` / `formulaTex` de theory y ejemplos. */
function formulasTex(fuente: unknown, nombre: string): [string, string][] {
  const resultado: [string, string][] = [];
  const recorrer = (valor: unknown, ruta: string): void => {
    if (Array.isArray(valor)) {
      valor.forEach((v, i) => recorrer(v, `${ruta}[${i}]`));
      return;
    }
    if (valor && typeof valor === 'object') {
      const obj = valor as Record<string, unknown>;
      if (typeof obj['formula'] === 'string') {
        expect(typeof obj['formulaTex']).withContext(`${nombre}/${ruta}`).toBe('string');
        resultado.push([`${nombre}/${ruta}`, obj['formulaTex'] as string]);
      }
      for (const [clave, v] of Object.entries(obj)) recorrer(v, `${ruta}.${clave}`);
    }
  };
  recorrer(fuente, nombre);
  return resultado;
}

function extraerFormulas(texto: string): [string, boolean][] {
  const formulas: [string, boolean][] = [];
  const patron = /\$\$([\s\S]*?)\$\$|\$([^$]+)\$/g;
  let coincidencia: RegExpExecArray | null;
  while ((coincidencia = patron.exec(texto)) !== null) {
    formulas.push([(coincidencia[1] ?? coincidencia[2]).trim(), Boolean(coincidencia[1])]);
  }
  return formulas;
}
