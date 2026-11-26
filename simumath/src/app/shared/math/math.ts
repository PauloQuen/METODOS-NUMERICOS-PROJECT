import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import katex from 'katex';

/**
 * Renderiza una fórmula LaTeX/TeX con KaTeX.
 *
 * ── Uso ──────────────────────────────────────────────────────────────
 *   <app-math tex="\frac{h}{2}\left[f(x_0)+f(x_n)\right]" />
 *   <app-math tex="\int_a^b f(x)\,dx" [display]="true" />
 *
 * `display` pone la fórmula en modo bloque (centrada, más grande). Por
 * defecto va en línea, para mezclarse con el texto.
 *
 * ── Seguridad ────────────────────────────────────────────────────────
 * 1. `trust: false` desactiva los comandos de KaTeX que pueden generar
 *    enlaces o HTML (`\href`, `\html`, `\includegraphics`). El TeX no
 *    puede escapar de KaTeX.
 * 2. La salida de KaTeX es HTML generado por la librería, no por el
 *    usuario: no interpola texto sin escapar. Por eso se marca como
 *    confiable para Angular con `bypassSecurityTrustHtml`. Sin eso, el
 *    sanitizador borraría los `style` de espaciado de KaTeX y la fórmula
 *    quedaría mal maquetada.
 * 3. `throwOnError: false`: un TeX inválido se muestra en rojo, no rompe
 *    la pantalla. Además el `catch` deja un fallback en texto plano.
 */
@Component({
  selector: 'app-math',
  standalone: true,
  template: `
    <span
      class="math"
      [class.math--display]="display()"
      [attr.aria-label]="etiqueta()"
      role="math"
    >
      <span class="math__html" [innerHTML]="html()"></span>
    </span>
  `,
  styles: [
    `
      :host {
        display: inline;
      }
      :host(:has(.math--display)) {
        display: block;
      }
      .math {
        display: inline;
      }
      .math--display {
        display: block;
        max-width: 100%;
        overflow-x: auto;
        overflow-y: hidden;
        padding: 0.35rem 0.1rem;
      }
      .math__html {
        display: inline;
      }
      .math--display .math__html {
        display: block;
        min-width: max-content;
      }
      /* KaTeX hereda el color del texto, así funciona en claro y oscuro. */
      .math ::ng-deep .katex {
        font-size: 1.05em;
      }
      .math--display ::ng-deep .katex-display {
        margin: 0;
      }
    `,
  ],
})
export class MathFormula {
  /** La fórmula en TeX, sin los delimitadores `$`. */
  readonly tex = input.required<string>();

  /** true = modo bloque; false = en línea. */
  readonly display = input(false);

  /**
   * Texto alternativo para lectores de pantalla. Si no se pasa, se arma
   * una versión legible quitando las órdenes de TeX.
   */
  readonly ariaLabel = input<string>('');

  private readonly sanitizer = inject(DomSanitizer);

  readonly etiqueta = computed(() => this.ariaLabel() || textoLegible(this.tex()));

  readonly html = computed<SafeHtml>(() => {
    const tex = (this.tex() ?? '').trim();
    if (tex === '') return '';
    try {
      const salida = katex.renderToString(tex, {
        displayMode: this.display(),
        throwOnError: false,
        strict: 'ignore',
        trust: false,
        output: 'html',
      });
      return this.sanitizer.bypassSecurityTrustHtml(salida);
    } catch {
      // Fallback: nunca una pantalla en blanco.
      return this.sanitizer.bypassSecurityTrustHtml(escapar(tex));
    }
  });
}

function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Convierte TeX básico en algo que se pueda leer con voz alta. */
export function textoLegible(tex: string): string {
  return (tex ?? '')
    .replace(/\\left|\\right/g, '')
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1 dividido $2')
    .replace(/\\sqrt\{([^{}]*)\}/g, 'raíz de $1')
    .replace(/\\sum/g, 'sumatoria')
    .replace(/\\int/g, 'integral')
    .replace(/\\cdot/g, 'por')
    .replace(/\\times/g, 'por')
    .replace(/\\,|\\;|\\!/g, ' ')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
