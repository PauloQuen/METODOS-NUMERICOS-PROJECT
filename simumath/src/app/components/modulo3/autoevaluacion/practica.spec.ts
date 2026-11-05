import { crearBanco } from './banco';
import { barajar, PracticaM3Service } from './practica.service';
import { EJERCICIOS_LAGRANGE } from '../tipos/interpolacion/lagrange/lagrange.contenido';
import { EJERCICIOS_MINIMOS_CUADRADOS } from '../tipos/ajuste/minimos-cuadrados/minimos-cuadrados.contenido';

const lag = crearBanco(EJERCICIOS_LAGRANGE, 'lagrange');
const mc = crearBanco(EJERCICIOS_MINIMOS_CUADRADOS, 'minimos-cuadrados');

describe('Banco y selección de autoevaluación M3', () => {
  it('conserva los ejercicios anteriores y amplía los dos temas a 24 problemas válidos', () => {
    for (const banco of [lag, mc]) {
      expect(banco.length).toBe(24);
      expect(new Set(banco.map(e=>e.id)).size).toBe(24);
      for (const e of banco) {
        expect(e.cuestionario!.length).toBeGreaterThanOrEqual(11);
        expect(new Set(e.cuestionario!.map(p=>p.id)).size).toBe(e.cuestionario!.length);
        expect(Number.isFinite(e.resolucion!.valorCorrecto as number)).toBeTrue();
        expect(e.guia.length).toBe(6);
        for (const p of e.cuestionario!) {
          expect(p.opciones.filter(o=>o.id===p.correcta).length).toBe(1);
          expect(new Set(p.opciones.map(o=>o.texto)).size).toBe(p.opciones.length);
        }
      }
    }
    expect(lag.find(e=>e.titulo==='Interpolación lineal')!.resolucion!.valorCorrecto).toBeCloseTo(5, 8);
    expect(lag.find(e=>e.titulo==='Cuatro nodos cúbicos')!.resolucion!.valorCorrecto).toBeCloseTo(7, 8);
    expect(mc.find(e=>e.titulo==='Recta exacta')!.resolucion!.valorCorrecto).toBeCloseTo(4, 8);
    expect(mc.find(e=>e.titulo==='Patrón curvo')!.resolucion!.valorCorrecto).toBeCloseTo(2, 8);
  });

  it('baraja una copia usando Fisher–Yates', () => {
    const original = [1,2,3,4];
    expect(barajar(original, ()=>0)).toEqual([2,3,4,1]);
    expect(original).toEqual([1,2,3,4]);
  });

  it('elige seis ejercicios, cuatro preguntas y no repite la tanda anterior', () => {
    const servicio = new PracticaM3Service();
    const tanda = servicio.tanda('lagrange',lag);
    for (let i=0; i<12; i++) {
      const anterior = tanda();
      expect(anterior.length).toBe(6);
      expect(anterior.filter(e=>e.tipo==='numerico').length).toBe(3);
      expect(anterior.filter(e=>e.tipo==='casuistica').length).toBe(3);
      expect(new Set(anterior.map(e=>e.id)).size).toBe(6);
      for (const e of anterior) {
        expect(e.cuestionario!.length).toBe(4);
        expect(new Set(e.cuestionario!.map(p=>p.id)).size).toBe(4);
        for (const p of e.cuestionario!) {
          expect(lag.find(b=>e.id.endsWith(':'+b.id))!.cuestionario!.some(b=>b.id===p.id)).toBeTrue();
          expect(p.opciones.some(o=>o.id===p.correcta)).toBeTrue();
        }
      }
      servicio.nuevaTanda('lagrange',lag);
      expect(tanda().some(e=>anterior.some(a=>a.id===e.id))).toBeFalse();
    }
    expect(lag[0].cuestionario!.length).toBeGreaterThan(4);
  });

  it('conserva tanda, preguntas y progreso al regresar; separa las dos páginas de Lagrange', () => {
    const servicio = new PracticaM3Service();
    const tanda = servicio.tanda('lagrange',lag);
    const e = tanda()[0];
    servicio.guardarPaso(e.id,3);
    expect(servicio.tanda('lagrange',lag)()).toBe(tanda());
    expect(servicio.pasoDe(e.id)).toBe(3);
    expect(servicio.tanda('lagrange-nuevo',lag)().some(n=>n.id===e.id)).toBeFalse();
  });
});
