import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { IterativoService } from './iterativo.service';
import { METODO_ITERATIVO } from './iterativo.config';

for (const metodo of ['jacobi', 'gauss-seidel'] as const) describe('Calculadora de ' + metodo, () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), IterativoService, { provide: METODO_ITERATIVO, useValue: metodo }] }));
  const entrada = { matriz: '4 1\n2 3', ladoDerecho: '6 8', x0: '', tol: '0.000000001', maxIter: '200' };

  it('acepta filas, comas, punto y coma y JSON, usando cero como semilla opcional', () => {
    const s = TestBed.inject(IterativoService);
    for (const matriz of ['4 1\n2 3', '4,1;2,3', '[[4,1],[2,3]]']) {
      s.calcular({ ...entrada, matriz, ladoDerecho: '[6; 8]' });
      expect(s.resultado()!.convergio).toBeTrue();
      expect(s.resultado()!.solucion![0]).toBeCloseTo(1, 8);
      expect(s.resultado()!.solucion![1]).toBeCloseTo(2, 8);
      expect(s.datos()!.x0).toEqual([0, 0]);
      expect(s.filas().length).toBe(s.resultado()!.iteraciones + 1);
      expect(s.filas()[0]['k']).toBe(0);
    }
  });

  it('compara exactamente los mismos datos y restaura los parámetros al limpiar', () => {
    const s = TestBed.inject(IterativoService);
    s.calcular(entrada);
    const anterior = s.resultado();
    s.comparar();
    expect(s.resultado()).toBe(anterior);
    expect(s.comparacion()!.convergio).toBeTrue();
    s.comparacion()!.solucion!.forEach((v, i) => expect(v).toBeCloseTo([1, 2][i], 8));
    expect(s.comparacion()!.inicial!.x).toEqual(s.resultado()!.inicial!.x);
    s.paso.set(2);
    s.reiniciar();
    expect(s.resultado()).toBeNull(); expect(s.comparacion()).toBeNull(); expect(s.datos()).toBeNull();
    expect(s.paso()).toBe(0); expect(s.valores()['tol']).toBe('0.000001');
  });

  const invalidas = [
    { tol: 'abc' }, { tol: '' }, { tol: 'Infinity' }, { maxIter: '' }, { maxIter: '1.8' }, { maxIter: '5001' },
    { matriz: '[[1,2],[3]]' }, { matriz: '[["a",1],[2,3]]' }, { matriz: '[[1,2]' },
    { matriz: '' }, { matriz: '1 q\n2 3' }, { matriz: '0 1\n1 2' },
    { ladoDerecho: '' }, { ladoDerecho: '1' }, { x0: '1' }, { x0: 'NaN 0' },
  ];
  invalidas.forEach((datos, i) => it('rechaza la entrada ' + (i + 1) + ' y borra resultados anteriores', () => {
    const s = TestBed.inject(IterativoService);
    s.calcular(entrada); s.comparar();
    s.calcular({ ...entrada, ...datos });
    expect(s.resultado()!.estado).toBe('entrada-invalida');
    expect(s.resultado()!.solucion).toBeUndefined(); expect(s.filas()).toEqual([]);
    expect(s.datos()).toBeNull(); expect(s.comparacion()).toBeNull();
  }));

  it('explica la no convergencia sin publicar una solución validada', () => {
    const s = TestBed.inject(IterativoService);
    s.probarDivergencia();
    expect(s.resultado()!.estado).toBe('limite'); expect(s.resultado()!.iteraciones).toBe(12);
    expect(s.resultado()!.aproximacion).toBeDefined(); expect(s.respuesta()!.exito).toBeFalse();
    expect(s.respuesta()!.solucion).toBeUndefined();
  });

  it('limita la entrada de la calculadora a veinte ecuaciones', () => {
    const s = TestBed.inject(IterativoService);
    s.calcular({ ...entrada, matriz: JSON.stringify(Array.from({ length: 21 }, (_, i) => Array.from({ length: 21 }, (_, j) => i === j ? 1 : 0))) });
    expect(s.resultado()!.estado).toBe('entrada-invalida');
    expect(s.resultado()!.mensaje).toContain('20');
  });
});
