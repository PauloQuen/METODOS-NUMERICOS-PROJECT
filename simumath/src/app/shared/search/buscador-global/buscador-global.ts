import {
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IndiceBusquedaService } from '../indice-busqueda.service';
import { normalizar } from '../normalizacion';
import type { GrupoResultados, ResultadoBusqueda } from '../modelos';

/** Un resultado con su índice global (el que usa `aria-activedescendant`). */
interface ResultadoConIndice {
  resultado: ResultadoBusqueda;
  indice: number;
}

interface GrupoConIndices {
  etiqueta: string;
  resultados: ResultadoConIndice[];
}

/**
 * BUSCADOR GLOBAL DEL PORTAL.
 *
 * ── Patrón de accesibilidad ───────────────────────────────────────────
 * Es un combobox con listbox: el foco NUNCA sale del `<input>`; la
 * opción activa se anuncia con `aria-activedescendant`. Eso permite
 * recorrer los resultados con flechas sin que el foco salte de elemento
 * y sin romper el `Tab` (que cierra el panel y sigue el recorrido
 * normal de la página). El total de resultados se anuncia por
 * `aria-live="polite"`.
 *
 * ── Estados ───────────────────────────────────────────────────────────
 * reposo · foco · cargando el índice · con resultados · sin resultados ·
 * error. Cada uno tiene su texto: nunca se deja un panel vacío sin
 * explicación.
 *
 * ── Búsquedas recientes ───────────────────────────────────────────────
 * Solo en memoria. El portal no usa `localStorage` en ninguna parte y no
 * se va a introducir aquí para guardar historial de lectura.
 */
@Component({
  selector: 'app-buscador-global',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './buscador-global.html',
  styleUrl: './buscador-global.scss',
  host: {
    '(document:keydown)': 'atajoGlobal($event)',
  },
})
export class BuscadorGlobal {
  private readonly router = inject(Router);
  private readonly indice = inject(IndiceBusquedaService);
  private readonly entrada = viewChild<ElementRef<HTMLInputElement>>('entrada');

  /** Texto escrito. */
  readonly consulta = signal('');

  /** ¿El panel de resultados está visible? */
  readonly abierto = signal(false);

  /** Resultados agrupados, ya puntuados. */
  readonly grupos = signal<GrupoResultados[]>([]);

  /** Índice global de la opción activa (para teclado). */
  readonly activo = signal(0);

  readonly buscando = signal(false);
  readonly error = signal<string | null>(null);

  /** Últimas búsquedas de la sesión (máximo 4). */
  readonly recientes = signal<string[]>([]);

  /** Sugerencias que se muestran en el estado inicial. */
  readonly sugerencias = signal<string[]>([
    'error relativo',
    'cifras significativas',
    'serie de Taylor',
    'propagación de errores',
    'Lagrange',
  ]);

  private temporizador: ReturnType<typeof setTimeout> | undefined;

  /** Los grupos con el índice global ya resuelto. */
  readonly gruposConIndices = computed<GrupoConIndices[]>(() => {
    let indice = 0;
    return this.grupos().map((grupo) => ({
      etiqueta: grupo.etiqueta,
      resultados: grupo.resultados.map((resultado) => ({ resultado, indice: indice++ })),
    }));
  });

  readonly totalResultados = computed(() =>
    this.grupos().reduce((total, grupo) => total + grupo.resultados.length, 0),
  );

  readonly opcionActivaId = computed(() => {
    if (this.totalResultados() === 0) return null;
    return `busqueda-op-${this.activo()}`;
  });

  readonly anuncio = computed(() => {
    if (this.buscando()) return 'Buscando…';
    if (this.error()) return this.error();
    if (normalizar(this.consulta()).length < 2) return '';
    const total = this.totalResultados();
    return total === 0
      ? 'No se encontraron resultados.'
      : `${total} resultado${total === 1 ? '' : 's'}. Usá las flechas para recorrerlos y Enter para abrir.`;
  });

  /** El alumno escribió. */
  alEscribir(valor: string): void {
    this.consulta.set(valor);
    this.abierto.set(true);
    this.programarBusqueda(valor);
  }

  /** Al enfocar se abre el panel y se adelanta la carga del índice. */
  alEnfocar(): void {
    void this.indice.asegurarContenido();
    if (this.consulta().trim().length >= 2) {
      this.abierto.set(true);
      this.programarBusqueda(this.consulta());
    }
  }

  /**
   * Al perder el foco se cierra el panel, SALVO que el foco se haya
   * movido a otro elemento del propio buscador (por ejemplo, al hacer
   * clic en un resultado). Sin esa excepción, el panel se cerraría en el
   * mousedown y el clic del enlace nunca llegaría.
   */
  alPerderFoco(evento: FocusEvent): void {
    const contenedor = evento.currentTarget as HTMLElement | null;
    const siguiente = evento.relatedTarget as Node | null;
    if (contenedor && siguiente && contenedor.contains(siguiente)) return;
    this.abierto.set(false);
  }

  limpiar(): void {
    this.consulta.set('');
    this.grupos.set([]);
    this.activo.set(0);
    this.error.set(null);
    this.abierto.set(true);
    this.entrada()?.nativeElement.focus();
  }

