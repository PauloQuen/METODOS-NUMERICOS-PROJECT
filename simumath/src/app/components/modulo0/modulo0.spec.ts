import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Modulo0 } from './modulo0';
import { InicioModulo0 } from './inicio/inicio';

describe('Modulo0', () => {
  let fixture: ComponentFixture<Modulo0>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modulo0],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Modulo0);
    fixture.detectChanges();
  });

  it('se crea y muestra el outlet del módulo', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});

describe('InicioModulo0', () => {
  let fixture: ComponentFixture<InicioModulo0>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioModulo0],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioModulo0);
    fixture.detectChanges();
  });

  it('muestra las cuatro familias y los cuatro métodos', () => {
    const texto = fixture.nativeElement.textContent as string;

    expect(fixture.nativeElement.querySelectorAll('.familia').length).toBe(4);
    expect(fixture.nativeElement.querySelectorAll('.inicio__link').length).toBe(4);
    expect(texto).toContain('Cifras significativas y redondeo');
    expect(texto).toContain('Series de Taylor y orden O(hⁿ)');
    expect(texto).toContain('Propagación de errores');
  });
});
