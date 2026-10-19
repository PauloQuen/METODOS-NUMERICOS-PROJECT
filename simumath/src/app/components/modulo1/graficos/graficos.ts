import { Component, ElementRef, computed, effect, signal, viewChild } from '@angular/core';
import { RegistroNav } from '../../../shared/layout/registro-nav/registro-nav';
import { UiCard } from '../../../shared/ui/ui-card/ui-card';
import { parseFuncion, MetodoResultado } from '../../../shared/domain/numerico/methods';
import {
  coordenadaRaiz,
  ejecutarMetodo,
  familiaDe,
  metodo,
  puntosDeIteracion,
  REGISTRO_POR_KEY,
  type MetodoKey,
} from '../../../shared/domain/numerico/registro';

/**
 * Rótulos (nombre + fórmula) derivados del registro. Antes venía del
 * `METODO_INFO` de Calculadoras, que era una copia más.
 */
const METODO_INFO: Record<MetodoKey, { nombre: string; formula: string }> = Object.fromEntries(
  Object.values(REGISTRO_POR_KEY).map((m) => [m.key, { nombre: m.nombre, formula: m.formula }]),
) as Record<MetodoKey, { nombre: string; formula: string }>;

/* ------------------------------------------------------------------ */
/* Graficador por canvas 2D (sin librerías externas).                  */
/*                                                                     */
/* NOTA IMPORTANTE: la sección es ILUSTRATIVA. Cada método muestra un   */
/* ejemplo fijo (los mismos del PDF) para visualizar la dinámica del   */
/* algoritmo. Aún NO consume los datos de la calculadora interactiva;  */
/* esa versión conectada queda para la próxima etapa.                  */
/* ------------------------------------------------------------------ */

interface Punto {
  x: number;
  y: number;
}

interface Colores {
  fondo: string;
  tinta: string;
  suave: string;
  grilla: string;
  curva: string;
  curva2: string;
  extra: string;
  punto: string;
}

/** Datos de un ejemplo fijo por método. */
interface EjemploGrafico {
  funcion: string;
  titulo: string;
  descripcion: string;
  valorA?: number;
  valorB?: number;
  semilla?: number;
  semilla2?: number;
  tolerancia: number;
}

/** Resultado neutro para métodos sin ejemplo curado todavía. */
const SIN_EJEMPLO: MetodoResultado = {
  rows: [],
  converged: false,
  iterations: 0,
  error: 'Este método todavía no tiene un ejemplo fijo para dibujar.',
};

const PAD = 0.12; // margen del rango visible
const ESCALONES_TELARAÑA = 6;

