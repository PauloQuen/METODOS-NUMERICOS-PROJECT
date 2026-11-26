import { By } from '@angular/platform-browser';
import { BloqueEjercicio } from '../domain/bloque-ejercicio/bloque-ejercicio';
import { ExerciseActions } from '../autoevaluacion-mejorada/exercise-actions/exercise-actions';
import { SesionPracticaService } from './sesion-practica.service';
import type { ConGuia } from './modelos';
import type { EjercicioBase } from '../models/metodo.model';
import type { Signal } from '@angular/core';
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
describe('Páginas de práctica M1 y M2', () => {
  for (const pagina of paginas) it(`${pagina.name} renueva seis ejercicios y conserva la selección al regresar`, () => {
    TestBed.configureTestingModule({ imports: [pagina], providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(pagina);
    fixture.detectChanges();
    const componente = fixture.componentInstance as { ejercicios: Signal<ConGuia<EjercicioBase>[]> };
    const ids = () => fixture.debugElement.queryAll(By.directive(ExerciseActions))
      .map(d => (d.componentInstance as ExerciseActions).ejercicioId());
    const anterior = ids();
    expect(anterior.length).toBe(6);
    expect(new Set(anterior).size).toBe(6);
    expect(componente.ejercicios().filter(e => e.tipo === 'numerico').length).toBe(3);
    expect(componente.ejercicios().filter(e => e.tipo === 'casuistica').length).toBe(3);
    componente.ejercicios().forEach(e => {
      expect(e.cuestionario!.length).toBe(4);
      expect(e.pasos.length).toBeGreaterThan(0);
    });
    fixture.detectChanges();
    expect(ids()).toEqual(anterior);
    const boton = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find(b => b.textContent!.trim() === 'Generar otra tanda')!;
    boton.click();
    fixture.detectChanges();
    expect(ids().length).toBe(6);
    expect(ids().some(id => anterior.includes(id))).toBeFalse();
    const actual = componente.ejercicios();
    TestBed.inject(SesionPracticaService).guardar(actual[0].id, 2);
    const bloques = fixture.debugElement.queryAll(By.directive(BloqueEjercicio));
    if (bloques.length) {
      expect(bloques.map(b => b.componentInstance.ejercicio().id)).toEqual(actual.map(e => e.id));
      const primerBloque = bloques[0].componentInstance as BloqueEjercicio;
      expect(primerBloque.filas().length).toBeGreaterThan(0);
      const acciones = bloques[0].query(By.directive(ExerciseActions)).componentInstance as ExerciseActions;
      acciones.alternarCuestionario.emit();
      fixture.detectChanges();
      for (const pregunta of actual[0].cuestionario!) {
        expect(bloques[0].nativeElement.textContent).toContain(pregunta.enunciado);
      }
    } else {
      const temas = (actual as (ConGuia<EjercicioBase> & { metodo: string })[]).map(e => e.metodo);
      expect(new Set(temas).size).toBe(6);
    }
    fixture.destroy();
    const regreso = TestBed.createComponent(pagina);
    regreso.detectChanges();
    const seleccion = (regreso.componentInstance as typeof componente).ejercicios();
    expect(seleccion.map(e => e.id)).toEqual(actual.map(e => e.id));
    expect(seleccion.map(e => e.cuestionario)).toEqual(actual.map(e => e.cuestionario));
    expect(TestBed.inject(SesionPracticaService).paso(actual[0].id)).toBe(2);
  });
});
