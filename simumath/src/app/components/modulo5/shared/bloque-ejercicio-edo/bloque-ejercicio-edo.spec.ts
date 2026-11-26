import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { BloqueEjercicioEdo } from './bloque-ejercicio-edo';
import { EJERCICIOS_EULER } from '../../tipos/edo-clasicos/euler/euler.contenido';
import type { EdoVista } from '../edo-vista';

@Component({
  standalone: true,
  imports: [BloqueEjercicioEdo],
  template: `
    <app-bloque-ejercicio-edo
      [ejercicio]="ejercicio"
      modulo="modulo5"
      tipo="edo-clasicos"
      metodo="euler"
      [estado]="estado"
    />
  `,
})
class Host {
  readonly ejercicio = EJERCICIOS_EULER[0];
  readonly estado: EdoVista = {
    funcionTexto: 't + y',
    t0: 0,
    y0: 1,
    h: 0.1,
    tFin: 0.1,
    pasos: 1,
    yFinal: 1.1,
    filas: [],
  };
}

describe('BloqueEjercicioEdo con gate estricto', () => {
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
    clic(boton(fixture, 'Cuestionario'), fixture);
    expect(fixture.nativeElement.querySelector(`#m45-panel-${id}-cuestionario`)).not.toBeNull();
    expect(boton(fixture, 'Cuestionario').getAttribute('aria-expanded')).toBe('true');
    clic(boton(fixture, 'Cuestionario'), fixture);
    expect(fixture.nativeElement.querySelector(`#m45-panel-${id}-cuestionario`)).toBeNull();

    expect(fixture.nativeElement.querySelector(`#m45-panel-${id}-resultado`)).toBeNull();
    clic(boton(fixture, 'Tu resultado'), fixture);
    expect(fixture.nativeElement.querySelector(`#m45-panel-${id}-resultado`)).not.toBeNull();
    clic(boton(fixture, 'Tu resultado'), fixture);
    expect(fixture.nativeElement.querySelector(`#m45-panel-${id}-resultado`)).toBeNull();
  });

  it('no abre con una pregunta mal ni con el quiz perfecto sin resultado', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const cuestionario = fixture.componentInstance.ejercicio.cuestionario!;
    abrir(fixture, 'Cuestionario');

    expect(boton(fixture, 'Ver solución').disabled).toBeTrue();
    const incorrecta = cuestionario[0].opciones.find((o) => o.id !== cuestionario[0].correcta)!;
    for (const p of cuestionario) {
      elegir(fixture, p.id, p.id === cuestionario[0].id ? incorrecta.id : p.correcta);
    }
    clic(boton(fixture, 'Comprobar respuesta'), fixture);
    expect(boton(fixture, 'Ver solución').disabled).toBeTrue();

    for (const p of cuestionario) elegir(fixture, p.id, p.correcta);
    clic(boton(fixture, 'Comprobar respuesta'), fixture);
    abrir(fixture, 'Tu resultado');
    expect(boton(fixture, 'Ver solución').disabled).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Resultado todavía no enviado');
  });

  it('abre solo con todas las correctas y el resultado enviado', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const cuestionario = fixture.componentInstance.ejercicio.cuestionario!;
    abrir(fixture, 'Cuestionario');

    for (const p of cuestionario) elegir(fixture, p.id, p.correcta);
    clic(boton(fixture, 'Comprobar respuesta'), fixture);
    expect(boton(fixture, 'Ver solución').disabled).toBeTrue();

    abrir(fixture, 'Tu resultado');
    const area: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    area.value = '1,1';
    area.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    clic(boton(fixture, 'Marcar resultado como enviado'), fixture);

    expect(fixture.nativeElement.textContent).toContain('Resultado enviado');
    expect(boton(fixture, 'Ver solución').disabled).toBeFalse();
    clic(boton(fixture, 'Ver solución'), fixture);
    expect(fixture.nativeElement.querySelector('app-bloque-ejemplo-edo')).not.toBeNull();
  });

  it('acepta un archivo como resultado, sin backend', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const cuestionario = fixture.componentInstance.ejercicio.cuestionario!;
    abrir(fixture, 'Cuestionario');
    for (const p of cuestionario) elegir(fixture, p.id, p.correcta);
    clic(boton(fixture, 'Comprobar respuesta'), fixture);

    abrir(fixture, 'Tu resultado');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    const archivo = new File(['y1 = 1,1'], 'resolucion.pdf', { type: 'application/pdf' });
    // El navegador no deja asignar `files` directamente; se simula el evento.
    Object.defineProperty(input, 'files', { value: [archivo], configurable: true });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('resolucion.pdf');
    expect(boton(fixture, 'Marcar resultado como enviado').disabled).toBeFalse();
    clic(boton(fixture, 'Marcar resultado como enviado'), fixture);
    expect(boton(fixture, 'Ver solución').disabled).toBeFalse();
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
    area.value = '1,1';
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
    expect(regreso.nativeElement.querySelector('textarea').value).toBe('1,1');
  });
});
