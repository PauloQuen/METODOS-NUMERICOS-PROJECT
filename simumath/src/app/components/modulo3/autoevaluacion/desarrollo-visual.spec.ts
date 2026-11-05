import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DesarrolloVisualM3 } from './desarrollo-visual';
import { crearVisuales } from './desarrollo-visual.data';
import { crearBanco } from './banco';
import { EJERCICIOS_LAGRANGE } from '../tipos/interpolacion/lagrange/lagrange.contenido';
import { EJERCICIOS_MINIMOS_CUADRADOS } from '../tipos/ajuste/minimos-cuadrados/minimos-cuadrados.contenido';

describe('Desarrollo visual M3', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [DesarrolloVisualM3], providers: [provideZonelessChangeDetection()],
  }));

  it('revela las operaciones, confirma el resultado después del acierto y permite repetir', () => {
    const fixture = TestBed.createComponent(DesarrolloVisualM3);
    const visual = crearVisuales({ puntos: [{x:0,y:2},{x:4,y:10}], evaluarEn:1.5 }, 'lagrange')[2];
    fixture.componentRef.setInput('visual', visual);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.operacion').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.fraccion').textContent).toContain('(1.5 − (4))');
    fixture.componentInstance.mostrarSiguiente();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.operacion').length).toBe(2);
    expect(fixture.nativeElement.querySelector('.resultado')).toBeNull();
    fixture.componentRef.setInput('resuelto', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.resultado').textContent).toContain('0.625');
    fixture.componentInstance.repetir();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.operacion').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.resultado')).toBeNull();
  });

  it('dibuja los residuos con los valores reales y escala también tablas de y constante', () => {
    const fixture = TestBed.createComponent(DesarrolloVisualM3);
    const datos = { puntos: [{x:0,y:1},{x:1,y:3},{x:2,y:4}], evaluarEn:1.5 };
    const visual = crearVisuales(datos, 'minimos-cuadrados')[4];
    fixture.componentRef.setInput('visual', visual);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.residuo').length).toBe(3);
    expect(visual.grafico.residuos![0].estimado).toBeCloseTo(7/6, 8);
    expect(visual.grafico.residuos![0].observado).toBe(1);
    expect(fixture.nativeElement.querySelector('.curva').getAttribute('d')).not.toContain('NaN');
    fixture.componentRef.setInput('visual', crearVisuales({ puntos: [{x:0,y:2},{x:1,y:2}], evaluarEn:0.5 }, 'lagrange')[4]);
    fixture.detectChanges();
    for (const p of fixture.componentInstance.plano().puntos) {
      expect(Number.isFinite(p.cx) && Number.isFinite(p.cy)).toBeTrue();
    }
  });

  it('genera seis pizarras para cada ejercicio y hace coincidir el gráfico final con la solución', () => {
    for (const banco of [crearBanco(EJERCICIOS_LAGRANGE, 'lagrange'), crearBanco(EJERCICIOS_MINIMOS_CUADRADOS, 'minimos-cuadrados')]) {
      for (const e of banco) {
        for (const paso of e.guia) {
          expect(paso.visual!.operaciones.length).toBeGreaterThan(0);
          expect(paso.visual!.grafico.puntos).toEqual(e.calculo.puntos);
        }
        expect(e.guia[0].visual!.grafico.curva).toBeUndefined();
        const final = e.guia[5].visual!;
        expect(final.grafico.estimacion!.y).toBeCloseTo(e.resolucion!.valorCorrecto as number, 8);
        expect(final.grafico.curva!.every(p=>Number.isFinite(p.x) && Number.isFinite(p.y))).toBeTrue();
      }
    }
  });
});
