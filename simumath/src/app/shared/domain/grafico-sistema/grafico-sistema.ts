import {
  Component,
  ElementRef,
  OnDestroy,
  afterRenderEffect,
  computed,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { SistemaLineal } from '../numerico/matriz';
import type { DibujarSistema } from '../../models/sistema.model';
import type { Rectangulo } from '../../models/metodo.model';

/**
 * GRÁFICO DE UN SISTEMA DE ECUACIONES LINEALES.
 *
 * ── Por qué no sirve el gráfico de f(x) ───────────────────────────────
 * El Módulo 1 dibuja la curva de una función y pone la raíz encima.
 * Un sistema lineal no tiene curva: tiene rectas. La solución del
 * sistema es el PUNTO donde se cortan, y ese punto es lo que hay que
 * ver. Por eso este componente es aparte y no una variante del otro.
 *
 * ── Qué dibuja ───────────────────────────────────────────────────────
 * · El plano cartesiano, con la misma escala en los dos ejes. Esto NO es
 *   un detalle: si el eje x se estira y el y no, las rectas se ven
 *   torcidas y el alumno ve un ángulo que no existe. Se elige una
 *   escala y se estiran los dos ejes por igual.
 * · Cada ecuación del sistema como una recta, con su color y su
 *   etiqueta.
 * · El punto solución, cuando existe, con sus líneas punteadas hasta
 *   los ejes.
 * · El camino que recorren las iteradas, cuando la tabla trae las
 *   columnas `x1` y `x2` (que es lo que hacen Jacobi y Gauss-Seidel).
 *
 * ── Qué NO dibuja ────────────────────────────────────────────────────
 * El sistema con tres o más incógnitas no cabe en un plano de dos
 * ejes. En ese caso este componente NO se instancia: la página muestra
 * un aviso explicando que el gráfico aplica a sistemas de 2×2, y la
 * tabla de pasos sigue funcionando. Nunca queda una pantalla en blanco.
 */
@Component({
  selector: 'app-grafico-sistema',
  standalone: true,
  templateUrl: './grafico-sistema.html',
  styleUrl: './grafico-sistema.scss',
})
export class GraficoSistema implements OnDestroy {
  /** El sistema que se está resolviendo. */
  readonly sistema = input.required<SistemaLineal>();

  /** La solución, si ya se encontró. */
  readonly solucion = input<number[] | undefined>(undefined);

  /** Las filas de la tabla del método (para leer el camino de iteradas). */
  readonly iteraciones = input<Record<string, number | string>[]>([]);

  /** Qué paso se está mostrando. */
  readonly pasoActual = input(0);

  /** Rango visible en los dos ejes (la vista es cuadrada). */
  readonly rango = input({ min: -6, max: 6 });

  /** Dibujo propio del método (el pivote de Gauss, por ejemplo). */
  readonly dibujarSistema = input<DibujarSistema | undefined>(undefined);

  /**
   * Sistemas EXTRA que se dibujan encima del plano, con trazo atenuado.
   *
   * ── Para qué existe ──────────────────────────────────────────────────
   * La descomposición LU produce un sistema triangular U·x = y que tiene
   * las MISMAS soluciones que el original pero rectas DISTINTAS. Verlo
   * sobre el plano es lo que hace entender qué hizo la eliminación: la
   * primera recta se queda y la segunda se vuelve horizontal.
   *
   * Se dibujan con trazo punteado y color atenuado a propósito: son un
   * APOYO para leer el método, no el objeto principal de la pantalla (ese
   * es el sistema original, que va en trazo fuerte).
   */
  readonly sistemasExtra = input<SistemaLineal[]>([]);

  /** Texto que se muestra arriba del gráfico. */
  readonly leyenda = input('');

  /** Alto del lienzo, en píxeles. */
  readonly alto = input(340);

  /** ¿El sistema tiene exactamente 2 ecuaciones y 2 incógnitas? */
  readonly esPlano2D = computed(() => {
    const s = this.sistema();
    return s.A.length === 2 && s.A.every((f) => f.length === 2) && s.b.length === 2;
  });

  /**
   * El lienzo, si existe.
   *
   * ── Por qué NO es `viewChild.required` ────────────────────────────────
   * El canvas solo se crea cuando el sistema es de 2×2: para 3 o más
   * ecuaciones el template muestra un aviso en su lugar (un sistema de
   * tres incógnitas no cabe en dos ejes). Con `required`, al pedir el
   * lienzo en un sistema de 3×3 Angular tiraba NG0951 ("Child query
   * result is required but no value is available") y la pantalla se
   * rompía.
   *
   * Por eso la query es OPCIONAL y todos los usos preguntan primero.
   */
  private readonly lienzo = viewChild<ElementRef<HTMLCanvasElement>>('lienzo');
  private readonly contenedor = viewChild.required<ElementRef<HTMLDivElement>>('contenedor');

  private readonly ancho = signal(0);
  private observador?: ResizeObserver;
  private removeListeners?: () => void;

  private readonly version = signal(0);
  private readonly zoom = signal(1);
  private readonly offsetX = signal(0);
  private readonly offsetY = signal(0);
  private readonly arrastrando = signal(false);
  private ultimoX = 0;
  private ultimoY = 0;

  readonly descripcionGrafico = computed(() => {
    const base = 'Gráfico del sistema de ecuaciones lineales';
    if (this.leyenda()) return `${base} ${this.leyenda()}.`;
    return `${base}.`;
  });

  private readonly rangoBase = computed(() => this.rango());

  /** El rango visible, con el zoom y el desplazamiento aplicados. */
  readonly viewRango = computed<{
    min: number;
    max: number;
    minY: number;
    maxY: number;
  }>(() => {
    const r = this.rangoBase();
    const span = r.max - r.min;
    if (span <= 0) {
      return { min: r.min, max: r.max, minY: r.min, maxY: r.max };
    }
    const z = this.zoom();
    const visible = span / Math.max(0.01, z);
    const cx = (r.min + r.max) / 2 + this.offsetX();
    const cy = (r.min + r.max) / 2 + this.offsetY();
    return {
      min: cx - visible / 2,
      max: cx + visible / 2,
      minY: cy - visible / 2,
      maxY: cy + visible / 2,
    };
  });

  constructor() {
    /*
     * El setup se hace con `afterRenderEffect` y no con `afterNextRender`
     * porque el lienzo NO SIEMPRE existe: aparece cuando el sistema es de
     * 2×2 y, para 3 o más ecuaciones, es un aviso en su lugar.
     *
     * Con `afterNextRender` el setup corría una sola vez, en el primer
     * render: si en ese momento no había lienzo (sistema de 3×3), los
     * escuchas de zoom y arrastre nunca se registraban y, aunque más
     * tarde apareciera el lienzo, el gráfico no respondía.
     *
     * `afterRenderEffect` vuelve a correr cada vez que el lienzo
     * cambia, y `registrarEventos` es idempotente: quita los escuchas
     * viejos antes de poner los nuevos.
     */
    afterRenderEffect({
      read: () => {
        // Se lee el lienzo para que el efecto dependa de él.
        this.lienzo();
      },
      write: () => {
        this.medir();
        this.observarResize();
        this.registrarEventos();
      },
    });

    effect(() => {
      this.sistema();
      this.solucion();
      this.iteraciones();
      this.pasoActual();
      this.rango();
      this.dibujarSistema();
      this.version();
      this.ancho();
      this.alto();
      this.zoom();
      this.offsetX();
      this.offsetY();
      this.dibujar();
    });

    effect(() => {
      this.rangoBase();
      this.reiniciarVista();
    });
  }

  private medir(): void {
    this.ancho.set(this.contenedor().nativeElement.clientWidth);
  }

  private observarResize(): void {
    // El observador anterior se desconecta: si no, cada registro nuevo
    // dejaría el viejo vivo y `medir()` se llamaría dos veces.
    this.observador?.disconnect();
    this.observador = new ResizeObserver(() => this.medir());
    this.observador.observe(this.contenedor().nativeElement);
  }

  private registrarEventos(): void {
    // Si ya había escuchas de un lienzo anterior, se quitan antes de
    // poner las nuevas: si no, cada vez que el lienzo cambia se
    // duplicarían y un clic movería el gráfico el doble.
    this.removeListeners?.();
    this.removeListeners = undefined;

    // Sin lienzo no hay a qué escuchando: el aviso de "no aplica" se
    // está mostrando en su lugar.
    const ref = this.lienzo();
    if (!ref) return;
    const canvas = ref.nativeElement;
    const cont = this.contenedor().nativeElement;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const r = this.rangoBase();
      const span = r.max - r.min;
      const z = this.zoom();
      const zNuevo = Math.max(0.25, Math.min(40, z * factor));
      const rect = cont.getBoundingClientRect();
      const relX = (e.offsetX) / (rect.width || 1);
      const relY = (e.offsetY) / (rect.height || 1);

      const visibleSpan = span / Math.max(0.01, z);
      const cx = (r.min + r.max) / 2 + this.offsetX();
      const cy = (r.min + r.max) / 2 + this.offsetY();

      // El punto del mundo que está bajo el cursor no se mueve al zoom.
      const mundoX = cx - visibleSpan / 2 + relX * visibleSpan;
      const mundoY = cy - visibleSpan / 2 + relY * visibleSpan;

      const nuevoSpan = span / Math.max(0.01, zNuevo);
      const nuevoCx = mundoX - (mundoX - cx) * (nuevoSpan / visibleSpan);
      const nuevoCy = mundoY - (mundoY - cy) * (nuevoSpan / visibleSpan);

      this.zoom.set(zNuevo);
      this.offsetX.set(nuevoCx - (r.min + r.max) / 2);
      this.offsetY.set(nuevoCy - (r.min + r.max) / 2);
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        this.arrastrando.set(true);
        this.ultimoX = e.clientX;
        this.ultimoY = e.clientY;
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!this.arrastrando()) return;
      const dx = e.clientX - this.ultimoX;
      const dy = e.clientY - this.ultimoY;
      this.ultimoX = e.clientX;
      this.ultimoY = e.clientY;
      const r = this.rangoBase();
      const span = r.max - r.min;
      const visibleSpan = span / Math.max(0.01, this.zoom());
      const anchoCss = cont.clientWidth || this.ancho();
      const altoCss = this.alto();
      this.offsetX.update((o) => o - (dx * visibleSpan) / Math.max(1, anchoCss));
      this.offsetY.update((o) => o - (dy * visibleSpan) / Math.max(1, altoCss));
    };
    const onMouseUp = () => this.arrastrando.set(false);
    const onMouseLeave = () => this.arrastrando.set(false);
    const onDblClick = () => this.reiniciarVista();

    let touchLastX = 0;
    let touchLastY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchLastX = e.touches[0].clientX;
        touchLastY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const dx = x - touchLastX;
        const dy = y - touchLastY;
        touchLastX = x;
        touchLastY = y;
        const r = this.rangoBase();
        const span = r.max - r.min;
        const visibleSpan = span / Math.max(0.01, this.zoom());
        const anchoCss = cont.clientWidth || this.ancho();
        const altoCss = this.alto();
        this.offsetX.update((o) => o - (dx * visibleSpan) / Math.max(1, anchoCss));
        this.offsetY.update((o) => o - (dy * visibleSpan) / Math.max(1, altoCss));
      }
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('dblclick', onDblClick);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    this.removeListeners = () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('dblclick', onDblClick);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }

  /** Acercar el zoom. */
  acercar(): void {
    this.zoom.update((z) => Math.min(40, z * 1.15));
  }
  /** Alejar el zoom. */
  alejar(): void {
    this.zoom.update((z) => Math.max(0.25, z / 1.15));
  }
  /** Vuelve a la vista original. */
  reiniciarVista(): void {
    this.zoom.set(1);
    this.offsetX.set(0);
    this.offsetY.set(0);
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
    this.removeListeners?.();
  }

  /* ---------------------------------------------------------------- */
  /* Dibujo                                                            */
  /* ---------------------------------------------------------------- */

  private dibujar(): void {
    if (!this.esPlano2D()) return;
    const ref = this.lienzo();
    if (!ref) return;
    const canvas = ref.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const anchoCss = this.ancho();
    const altoCss = this.alto();
    if (anchoCss <= 0 || altoCss <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(anchoCss * dpr);
    canvas.height = Math.round(altoCss * dpr);
    canvas.style.width = `${anchoCss}px`;
    canvas.style.height = `${altoCss}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, anchoCss, altoCss);

    const rango = this.viewRango();
    const margen = { arriba: 16, derecha: 16, abajo: 34, izquierda: 52 };
    const rect: Rectangulo = {
      x: margen.izquierda,
      y: margen.arriba,
      ancho: anchoCss - margen.izquierda - margen.derecha,
      alto: altoCss - margen.arriba - margen.abajo,
    };

    const min = rango.min;
    const max = rango.max;
    const minY = rango.minY;
    const maxY = rango.maxY;
    const spanX = max - min;
    const spanY = maxY - minY;

    const aX = (x: number): number => rect.x + ((x - min) / spanX) * rect.ancho;
    const aY = (y: number): number => rect.y + rect.alto - ((y - minY) / spanY) * rect.alto;

    this.dibujarFondo(ctx, rect);
    this.dibujarCuadricula(ctx, rect, aX, aY, min, max, minY, maxY);
    this.dibujarEjes(ctx, rect, aX, aY, min, max, minY, maxY);
    this.dibujarSistemasExtra(ctx, rect, aX, aY, min, max, minY, maxY);
    this.dibujarRectas(ctx, rect, aX, aY, min, max, minY, maxY);
    this.dibujarCamino(ctx, aX, aY);
    this.dibujarSolucion(ctx, aX, aY);

    const dibujar = this.dibujarSistema();
    if (dibujar) {
      try {
        dibujar(ctx, rect, {
          aX,
          aY,
          sistema: this.sistema(),
          iteraciones: this.iteraciones(),
          pasoActual: this.pasoActual(),
          rango: { min, max, minY, maxY },
          solucion: this.solucion(),
          sistemasExtra: this.sistemasExtra(),
          rect,
        });
      } catch {
        // Un dibujo que falla no puede romper la página: el resto del
        // gráfico (rectas y solución) ya está en pantalla.
      }
    }
  }

  private dibujarFondo(ctx: CanvasRenderingContext2D, rect: Rectangulo): void {
    ctx.fillStyle =
      getComputedStyle(document.documentElement).getPropertyValue('--surface-container-lowest').trim() ||
      '#ffffff';
    ctx.fillRect(rect.x, rect.y, rect.ancho, rect.alto);
  }

  private dibujarCuadricula(
    ctx: CanvasRenderingContext2D,
    rect: Rectangulo,
    aX: (x: number) => number,
    aY: (y: number) => number,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
  ): void {
    const paso = pasoBonito(maxX - minX);
    ctx.strokeStyle = 'rgba(11, 36, 71, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = Math.ceil(minX / paso) * paso; x <= maxX; x += paso) {
      const px = Math.round(aX(x)) + 0.5;
      ctx.moveTo(px, rect.y);
      ctx.lineTo(px, rect.y + rect.alto);
    }
    for (let y = Math.ceil(minY / paso) * paso; y <= maxY; y += paso) {
      const py = Math.round(aY(y)) + 0.5;
      ctx.moveTo(rect.x, py);
      ctx.lineTo(rect.x + rect.ancho, py);
    }
    ctx.stroke();
  }

  private dibujarEjes(
    ctx: CanvasRenderingContext2D,
    rect: Rectangulo,
    aX: (x: number) => number,
    aY: (y: number) => number,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
  ): void {
    ctx.strokeStyle = 'rgba(11, 36, 71, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (minX <= 0 && maxX >= 0) {
      const py = Math.round(aY(0)) + 0.5;
      ctx.moveTo(rect.x, py);
      ctx.lineTo(rect.x + rect.ancho, py);
    }
    if (minY <= 0 && maxY >= 0) {
      const px = Math.round(aX(0)) + 0.5;
      ctx.moveTo(px, rect.y);
      ctx.lineTo(px, rect.y + rect.alto);
    }
    ctx.stroke();

    const paso = pasoBonito(maxX - minX);
    ctx.fillStyle = 'rgba(11, 36, 71, 0.6)';
    ctx.font = '11px system-ui, sans-serif';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = Math.ceil(minX / paso) * paso; x <= maxX; x += paso) {
      if (Math.abs(x) < paso / 1000) continue;
      ctx.fillText(formatearNumero(x), aX(x), rect.y + rect.alto + 6);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = Math.ceil(minY / paso) * paso; y <= maxY; y += paso) {
      if (Math.abs(y) < paso / 1000) continue;
      ctx.fillText(formatearNumero(y), rect.x - 6, aY(y));
    }

    // Rótulos de los ejes: x₁ en horizontal, x₂ en vertical.
    ctx.fillStyle = 'rgba(11, 36, 71, 0.85)';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('x₁', rect.x + rect.ancho, rect.y + rect.alto + 6);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('x₂', rect.x - 6, rect.y + 10);
  }

  /**
   * Dibuja cada ecuación del sistema como una recta.
   *
   * La ecuación a·x₁ + b·x₂ = c se escribe como x₂ = (c − a·x₁)/b, y se
   * dibuja muestreando x₁. Cuando b es casi cero, la recta es vertical
   * (x₁ = c/a) y se dibuja aparte.
   */
  /**
   * Dibuja los sistemas extra con trazo atenuado.
   *
   * Van DEBAJO de las rectas del sistema original: el original es lo que
   * se está resolviendo y tiene que dominating la vista; los extra son un
   * apoyo para entender qué hizo el método.
   *
   * Cada sistema extra se etiqueta con una "T" (de triangular), que es
   * como se los llama en la teoría.
   */
  private dibujarSistemasExtra(
    ctx: CanvasRenderingContext2D,
    rect: Rectangulo,
    aX: (x: number) => number,
    aY: (y: number) => number,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
  ): void {
    const extras = this.sistemasExtra();
    if (extras.length === 0) return;

    ctx.save();
    ctx.strokeStyle = COLOR_EXTRA;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([7, 5]);

    for (const s of extras) {
      if (s.A.length !== 2 || s.b.length !== 2) continue;
      for (let i = 0; i < 2; i++) {
        trazarRecta(ctx, s.A[i][0], s.A[i][1], s.b[i], aX, aY, minX, maxX, rect);
      }
    }

    ctx.setLineDash([]);

    // Etiqueta "T" junto a la primera recta extra.
    ctx.fillStyle = COLOR_EXTRA;
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const xEtiqueta = Math.min(maxX - 0.4, maxX);
    const yEtiqueta = minY + (maxY - minY) * 0.92;
    ctx.fillText('T', aX(xEtiqueta), aY(yEtiqueta));

    ctx.restore();
  }

  private dibujarRectas(
    ctx: CanvasRenderingContext2D,
    rect: Rectangulo,
    aX: (x: number) => number,
    aY: (y: number) => number,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
  ): void {
    const s = this.sistema();
    const colores = COLOR_ECUACIONES;

    for (let i = 0; i < s.A.length; i++) {
      const a = s.A[i][0];
      const b = s.A[i][1];
      const c = s.b[i];
      const color = colores[i % colores.length];

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';

      trazarRecta(ctx, a, b, c, aX, aY, minX, maxX, rect);

      // Etiqueta de la ecuación, cerca del borde derecho.
      const etiqueta = `E${i + 1}`;
      ctx.fillStyle = color;
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const xEtiqueta = Math.min(maxX - 0.4, maxX);
      const yEtiqueta = minY + (maxY - minY) * (0.08 + 0.12 * i);
      ctx.fillText(etiqueta, aX(xEtiqueta), aY(yEtiqueta));
    }
  }

  /**
   * Dibuja el camino que recorren las iteradas.
   *
   * Las coordenadas se leen de las columnas `x1` y `x2` de la tabla, así
   * que el camino y la tabla no pueden contradecirse. Si la tabla no
   * tiene esas columnas (los métodos directos no iteran), no hay camino
   * y no se dibuja nada.
   */
  private dibujarCamino(
    ctx: CanvasRenderingContext2D,
    aX: (x: number) => number,
    aY: (y: number) => number,
  ): void {
    const filas = this.iteraciones();
    if (filas.length === 0) return;

    const puntos: { x: number; y: number }[] = [];
    for (const fila of filas) {
      const xv = Number(fila['x1']);
      const yv = Number(fila['x2']);
      if (!Number.isFinite(xv) || !Number.isFinite(yv)) break;
      puntos.push({ x: xv, y: yv });
    }
    if (puntos.length < 2) return;

    const hasta = Math.min(puntos.length, this.pasoActual() + 1);

    ctx.strokeStyle = 'rgba(184, 134, 11, 0.85)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    for (let i = 0; i < hasta; i++) {
      const px = aX(puntos[i].x);
      const py = aY(puntos[i].y);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    for (let i = 0; i < hasta; i++) {
      const px = aX(puntos[i].x);
      const py = aY(puntos[i].y);
      ctx.fillStyle = i === hasta - 1 ? '#b8860b' : 'rgba(184, 134, 11, 0.45)';
      ctx.beginPath();
      ctx.arc(px, py, i === hasta - 1 ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** Dibuja el punto solución. */
  private dibujarSolucion(
    ctx: CanvasRenderingContext2D,
    aX: (x: number) => number,
    aY: (y: number) => number,
  ): void {
    const sol = this.solucion();
    if (!sol || sol.length < 2) return;
    const x = sol[0];
    const y = sol[1];
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    const px = aX(x);
    const py = aY(y);

    ctx.save();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, aY(0));
    ctx.moveTo(px, py);
    ctx.lineTo(aX(0), py);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#b8860b';
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`(${formatearNumero(x)}, ${formatearNumero(y)})`, px, py - 9);
    ctx.restore();
  }
}

/**
 * Los colores de las rectas.
 *
 * El mismo dorado (#b8860b) marca la solución, igual que marcaba la raíz
 * en el Módulo 1: el alumno ya aprendió que el dorado es "la respuesta".
 */
const COLOR_ECUACIONES = ['#1b365d', '#b3541e', '#0f766e', '#7a3b8f'];

/**
 * El color de los sistemas EXTRA (el triangular de LU, por ejemplo).
 *
 * Es el azul de las ecuaciones, pero apagado: se distingue del original
 * sin competir con él.
 */
const COLOR_EXTRA = 'rgba(27, 54, 93, 0.45)';

/**
 * Traza la recta de la ecuación `a·x₁ + b·x₂ = c` dentro del recuadro.
 *
 * ── Por qué una función suelta ────────────────────────────────────────
 * La misma recta se dibuja en dos lugares: la del sistema original (en
 * trazo fuerte) y la de los sistemas extra (en trazo atenuado). Si el
 * cálculo de la recta estuviera duplicado, un cambio en uno de los dos
 * podría dejarlos distintos sin que nada se quejara.
 *
 * La recta se traza punto por punto porque puede ser vertical (b = 0) o
 * muy inclinada: la ecuación `x₂ = (c − a·x₁) / b` se evalúa en 500
 * puntos del rango visible y se descarta el tramo que se sale del
 * recuadro, para que una recta casi vertical no se dibuje como una
 * línea gigante que cruza todo el gráfico.
 */
function trazarRecta(
  ctx: CanvasRenderingContext2D,
  a: number,
  b: number,
  c: number,
  aX: (x: number) => number,
  aY: (y: number) => number,
  minX: number,
  maxX: number,
  rect: Rectangulo,
): void {
  if (Math.abs(b) > 1e-12) {
    const pasos = 500;
    ctx.beginPath();
    let trazando = false;
    for (let p = 0; p <= pasos; p++) {
      const x1 = minX + ((maxX - minX) * p) / pasos;
      const x2 = (c - a * x1) / b;
      if (!Number.isFinite(x2) || Math.abs(x2) > 1e6) {
        trazando = false;
        continue;
      }
      const px = aX(x1);
      const py = aY(x2);
      if (trazando) {
        ctx.lineTo(px, py);
      } else {
        ctx.moveTo(px, py);
        trazando = true;
      }
    }
    ctx.stroke();
  } else if (Math.abs(a) > 1e-12) {
    // Recta vertical: x₁ = c / a.
    const x1 = c / a;
    const px = aX(x1);
    ctx.beginPath();
    ctx.moveTo(px, rect.y);
    ctx.lineTo(px, rect.y + rect.alto);
    ctx.stroke();
  }
}

function pasoBonito(rango: number): number {
  if (rango <= 0) return 1;
  const bruto = rango / 8;
  const magnitud = Math.pow(10, Math.floor(Math.log10(bruto)));
  const normalizado = bruto / magnitud;
  const paso = normalizado >= 5 ? 5 : normalizado >= 2 ? 2 : 1;
  return paso * magnitud;
}

function formatearNumero(v: number): string {
  if (Math.abs(v) < 1e-10) return '0';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2).replace(/\.?0+$/, '');
}
