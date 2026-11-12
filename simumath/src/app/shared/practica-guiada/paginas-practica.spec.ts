import { By } from '@angular/platform-browser';
import { BloqueEjercicio } from '../domain/bloque-ejercicio/bloque-ejercicio';
import { provideZonelessChangeDetection, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BiseccionAutoevaluacion } from '../../components/modulo1/tipos/cerrados/biseccion/tabs/biseccion-autoevaluacion';
import { ReglaFalsaAutoevaluacion } from '../../components/modulo1/tipos/cerrados/regla-falsa/tabs/regla-falsa-autoevaluacion';
import { NewtonRaphsonAutoevaluacion } from '../../components/modulo1/tipos/abiertos/newton-raphson/tabs/newton-raphson-autoevaluacion';
import { SecanteAutoevaluacion } from '../../components/modulo1/tipos/abiertos/secante/tabs/secante-autoevaluacion';
import { PuntoFijoAutoevaluacion } from '../../components/modulo1/tipos/abiertos/punto-fijo/tabs/punto-fijo-autoevaluacion';
import { CardanoAutoevaluacion } from '../../components/modulo1/tipos/polinomios/cardano/tabs/cardano-autoevaluacion';
import { GaussAutoevaluacion } from '../../components/modulo2/tipos/directos/gauss/tabs/gauss-autoevaluacion';
import { LuAutoevaluacion } from '../../components/modulo2/tipos/directos/lu/tabs/lu-autoevaluacion';
import { AutoevaluacionMejorada } from '../../components/modulo1/autoevaluacion/autoevaluacion-mejorada';
const paginas:Type<unknown>[]=[BiseccionAutoevaluacion,ReglaFalsaAutoevaluacion,NewtonRaphsonAutoevaluacion,SecanteAutoevaluacion,PuntoFijoAutoevaluacion,CardanoAutoevaluacion,GaussAutoevaluacion,LuAutoevaluacion,AutoevaluacionMejorada];
describe('Páginas de práctica M1 y M2',()=>{
 for(const pagina of paginas)it(`${pagina.name} muestra seis ejercicios y renueva la tanda`,()=>{
  TestBed.configureTestingModule({imports:[pagina],providers:[provideZonelessChangeDetection()]});
  const fixture=TestBed.createComponent(pagina);fixture.detectChanges();
  const ids=()=>fixture.debugElement.queryAll(By.directive(BloqueEjercicio)).map(d=>(d.componentInstance as BloqueEjercicio).ejercicio().id);
  const anterior=ids();expect(anterior.length).toBe(6);
  const boton=Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).find(b=>b.textContent!.trim()==='Generar otra tanda')!;
  boton.click();fixture.detectChanges();expect(ids().length).toBe(6);
  expect(ids().some(t=>anterior.includes(t))).toBeFalse();
 });
});
