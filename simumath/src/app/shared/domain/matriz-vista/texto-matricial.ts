import { Component, computed, input } from '@angular/core';
import { MatrizVista } from './matriz-vista';
export function leerFilaMatriz(texto: string): { valores: number[]; aumentada: boolean } | undefined {
  const normal = texto.trim().replace(/−/g, '-').replace(/[\[\]]/g, '');
  if (!/^[\d.eE+\-\s,;|]+$/.test(normal)) return undefined;
  const partes = normal.split(/[\s,;|]+/).filter(Boolean);
  const valores = partes.map(Number);
  return partes.length && valores.every(Number.isFinite) ? { valores, aumentada: normal.includes('|') } : undefined;
}
export interface FragmentoMatricial {
  texto?: string;
  matrices?: { titulo: string; valores: number[][]; aumentada: boolean }[];
}
/** Reconoce los bloques numéricos de los contenidos existentes, sin interpretar prosa como una matriz. */
export function separarMatrices(texto: string): FragmentoMatricial[] {
  const fragmentos: FragmentoMatricial[] = [];
  let bloque: NonNullable<FragmentoMatricial['matrices']> = [];
  const cerrar = () => { if (bloque.length) fragmentos.push({ matrices: bloque }); bloque = []; };
  const agregarTexto = (t: string) => {
    if (!t.trim()) return;
    const anterior = fragmentos[fragmentos.length - 1];
    if (anterior?.texto !== undefined) anterior.texto += '\n' + t;
    else fragmentos.push({ texto: t });
  };
  // Formato JSON de los parámetros históricos.
  try {
    const json = JSON.parse(texto);
    const matriz = Array.isArray(json) && json.every(v => typeof v === 'number') ? json.map(v => [v]) : json;
    if (Array.isArray(matriz) && matriz.length && matriz.every(f => Array.isArray(f) && f.every(v => typeof v === 'number' && Number.isFinite(v))))
      return [{ matrices: [{ titulo: '', valores: matriz, aumentada: false }] }];
  } catch { /* El resto del contenido son párrafos y bloques entre corchetes. */ }
  for (const linea of texto.split('\n')) {
    const matches = [...linea.matchAll(/(?:([A-Za-z])\s*=\s*)?\[([^\[\]]+)\]/g)];
    const filas = matches.map(m => leerFilaMatriz(m[2]));
    if (!matches.length || filas.some(f => !f)) { cerrar(); agregarTexto(linea); continue; }
    const resto = linea.replace(/(?:([A-Za-z])\s*=\s*)?\[([^\[\]]+)\]/g, '').trim();
    if (resto) { cerrar(); agregarTexto(resto); }
    if (bloque.length && (bloque.length !== filas.length || matches.some(m => m[1]))) cerrar();
    filas.forEach((fila, i) => {
      if (!bloque[i]) bloque[i] = { titulo: matches[i][1] || '', valores: [], aumentada: fila!.aumentada };
      if (bloque[i].valores.length && bloque[i].valores[0].length !== fila!.valores.length) { cerrar(); bloque[i] = { titulo: matches[i][1] || '', valores: [], aumentada: fila!.aumentada }; }
      bloque[i].valores.push(fila!.valores);
    });
  }
  cerrar();
  return fragmentos;
}
@Component({
  selector: 'app-texto-matricial', standalone: true, imports: [MatrizVista],
  template: `@for (parte of partes(); track $index) {
    @if (parte.texto) { <p>{{ parte.texto }}</p> }
    @if (parte.matrices) { <div class="grupo-matrices">@for (matriz of parte.matrices; track $index) {
      <app-matriz-vista [valores]="matriz.valores" [titulo]="matriz.titulo" [aumentada]="matriz.aumentada" />
    }</div> }
  }`,
  styles: [`:host{display:block;min-width:0} p{margin:.35rem 0;line-height:1.7;white-space:pre-line;overflow-wrap:anywhere}.grupo-matrices{display:flex;flex-wrap:wrap;gap:1.5rem 2.5rem;margin:1rem 0;align-items:flex-start}.grupo-matrices>*{max-width:100%}`],
})
export class TextoMatricial {
  readonly texto = input.required<string>();
  readonly partes = computed(() => separarMatrices(this.texto()));
}
