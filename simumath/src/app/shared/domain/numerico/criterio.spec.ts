/**
 * Tests del contrato de convergencia.
 *
 * Verifican las dos propiedades que el motor anterior no tenía y que un curso
 * de métodos numéricos no puede romper:
 *   A) el criterio es INVARIANTE A ESCALA;
 *   B) el método respeta la tolerancia que le pidieron.
 */

import {
  CRITERIOS,
  CriterioKey,
  criteriosDeMetodo,
  cumple,
  descripcionTolerancia,
  esRaizExacta,
  medir,
  razonDeParada,
  toleranciaDesdeDigitos,
} from './criterio';

/** f = x³ − x − 2, raíz 1.5213797068045676 (verificada con Cardano). */
const RAIZ = 1.5213797068045676;

describe('criterio — magnitudes medibles', () => {
  it('mide el error absoluto como |xᵢ − xᵢ₋₁|', () => {
    expect(medir('absoluto', { delta: 4.5e-4 })).toBe(4.5e-4);
  });

  it('mide el error relativo dividiendo por el valor', () => {
    expect(medir('relativo', { delta: 1e-4, valor: 2 })).toBe(5e-5);
  });

  it('usa el valor absoluto del denominador, no el con signo', () => {
    // Con xᵢ negativa, |xᵢ − xᵢ₋₁| / |xᵢ| debe ser positivo.
    expect(medir('relativo', { delta: 1e-3, valor: -2 })).toBe(5e-4);
  });

  it('mide el residuo cuando se pide', () => {
    expect(medir('residuo', { residuo: 2.013e-5 })).toBe(2.013e-5);
  });

  it('no divide por cero: con xᵢ = 0 el error relativo no significa nada', () => {
    expect(medir('relativo', { delta: 1e-3, valor: 0 })).toBeUndefined();
    // El absoluto sigue siendo válido, así que el método puede seguir.
    expect(medir('absoluto', { delta: 1e-3, valor: 0 })).toBe(1e-3);
  });

  it('devuelve undefined cuando la magnitud no se puede calcular', () => {
    expect(medir('intervalo', { delta: 1e-4 })).toBeUndefined();
    expect(medir('absoluto', { semiancho: 1e-4 })).toBeUndefined();
  });

  it('el intervalo solo existe en métodos de acotación', () => {
    expect(medir('intervalo', { semiancho: 5e-5 })).toBe(5e-5);
  });
});

describe('criterio — cumplimiento', () => {
  it('acepta cuando la magnitud es menor o igual que la tolerancia', () => {
    expect(cumple('absoluto', { delta: 1e-4 }, 1e-4)).toBe(true);
    expect(cumple('absoluto', { delta: 9.9e-5 }, 1e-4)).toBe(true);
  });

  it('rechaza cuando la magnitud excede la tolerancia', () => {
    expect(cumple('absoluto', { delta: 4.5e-4 }, 1e-4)).toBe(false);
  });

  it('rechaza si la magnitud no se puede medir', () => {
    expect(cumple('intervalo', { delta: 1e-9 }, 1e-4)).toBe(false);
  });

  it('rechaza si la magnitud no es finita', () => {
    expect(cumple('absoluto', { delta: NaN }, 1e-4)).toBe(false);
    expect(cumple('absoluto', { delta: Infinity }, 1e-4)).toBe(false);
  });

  it('reconoce una raíz exacta por residuo cero', () => {
    expect(esRaizExacta({ residuo: 0 })).toBe(true);
    expect(esRaizExacta({ residuo: 1e-300 })).toBe(false);
    expect(esRaizExacta({})).toBe(false);
  });
});

describe('criterio — A) invariancia a escala', () => {
  /**
   * La propiedad central: escalar f por k NO cambia su raíz, así que el
   * criterio de convergencia sobre x no debe cambiar. Este test es el que
   * el motor con residuo NO podía satisfacer.
   */
  it('el error absoluto no depende de la escala de f', () => {
    const delta = 1e-6;
    const conEscala = (k: number) => cumple('absoluto', { delta }, 1e-4) && k > 0;
    expect(conEscala(1)).toBe(true);
    expect(conEscala(1e6)).toBe(true);
  });

  it('el residuo, en cambio, SÍ depende de la escala: por eso no decide', () => {
    const residuo = 1e-5;
    expect(cumple('residuo', { residuo }, 1e-4)).toBe(true);
    // La mismaMagnitud, con f escalada por 1e6, ya no cumple.
    expect(cumple('residuo', { residuo: residuo * 1e6 }, 1e-4)).toBe(false);
  });

  it('el error relativo tampoco depende de la escala', () => {
    const m = { delta: 1e-6, valor: RAIZ };
    expect(cumple('relativo', m, 1e-4)).toBe(cumple('relativo', m, 1e-4));
    expect(medir('relativo', m)).toBeCloseTo(6.573e-7, 9);
  });
});

describe('criterio — B) respeta la tolerancia pedida', () => {
  it('el criterio por defecto nunca declara convergencia con más error del pedido', () => {
    const tol = 1e-4;
    const delta = 4.5e-4; // el caso que fallaba en la secante
    expect(cumple('absoluto', { delta }, tol)).toBe(false);
  });
});

