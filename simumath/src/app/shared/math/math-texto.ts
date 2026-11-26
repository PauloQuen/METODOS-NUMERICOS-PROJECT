import { Component, computed, input } from '@angular/core';
import { MathFormula } from './math';

/** Un tramo del texto: o es prosa, o es una fórmula. */
interface Segmento {
  tipo: 'texto' | 'formula';
  contenido: string;
  display: boolean;
}

/**
 * Texto mixto: prosa con fórmulas TeX entre `$…$` (en línea) y `$$…$$`
 * (en bloque).
 *
 *   <app-math-texto [texto]="'El error es $O(h^2)$ en el trapecio.'" />
 *
 * Es la convención única de todo el Módulo 5: el contenido se escribe
 * como un string normal y este componente se encarga de los delimitadores.
 * Así no hay que partir cada párrafo en cinco componentes.
 *
 * Si el texto no tiene `$`, se muestra tal cual: no hay costo por usarlo
 * en prosa sin matemática.
 */
@Component({
  selector: 'app-math-texto',
  standalone: true,
  imports: [MathFormula],
  template: `
    @for (segmento of segmentos(); track $index) {
      @if (segmento.tipo === 'texto') {
        <span>{{ segmento.contenido }}</span>
      } @else {
        <app-math [tex]="segmento.contenido" [display]="segmento.display" />
      }
    }
  `,
})
export class MathTexto {
  readonly texto = input.required<string>();

  readonly segmentos = computed(() => segmentar(this.texto()));
}

/**
 * Parte el texto en prosa y fórmulas.
 *
 * El orden de las alternativas importa: `$$` se prueba antes que `$`,
 * porque si no el bloque se leería como dos fórmulas en línea vacías.
 */
export function segmentar(texto: string): Segmento[] {
  if (!texto.includes('$')) {
    return [{ tipo: 'texto', contenido: texto, display: false }];
  }

  const partes = texto.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  const segmentos: Segmento[] = [];

  for (const parte of partes) {
    if (parte === '') continue;

    if (parte.startsWith('$$') && parte.endsWith('$$')) {
      segmentos.push({
        tipo: 'formula',
        contenido: parte.slice(2, -2).trim(),
        display: true,
      });
    } else if (parte.startsWith('$') && parte.endsWith('$') && parte.length > 2) {
      segmentos.push({
        tipo: 'formula',
        contenido: parte.slice(1, -1).trim(),
        display: false,
      });
    } else {
      segmentos.push({ tipo: 'texto', contenido: parte, display: false });
    }
  }

  return segmentos;
}
