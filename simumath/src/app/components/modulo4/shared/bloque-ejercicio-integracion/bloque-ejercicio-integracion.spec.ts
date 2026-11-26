import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { BloqueEjercicioIntegracion } from './bloque-ejercicio-integracion';
import { EJERCICIOS_TRAPECIO } from '../../tipos/newton-cotes/trapecio/trapecio.contenido';
import type { IntegracionVista } from '../integracion-vista';

@Component({
  standalone: true,
  imports: [BloqueEjercicioIntegracion],
  template: `
    <app-bloque-ejercicio-integracion
      [ejercicio]="ejercicio"
      modulo="modulo4"
      tipo="newton-cotes"
      metodo="trapecio"
      [estado]="estado"
      [funcion]="funcion"
    />
  `,
})
class Host {
  readonly ejercicio = EJERCICIOS_TRAPECIO[0];
  readonly estado: IntegracionVista = {
    funcionTexto: 'x^2',
    a: 0,
    b: 1,
    n: 4,
    h: 0.25,
    integral: 0.34375,
    exacto: 1 / 3,
    filas: [],
  };
  readonly funcion = () => 0;
}

describe('BloqueEjercicioIntegracion con gate estricto', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideZonelessChangeDetection()],
    }),
  );

  function boton(fixture: ComponentFixture<Host>, texto: string) {
    const encontrado = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((b) => b.textContent!.trim().includes(texto));
    if (!encontrado) throw new Error(`No hay botón con texto ${texto}`);
    return encontrado;
  }

  function clic(elemento: HTMLElement, fixture: ComponentFixture<Host>) {
    elemento.click();
    fixture.detectChanges();
  }

  function abrir(fixture: ComponentFixture<Host>, texto: 'Cuestionario' | 'Tu resultado') {
    clic(boton(fixture, texto), fixture);
  }

  function elegir(fixture: ComponentFixture<Host>, preguntaId: string, opcionId: string) {
    const selector = `input[name="${fixture.componentInstance.ejercicio.id}-${preguntaId}"][value="${opcionId}"]`;
    clic(fixture.nativeElement.querySelector(selector), fixture);
    expect(fixture.nativeElement.querySelector(selector).checked).toBeTrue();
  }

  it('despliega y oculta el cuestionario y el resultado, con ARIA', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const id = fixture.componentInstance.ejercicio.id;

    expect(fixture.nativeElement.querySelector(`#m45-panel-${id}-cuestionario`)).toBeNull();
    expect(boton(fixture, 'Cuestionario').getAttribute('aria-expanded')).toBe('false');
    clic(boton(fixture, 'Cuestionario'), fixture);
    expect(fixture.nativeElement.querySelector(`#m45-panel-${id}-cuestionario`)).not.toBeNull();
    expect(boton(fixture, 'Cuestionario').getAttribute('aria-expanded')).toBe('true');
    clic(boton(fixture, 'Cuestionario'), fixture);
    expect(fixture.nativeElement.querySelector(`#m45-panel-${id}-cuestionario`)).toBeNull();

    expect(fixture.nativeElement.querySelector(`#m45-panel-${id}-resultado`)).toBeNull();
    clic(boton(fixture, 'Tu resultado'), fixture);
    expect(fixture.nativeElement.querySelector(`#m45-panel-${id}-resultado`)).not.toBeNull();
    expect(boton(fixture, 'Tu resultado').getAttribute('aria-expanded')).toBe('true');
    clic(boton(fixture, 'Tu resultado'), fixture);
    expect(fixture.nativeElement.querySelector(`#m45-panel-${id}-resultado`)).toBeNull();
  });

  it('mantiene la solución cerrada si alguna pregunta está mal', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const cuestionario = fixture.componentInstance.ejercicio.cuestionario!;
    abrir(fixture, 'Cuestionario');

    expect(boton(fixture, 'Ver solución').disabled).toBeTrue();
    expect(fixture.nativeElement.querySelector('app-bloque-ejemplo-integracion')).toBeNull();

    const incorrecta = cuestionario[0].opciones.find((o) => o.id !== cuestionario[0].correcta)!;
    for (const p of cuestionario) {
      elegir(fixture, p.id, p.id === cuestionario[0].id ? incorrecta.id : p.correcta);
    }
    clic(boton(fixture, 'Comprobar respuesta'), fixture);
    expect(boton(fixture, 'Ver solución').disabled).toBeTrue();

    // Con todas correctas pero sin resultado enviado, sigue cerrada.
    for (const p of cuestionario) elegir(fixture, p.id, p.correcta);
    clic(boton(fixture, 'Comprobar respuesta'), fixture);
    abrir(fixture, 'Tu resultado');
    expect(boton(fixture, 'Ver solución').disabled).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Resultado todavía no enviado');
  });

  it('abre solo con todas las correctas y el resultado enviado; cerrarlo al editar', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const cuestionario = fixture.componentInstance.ejercicio.cuestionario!;
    abrir(fixture, 'Cuestionario');

    for (const p of cuestionario) elegir(fixture, p.id, p.correcta);
    clic(boton(fixture, 'Comprobar respuesta'), fixture);
    expect(boton(fixture, 'Ver solución').disabled).toBeTrue();

    abrir(fixture, 'Tu resultado');
    const area: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    area.value = '0,34375';
    area.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(boton(fixture, 'Marcar resultado como enviado').disabled).toBeFalse();
    clic(boton(fixture, 'Marcar resultado como enviado'), fixture);

    expect(fixture.nativeElement.textContent).toContain('Resultado enviado');
    expect(boton(fixture, 'Ver solución').disabled).toBeFalse();
    clic(boton(fixture, 'Ver solución'), fixture);
    expect(fixture.nativeElement.querySelector('app-bloque-ejemplo-integracion')).not.toBeNull();

    // Escribir otra vez revoca el envío, cierra la solución y la quita del DOM.
    area.value = 'otro valor';
    area.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(boton(fixture, 'Ver solución').disabled).toBeTrue();
    expect(fixture.nativeElement.querySelector('app-bloque-ejemplo-integracion')).toBeNull();
  });

  it('mantiene cuestionario, resultado y paneles abiertos al destruir y recrear el bloque', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const cuestionario = fixture.componentInstance.ejercicio.cuestionario!;
    abrir(fixture, 'Cuestionario');
    for (const p of cuestionario) elegir(fixture, p.id, p.correcta);
    clic(boton(fixture, 'Comprobar respuesta'), fixture);
    abrir(fixture, 'Tu resultado');
    const area: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    area.value = '0,34375';
    area.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    clic(boton(fixture, 'Marcar resultado como enviado'), fixture);
    fixture.destroy();

    const regreso = TestBed.createComponent(Host);
    regreso.detectChanges();
    const id = regreso.componentInstance.ejercicio.id;
    expect(regreso.nativeElement.querySelector(`#m45-panel-${id}-cuestionario`)).not.toBeNull();
    expect(regreso.nativeElement.querySelector(`#m45-panel-${id}-resultado`)).not.toBeNull();
    expect(boton(regreso, 'Ver solución').disabled).toBeFalse();
    for (const p of cuestionario) {
      const selector = `input[name="${regreso.componentInstance.ejercicio.id}-${p.id}"][value="${p.correcta}"]`;
      expect(regreso.nativeElement.querySelector(selector).checked).toBeTrue();
    }
    expect(regreso.nativeElement.querySelector('textarea').value).toBe('0,34375');
  });
});
