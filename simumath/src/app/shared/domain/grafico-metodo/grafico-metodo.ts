import {
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { ContextoGrafico, DibujarMetodo } from '../../models/metodo.model';

@Component({
  selector: 'app-grafico-metodo',
  standalone: true,
  templateUrl: './grafico-metodo.html',
  styleUrl: './grafico-metodo.scss',
})
export class GraficoMetodo implements OnDestroy {
  readonly funcion = input.required<(x: number) => number>();
  readonly iteraciones = input<Record<string, number | string>[]>([]);
  readonly pasoActual = input(0);
  readonly rango = input({ min: -5, max: 5 });
  readonly rangoY = input<{ min: number; max: number } | undefined>(undefined);
  readonly dibujarMetodo = input<DibujarMetodo | undefined>(undefined);
  readonly leyenda = input('');
  readonly raiz = input<number | undefined>(undefined);
  readonly columnaA = input<string | undefined>(undefined);
  readonly columnaB = input<string | undefined>(undefined);
  readonly columnaC = input<string | undefined>(undefined);
  readonly alto = input(320);

  private readonly lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private readonly contenedor = viewChild.required<ElementRef<HTMLDivElement>>('contenedor');

  private readonly ancho = signal(0);
  private observador?: ResizeObserver;
  private removeListeners?: () => void;

  private readonly version = signal(0);
  private readonly zoom = signal(1);
  private readonly offsetX = signal(0);

  private readonly arrastrando = signal(false);
  private ultimoX = 0;

  readonly descripcionGrafico = computed(() => {
    const base = 'Gráfico de la función';
    if (this.leyenda()) return `${base} ${this.leyenda()}, con el avance del método paso a paso.`;
    return `${base}, con el avance del método paso a paso.`;
  });

  readonly redibujar = () => this.version.update((v) => v + 1);

  private readonly rangoBase = computed(() => this.rango());

  readonly viewRangoX = computed(() => {
    const r = this.rangoBase();
    const span = r.max - r.min;
    if (span <= 0) return { min: r.min, max: r.max };
    const z = this.zoom();
    const visibleSpan = span / Math.max(0.01, z);
    const center = (r.min + r.max) / 2 + this.offsetX();
    return { min: center - visibleSpan / 2, max: center + visibleSpan / 2 };
  });

  constructor() {
    afterNextRender(() => {
      this.medir();
      this.observarResize();
      this.registrarEventos();
    });

    effect(() => {
      this.funcion();
      this.iteraciones();
      this.pasoActual();
      this.rango();
      this.rangoY();
      this.dibujarMetodo();
      this.raiz();
      this.version();
      this.ancho();
      this.alto();
      this.zoom();
      this.offsetX();
      this.dibujar();
    });

    effect(() => {
      this.rangoBase();
      this.reiniciarVista();
    });
  }

  private medir(): void {
    const c = this.contenedor().nativeElement;
    this.ancho.set(c.clientWidth);
  }

  private observarResize(): void {
    this.observador = new ResizeObserver(() => this.medir());
    this.observador.observe(this.contenedor().nativeElement);
  }

  private registrarEventos(): void {
    const canvas = this.lienzo().nativeElement;
    const cont = this.contenedor().nativeElement;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY;
      const factor = delta > 0 ? 0.9 : 1.1;
      const rect = cont.getBoundingClientRect();
      const relX = (e.offsetX) / (rect.width || 1);
      const r = this.rangoBase();
      const span = r.max - r.min;
      const zActual = this.zoom();
      const zNuevo = Math.max(0.25, Math.min(40, zActual * factor));
      const centerActual = (r.min + r.max) / 2 + this.offsetX();
      const visibleSpanActual = span / Math.max(0.01, zActual);
      const worldXCursor = centerActual - visibleSpanActual / 2 + relX * visibleSpanActual;
      const visibleSpanNuevo = span / Math.max(0.01, zNuevo);
      const centerNuevo = worldXCursor - relX * visibleSpanNuevo;
      this.zoom.set(zNuevo);
      this.offsetX.set(centerNuevo - (r.min + r.max) / 2);
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        this.arrastrando.set(true);
        this.ultimoX = e.clientX;
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (this.arrastrando()) {
        const dx = e.clientX - this.ultimoX;
        this.ultimoX = e.clientX;
        const r = this.rangoBase();
        const span = r.max - r.min;
        const z = this.zoom();
        const visibleSpan = span / Math.max(0.01, z);
        const anchoCss = cont.clientWidth || this.ancho();
        this.offsetX.update((o) => o + (-dx * visibleSpan) / Math.max(1, anchoCss));
      }
    };
    const onMouseUp = () => this.arrastrando.set(false);
    const onMouseLeave = () => this.arrastrando.set(false);
    const onDblClick = () => this.reiniciarVista();

    let touchLastX = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) touchLastX = e.touches[0].clientX;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        const x = e.touches[0].clientX;
        const dx = x - touchLastX;
        touchLastX = x;
        const r = this.rangoBase();
        const span = r.max - r.min;
        const z = this.zoom();
        const visibleSpan = span / Math.max(0.01, z);
        const anchoCss = cont.clientWidth || this.ancho();
        this.offsetX.update((o) => o + (-dx * visibleSpan) / Math.max(1, anchoCss));
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

  acercar(): void {
    this.zoom.update((z) => Math.min(40, z * 1.15));
  }
  alejar(): void {
    this.zoom.update((z) => Math.max(0.25, z / 1.15));
  }
  reiniciarVista(): void {
    this.zoom.set(1);
    this.offsetX.set(0);
  }
  ajustarVista(): void {
    this.reiniciarVista();
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
    this.removeListeners?.();
  }

  private dibujar(): void {
    const canvas = this.lienzo().nativeElement;
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
    const rango = this.viewRangoX();
    const rangoY = this.calcularRangoY(rango);
    const margen = { arriba: 16, derecha: 16, abajo: 34, izquierda: 52 };
    const rect = {
      x: margen.izquierda,
      y: margen.arriba,
      ancho: anchoCss - margen.izquierda - margen.derecha,
      alto: altoCss - margen.arriba - margen.abajo,
    };
    const aX = (x: number): number => rect.x + ((x - rango.min) / (rango.max - rango.min)) * rect.ancho;
    const aY = (y: number): number => rect.y + rect.alto - ((y - rangoY.min) / (rangoY.max - rangoY.min)) * rect.alto;
    this.dibujarFondo(ctx, rect);
    this.dibujarCuadricula(ctx, rect, aX, aY, rango, rangoY);
    this.dibujarEjes(ctx, rect, aX, aY, rango, rangoY);
    this.dibujarCurva(ctx, rect, aX, aY);
    this.dibujarRaiz(ctx, aX, aY);
    const dibujar = this.dibujarMetodo();
    if (dibujar) {
      const contexto: ContextoGrafico = {
        aX,
        aY,
        funcion: this.funcion(),
        iteraciones: this.iteraciones(),
        pasoActual: this.pasoActual(),
        rango,
        raiz: this.raiz(),
      };
      try {
        dibujar(ctx, rect, contexto);
      } catch {}
    }
  }

  private calcularRangoY(rangoX: { min: number; max: number }): { min: number; max: number } {
    const dado = this.rangoY();
    if (dado) return dado;
    const f = this.funcion();
    let min = Infinity;
    let max = -Infinity;
    const muestras = Math.max(160, Math.round((rangoX.max - rangoX.min) * 120));
    for (let i = 0; i <= muestras; i++) {
      const x = rangoX.min + ((rangoX.max - rangoX.min) * i) / muestras;
      const y = f(x);
      if (!Number.isFinite(y)) continue;
      if (y > 1e6 || y < -1e6) continue;
      if (y < min) min = y;
      if (y > max) max = y;
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: -10, max: 10 };
    if (min === max) return { min: min - 5, max: max + 5 };
    const margen = (max - min) * 0.12;
    return { min: min - margen, max: max + margen };
  }

  private dibujarFondo(ctx: CanvasRenderingContext2D, rect: { x: number; y: number; ancho: number; alto: number }): void {
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface-container-lowest').trim() || '#ffffff';
    ctx.fillRect(rect.x, rect.y, rect.ancho, rect.alto);
  }
  private dibujarCuadricula(
    ctx: CanvasRenderingContext2D,
    rect: { x: number; y: number; ancho: number; alto: number },
    aX: (x: number) => number,
    aY: (y: number) => number,
    rangoX: { min: number; max: number },
    rangoY: { min: number; max: number },
  ): void {
    const pasoX = pasoBonito(rangoX.max - rangoX.min);
    const pasoY = pasoBonito(rangoY.max - rangoY.min);
    ctx.strokeStyle = 'rgba(11, 36, 71, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = Math.ceil(rangoX.min / pasoX) * pasoX; x <= rangoX.max; x += pasoX) {
      const px = Math.round(aX(x)) + 0.5;
      ctx.moveTo(px, rect.y);
      ctx.lineTo(px, rect.y + rect.alto);
    }
    for (let y = Math.ceil(rangoY.min / pasoY) * pasoY; y <= rangoY.max; y += pasoY) {
      const py = Math.round(aY(y)) + 0.5;
      ctx.moveTo(rect.x, py);
      ctx.lineTo(rect.x + rect.ancho, py);
    }
    ctx.stroke();
  }
  private dibujarEjes(
    ctx: CanvasRenderingContext2D,
    rect: { x: number; y: number; ancho: number; alto: number },
    aX: (x: number) => number,
    aY: (y: number) => number,
    rangoX: { min: number; max: number },
    rangoY: { min: number; max: number },
  ): void {
    ctx.strokeStyle = 'rgba(11, 36, 71, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (rangoX.min <= 0 && rangoX.max >= 0) {
      const py = Math.round(aY(0)) + 0.5;
      ctx.moveTo(rect.x, py);
      ctx.lineTo(rect.x + rect.ancho, py);
    }
    if (rangoY.min <= 0 && rangoY.max >= 0) {
      const px = Math.round(aX(0)) + 0.5;
      ctx.moveTo(px, rect.y);
      ctx.lineTo(px, rect.y + rect.alto);
    }
    ctx.stroke();
    const pasoX = pasoBonito(rangoX.max - rangoX.min);
    ctx.fillStyle = 'rgba(11, 36, 71, 0.6)';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = Math.ceil(rangoX.min / pasoX) * pasoX; x <= rangoX.max; x += pasoX) {
      if (Math.abs(x) < pasoX / 1000) continue;
      ctx.fillText(formatearNumero(x), aX(x), rect.y + rect.alto + 6);
    }
    const pasoY = pasoBonito(rangoY.max - rangoY.min);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = Math.ceil(rangoY.min / pasoY) * pasoY; y <= rangoY.max; y += pasoY) {
      if (Math.abs(y) < pasoY / 1000) continue;
      ctx.fillText(formatearNumero(y), rect.x - 6, aY(y));
    }
  }
  private dibujarCurva(
    ctx: CanvasRenderingContext2D,
    rect: { x: number; y: number; ancho: number; alto: number },
    aX: (x: number) => number,
    aY: (y: number) => number,
  ): void {
    const rango = this.viewRangoX();
    const f = this.funcion();
    const pasos = Math.max(500, Math.round(rect.ancho * 3));
    ctx.strokeStyle = '#0b2447';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    let trazando = false;
    for (let i = 0; i <= pasos; i++) {
      const x = rango.min + ((rango.max - rango.min) * i) / pasos;
      const y = f(x);
      if (!Number.isFinite(y) || y > 1e6 || y < -1e6) {
        trazando = false;
        continue;
      }
      const px = aX(x);
      const py = aY(y);
      if (trazando) {
        ctx.lineTo(px, py);
      } else {
        ctx.moveTo(px, py);
        trazando = true;
      }
    }
    ctx.stroke();
  }
  private dibujarRaiz(ctx: CanvasRenderingContext2D, aX: (x: number) => number, aY: (y: number) => number): void {
    const raiz = this.raiz();
    if (raiz === undefined || !Number.isFinite(raiz)) return;
    const px = aX(raiz);
    const py = aY(0);
    ctx.save();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(px, this.alto() - 34);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#b8860b';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`x ≈ ${raiz.toFixed(4)}`, px, py - 8);
    ctx.restore();
  }
}

function pasoBonito(rango: number): number {
  if (rango <= 0) return 1;
  const bruto = rango / 10;
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