  /** Teclado del combobox. */
  alTeclear(evento: KeyboardEvent): void {
    switch (evento.key) {
      case 'ArrowDown':
        evento.preventDefault();
        this.mover(1);
        break;
      case 'ArrowUp':
        evento.preventDefault();
        this.mover(-1);
        break;
      case 'Home':
        if (this.totalResultados() > 0) {
          evento.preventDefault();
          this.activo.set(0);
        }
        break;
      case 'End':
        if (this.totalResultados() > 0) {
          evento.preventDefault();
          this.activo.set(this.totalResultados() - 1);
        }
        break;
      case 'Enter':
        evento.preventDefault();
        this.abrirActivo();
        break;
      case 'Escape':
        evento.preventDefault();
        this.abierto.set(false);
        break;
      case 'Tab':
        // No se intercepta: el panel se cierra y el foco sigue su curso.
        this.abierto.set(false);
        break;
    }
  }

  /** Atajos globales: `/` y Ctrl/Cmd+K. */
  atajoGlobal(evento: KeyboardEvent): void {
    const objetivo = evento.target as HTMLElement | null;
    const escribiendo =
      objetivo instanceof HTMLInputElement ||
      objetivo instanceof HTMLTextAreaElement ||
      objetivo?.isContentEditable;

    const esBarra = evento.key === '/' && !escribiendo && !evento.ctrlKey && !evento.metaKey;
    const esComando = (evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'k';

    if (!esBarra && !esComando) return;

    evento.preventDefault();
    this.entrada()?.nativeElement.focus();
    this.abierto.set(true);
    void this.indice.asegurarContenido();
  }

  /** Un clic en una sugerencia la busca. */
  usarSugerencia(texto: string): void {
    this.consulta.set(texto);
    this.abierto.set(true);
    this.programarBusqueda(texto);
    this.entrada()?.nativeElement.focus();
  }

  /** Se eligió un resultado. */
  elegir(resultado: ResultadoBusqueda): void {
    if (!resultado.ruta) return;

    this.recordar(this.consulta());
    this.abierto.set(false);
    void this.router.navigateByUrl(resultado.ruta);
  }

  /** ¿La opción está activa? (para `aria-selected` y la clase visual). */
  esActiva(indice: number): boolean {
    return this.activo() === indice;
  }

  /** ¿Hay algo que el panel deba mostrar? */
  readonly hayPanel = computed(
    () =>
      this.abierto() &&
      (this.buscando() ||
        !!this.error() ||
        this.totalResultados() > 0 ||
        this.consulta().trim().length >= 2),
  );

  /* ---------------------------------------------------------------- */
  /* Internos                                                          */
  /* ---------------------------------------------------------------- */

  private mover(delta: number): void {
    const total = this.totalResultados();
    if (total === 0) return;
    this.abierto.set(true);
    this.activo.update((actual) => {
      const siguiente = actual + delta;
      if (siguiente < 0) return total - 1;
      if (siguiente >= total) return 0;
      return siguiente;
    });
  }

  private abrirActivo(): void {
    if (!this.abierto()) {
      if (this.consulta().trim().length >= 2) {
        this.abierto.set(true);
        this.programarBusqueda(this.consulta());
      }
      return;
    }
    const resultado = this.resultadoPorIndice(this.activo());
    if (resultado) this.elegir(resultado);
  }

  private resultadoPorIndice(indice: number): ResultadoBusqueda | undefined {
    for (const grupo of this.grupos()) {
      if (indice < grupo.resultados.length) return grupo.resultados[indice];
      indice -= grupo.resultados.length;
    }
    return undefined;
  }

  private programarBusqueda(texto: string): void {
    if (this.temporizador) clearTimeout(this.temporizador);

    const limpio = texto.trim();
    if (normalizar(limpio).length < 2) {
      this.grupos.set([]);
      this.buscando.set(false);
      this.error.set(null);
      return;
    }

    // 120 ms: suficiente para no buscar en cada tecla, imperceptible para
    // quien escribe.
    this.temporizador = setTimeout(() => void this.ejecutar(limpio), 120);
  }

  private async ejecutar(texto: string): Promise<void> {
    this.buscando.set(true);
    this.error.set(null);

    try {
      await this.indice.asegurarContenido();

      // Si mientras cargaba el alumno siguió escribiendo, manda lo último.
      if (this.consulta().trim() !== texto) return;

      this.grupos.set(this.indice.buscar(texto));
      this.activo.set(0);
    } catch {
      this.error.set('No se pudo preparar el índice. Probá de nuevo en un momento.');
      this.grupos.set([]);
    } finally {
      if (this.consulta().trim() === texto) this.buscando.set(false);
    }
  }

  private recordar(texto: string): void {
    const limpio = texto.trim();
    if (normalizar(limpio).length < 2) return;

    this.recientes.update((lista) => {
      const sinRepetir = lista.filter((t) => normalizar(t) !== normalizar(limpio));
      return [limpio, ...sinRepetir].slice(0, 4);
    });
  }
}
