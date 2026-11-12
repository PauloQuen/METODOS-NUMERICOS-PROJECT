import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { MODULO0_ROUTES } from './modulo0.routes';

/**
 * Integración de rutas del Módulo 0.
 *
 * No se mockea el router: se navega con el mismo `routes` de la app y se
 * comprueba que el `loadChildren` de cada método, sus cuatro pestañas y
 * la lista por familia llegan a un componente real. Es la red que faltaba
 * entre los tests de contenido y una verificación manual en el navegador.
 */
describe('rutas del Módulo 0', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          { path: '', redirectTo: 'modulo0', pathMatch: 'full' },
          ...MODULO0_ROUTES,
        ]),
      ],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
  });

  function dom(): HTMLElement {
    return harness.fixture.nativeElement as HTMLElement;
  }

  it('redirige /modulo0 a la portada y muestra las cuatro familias', async () => {
    await harness.navigateByUrl('/modulo0');

    expect(TestBed.inject(Router).url).toBe('/modulo0/inicio');

    const texto = dom().textContent ?? '';
    expect(dom().querySelectorAll('h1').length).toBe(1);
    expect(texto).toContain('Fase 0: entender el error antes de calcular');
    expect(texto).toContain('Aritmética de máquina');
    expect(texto).toContain('Medición del error');
    expect(texto).toContain('Error de truncamiento');
    expect(texto).toContain('Propagación y condicionamiento');
  });

  it('la familia de truncamiento lista Taylor y enlaza a su teoría', async () => {
    await harness.navigateByUrl('/modulo0/tipos/truncamiento');

    expect(dom().textContent).toContain('Error de truncamiento');
    expect(dom().textContent).toContain('Series de Taylor y orden O(hⁿ)');

    const enlace = dom().querySelector('a.metodo') as HTMLAnchorElement | null;
    expect(enlace?.getAttribute('href')).toBe('/modulo0/tipos/truncamiento/taylor/teoria');
  });

  it('carga la teoría de Taylor con sus cuatro pestañas', async () => {
    await harness.navigateByUrl('/modulo0/tipos/truncamiento/taylor/teoria');

    expect(dom().querySelectorAll('h1').length).toBe(1);
    expect(dom().querySelectorAll('.pagina-metodo__pestana').length).toBe(4);
    expect(dom().querySelector('.pagina-metodo__pestana--activa')?.textContent).toContain('Teoría');
    expect(dom().querySelectorAll('.teoria-m3__seccion').length).toBeGreaterThanOrEqual(2);
    expect(dom().textContent).toContain('Serie de Taylor');
  });

  it('carga ejemplos, autoevaluación y calculadora del mismo método', async () => {
    await harness.navigateByUrl('/modulo0/tipos/truncamiento/taylor/ejemplos');
    expect(dom().querySelectorAll('.lista-m3-tab__bloque').length).toBeGreaterThan(0);
    expect(dom().textContent).toContain('e² con cinco términos');

    await harness.navigateByUrl('/modulo0/tipos/truncamiento/taylor/autoevaluacion');
    expect(dom().querySelectorAll('app-m0-bloque-ejercicio-error').length).toBeGreaterThan(0);
    expect(dom().textContent).toContain('Aproximar e^0,5 con grado 3');

    await harness.navigateByUrl('/modulo0/tipos/truncamiento/taylor/calculadora');
    expect(dom().querySelector('app-panel-calculadora-datos')).toBeTruthy();
    expect(dom().textContent).toContain('Calculadora de Taylor para e^x');
  });

  it('cada uno de los cuatro métodos abre su propia teoría', async () => {
    const esperados = [
      ['/modulo0/tipos/aritmetica/cifras-significativas/teoria', 'Cifras significativas y redondeo'],
      [
        '/modulo0/tipos/medicion/error-absoluto-relativo/teoria',
        'Error absoluto, relativo y porcentual',
      ],
      ['/modulo0/tipos/truncamiento/taylor/teoria', 'Series de Taylor y orden O(hⁿ)'],
      [
        '/modulo0/tipos/propagacion/propagacion-errores/teoria',
        'Propagación de errores',
      ],
    ];

    for (const [ruta, titulo] of esperados) {
      await harness.navigateByUrl(ruta);
      expect(dom().querySelector('h1')?.textContent).toContain(titulo);
      expect(dom().querySelectorAll('.pagina-metodo__pestana').length).toBe(4);
    }
  });
});
