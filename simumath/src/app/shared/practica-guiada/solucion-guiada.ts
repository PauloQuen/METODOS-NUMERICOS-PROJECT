import { MatrizVista } from '../domain/matriz-vista/matriz-vista';
import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, signal, type TemplateRef } from '@angular/core';
import { FormulaMatematica } from './formula-matematica';
import type { EtapaPractica } from './modelos';
import { numeroTexto } from './modelos';
import { SesionPracticaService } from './sesion-practica.service';
@Component({
  selector:'app-solucion-guiada',standalone:true,imports:[NgTemplateOutlet,FormulaMatematica,MatrizVista],
  templateUrl:'./solucion-guiada.html',styleUrl:'./solucion-guiada.scss',
})
export class SolucionGuiada {
  readonly ejercicioId=input.required<string>();
  readonly etapas=input.required<EtapaPractica[]>();
  readonly desarrollo=input.required<TemplateRef<unknown>>();
  private readonly sesion=inject(SesionPracticaService);
  readonly indice=computed(()=>this.sesion.paso(this.ejercicioId()));
  readonly actual=computed(()=>this.etapas()[this.indice()]);
  readonly completa=computed(()=>this.indice()>=this.etapas().length);
  readonly elegida=signal('');readonly comprobada=signal(false);readonly operaciones=signal(1);readonly replay=signal(0);
  readonly acierto=computed(()=>this.comprobada() && this.elegida()===this.actual()?.pregunta?.correcta);
  readonly cuentas=computed(()=>this.actual()?.cuentas.slice(0,this.operaciones())??[]);
  readonly grafico=computed(()=>{
    const g=this.actual()?.grafico;if(!g)return undefined;
    const todos=[...g.curva,...g.puntos,...(g.lineas??[]).flat(),{x:0,y:0}];
    const xs=todos.map(p=>p.x),ys=todos.map(p=>p.y);
    const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
    const dx=Math.max(xmax-xmin,.1)*1.16,dy=Math.max(ymax-ymin,.1)*1.16;
    const sx=(x:number)=>40+310*(x-xmin+(dx-(xmax-xmin))/2)/dx;
    const sy=(y:number)=>205-170*(y-ymin+(dy-(ymax-ymin))/2)/dy;
    const path=(ps:{x:number;y:number}[])=>ps.map((p,i)=>`${i?'L':'M'}${sx(p.x)},${sy(p.y)}`).join(' ');
    return {curva:path(g.curva),puntos:g.puntos.map(p=>({...p,cx:sx(p.x),cy:sy(p.y)})),
      lineas:(g.lineas??[]).map(path),x0:sx(0),y0:sy(0),
      xmin:numeroTexto(xmin),xmax:numeroTexto(xmax),
      intervalo:g.intervalo?{a:sx(g.intervalo[0]),b:sx(g.intervalo[1])}:undefined};
  });
  elegir(id:string):void{this.elegida.set(id);this.comprobada.set(false);}
  comprobar():void{if(this.elegida())this.comprobada.set(true);}
  mostrar():void{this.operaciones.update(n=>Math.min(n+1,this.actual()?.cuentas.length??0));}
  repetir():void{this.operaciones.set(1);this.replay.update(n=>n+1);}
  siguiente():void{if(this.completa()||(this.actual()?.pregunta&&!this.acierto()))return;this.mover(this.indice()+1);}
  anterior():void{this.mover(Math.max(0,this.indice()-1));}
  reiniciar():void{this.mover(0);}
  private mover(n:number):void{this.sesion.guardar(this.ejercicioId(),n);this.elegida.set('');this.comprobada.set(false);this.repetir();}
  readonly f=numeroTexto;
}
