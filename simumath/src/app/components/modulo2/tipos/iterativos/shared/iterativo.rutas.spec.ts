import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../../../../app.routes';
import { IterativoCalculadora } from './iterativo-calculadora';
import { IterativoAutoevaluacion } from './iterativo-autoevaluacion';
import { BloqueEjercicio } from '../../../../../shared/domain/bloque-ejercicio/bloque-ejercicio';
import { QuizPanel } from '../../../../../shared/autoevaluacion-mejorada/quiz-panel/quiz-panel';
import { SesionPracticaService } from '../../../../../shared/practica-guiada/sesion-practica.service';
import { GraficoIterativo } from './grafico-iterativo';

describe('Métodos iterativos integrados en el módulo 2', () => {
  let harness: RouterTestingHarness;
  const ruta = (metodo: string, tab: string) => '/modulo2/tipos/iterativos/' + metodo + '/' + tab;
  const dom = () => harness.fixture.nativeElement as HTMLElement;
  const boton = (host: HTMLElement, texto: string) => Array.from(host.querySelectorAll('button')).find(b => b.textContent!.trim() === texto)!;
  async function ir(url: string) { await harness.navigateByUrl(url); await harness.fixture.whenStable(); harness.detectChanges(); }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter(routes.filter(r => r.path === 'modulo2'))],
    }).compileComponents();
    harness = await RouterTestingHarness.create();
  });

  it('habilita Jacobi y Gauss-Seidel desde la portada y la lista de familia', async () => {
    await ir('/modulo2/inicio');
    expect(dom().textContent).not.toContain('En construcción');
    expect(dom().querySelector('a[href="' + ruta('jacobi', 'teoria') + '"]')).not.toBeNull();
    expect(dom().querySelector('a[href="' + ruta('gauss-seidel', 'teoria') + '"]')).not.toBeNull();
    await ir('/modulo2/tipos/iterativos');
    expect(dom().querySelectorAll('a.ficha').length).toBe(2);
    expect(dom().querySelector('.ficha--pendiente')).toBeNull();
  });

  for (const metodo of ['jacobi', 'gauss-seidel']) {
    it(metodo + ' abre las cuatro pestañas con contenido y bancos completos', async () => {
      await ir('/modulo2/tipos/iterativos/' + metodo);
      expect(TestBed.inject(Router).url).toBe(ruta(metodo, 'teoria'));
      expect(dom().querySelectorAll('h1').length).toBe(1);
      expect(dom().querySelectorAll('.gauss__pestana').length).toBe(4);
      expect(dom().querySelectorAll('app-ejemplo-iterativo').length).toBe(2);
      expect(dom().querySelector('.katex-error')).toBeNull();
      await ir(ruta(metodo, 'ejemplos'));
      expect(dom().querySelectorAll('app-ejemplo-iterativo').length).toBe(4);
      expect(dom().querySelectorAll('app-grafico-iterativo svg').length).toBe(4);
      await ir(ruta(metodo, 'autoevaluacion'));
      expect(dom().querySelectorAll('app-bloque-ejercicio').length).toBe(6);
      expect(dom().textContent).toContain('Banco de 24 ejercicios');
      await ir(ruta(metodo, 'calculadora'));
      expect(dom().querySelectorAll('textarea').length).toBe(1);
      expect(dom().querySelectorAll('app-form-field').length).toBe(5);
    });

    it(metodo + ' calcula desde el formulario y conserva datos y resultado al navegar', async () => {
      await ir(ruta(metodo, 'calculadora'));
      const campos = dom().querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('app-form-field input, app-form-field textarea');
      ['4 1\n2 3', '6 8', '', '0.000000001', '200'].forEach((valor, i) => {
        campos[i].value = valor; campos[i].dispatchEvent(new Event('input', { bubbles: true }));
      });
      harness.detectChanges();
      dom().querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await harness.fixture.whenStable();
      const calculadora = harness.fixture.debugElement.query(By.directive(IterativoCalculadora)).componentInstance as IterativoCalculadora;
      const servicio = calculadora.servicio;
      expect(servicio.resultado()!.convergio).toBeTrue();
      expect(servicio.resultado()!.solucion![0]).toBeCloseTo(1, 8);
      expect(servicio.resultado()!.solucion![1]).toBeCloseTo(2, 8);
      calculadora.cambiarPaso(1); harness.detectChanges(); await harness.fixture.whenStable();
      expect(dom().querySelectorAll('.despejes app-formula-matematica').length).toBe(2);
      boton(dom(), 'Comparar ambos métodos').click(); harness.detectChanges();
      expect(servicio.comparacion()!.convergio).toBeTrue();
      expect(dom().querySelectorAll('.comparacion tbody tr').length).toBe(2);
      expect(dom().querySelectorAll('app-grafico-iterativo .curva').length).toBe(2);
      await ir(ruta(metodo, 'teoria'));
      await ir(ruta(metodo, 'calculadora'));
      const regreso = harness.fixture.debugElement.query(By.directive(IterativoCalculadora)).componentInstance as IterativoCalculadora;
      expect(regreso.servicio).toBe(servicio);
      expect(regreso.servicio.paso()).toBe(1);
      expect((dom().querySelector('textarea') as HTMLTextAreaElement).value).toBe('4 1\n2 3');
      const otro = metodo === 'jacobi' ? 'gauss-seidel' : 'jacobi';
      await ir(ruta(otro, 'calculadora'));
      const otra = harness.fixture.debugElement.query(By.directive(IterativoCalculadora)).componentInstance as IterativoCalculadora;
      expect(otra.servicio).not.toBe(servicio);
      expect(otra.servicio.resultado()).toBeNull();
    });

    it(metodo + ' renueva seis ejercicios, desbloquea la guía y conserva el avance', async () => {
      await ir(ruta(metodo, 'autoevaluacion'));
      let pagina = harness.fixture.debugElement.query(By.directive(IterativoAutoevaluacion)).componentInstance as IterativoAutoevaluacion;
      const anterior = pagina.ejercicios().map(e => e.id);
      expect(pagina.ejercicios().filter(e => e.tipo === 'numerico').length).toBe(3);
      expect(pagina.ejercicios().filter(e => e.tipo === 'casuistica').length).toBe(3);
      pagina.ejercicios().forEach(e => expect(e.cuestionario!.length).toBe(4));
      let vista = harness.fixture.debugElement.query(By.directive(BloqueEjercicio));
      let host = vista.nativeElement as HTMLElement;
      expect(boton(host, 'Ver solución').disabled).toBeTrue();
      expect(host.querySelector('app-solucion-practica')).toBeNull();
      boton(host, 'Cuestionario').click(); harness.detectChanges();
      const bloque = vista.componentInstance as BloqueEjercicio;
      const quiz = vista.query(By.directive(QuizPanel)).componentInstance as QuizPanel;
      bloque.ejercicio().cuestionario!.forEach(q => quiz.responder.emit({ preguntaId: q.id, opcionId: q.correcta }));
      quiz.comprobar.emit(); harness.detectChanges();
      expect(boton(host, 'Ver solución').disabled).toBeFalse();
      boton(host, 'Ver solución').click(); harness.detectChanges(); await harness.fixture.whenStable();
      expect(host.querySelector('app-solucion-practica .katex')).not.toBeNull();
      const ejercicio = bloque.ejercicio();
      const sesion = TestBed.inject(SesionPracticaService);
      sesion.guardar(ejercicio.id, 2);
      await ir(ruta(metodo, 'ejemplos'));
      await ir(ruta(metodo, 'autoevaluacion'));
      expect(sesion.paso(ejercicio.id)).toBe(2);
      pagina = harness.fixture.debugElement.query(By.directive(IterativoAutoevaluacion)).componentInstance as IterativoAutoevaluacion;
      expect(pagina.ejercicios().map(e => e.id)).toEqual(anterior);
      vista = harness.fixture.debugElement.query(By.directive(BloqueEjercicio)); host = vista.nativeElement;
      expect(host.textContent).toContain(ejercicio.guia![2].titulo);
      sesion.guardar(ejercicio.id, ejercicio.guia!.length);
      harness.detectChanges(); await harness.fixture.whenStable();
      expect(host.querySelector('app-solucion-guiada app-bloque-ejemplo app-grupo-matrices')).not.toBeNull();
      expect(host.querySelector('app-solucion-guiada app-iteration-table')).not.toBeNull();
      boton(dom(), 'Generar otra tanda').click(); harness.detectChanges(); await harness.fixture.whenStable();
      expect(pagina.ejercicios().some(e => anterior.includes(e.id))).toBeFalse();
      expect(dom().querySelectorAll('app-bloque-ejercicio').length).toBe(6);
    });
  }

  it('pagina un historial largo y sincroniza la página con el estado seleccionado', async () => {
    await ir(ruta('jacobi', 'calculadora'));
    const c = harness.fixture.debugElement.query(By.directive(IterativoCalculadora)).componentInstance as IterativoCalculadora;
    c.calcular({ matriz: '1 0.999\n0.999 1', ladoDerecho: '1.999 1.999', x0: '0 0', tol: '0.0000000001', maxIter: '120' });
    harness.detectChanges(); await harness.fixture.whenStable();
    expect(c.servicio.filas().length).toBe(121);
    expect(dom().querySelectorAll('app-iteration-table tbody tr').length).toBe(50);
    (dom().querySelector('app-pasos-control button[aria-label="Ir al final"]') as HTMLButtonElement).click();
    harness.detectChanges(); await harness.fixture.whenStable();
    expect(c.servicio.actual()!.k).toBe(120);
    expect(c.pagina()).toBe(2);
    expect(dom().querySelectorAll('app-iteration-table tbody tr').length).toBe(21);
    expect(dom().textContent).toContain('101 a 121 de 121');
    expect(boton(dom(), 'Filas siguientes').disabled).toBeTrue();
    boton(dom(), 'Filas anteriores').click(); harness.detectChanges();
    expect(c.pagina()).toBe(1);
    expect(dom().querySelectorAll('app-iteration-table tbody tr').length).toBe(50);
  });

  it('representa residuos nulos y una iteración no convergente sin coordenadas no finitas', async () => {
    await ir(ruta('jacobi', 'calculadora'));
    const c = harness.fixture.debugElement.query(By.directive(IterativoCalculadora)).componentInstance as IterativoCalculadora;
    c.servicio.calcular({ matriz: '1 0\n0 1', ladoDerecho: '0 0', x0: '', tol: '0.000001', maxIter: '10' });
    harness.detectChanges(); await harness.fixture.whenStable();
    let grafico = harness.fixture.debugElement.query(By.directive(GraficoIterativo)).componentInstance as GraficoIterativo;
    expect(grafico.plano().principal).not.toMatch(/NaN|Infinity/);
    expect(dom().textContent).toContain('no fue necesario iterar');
    boton(dom(), 'Probar un caso no convergente').click(); harness.detectChanges(); await harness.fixture.whenStable();
    expect(c.servicio.resultado()!.convergio).toBeFalse();
    expect(dom().textContent).toContain('Última aproximación');
    expect(dom().querySelector('.it-table-row--highlight')).toBeNull();
    grafico = harness.fixture.debugElement.query(By.directive(GraficoIterativo)).componentInstance as GraficoIterativo;
    expect(grafico.plano().principal).not.toMatch(/NaN|Infinity/);
    boton(dom(), 'Limpiar').click(); harness.detectChanges();
    expect(c.servicio.resultado()).toBeNull();
    expect(dom().querySelector('app-grafico-iterativo')).toBeNull();
  });
});
