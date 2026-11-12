import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormulaMatematica, analizarFormula } from './formula-matematica';
import { SolucionGuiada } from './solucion-guiada';
import { CATALOGO_MODULO1 } from '../../components/modulo1/autoevaluacion/bancos/catalogo';
import { BloqueEjercicio } from '../domain/bloque-ejercicio/bloque-ejercicio';
import { SolutionGateService, claveDeGate } from '../autoevaluacion-mejorada/solution-gate.service';
@Component({standalone:true,imports:[SolucionGuiada],template:`<ng-template #final><p id="desarrollo-final">Desarrollo completo</p></ng-template><app-solucion-guiada ejercicioId="test-guia" [etapas]="ejercicio.guia" [desarrollo]="final"/>`})
class Host{ejercicio=CATALOGO_MODULO1[0].banco[3];}
describe('Guía y notación matemática de M1 y M2',()=>{
 beforeEach(()=>TestBed.configureTestingModule({imports:[Host,FormulaMatematica,BloqueEjercicio],providers:[provideZonelessChangeDetection()]}));
 it('renderiza fracciones, potencias y raíces en el espacio de nombres MathML',()=>{
   const fixture=TestBed.createComponent(FormulaMatematica);
   fixture.componentRef.setInput('texto','x = (a+b)/(2*a) + sqrt(x^2)');fixture.detectChanges();
   const frac=fixture.nativeElement.querySelector('mfrac');
   expect(frac).not.toBeNull();expect(frac.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML');
   expect(fixture.nativeElement.querySelector('msup').namespaceURI).toBe(frac.namespaceURI);
   expect(fixture.nativeElement.querySelector('msqrt')).not.toBeNull();
   expect(analizarFormula('(q/2)^2').tipo).toBe('fila');
 });
 it('revela operaciones y exige las respuestas antes de avanzar; solo crea el desarrollo al finalizar',()=>{
   const fixture=TestBed.createComponent(Host);fixture.detectChanges();
   const boton=(texto:string)=>Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).find(b=>b.textContent!.trim()===texto)!;
   const clic=(b:HTMLElement)=>{b.click();fixture.detectChanges();};
   expect(boton('Continuar').disabled).toBeTrue();
   expect(fixture.nativeElement.querySelector('#desarrollo-final')).toBeNull();
   const antes=fixture.nativeElement.querySelectorAll('.operacion').length;
   clic(boton('Mostrar siguiente operación ↓'));expect(fixture.nativeElement.querySelectorAll('.operacion').length).toBe(antes+1);
   const pasos=fixture.componentInstance.ejercicio.guia;
   const mala=pasos[0].pregunta!.opciones.find(o=>o.id!==pasos[0].pregunta!.correcta)!;
   clic(fixture.nativeElement.querySelector(`input[value="${mala.id}"]`));clic(boton('Comprobar paso'));
   expect(boton('Continuar').disabled).toBeTrue();
   for(let i=0;i<pasos.length;i++){
     expect(fixture.nativeElement.querySelector('#desarrollo-final')).toBeNull();
     if(pasos[i].pregunta){clic(fixture.nativeElement.querySelector(`input[value="${pasos[i].pregunta!.correcta}"]`));clic(boton('Comprobar paso'));}
     clic(boton(i===pasos.length-1?'Finalizar ejercicio':'Continuar'));
   }
   expect(fixture.nativeElement.querySelector('#desarrollo-final')).not.toBeNull();
   fixture.destroy();const regreso=TestBed.createComponent(Host);regreso.detectChanges();expect(regreso.nativeElement.querySelector('#desarrollo-final')).not.toBeNull();
 });
 it('mantiene el bloqueo del ejercicio y abre la guía al desbloquear',()=>{
   const fixture=TestBed.createComponent(BloqueEjercicio),e=CATALOGO_MODULO1[0].banco[3];
   fixture.componentRef.setInput('ejercicio',e);fixture.componentRef.setInput('mejorada',true);fixture.componentRef.setInput('metodoId','biseccion');fixture.detectChanges();
   const boton=()=>Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).find(b=>b.textContent!.trim()==='Ver solución')!;
   expect(boton().disabled).toBeTrue();expect(fixture.nativeElement.querySelector('app-solucion-guiada')).toBeNull();
   TestBed.inject(SolutionGateService).actualizar(claveDeGate('modulo1','','biseccion',e.id),{respuestaCorrecta:true});fixture.detectChanges();
   boton().click();fixture.detectChanges();expect(fixture.nativeElement.querySelector('app-solucion-guiada')).not.toBeNull();
   expect(fixture.nativeElement.querySelector('app-bloque-ejemplo')).toBeNull();
 });
});
