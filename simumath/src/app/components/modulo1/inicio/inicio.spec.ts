import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';

import { Inicio } from './inicio';

/**
 * Pantalla A — "¿Qué quieres aprender hoy?"
 *
 * Lo que hay que proteger acá es el CONTRATO con el registro: la landing
 * es la puerta de entrada, así que si un método nuevo se registra y esta
 * pantalla no lo muestra, nadie llega a él. Y si se escribe una familia
 * a mano en vez de leerla del registro, en dos semanas se desincroniza.
 */
describe('Inicio (Pantalla A)', () => {
  async function render(): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: 'modulo1/inicio', component: Inicio }]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/modulo1/inicio', Inicio);
    return harness.fixture.nativeElement as HTMLElement;
  }

  it('muestra las tres familias con su principio', async () => {
    const dom = await render();
    const texto = dom.textContent ?? '';

    expect(texto).toContain('Métodos cerrados');
    expect(texto).toContain('Acotan la raíz');
    expect(texto).toContain('Métodos abiertos');
    expect(texto).toContain('No acotan');
    expect(texto).toContain('Métodos analíticos');
    expect(texto).toContain('Resuelven por álgebra');
  });

  it('lista los métodos de cada familia según el registro', async () => {
    const dom = await render();
    const texto = dom.textContent ?? '';

    expect(texto).toContain('Bisección');
    expect(texto).toContain('Regla Falsa');
    expect(texto).toContain('Newton-Raphson');
    expect(texto).toContain('Secante');
    expect(texto).toContain('Punto Fijo');
    // Cardano está planificado: se muestra igual, con su badge.
    expect(texto).toContain('Fórmula de Cardano');
    expect(texto).toContain('Próximamente');
  });

  it('cada tarjeta de familia enlaza a su lista de métodos', async () => {
    const dom = await render();
    const hrefs = Array.from(dom.querySelectorAll('a.familia')).map((a) =>
      (a as HTMLAnchorElement).getAttribute('href'),
    );

    expect(hrefs).toEqual([
      '/modulo1/tipos/cerrados',
      '/modulo1/tipos/abiertos',
      '/modulo1/tipos/polinomios',
    ]);
  });

  it('mantiene el acceso al material transversal (secciones generales)', async () => {
    const dom = await render();
    const texto = dom.textContent ?? '';

    expect(texto).toContain('Material general del módulo');
    expect(texto).toContain('Calculadoras');
    expect(texto).toContain('Autoevaluación');
  });
});