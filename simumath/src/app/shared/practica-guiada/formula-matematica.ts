import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
export interface NodoFormula { tipo:'texto'|'fila'|'fraccion'|'potencia'|'raiz'; texto?:string; hijos?:NodoFormula[]; }
const fila = (hijos:NodoFormula[]):NodoFormula => ({tipo:'fila',hijos});
/** Parser de presentación: nunca evalúa expresiones ni genera HTML con los datos. */
export function analizarFormula(texto:string):NodoFormula {
  if (!/[=+*/^√∛−↔←≤≥]/.test(texto)) return {tipo:'texto', texto};
  const tokens=texto.match(/\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|sqrt|√|[\p{L}]+|[^\s]/gu)??[];
  let i=0;
  const atomo=():NodoFormula=>{
    const t=tokens[i++]; if(t===undefined)return {tipo:'texto',texto:''};
    if(t==='(' || t==='[' || t==='{') {
      const cierre=t==='('?')':t==='['?']':'}'; const interior=grupo(cierre);
      if(tokens[i]===cierre)i++;
      return fila([{tipo:'texto',texto:t},interior,{tipo:'texto',texto:cierre}]);
    }
    if(t==='sqrt'||t==='√'||t==='∛')return {tipo:'raiz',texto:t==='∛'?'3':undefined,hijos:[atomo()]};
    if((t==='-'||t==='−') && i<tokens.length)return fila([{tipo:'texto',texto:'−'},atomo()]);
    return {tipo:'texto',texto:t==='*'?'·':t};
  };
  const potencia=():NodoFormula=>{
    let n=atomo();
    if(tokens[i]==='^') {i++;n={tipo:'potencia',hijos:[n,potencia()]};}
    return n;
  };
  const grupo=(cierre?:string):NodoFormula=>{
    const nodos:NodoFormula[]=[];
    while(i<tokens.length && tokens[i]!==cierre) {
      let n=potencia();
      while(tokens[i]==='/') {i++;n={tipo:'fraccion',hijos:[n,potencia()]};}
      nodos.push(n);
    }
    return fila(nodos);
  };
  return grupo();
}
@Component({
  selector:'app-formula-matematica', standalone:true, imports:[NgTemplateOutlet],
  template:`
    <math xmlns="http://www.w3.org/1998/Math/MathML" [attr.aria-label]="texto()" display="block">
      <math:mtable columnalign="left">
        @for(linea of lineas();track $index) {
          <math:mtr><math:mtd><ng-container *ngTemplateOutlet="nodo; context:{$implicit:linea}" /></math:mtd></math:mtr>
        }
      </math:mtable>
    </math>
    <ng-template #nodo let-n>
      @switch(n.tipo) {
        @case('fraccion') { <math:mfrac><math:mrow><ng-container *ngTemplateOutlet="nodo;context:{$implicit:n.hijos[0]}" /></math:mrow><math:mrow><ng-container *ngTemplateOutlet="nodo;context:{$implicit:n.hijos[1]}" /></math:mrow></math:mfrac> }
        @case('potencia') { <math:msup><math:mrow><ng-container *ngTemplateOutlet="nodo;context:{$implicit:n.hijos[0]}" /></math:mrow><math:mrow><ng-container *ngTemplateOutlet="nodo;context:{$implicit:n.hijos[1]}" /></math:mrow></math:msup> }
        @case('raiz') {
          @if(n.texto) { <math:mroot><math:mrow><ng-container *ngTemplateOutlet="nodo;context:{$implicit:n.hijos[0]}" /></math:mrow><math:mn>{{n.texto}}</math:mn></math:mroot> }
          @else { <math:msqrt><ng-container *ngTemplateOutlet="nodo;context:{$implicit:n.hijos[0]}" /></math:msqrt> }
        }
        @case('fila') { <math:mrow>@for(hijo of n.hijos;track $index) { <ng-container *ngTemplateOutlet="nodo;context:{$implicit:hijo}" /> }</math:mrow> }
        @default { <math:mtext>{{n.texto}}</math:mtext> }
      }
    </ng-template>
  `,
  styles:[`:host{display:block;max-width:100%;overflow-x:auto;padding:.5rem .15rem} math{font-size:1.2em;font-family:'Cambria Math',math,serif;min-width:max-content;margin:0} mfrac{padding:0 .15em} mtext{white-space:pre} :host:focus-visible{outline:2px solid var(--primary)}`],
})
export class FormulaMatematica {
  readonly texto=input.required<string>();
  readonly lineas=computed(()=>this.texto().split(/\n+/).map(analizarFormula));
}
