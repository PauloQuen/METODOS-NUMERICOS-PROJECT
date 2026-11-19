import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatrizVista } from './matriz-vista';
import { GrupoMatrices } from './grupo-matrices';
import { ParametrosMatriciales } from './parametros-matriciales';
import { leerFilaMatriz, separarMatrices, TextoMatricial } from './texto-matricial';
import { GaussTeoria } from '../../../components/modulo2/tipos/directos/gauss/tabs/gauss-teoria';
import { LuTeoria } from '../../../components/modulo2/tipos/directos/lu/tabs/lu-teoria';
import { GaussEjemplos } from '../../../components/modulo2/tipos/directos/gauss/tabs/gauss-ejemplos';
import { LuEjemplos } from '../../../components/modulo2/tipos/directos/lu/tabs/lu-ejemplos';
import { GaussAutoevaluacion } from '../../../components/modulo2/tipos/directos/gauss/tabs/gauss-autoevaluacion';
import { LuAutoevaluacion } from '../../../components/modulo2/tipos/directos/lu/tabs/lu-autoevaluacion';
import { BloqueEjercicio } from '../bloque-ejercicio/bloque-ejercicio';
import { SolutionGateService, claveDeGate } from '../../autoevaluacion-mejorada/solution-gate.service';
import { SesionPracticaService } from '../../practica-guiada/sesion-practica.service';

