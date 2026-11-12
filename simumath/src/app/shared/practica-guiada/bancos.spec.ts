import { CATALOGO_MODULO1 } from '../../components/modulo1/autoevaluacion/bancos/catalogo';
import { crearBancoSistemas } from '../../components/modulo2/autoevaluacion/crear-banco';
import { EJERCICIOS_GAUSS } from '../../components/modulo2/tipos/directos/gauss/gauss.contenido';
import { EJERCICIOS_LU } from '../../components/modulo2/tipos/directos/lu/lu.contenido';
import { ejecutarGauss } from '../../components/modulo2/tipos/directos/gauss/gauss.algoritmo';
import { ejecutarLu } from '../../components/modulo2/tipos/directos/lu/lu.algoritmo';
import { parsearFuncion } from '../domain/numerico/evaluador-funciones';
import { SesionPracticaService } from './sesion-practica.service';
import type { ConGuia } from './modelos';
import type { EjercicioBase } from '../models/metodo.model';
const sistemas=[{metodo:'gauss' as const,banco:crearBancoSistemas(EJERCICIOS_GAUSS,'gauss')},{metodo:'lu' as const,banco:crearBancoSistemas(EJERCICIOS_LU,'lu')}];
describe('Bancos de los módulos 1 y 2',()=>{
  it('ofrece 24 ejercicios por cada uno de los ocho métodos con preguntas válidas y soluciones finitas',()=>{
    const bancos:ConGuia<EjercicioBase>[][]=[...CATALOGO_MODULO1.map(g=>g.banco),...sistemas.map(g=>g.banco)];
    for(const banco of bancos){
      expect(banco.length).toBe(24);
      expect(new Set(banco.map(e=>e.id)).size).toBe(24);
      expect(banco.filter(e=>e.tipo==='casuistica').length).toBeGreaterThanOrEqual(6);
      for(const e of banco){
        expect(e.guia.length).toBeGreaterThanOrEqual(4);
        expect(e.cuestionario!.length).toBeGreaterThanOrEqual(11);
        expect(new Set(e.cuestionario!.map(p=>p.id)).size).toBe(e.cuestionario!.length);
        for(const p of e.cuestionario!){expect(p.opciones.filter(o=>o.id===p.correcta).length).toBe(1);expect(new Set(p.opciones.map(o=>o.texto)).size).toBe(p.opciones.length);}
        const valores=e.resolucion?.valorCorrecto;if(valores!==undefined)expect((Array.isArray(valores)?valores.flat():[valores]).every(Number.isFinite)).toBeTrue();
      }
    }
  });
  it('comprueba cada raíz y punto fijo en su ecuación original',()=>{
    for(const grupo of CATALOGO_MODULO1)for(const e of grupo.banco){
      const fn=parsearFuncion(e.calculo.funcion);
      const r=e.resolucion!.valorCorrecto;const valores=(Array.isArray(r)?r:[r]) as number[];
      for(const x of valores)expect(Math.abs(grupo.metodo==='punto-fijo'?fn(x)-x:fn(x))).withContext(e.id).toBeLessThan(.01);
    }
  });
  it('verifica los vectores, la eliminación y las sustituciones visuales de Gauss y LU',()=>{
    for(const grupo of sistemas)for(const e of grupo.banco){
      const {A,b}=e.calculo;
      if(!e.resolucion){expect(e.id).toBe('gauss-ex-3');expect(e.conclusion).toBe('Infinitas soluciones.');continue;}
      const x=e.resolucion.valorCorrecto as number[];
      A.forEach((fila,i)=>expect(fila.reduce((s,a,j)=>s+a*x[j],0)).withContext(e.id).toBeCloseTo(b[i],7));
      const motor=grupo.metodo==='gauss'?ejecutarGauss(e.calculo):ejecutarLu(e.calculo);
      x.forEach((v,i)=>expect(v).toBeCloseTo(motor.solucion![i],8));
      for(let i=0;i<x.length;i++){
        const paso=e.guia.find(p=>p.titulo===`Sustitución atrás · x${i+1}`)!;
        expect(Number(paso.resultado.split('≈')[1])).toBeCloseTo(x[i],7);
      }
      if(grupo.metodo==='lu'){
        const fact=e.guia.find(p=>p.titulo==='Revisar la factorización')!;
        const [L,U]=fact.matrices!.map(m=>m.valores);
        A.forEach((fila,i)=>fila.forEach((a,j)=>expect(L[i].reduce((s,l,k)=>s+l*U[k][j],0)).toBeCloseTo(a,7)));
      }
    }
  });
  it('elige tandas disjuntas de seis con cuatro preguntas sin mutar el banco; conserva progreso',()=>{
    const s=new SesionPracticaService(),banco=CATALOGO_MODULO1[0].banco,tanda=s.tanda('prueba',banco);
    const primera=tanda();expect(primera.length).toBe(6);
    expect(primera.filter(e=>e.tipo==='numerico').length).toBe(3);
    primera.forEach(e=>expect(e.cuestionario!.length).toBe(4));
    s.guardar(primera[0].id,2);expect(s.tanda('prueba',banco)()).toBe(primera);expect(s.paso(primera[0].id)).toBe(2);
    s.renovar('prueba',banco);expect(tanda().some(e=>primera.some(p=>p.id===e.id))).toBeFalse();
    expect(banco.every(e=>e.cuestionario!.length>=11)).toBeTrue();
  });
});
