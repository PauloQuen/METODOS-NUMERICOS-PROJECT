import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';

import { TipoMetodos } from './tipo-metodos';

/**
 * Pantalla B — la lista por familia.
 *
 * La forma de trabajo del componente es "leer la URL y renderizar lo que
 * el registro dice de esa familia", así que los tests se escriben igual:
 * se navega a una URL y se chequea contra el DOM.
 *
 * Un detalle de la elección de diseño: como hay UN solo componente para
 * las tres familias, estos tres tests cubren las tres pantallas. Si
 * hubiéramos hecho cerrados.ts, abiertos.ts y polinomios.ts, este mismo
 * suite habría que copiarlo tres veces, y la copia se olvida.
 */
describe('TipoMetodos (Pantalla B)', () => {
  async function render(ruta: string): Promise<{ fixture: { nativeElement: HTMLElement } }> {
    TestBed.configureTestingModule({
      imports: [TipoMetodos],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: 'tipos/:familia', component: TipoMetodos }]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(ruta, TipoMetodos);
    return harness as unknown as { fixture: { nativeElement: HTMLElement } };
  }

  it('cerrados lista sus dos métodos y nada más', async () => {
    const { fixture } = await render('/tipos/cerrados');
    const texto = fixture.nativeElement.textContent ?? '';

    expect(texto).toContain('Métodos cerrados');
    expect(texto).toContain('Bisección');
    expect(texto).toContain('Regla Falsa');
    // Los de otra familia NO deben filtrarse:
    expect(texto).not.toContain('Newton-Raphson');
    expect(texto).not.toContain('Cardano');
  });

  it('abiertos lista Newton, Secante y Punto Fijo', async () => {
    const { fixture } = await render('/tipos/abiertos');
    const texto = fixture.nativeElement.textContent ?? '';

    expect(texto).toContain('Métodos abiertos');
    expect(texto).toContain('Newton-Raphson');
    expect(texto).toContain('Secante');
    expect(texto).toContain('Punto Fijo');
    expect(texto).not.toContain('Bisección');
  });

  it('polinomios muestra a Cardano como "Próximamente", sin enlace de entrada', async () => {
    const { fixture } = await render('/tipos/polinomios');
    const dom = fixture.nativeElement as HTMLElement;

    expect(dom.textContent).toContain('Fórmula de Cardano');
    expect(dom.textContent).toContain('Próximamente');

    // El único método está planificado: no puede existir un enlace hacia
    // una página que todavía no existe.
    const enlaces = dom.querySelectorAll('a.metodo');
    expect(enlaces.length).toBe(0);
  });

  it('los métodos disponibles enlazan a su pestaña de Teoría', async () => {
    const { fixture } = await render('/tipos/cerrados');
    const dom = fixture.nativeElement as HTMLElement;
    const primerEnlace = dom.querySelector('a.metodo') as HTMLAnchorElement | null;

    expect(primerEnlace).not.toBeNull();
    expect(primerEnlace?.getAttribute('href')).toBe('/modulo1/tipos/cerrados/biseccion/teoria');
  });
});