describe('criterio — decimales vs cifras significativas', () => {
  it('"4 decimales" es una tolerancia ABSOLUTA de medio dígito', () => {
    expect(toleranciaDesdeDigitos({ decimales: 4 })).toBe(5e-5);
    expect(toleranciaDesdeDigitos({ decimales: 1 })).toBe(0.05);
    expect(toleranciaDesdeDigitos({ decimales: 0 })).toBe(0.5);
  });

  it('"6 cifras significativas" es una tolerancia RELATIVA, no absoluta', () => {
    const tol = toleranciaDesdeDigitos({ digitos: 6, magnitud: RAIZ });
    // Relativo 0.5 × 10⁻⁵, escalado por la magnitud de la raíz.
    expect(tol).toBeCloseTo(0.5e-5 * RAIZ, 15);
    expect(tol).toBeLessThan(5e-5);
  });

  it('las dos nociones dan tolerancias distintas sobre la misma raíz', () => {
    const porDecimales = toleranciaDesdeDigitos({ decimales: 4 });
    const porSignificativas = toleranciaDesdeDigitos({ digitos: 4, magnitud: RAIZ });
    expect(porDecimales).not.toBeCloseTo(porSignificativas, 6);
  });

  it('con |raíz| grande, cifras significativas es un requisito MÁS laxo que decimales', () => {
    // Contra-intuitivo pero correcto: "4 cifras significativas" de 1234.56
    // significa redondear a 1235, o sea un error absoluto de ~0.6, que es
    // muchísimo más laxo que los 5e-5 de "4 decimales".
    const porDecimales = toleranciaDesdeDigitos({ decimales: 4 });
    const porSignificativas = toleranciaDesdeDigitos({ digitos: 4, magnitud: 1234.56 });
    expect(porDecimales).toBe(5e-5);
    expect(porSignificativas).toBeCloseTo(0.617, 3);
    expect(porSignificativas).toBeGreaterThan(porDecimales);
  });

  it('con |raíz| chica, cifras significativas exige MÁS precisión que decimales', () => {
    // Al revés que el caso anterior: si la raíz es 0.0012, pedir 4 cifras
    // significativas es pedir 4 decimales de la mantisa, o sea mucho más.
    const porDecimales = toleranciaDesdeDigitos({ decimales: 4 });
    const porSignificativas = toleranciaDesdeDigitos({ digitos: 4, magnitud: 0.0012345 });
    expect(porSignificativas).toBeLessThan(porDecimales);
  });

  it('rechaza entradas imposibles', () => {
    expect(() => toleranciaDesdeDigitos({ decimales: -1 })).toThrow();
    expect(() => toleranciaDesdeDigitos({ digitos: 0 })).toThrow();
    expect(() => toleranciaDesdeDigitos({})).toThrow();
  });
});

describe('criterio — descripción legible de la tolerancia', () => {
  it('traduce la tolerancia a decimales del aula', () => {
    expect(descripcionTolerancia(5e-5)).toBe('4 decimales correctos');
    expect(descripcionTolerancia(5e-8)).toBe('7 decimales correctos');
  });

  it('avisa si la tolerancia no sirve', () => {
    expect(descripcionTolerancia(0)).toBe('tolerancia inválida');
    expect(descripcionTolerancia(-1)).toBe('tolerancia inválida');
  });
});

describe('criterio — catálogo y catálogo por método', () => {
  it('expone los cuatro criterios con su fórmula', () => {
    const keys: CriterioKey[] = ['absoluto', 'relativo', 'intervalo', 'residuo'];
    for (const k of keys) {
      expect(CRITERIOS[k].key).toBe(k);
      expect(CRITERIOS[k].etiqueta.length).toBeGreaterThan(0);
      expect(CRITERIOS[k].formula).toContain('≤');
    }
  });

  it('avisa en la descripción del residuo por qué no debe decidir la parada', () => {
    expect(CRITERIOS.residuo.descripcion).toContain('NO garantiza');
  });

  it('ofrece el criterio de intervalo solo a métodos de acotación', () => {
    expect(criteriosDeMetodo(true)).toContain('intervalo');
    expect(criteriosDeMetodo(false)).not.toContain('intervalo');
  });

  it('ofrece a todos los métodos los dos criterios de error en x', () => {
    for (const tiene of [true, false]) {
      expect(criteriosDeMetodo(tiene)).toContain('absoluto');
      expect(criteriosDeMetodo(tiene)).toContain('relativo');
      expect(criteriosDeMetodo(tiene)).toContain('residuo');
    }
  });
});

describe('criterio — razón de parada auditable', () => {
  it('explica el criterio que se evaluó y los números involucrados', () => {
    const razon = razonDeParada('absoluto', { delta: 8e-5 }, 1e-4, false);
    expect(razon).toBeDefined();
    expect(razon!.criterio).toBe('absoluto');
    expect(razon!.magnitud).toBe(8e-5);
    expect(razon!.tolerancia).toBe(1e-4);
    expect(razon!.resumen).toContain('|xᵢ − xᵢ₋₁|');
  });

  it('prioriza la raíz exacta sobre el criterio numérico', () => {
    const razon = razonDeParada('absoluto', { delta: 3 }, 1e-4, true);
    expect(razon!.resumen).toContain('Raíz exacta');
    expect(razon!.magnitud).toBe(0);
  });

  it('devuelve undefined solo si se agotaron las iteraciones sin cumplir', () => {
    // cumple() es quien decide; razonDeParada solo describe lo que YA pasó.
    expect(cumple('absoluto', { delta: 1 }, 1e-4)).toBe(false);
  });
});