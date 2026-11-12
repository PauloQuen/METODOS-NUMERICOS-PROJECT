import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActividadesEjercicioService } from '../../../components/modulo3/shared/actividades-ejercicio/actividades-ejercicio.service';
import { SolucionGuiada } from './solucion-guiada';

@Component({
  standalone: true,
  imports: [SolucionGuiada],
  template: `
    <app-solucion-guiada
      ejercicioId="guia-prueba"
      [pasos]="pasos"
      conclusion="Conclusión de prueba"
    >
      <p id="desarrollo-completo">Desarrollo completo</p>
    </app-solucion-guiada>
  `,
})
class Host {
  readonly pasos = ['Primer paso', 'Segundo paso'];
}

describe('Solución guiada', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideZonelessChangeDetection()],
    });
  });

  function boton(fixture: ComponentFixture<Host>, texto: string) {
    return Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((b) => b.textContent?.includes(texto));
  }

  it('avanza un paso por vez, guarda el avance y recién al final muestra el desarrollo', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Primer paso');
    expect(fixture.nativeElement.querySelector('#desarrollo-completo')).toBeNull();

    boton(fixture, 'Siguiente')!.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Segundo paso');
    expect(fixture.nativeElement.querySelector('#desarrollo-completo')).toBeNull();

    boton(fixture, 'Finalizar')!.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Recorrido completado');
    expect(fixture.nativeElement.textContent).toContain('Conclusión de prueba');
    expect(fixture.nativeElement.querySelector('#desarrollo-completo')).not.toBeNull();
    expect(TestBed.inject(ActividadesEjercicioService).pasoGuiaDe('guia-prueba')).toBe(2);
  });
});