/** Paso "bonito" para los ticks: 1, 2 o 5 × 10^k. */
function pasoBonito(ancho: number): number {
  const k = Math.pow(10, Math.floor(Math.log10(ancho)));
  const r = ancho / k;
  return (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * k;
}

/**
 * Ejemplos curados por método (los clásicos del PDF del tema):
 * convergen, ilustran la idea del algoritmo y quedan bien en pantalla.
 */
const EJEMPLOS: Partial<Record<MetodoKey, EjemploGrafico>> = {
  biseccion: {
    funcion: 'x^3 - 7*x + 4',
    titulo: 'f(x) = x³ − 7x + 4 en [−3, −2]',
    descripcion: 'Bolzano: f(−3)·f(−2) < 0 → la mitad del intervalo se descarta en cada paso.',
    valorA: -3,
    valorB: -2,
    tolerancia: 0.0001,
  },
  newton: {
    funcion: 'cos(x) - 3*x',
    titulo: 'f(x) = cos(x) − 3x con x₀ = π/8',
    descripcion: 'La recta tangente corta el eje en cada paso: convergencia cuadrática.',
    semilla: Math.PI / 8,
    tolerancia: 0.000001,
  },
  reglaFalsa: {
    funcion: 'e^x + 4*x^3 - 5',
    titulo: 'f(x) = eˣ + 4x³ − 5 en [0, 1]',
    descripcion: 'La cuerda entre los extremos se acerca a la raíz: extremo estancado a la vista.',
    valorA: 0,
    valorB: 1,
    tolerancia: 0.000001,
  },
  secante: {
    funcion: 'cos(x) - x',
    titulo: 'f(x) = cos(x) − x con x₀ = 0.5 y x₁ = π/4',
    descripcion: 'Newton sin derivada: la pendiente se aproxima con las dos últimas iteraciones.',
    semilla: 0.5,
    semilla2: Math.PI / 4,
    tolerancia: 0.00000001,
  },
  puntoFijo: {
    funcion: '(x + 2)^(1/3)',
    titulo: 'g(x) = (x + 2)^(1/3) con x₀ = 1.5',
    descripcion: '|g\'(x)| ≈ 0.144 < 1 en la zona: la telaraña converge al punto fijo.',
    semilla: 1.5,
    tolerancia: 0.00000001,
  },
};

@Component({
  selector: 'app-graficos',
  imports: [RegistroNav, UiCard],
  templateUrl: './graficos.html',
  styleUrl: './graficos.scss',
})
export class Graficos {
  readonly info = METODO_INFO;
  /** Ficha y familia del método activo, para el encabezado. */
  readonly ficha = computed(() => metodo(this.metodo()));
  readonly familiaActiva = computed(() => familiaDe(this.metodo()));
  readonly ejemplos = EJEMPLOS;

  readonly metodo = signal<MetodoKey>('biseccion');

  /** Ejemplo fijo del método activo. */
  /**
   * Ejemplo curado del método activo. `undefined` para los métodos que todavía
   * no tienen uno (Cardano): la UI lo maneja con un mensaje en vez de romper.
   */
  readonly ejemplo = computed(() => EJEMPLOS[this.metodo()]);

  /** Ejecución automática del ejemplo: cambia con la pestaña. */
  readonly resultado = computed(() => {
    const ej = this.ejemplo();
    if (!ej) return SIN_EJEMPLO;
    return this.ejecutarEjemplo(ej);
  });

  readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');

  /** Puntos (x, f(x)) de cada fila, según las columnas reales del método. */
  constructor() {
    effect(() => {
      // Se redibuja ante cualquier cambio de pestaña o de resultado.
      void this.metodo();
      void this.resultado();
      this.dibujar();
    });
  }

  cambiarMetodo(key: MetodoKey): void {
    this.metodo.set(key);
  }

  /** Última aproximación del resultado, según la columna que usa el método. */
  ultimaAproximacion(r: MetodoResultado): string {
    const fila = r.rows.at(-1);
    if (!fila) return '—';
    // La columna de la aproximación la declara el registro, así que no hay
    // que adivinar si se llama 'c', 'xᵢ' o 'x0' según el método.
    const v = (fila as Record<string, unknown>)[metodo(this.metodo()).columnaValor];
    return v !== undefined ? String(v) : '—';
  }

  /** Ejecuta el método del ejemplo con sus datos fijos. Nunca lanza. */
  private ejecutarEjemplo(ej: EjemploGrafico): MetodoResultado {
    try {
      // El registro se encarga de llamar al runner con la firma correcta.
      // Para punto fijo, `funcion` es g(x): el registro lo declara con
      // `operaSobreG` y no hace falta un caso especial acá.
      return ejecutarMetodo(
        this.metodo(),
        parseFuncion(ej.funcion),
        { a: ej.valorA, b: ej.valorB, x0: ej.semilla, x1: ej.semilla2 },
        { tol: ej.tolerancia, maxIter: 50 },
      );
    } catch (e) {
      return {
        rows: [],
        converged: false,
        iterations: 0,
        error: e instanceof Error ? e.message : 'Error al evaluar la función.',
      };
    }
  }

  /**
   * Puntos (x, f(x)) de cada iteración, para dibujar la telaraña.
   *
   * Se derivan de `columnaValor` y `columnaResiduo` del registro. Antes
   * había un mapa escrito a mano con un caso por método, y le faltaba
   * `puntoFijo`: como no estaba, `deriva['puntoFijo']` era `undefined` y el
   * grafico de punto fijo NUNCA dibujaba las iteraciones (caía al `?? []`).
   * Bug real, invisible a simple vista porque el resto del grafico se veía
   * bien. Con el registro no hay mapa que olvidar.
   */
  private puntosDe(r: MetodoResultado): Punto[] {
    // Toda la lógica de "qué columnas forman el punto" vive en el dominio
    // (`puntosDeIteracion`), donde está testeada contra los runners reales.
    // Acá no hay ni un nombre de columna escrito a mano.
    return puntosDeIteracion(metodo(this.metodo()), r.rows);
  }

  /* ---------------------------- dibujo ---------------------------- */

  private dibujar(): void {
    const canvas = this.canvas()?.nativeElement;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 800;
    const h = canvas.clientHeight || 480;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const css = getComputedStyle(document.documentElement);
    const c: Colores = {
      fondo: css.getPropertyValue('--surface-bright').trim() || '#ffffff',
      tinta: css.getPropertyValue('--on-surface').trim() || '#1a1c1e',
      suave: css.getPropertyValue('--on-surface-variant').trim() || '#44474e',
      grilla: css.getPropertyValue('--outline-variant').trim() || '#c4c6cf',
      curva: css.getPropertyValue('--primary').trim() || '#002046',
      curva2: css.getPropertyValue('--secondary').trim() || '#7e5700',
      extra: css.getPropertyValue('--tertiary').trim() || '#003d3c',
      punto: css.getPropertyValue('--error').trim() || '#ba1a1a',
    };

    ctx.fillStyle = c.fondo;
    ctx.fillRect(0, 0, w, h);

    const ej = this.ejemplo();
    // Sin ejemplo curado no hay nada que dibujar: se deja el canvas en blanco
    // en vez de romper con un undefined.
    if (!ej) return;

    // `operaSobreG` viene del registro: cualquier método que itere g (hoy
    // punto fijo) recibe la recta y = x y la telaraña, sin casos hardcodeados.
    const esPuntoFijo = this.ficha().operaSobreG;

    // Función del ejemplo (para punto fijo, la curva dibujada es g).
    let f: (x: number) => number;
    let g: ((x: number) => number) | null = null;
    try {
      if (esPuntoFijo) {
        g = parseFuncion(ej.funcion);
        f = g;
      } else {
        f = parseFuncion(ej.funcion);
      }
    } catch {
      this.dibujarMensaje(ctx, w, h, 'Función inválida en el ejemplo.');
      return;
    }

    // Rango X: alrededor de los puntos de iteración o de los datos del ejemplo.
    const r = this.resultado();
    const puntos = r ? this.puntosDe(r) : [];
    let xs: number[];
    if (puntos.length) {
      xs = puntos.map((p) => p.x);
    } else if (ej.valorA !== undefined && ej.valorB !== undefined) {
      xs = [ej.valorA, ej.valorB];
    } else if (ej.semilla !== undefined) {
      xs = [ej.semilla - 1, ej.semilla + 1];
    } else {
      xs = [-4, 4];
    }
    if (xs.some((v) => !Number.isFinite(v))) {
      xs = [-4, 4];
    }
    let xmin = Math.min(...xs);
    let xmax = Math.max(...xs);
    if (xmax - xmin < 1e-6) {
      xmin -= 1;
      xmax += 1;
    }
    const dx = (xmax - xmin) * PAD;
    xmin -= dx;
    xmax += dx;

    // Rango Y: muestreo de la curva + residuos de las iteraciones.
    const N = 240;
    const muestras: number[] = [];
    const ys = puntos.map((p) => p.y);
    for (let i = 0; i <= N; i++) {
      const x = xmin + ((xmax - xmin) * i) / N;
      const y = f(x);
      if (Number.isFinite(y) && Math.abs(y) < 1e6) muestras.push(y);
    }
    const ymin = Math.min(-0.5, ...muestras, ...ys);
    const ymax = Math.max(0.5, ...muestras, ...ys);

    // Grilla con ticks bonitos.
    const px = (x: number) => ((x - xmin) / (xmax - xmin)) * w;
    const py = (y: number) => h - ((y - ymin) / (ymax - ymin)) * h;

    ctx.strokeStyle = c.grilla;
    ctx.lineWidth = 1;
    ctx.font = '11px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.fillStyle = c.suave;

    const pasoX = pasoBonito(xmax - xmin);
    for (let x = Math.ceil(xmin / pasoX) * pasoX; x <= xmax; x += pasoX) {
      const sx = Math.round(px(x));
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
      ctx.stroke();
      ctx.fillText(fmtNum(x), sx + 4, py(0) + 16);
    }
    const pasoY = pasoBonito(ymax - ymin);
    for (let y = Math.ceil(ymin / pasoY) * pasoY; y <= ymax; y += pasoY) {
      const sy = Math.round(py(y));
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
      ctx.stroke();
      ctx.fillText(fmtNum(y), 6, sy - 4);
    }

    // Ejes.
    ctx.strokeStyle = c.tinta;
    ctx.lineWidth = 1.4;
    const ejeXVisible = ymin <= 0 && ymax >= 0;
    const ejeYVisible = xmin <= 0 && xmax >= 0;
    if (ejeXVisible) {
      ctx.beginPath();
      ctx.moveTo(0, py(0));
      ctx.lineTo(w, py(0));
      ctx.stroke();
    }
    if (ejeYVisible) {
      ctx.beginPath();
      ctx.moveTo(px(0), 0);
      ctx.lineTo(px(0), h);
      ctx.stroke();
    }

    // Rótulos de los ejes.
    ctx.fillStyle = c.suave;
    ctx.font = 'italic 12px "Plus Jakarta Sans", Arial, sans-serif';
    if (ejeXVisible) {
      ctx.textAlign = 'right';
      ctx.fillText('x', w - 10, py(0) - 8);
      ctx.textAlign = 'start';
    }
    if (ejeYVisible) {
      ctx.textAlign = 'left';
      ctx.fillText(esPuntoFijo ? 'g(x)' : 'f(x)', px(0) + 10, 16);
      ctx.textAlign = 'start';
    }

    // Punto fijo: recta y = x (referencia de la iteración).
    if (esPuntoFijo) {
      ctx.strokeStyle = c.suave;
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(px(xmin), py(xmin));
      ctx.lineTo(px(xmax), py(xmax));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Curva de la función.
    ctx.strokeStyle = c.curva;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    let abierto = false;
    for (let i = 0; i <= N; i++) {
      const x = xmin + ((xmax - xmin) * i) / N;
      const y = f(x);
      if (!Number.isFinite(y) || Math.abs(y) > 1e6) {
        abierto = false;
        continue;
      }
      const sx = px(x);
      const sy = py(y);
      if (!abierto) {
        ctx.moveTo(sx, sy);
        abierto = true;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();

    // Telaraña del punto fijo: escalera real sobre la recta y = x.
    if (esPuntoFijo && g) {
      this.dibujarEscalera(ctx, px, py, g, ej.semilla!, c);
    } else if (puntos.length) {
      this.dibujarIteraciones(ctx, px, py, puntos, c);
    }

    // Punto de la raíz aproximada (última fila del resultado).
    const raiz = r?.rows.at(-1);
    if (raiz) {
      const xr = coordenadaRaiz(metodo(this.metodo()), raiz);
      if (Number.isFinite(xr)) {
        const yr = f(xr);
        ctx.fillStyle = c.punto;
        ctx.strokeStyle = c.fondo;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px(xr), py(yr), 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  /** Escalera (telaraña) del punto fijo: (xₖ, xₖ) → (xₖ, g(xₖ)) → (g(xₖ), g(xₖ)). */
  private dibujarEscalera(
    ctx: CanvasRenderingContext2D,
    px: (x: number) => number,
    py: (y: number) => number,
    g: (x: number) => number,
    x0: number,
    c: Colores,
  ): void {
    let xk = x0;
    for (let k = 0; k < ESCALONES_TELARAÑA; k++) {
      const yk = g(xk);
      if (!Number.isFinite(yk)) break;

      // Vertical: de (xₖ, xₖ) hasta la curva (xₖ, g(xₖ)).
      ctx.strokeStyle = c.extra;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(px(xk), py(xk));
      ctx.lineTo(px(xk), py(yk));
      ctx.stroke();

      // Punto sobre la curva.
      ctx.fillStyle = c.extra;
      ctx.beginPath();
      ctx.arc(px(xk), py(yk), 4, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal: de la curva hasta la recta y = x (xₖ₊₁ = g(xₖ)).
      ctx.beginPath();
      ctx.moveTo(px(xk), py(yk));
      ctx.lineTo(px(yk), py(yk));
      ctx.stroke();

      xk = yk;
    }
  }

  private dibujarIteraciones(
    ctx: CanvasRenderingContext2D,
    px: (x: number) => number,
    py: (y: number) => number,
    puntos: Punto[],
    c: Colores,
  ): void {
    const visibles = puntos.slice(-12);

    // Polilínea que une las aproximaciones (evolución del método).
    ctx.strokeStyle = c.curva2;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    visibles.forEach((p, i) => {
      const sx = px(p.x);
      const sy = py(p.y);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.stroke();

    // Puntos con halo claro para contraste sobre la curva.
    visibles.forEach((p, i) => {
      const t = visibles.length === 1 ? 1 : i / (visibles.length - 1);
      const alpha = 0.35 + 0.65 * t;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = c.curva2;
      ctx.strokeStyle = c.fondo;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px(p.x), py(p.y), 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
  }

  private dibujarMensaje(ctx: CanvasRenderingContext2D, w: number, h: number, texto: string): void {
    ctx.fillStyle = '#ba1a1a';
    ctx.font = '14px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(texto, w / 2, h / 2);
    ctx.textAlign = 'start';
  }
}

function fmtNum(v: number): string {
  if (Math.abs(v) >= 1000 || (Math.abs(v) > 0 && Math.abs(v) < 0.01)) {
    return v.toExponential(1);
  }
  return String(Math.round(v * 1000) / 1000);
}
