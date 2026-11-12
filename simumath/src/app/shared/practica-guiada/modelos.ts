import type { EjercicioBase, PreguntaCuestionarioAuto } from '../models/metodo.model';
export type PreguntaPractica = PreguntaCuestionarioAuto;
export interface CuentaPractica { etiqueta: string; expresion?: string; numerador?: string; denominador?: string; }
export interface MatrizPractica { titulo: string; valores: number[][]; aumentada?: boolean; fila?: number; columna?: number; }
export interface GraficoPractica {
  curva: {x:number;y:number}[];
  puntos: {x:number;y:number;etiqueta:string}[];
  lineas?: {x:number;y:number}[][];
  intervalo?: [number,number];
  identidad?: boolean;
}
export interface EtapaPractica {
  titulo: string;
  explicacion: string;
  cuentas: CuentaPractica[];
  resultado: string;
  pregunta?: PreguntaPractica;
  matrices?: MatrizPractica[];
  grafico?: GraficoPractica;
}
export type ConGuia<T extends EjercicioBase = EjercicioBase> = T & { guia: EtapaPractica[] };
export const numeroTexto = (n:number): string => !Number.isFinite(n) ? '—' : Number(n.toFixed(8)).toString();
export function pregunta(id:string, enunciado:string, correcta:string, otras:string[], explicacion:string): PreguntaPractica {
  return {id, enunciado, tipo:'opcion-multiple', correcta:'a', explicacion,
    opciones:[correcta,...otras].map((texto,i)=>({id:String.fromCharCode(97+i),texto}))};
}
export function preguntaNumero(id:string, enunciado:string, valor:number, explicacion:string): PreguntaPractica {
  const salto = Math.max(0.5,Math.abs(valor)*0.2);
  return pregunta(id,enunciado,numeroTexto(valor),[valor+salto,valor-salto,valor+2*salto].map(numeroTexto),explicacion);
}
