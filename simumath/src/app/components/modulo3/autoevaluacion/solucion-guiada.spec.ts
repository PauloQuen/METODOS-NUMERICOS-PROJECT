import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SolucionGuiadaM3 } from './solucion-guiada';
import { crearBanco } from './banco';
import { PracticaM3Service } from './practica.service';

@Component({standalone:true, imports:[SolucionGuiadaM3], template:`
  <ng-template #final><p id="resultado-final">Resultado completo</p></ng-template>
  <app-solucion-guiada-m3 ejercicioId="prueba" [pasos]="pasos" [desarrollo]="final" />
`})
class Host {
  pasos = crearBanco([], 'lagrange')[0].guia;
}

describe('Solución guiada M3',()=>{
  beforeEach(()=>TestBed.configureTestingModule({imports:[Host], providers:[provideZonelessChangeDetection()]}));
  it('exige comprobar cada pregunta y solo crea el desarrollo al completar todas las etapas',()=>{
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const boton = (texto:string): HTMLButtonElement => Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).find(b=>b.textContent!.trim()===texto)!;
    const clic = (b:HTMLElement) => {b.click();fixture.detectChanges();};
    const guia = fixture.componentInstance.pasos;
    expect(fixture.nativeElement.querySelector('#resultado-final')).toBeNull();
    expect(boton('Continuar').disabled).toBeTrue();
    const incorrecta = guia[0].pregunta!.opciones.find(o=>o.id!==guia[0].pregunta!.correcta)!;
    clic(fixture.nativeElement.querySelector(`input[value="${incorrecta.id}"]`));
    clic(boton('Comprobar paso'));
    expect(boton('Continuar').disabled).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Revisa el procedimiento');
    for (let i=0; i<guia.length; i++) {
      expect(fixture.nativeElement.querySelector('#resultado-final')).toBeNull();
      if (guia[i].pregunta) {
        clic(fixture.nativeElement.querySelector(`input[value="${guia[i].pregunta!.correcta}"]`));
        clic(boton('Comprobar paso'));
      }
      clic(boton(i===guia.length-1?'Finalizar ejercicio':'Continuar'));
    }
    expect(fixture.nativeElement.querySelector('#resultado-final')).not.toBeNull();
    fixture.destroy();
    const regreso = TestBed.createComponent(Host);
    regreso.detectChanges();
    expect(regreso.nativeElement.querySelector('#resultado-final')).not.toBeNull();
    expect(TestBed.inject(PracticaM3Service).pasoDe('prueba')).toBe(guia.length);
  });
});
