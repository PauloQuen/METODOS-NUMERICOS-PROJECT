import { Injectable, signal, type WritableSignal } from '@angular/core';
import type { EjercicioBase } from '../models/metodo.model';
import type { ConGuia, PreguntaPractica } from './modelos';
export function mezclar<T>(valores:readonly T[], azar:()=>number=Math.random):T[] {
  const copia=[...valores];
  for(let i=copia.length-1;i>0;i--) { const j=Math.floor(azar()*(i+1)); [copia[i],copia[j]]=[copia[j],copia[i]]; }
  return copia;
}
const mezclarOpciones = (p:PreguntaPractica):PreguntaPractica => ({...p,opciones:mezclar(p.opciones)});
@Injectable({providedIn:'root'})
export class SesionPracticaService {
  private readonly tandas = new Map<string,WritableSignal<ConGuia<EjercicioBase>[]>>();
  private readonly preparados = new Map<string,ConGuia<EjercicioBase>>();
  private readonly progresos = signal<Record<string,number>>({});
  tanda<T extends EjercicioBase>(clave:string,banco:ConGuia<T>[]):WritableSignal<ConGuia<T>[]> {
    if(!this.tandas.has(clave)) { this.tandas.set(clave,signal<ConGuia<EjercicioBase>[]>([])); this.renovar(clave,banco); }
    return this.tandas.get(clave)! as WritableSignal<ConGuia<T>[]>;
  }
  renovar<T extends EjercicioBase>(clave:string,banco:ConGuia<T>[]):void {
    const tanda=this.tandas.get(clave); if(!tanda)return;
    const previos=new Set(tanda().map(e=>e.id));
    const candidatos=banco.filter(e=>!previos.has(`${clave}:${e.id}`));
    const elegidos=(['numerico','casuistica'] as const).flatMap(tipo=>mezclar(candidatos.filter(e=>e.tipo===tipo)).slice(0,3));
    tanda.set(mezclar(elegidos).map(e=>{
      const id=`${clave}:${e.id}`;
      if(!this.preparados.has(id)) this.preparados.set(id,{...e,id,
        cuestionario:mezclar(e.cuestionario??[]).slice(0,4).map(mezclarOpciones),
        guia:e.guia.map(p=>({...p,pregunta:p.pregunta?mezclarOpciones(p.pregunta):undefined}))});
      return this.preparados.get(id)!;
    }));
  }
  paso(id:string):number { return this.progresos()[id]??0; }
  guardar(id:string,paso:number):void { this.progresos.update(p=>({...p,[id]:paso})); }
}
