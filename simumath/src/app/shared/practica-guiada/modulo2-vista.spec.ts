import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatrizVista } from '../domain/matriz-vista/matriz-vista';
import { leerFilaMatriz, separarMatrices } from '../domain/matriz-vista/texto-matricial';
import { GaussTeoria } from '../../components/modulo2/tipos/directos/gauss/tabs/gauss-teoria';
import { LuTeoria } from '../../components/modulo2/tipos/directos/lu/tabs/lu-teoria';
import { GaussEjemplos } from '../../components/modulo2/tipos/directos/gauss/tabs/gauss-ejemplos';
import { LuEjemplos } from '../../components/modulo2/tipos/directos/lu/tabs/lu-ejemplos';
import { GaussCalculadora } from '../../components/modulo2/tipos/directos/gauss/tabs/gauss-calculadora';
import { LuCalculadora } from '../../components/modulo2/tipos/directos/lu/tabs/lu-calculadora';
import { GaussAutoevaluacion } from '../../components/modulo2/tipos/directos/gauss/tabs/gauss-autoevaluacion';
import { LuAutoevaluacion } from '../../components/modulo2/tipos/directos/lu/tabs/lu-autoevaluacion';
import { GaussService } from '../../components/modulo2/tipos/directos/gauss/gauss.service';
import { LuService } from '../../components/modulo2/tipos/directos/lu/lu.service';
import { BloqueEjercicio } from '../domain/bloque-ejercicio/bloque-ejercicio';
import { SolutionGateService, claveDeGate } from '../autoevaluacion-mejorada/solution-gate.service';
import { SesionPracticaService } from './sesion-practica.service';
const sinGraficos=(el:HTMLElement)=>expect(el.querySelector('canvas, svg, app-grafico-sistema, app-grafico-metodo')).toBeNull();
describe('Vista matricial del módulo 2',()=>{
 beforeEach(()=>TestBed.configureTestingModule({providers:[provideZonelessChangeDetection()]}));
 it('reconoce matrices aumentadas, JSON y L/U en paralelo, preservando la explicación',()=>{
  expect(leerFilaMatriz(' −2.5  0 | 1e-4')).toEqual({valores:[-2.5,0,.0001],aumentada:true});
  expect(leerFilaMatriz('x₁ = 2')).toBeUndefined();
  expect(separarMatrices('[[1,2],[3,4]]')[0].matrices![0].valores).toEqual([[1,2],[3,4]]);
  const bloques=separarMatrices('Descomposición:\nL = [1 0]   U = [2 3]\n    [4 1]       [0 5]\nSe cumple A = LU.');
  expect(bloques[0].texto).toBe('Descomposición:');
  expect(bloques[1].matrices!.map(m=>m.titulo)).toEqual(['L','U']);
  expect(bloques[1].matrices![1].valores).toEqual([[2,3],[0,5]]);
  expect(bloques[2].texto).toBe('Se cumple A = LU.');
 });
 it('alinea los valores, separa b y elimina ceros y decimales de relleno',()=>{
  const fixture=TestBed.createComponent(MatrizVista);
  fixture.componentRef.setInput('valores',[[1,-0,2.5],[-3,4,6]]);fixture.componentRef.setInput('aumentada',true);fixture.detectChanges();
  const celdas=Array.from<HTMLTableCellElement>(fixture.nativeElement.querySelectorAll('td'));
  expect(celdas.map(c=>c.textContent!.trim())).toEqual(['1','0','2.5','−3','4','6']);
  expect(fixture.nativeElement.querySelectorAll('.independiente').length).toBe(2);
  expect(getComputedStyle(celdas[0]).textAlign).toBe('right');
 });
 for(const tipo of [GaussTeoria,LuTeoria])it(`${tipo.name} no incluye ejemplos resueltos ni gráficos`,()=>{
  const f=TestBed.createComponent<unknown>(tipo);f.detectChanges();sinGraficos(f.nativeElement);
  expect(f.nativeElement.querySelector('app-bloque-ejemplo')).toBeNull();
  expect(f.nativeElement.textContent).not.toContain('Ejemplo numérico resuelto');
 });
 for(const tipo of [GaussEjemplos,LuEjemplos])it(`${tipo.name} dedica el ancho completo a matrices y operaciones`,()=>{
  const f=TestBed.createComponent<unknown>(tipo);f.detectChanges();sinGraficos(f.nativeElement);
  expect(f.nativeElement.querySelectorAll('.bloque-ejemplo__grilla--matrices').length).toBeGreaterThan(0);
  expect(f.nativeElement.querySelectorAll('app-matriz-vista').length).toBeGreaterThan(2);
 });
 it('las dos calculadoras muestran matrices y factores sin ningún contenedor gráfico',()=>{
  const g=TestBed.createComponent(GaussCalculadora);
  g.debugElement.injector.get(GaussService).calcular('2 1\n1 3','5 7');g.detectChanges();sinGraficos(g.nativeElement);
  expect(g.nativeElement.textContent).toContain('Sistema aumentado');expect(g.nativeElement.querySelector('app-matriz-vista')).not.toBeNull();
  const l=TestBed.createComponent(LuCalculadora);
  l.debugElement.injector.get(LuService).calcular('2 1\n1 3','5 7');l.detectChanges();sinGraficos(l.nativeElement);
  expect(l.nativeElement.textContent).toContain('triangular inferior');expect(l.nativeElement.textContent).toContain('triangular superior');
 });
 for(const tipo of [GaussAutoevaluacion,LuAutoevaluacion])it(`${tipo.name} conserva el modo matricial después de completar la guía`,()=>{
  const f=TestBed.createComponent<unknown>(tipo);f.detectChanges();
  const bloque=f.debugElement.query(By.directive(BloqueEjercicio)).componentInstance as BloqueEjercicio;
  const e=bloque.ejercicio();
  TestBed.inject(SolutionGateService).actualizar(claveDeGate('modulo2','directos',bloque.metodoId(),e.id),{verSolucionForzado:true});f.detectChanges();
  const boton=Array.from<HTMLButtonElement>(f.nativeElement.querySelectorAll('button')).find(b=>b.textContent!.trim()==='Ver solución')!;
  boton.click();f.detectChanges();sinGraficos(f.nativeElement);
  expect(f.nativeElement.querySelector('app-solucion-guiada app-matriz-vista')).not.toBeNull();
  TestBed.inject(SesionPracticaService).guardar(e.id,e.guia!.length);f.detectChanges();sinGraficos(f.nativeElement);
  expect(f.nativeElement.querySelector('app-bloque-ejemplo .bloque-ejemplo__grilla--matrices')).not.toBeNull();
 });
});
