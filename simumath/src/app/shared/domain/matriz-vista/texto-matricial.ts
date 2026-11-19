import { Component, computed, input } from '@angular/core';
import { GrupoMatrices, type MatrizPresentada } from './grupo-matrices';

export function leerFilaMatriz(texto: string): { valores: number[]; aumentada: boolean } | undefined {
  const normal = texto.trim().replace(/−/g, '-').replace(/^\[|\]$/g, '').trim();
  if (!/^[\d.eE+\-\s,;|]+$/.test(normal)) return undefined;
  const partes = normal.split(/[\s,;|]+/).filter(Boolean);
  const valores = partes.map(Number);
  const lados = normal.split('|');
  if (lados.length > 2 || (lados.length === 2 &&
    (!lados[0].trim() || !lados[1].trim() || lados[1].trim().split(/[\s,;]+/).length !== 1))) {
    return undefined;
  }
  return partes.length && valores.every(Number.isFinite)
    ? { valores, aumentada: lados.length === 2 }
    : undefined;
}

interface MatrizTexto extends MatrizPresentada {
  aumentada: boolean;
}

export interface FragmentoMatricial {
  texto?: string;
  matrices?: MatrizTexto[];
  enLinea?: boolean;
}

function leerMatriz(texto: string): MatrizTexto | undefined {
  const normal = texto.replace(/−/g, '-');
  if (/^\[\s*\[/.test(normal)) {
    try {
      const valores: unknown = JSON.parse(normal);
      if (Array.isArray(valores) && valores.length && valores.every(f =>
        Array.isArray(f) && f.length > 0 && f.length === valores[0].length &&
        f.every(v => typeof v === 'number' && Number.isFinite(v)))) {
        return { titulo: '', valores, aumentada: false };
      }
    } catch { /* Un bloque inválido se conserva como texto. */ }
    return undefined;
  }
  const filas = normal.slice(1, -1).split(';').map(leerFilaMatriz);
  if (filas.some(f => !f) || !filas[0]) return undefined;
  const primera = filas[0];
  if (filas.some(f => f!.valores.length !== primera.valores.length || f!.aumentada !== primera.aumentada)) {
    return undefined;
  }
  return { titulo: '', valores: filas.map(f => f!.valores), aumentada: primera.aumentada };
}

/** Reconoce matrices numéricas y conserva la prosa y los operadores en su orden original. */
export function separarMatrices(texto: string): FragmentoMatricial[] {
  const fragmentos: FragmentoMatricial[] = [];
  let bloque: MatrizTexto[] = [];
  const cerrar = () => {
    if (bloque.length) fragmentos.push({ matrices: bloque });
    bloque = [];
  };
  const agregarTexto = (t: string) => {
    if (!t) return;
    const anterior = fragmentos[fragmentos.length - 1];
    if (anterior?.texto !== undefined) anterior.texto += t;
    else if (t.trim()) fragmentos.push({ texto: t });
  };

  // Los parámetros históricos guardan b como vector JSON; se muestra en columna.
  try {
    const vector: unknown = JSON.parse(texto.replace(/−/g, '-'));
    if (Array.isArray(vector) && vector.length && vector.every(v => typeof v === 'number' && Number.isFinite(v))) {
      return [{ matrices: [{ titulo: '', valores: vector.map(v => [v]), aumentada: false }] }];
    }
  } catch { /* También se admiten filas entre corchetes dentro de párrafos. */ }

  const lineas = texto.split('\n');
  lineas.forEach((linea, indice) => {
    const patron = /(?:\b([A-Za-z])\s*=\s*)?(\[\s*\[[^\[\]\n]+\](?:\s*,\s*\[[^\[\]\n]+\])*\s*\]|\[[^\[\]\n]+\])/g;
    const coincidencias = [...linea.matchAll(patron)];
    const matrices = coincidencias.map(m => leerMatriz(m[2]));
    const soloMatrices = coincidencias.length > 0 && matrices.every(Boolean) && !linea.replace(patron, '').trim();
    if (soloMatrices) {
      const anterior = fragmentos[fragmentos.length - 1];
      if (anterior?.texto !== undefined) anterior.texto = anterior.texto.trimEnd();
      const nuevas = matrices as MatrizTexto[];
      const continuacion = bloque.length === nuevas.length && nuevas.every((m, i) =>
        !coincidencias[i][1] && m.valores.length === 1 &&
        m.valores[0].length === bloque[i].valores[0].length && m.aumentada === bloque[i].aumentada);
      if (!continuacion) cerrar();
      nuevas.forEach((m, i) => {
        if (continuacion) bloque[i].valores.push(...m.valores);
        else bloque.push({ ...m, titulo: coincidencias[i][1] || '' });
      });
      if (nuevas.some(m => m.valores.length > 1)) cerrar();
      return;
    }

    cerrar();
    let inicio = 0;
    coincidencias.forEach((m, i) => {
      const matriz = matrices[i];
      if (!matriz) return;
      agregarTexto(linea.slice(inicio, m.index));
      fragmentos.push({ matrices: [{ ...matriz, titulo: m[1] || '' }], enLinea: true });
      inicio = m.index! + m[0].length;
    });
    agregarTexto(linea.slice(inicio) + (indice < lineas.length - 1 ? '\n' : ''));
  });
  cerrar();
  return fragmentos;
}

@Component({
  selector: 'app-texto-matricial', standalone: true, imports: [GrupoMatrices],
  template: `@for (parte of partes(); track $index) {
    @if (parte.texto) { <span class="texto">{{ parte.texto }}</span> }
    @if (parte.matrices) {
      <app-grupo-matrices [matrices]="parte.matrices" [compacta]="compacta()" [class.en-linea]="parte.enLinea" />
    }
  }`,
  styles: [`
    :host { display:block; min-width:0; max-width:100%; line-height:1.7; }
    .texto { white-space:pre-line; overflow-wrap:anywhere; }
    app-grupo-matrices { margin:.75rem 0; }
    app-grupo-matrices.en-linea { display:inline-block; vertical-align:middle; margin:.5rem .35rem; max-width:calc(100% - .7rem); }
  `],
})
export class TextoMatricial {
  readonly texto = input.required<string>();
  readonly compacta = input(false);
  readonly partes = computed(() => {
    const partes = separarMatrices(this.texto());
    const grupos: FragmentoMatricial[] = [];
    for (let i = 0; i < partes.length; i++) {
      const parte = partes[i];
      if (!parte.enLinea || !parte.matrices) { grupos.push(parte); continue; }
      const matrices = [...parte.matrices];
      // Conserva productos e igualdades completos en una misma fila desplazable.
      while (i + 2 < partes.length && /^\s*(?:[=·×+−→↔-]|y)\s*$/.test(partes[i + 1].texto ?? '') &&
        partes[i + 2].enLinea && partes[i + 2].matrices) {
        matrices.push(...partes[i + 2].matrices!.map((m, j) => ({
          ...m, operador: j === 0 ? partes[i + 1].texto!.trim() : undefined,
        })));
        i += 2;
      }
      grupos.push({ matrices, enLinea: true });
    }
    return grupos;
  });
}