describe('Matrices del módulo 2 con KaTeX', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] }));

  it('agrupa filas aumentadas y los factores L y U sin mezclar sus columnas', () => {
    const partes = separarMatrices('Descomposición:\nL = [1 0]   U = [2 3]\n    [4 1]       [0 5]\nSe cumple A = LU.');
    expect(partes[0].texto).toBe('Descomposición:');
    expect(partes[1].matrices!.map(m => m.titulo)).toEqual(['L', 'U']);
    expect(partes[1].matrices!.map(m => m.valores)).toEqual([[[1, 0], [4, 1]], [[2, 3], [0, 5]]]);
    expect(partes[2].texto).toBe('Se cumple A = LU.');
    const aumentada = separarMatrices('[−2.5 0 | 1e-4]\n[1 3 | 2]')[0].matrices![0];
    expect(aumentada.valores).toEqual([[-2.5, 0, .0001], [1, 3, 2]]);
    expect(aumentada.aumentada).toBeTrue();
  });

  it('conserva el orden de los operadores entre matrices y reconoce filas con punto y coma', () => {
    const partes = separarMatrices('Se cumple [4, 1; 2, 2] = [1, 0; 0.5, 1] · [4, 1; 0, 1.5].');
    expect(partes.map(p => p.texto ?? 'M')).toEqual(['Se cumple ', 'M', ' = ', 'M', ' · ', 'M', '.']);
    expect(partes[1].matrices![0].valores).toEqual([[4, 1], [2, 2]]);
    expect(separarMatrices('[[4, 1], [2, −2]]')[0].matrices![0].valores).toEqual([[4, 1], [2, -2]]);
    expect(separarMatrices('[13, −1, 6]')[0].matrices![0].valores).toEqual([[13], [-1], [6]]);
  });

  it('conserva la notación simbólica y las matrices inválidas como texto', () => {
    for (const texto of ['[A | b]', '[[1,2],[3]]', '[1 2 | 3 4]', '[1 2; 3]', 'x₁ = 2']) {
      expect(separarMatrices(texto)).toEqual([{ texto }]);
    }
    expect(leerFilaMatriz('1 |')).toBeUndefined();
    const partes = separarMatrices('[1 2] [3 4]\n[5 6] [7 8 9]');
    expect(partes[0].matrices!.map(m => m.valores)).toEqual([[[1, 2]], [[3, 4]]]);
    expect(partes[1].matrices!.map(m => m.valores)).toEqual([[[5, 6]], [[7, 8, 9]]]);
  });

  it('genera corchetes, separador aumentado, MathML y actualiza las celdas activas', async () => {
    const f = TestBed.createComponent(MatrizVista);
    f.componentRef.setInput('valores', [[1, -0, 2.5], [-3, 4, 6]]);
    f.componentRef.setInput('aumentada', true);
    f.detectChanges();
    await f.whenStable();
    expect(f.nativeElement.querySelector('.katex')).not.toBeNull();
    expect(f.nativeElement.querySelector('.katex-error')).toBeNull();
    expect(f.nativeElement.querySelector('math mtable')).not.toBeNull();
    expect(f.componentInstance.formula()).toContain('{rr|r}');
    expect(f.componentInstance.formula()).toContain('1 & 0 & 2.5');
    f.componentRef.setInput('filaActiva', 1);
    f.componentRef.setInput('valores', [[1e-10, 0, 1], [2, 3, 4]]);
    f.detectChanges();
    await f.whenStable();
    expect(f.componentInstance.formula()).toContain('1\\times 10^{-10}');
    expect(f.componentInstance.formula()).toContain('\\boxed{2}');
    expect(f.nativeElement.querySelector('.katex-error')).toBeNull();
  });

  it('contiene las matrices anchas en un área desplazable en móvil', async () => {
    const f = TestBed.createComponent(TextoMatricial);
    f.componentRef.setInput('texto', 'Matriz:\n[100 200 300 400 500 600 700 | 800]\n[1 2 3 4 5 6 7 | 8]');
    const host = f.nativeElement as HTMLElement;
    host.style.width = '280px';
    document.body.appendChild(host);
    f.detectChanges();
    await f.whenStable();
    await document.fonts.ready;
    expect(document.fonts.check('16px KaTeX_Main')).toBeTrue();
    expect(document.fonts.check('16px KaTeX_Size4')).toBeTrue();
    const scroll = host.querySelector<HTMLElement>('.grupo-scroll')!;
    expect(scroll.getBoundingClientRect().width).toBeLessThanOrEqual(280);
    expect(getComputedStyle(scroll).overflowX).toBe('auto');
    expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
    expect(host.scrollWidth).toBeLessThanOrEqual(280);
  });

  it('muestra una sola representación visual de cada matriz y alinea las filas de L y U', async () => {
    const f = TestBed.createComponent(TextoMatricial);
    f.componentRef.setInput('texto', 'L = [1 0]   U = [4 1]\n    [0.5 1]       [0 1.5]');
    document.body.appendChild(f.nativeElement);
    f.detectChanges();
    await f.whenStable();
    await document.fonts.ready;
    const matrices = Array.from<HTMLElement>(f.nativeElement.querySelectorAll('app-matriz-vista'));
    expect(matrices.length).toBe(2);
    for (const matriz of matrices) {
      const accesible = matriz.querySelector<HTMLElement>('.katex-mathml')!;
      // MathML se conserva para lectores de pantalla, sin duplicar la matriz visible.
      expect(getComputedStyle(accesible).position).toBe('absolute');
      expect(accesible.getBoundingClientRect().width).toBeLessThanOrEqual(1);
      expect(accesible.getBoundingClientRect().height).toBeLessThanOrEqual(1);
      const columnas = matriz.querySelectorAll<HTMLElement>('.katex-html .mtable > .col-align-r');
      expect(columnas.length).toBe(2);
      for (const columna of columnas) {
        const filas = columna.querySelectorAll<HTMLElement>('.vlist-r:first-child > .vlist > span > .mord');
        expect(filas.length).toBe(2);
        const superior = filas[0].getBoundingClientRect();
        const inferior = filas[1].getBoundingClientRect();
        expect(inferior.top).toBeGreaterThan(superior.bottom);
        expect(Math.abs(superior.right - inferior.right)).toBeLessThan(1);
      }
    }
  });

  for (const ancho of [280, 900]) {
    it(`mantiene dos matrices 3×3 lado a lado en ${ancho}px y desplaza el grupo cuando falta espacio`, async () => {
      const f = TestBed.createComponent(GrupoMatrices);
      const valores = [[1000, 2000, 3000], [4000, 5000, 6000], [7000, 8000, 9000]];
      f.componentRef.setInput('matrices', [{ titulo: 'L', valores }, { titulo: 'U', valores }]);
      const host = f.nativeElement as HTMLElement;
      host.style.width = `${ancho}px`;
      document.body.appendChild(host);
      f.detectChanges();
      await f.whenStable();
      await document.fonts.ready;
      const matrices = host.querySelectorAll<HTMLElement>('app-matriz-vista');
      const izquierda = matrices[0].getBoundingClientRect();
      const derecha = matrices[1].getBoundingClientRect();
      expect(Math.abs(izquierda.top - derecha.top)).toBeLessThan(1);
      expect(derecha.left).toBeGreaterThan(izquierda.right);
      expect(host.scrollWidth).toBeLessThanOrEqual(ancho);
      const scroll = host.querySelector<HTMLElement>('.grupo-scroll')!;
      if (ancho === 280) {
        expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
        scroll.scrollLeft = scroll.scrollWidth;
        expect(scroll.scrollLeft).toBeGreaterThan(0);
      } else {
        expect(scroll.scrollWidth).toBe(scroll.clientWidth);
      }
    });
  }

  it('presenta A y b en la misma fila y conserva las etiquetas y los parámetros de texto', async () => {
    const f = TestBed.createComponent(ParametrosMatriciales);
    f.componentRef.setInput('parametros', [
      { etiqueta: 'Matriz A', valor: '[[4,1],[2,2]]' },
      { etiqueta: 'Lado derecho b', valor: '[10,8]' },
      { etiqueta: 'Incógnita', valor: 'cantidad de piezas' },
    ]);
    document.body.appendChild(f.nativeElement);
    f.detectChanges();
    await f.whenStable();
    const matrices = f.debugElement.queryAll(By.directive(MatrizVista));
    expect(matrices.map(m => m.componentInstance.titulo())).toEqual(['Matriz A', 'Lado derecho b']);
    expect(matrices[1].componentInstance.valores()).toEqual([[10], [8]]);
    const izquierda = matrices[0].nativeElement.getBoundingClientRect();
    const derecha = matrices[1].nativeElement.getBoundingClientRect();
    expect(Math.abs(izquierda.top - derecha.top)).toBeLessThan(1);
    expect(derecha.left).toBeGreaterThan(izquierda.right);
    expect(f.nativeElement.querySelector('li').textContent).toContain('Incógnita: cantidad de piezas');
  });

  it('mantiene matrices y operadores de una igualdad en una misma fila', async () => {
    const f = TestBed.createComponent(TextoMatricial);
    f.componentRef.setInput('texto', 'Se cumple [4,1;2,2] = [1,0;0.5,1] · [4,1;0,1.5].');
    const host = f.nativeElement as HTMLElement;
    host.style.width = '280px';
    document.body.appendChild(host);
    f.detectChanges();
    await f.whenStable();
    expect(host.querySelectorAll('app-grupo-matrices').length).toBe(1);
    expect(Array.from(host.querySelectorAll('.operador')).map(e => e.textContent)).toEqual(['=', '·']);
    const matrices = Array.from(host.querySelectorAll('app-matriz-vista')).map(e => e.getBoundingClientRect());
    expect(matrices.length).toBe(3);
    expect(Math.abs(matrices[0].top - matrices[2].top)).toBeLessThan(1);
    expect(matrices[2].left).toBeGreaterThan(matrices[1].right);
    expect(host.scrollWidth).toBeLessThanOrEqual(280);
  });

  for (const tipo of [GaussTeoria, LuTeoria, GaussEjemplos, LuEjemplos]) {
    it(`${tipo.name} muestra las matrices del contenido con KaTeX`, async () => {
      const f = TestBed.createComponent<unknown>(tipo);
      f.detectChanges();
      await f.whenStable();
      expect(f.nativeElement.querySelectorAll('app-matriz-vista .katex').length).toBeGreaterThan(2);
      expect(f.nativeElement.querySelector('.katex-error')).toBeNull();
      expect(f.nativeElement.querySelector('app-parametros-matriciales').textContent).not.toContain('[[');
    });
  }

  for (const tipo of [GaussAutoevaluacion, LuAutoevaluacion]) {
    it(`${tipo.name} mantiene KaTeX durante la guía y al consultar el desarrollo completo`, async () => {
      const f = TestBed.createComponent<unknown>(tipo);
      f.detectChanges();
      const practica = TestBed.inject(SesionPracticaService);
      for (const vista of f.debugElement.queryAll(By.directive(BloqueEjercicio))) {
        const bloque = vista.componentInstance as BloqueEjercicio;
        const host = vista.nativeElement as HTMLElement;
        const e = bloque.ejercicio();
        TestBed.inject(SolutionGateService).actualizar(
          claveDeGate('modulo2', 'directos', bloque.metodoId(), e.id), { verSolucionForzado: true });
        f.detectChanges();
        const boton = Array.from(host.querySelectorAll('button'))
          .find(b => b.textContent!.trim() === 'Ver solución')!;
        boton.click();
        for (let i = 0; i < e.guia!.length; i++) {
          practica.guardar(e.id, i);
          f.detectChanges();
          await f.whenStable();
          if (e.guia![i].matrices?.length) {
            expect(host.querySelector('app-solucion-guiada app-matriz-vista .katex')).not.toBeNull();
          }
          expect(host.querySelector('.katex-error')).toBeNull();
        }
        practica.guardar(e.id, e.guia!.length);
        f.detectChanges();
        await f.whenStable();
        expect(host.querySelector('app-solucion-guiada app-bloque-ejemplo app-matriz-vista .katex')).not.toBeNull();
        expect(host.querySelector('.katex-error')).toBeNull();
      }
    });
  }
});
