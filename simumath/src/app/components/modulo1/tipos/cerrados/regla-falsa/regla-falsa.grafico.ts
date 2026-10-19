import type { ContextoGrafico, DibujarMetodo } from '../../../../../shared/models/metodo.model';

const COLOR_INTERVALO = '#8b5cf6';
const COLOR_CUERDA = '#5b7cfa';
const COLOR_CORTE = '#f0a52a';
const COLOR_RAIZ = '#16a34a';

export const dibujarReglaFalsa: DibujarMetodo = (
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; ancho: number; alto: number },
  { aX, aY, funcion, iteraciones, pasoActual, raiz }: ContextoGrafico,
) => {
  const fila = iteraciones?.[pasoActual];

  if (!fila) return;

  const a = Number(fila['a']);
  const b = Number(fila['b']);
  const c = Number(fila['c']);
  const fc = Number(fila['fc']);

  if (![a, b, c, fc].every(Number.isFinite)) return;

  const yCero = aY(0);
  const xA = aX(a);
  const xB = aX(b);
  const xC = aX(c);

  const fa = funcion(a);
  const fb = funcion(b);
  const yFa = aY(fa);
  const yFb = aY(fb);
  const yFc = aY(fc);

  ctx.save();

  // Intervalo sobre eje
  ctx.strokeStyle = COLOR_INTERVALO;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(xA, yCero);
  ctx.lineTo(xB, yCero);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(xA, yCero - 14);
  ctx.lineTo(xA, yCero + 14);
  ctx.moveTo(xB, yCero - 14);
  ctx.lineTo(xB, yCero + 14);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = COLOR_INTERVALO;
  ctx.font = '600 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('a', xA, yCero - 16);
  ctx.fillText('b', xB, yCero - 16);

  // Cuerda (a, f(a)) -> (b, f(b))
  ctx.strokeStyle = COLOR_CUERDA;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(xA, yFa);
  ctx.lineTo(xB, yFb);
  ctx.stroke();

  circulo(ctx, xA, yFa, 4, '#ffffff', COLOR_CUERDA);
  circulo(ctx, xB, yFb, 4, '#ffffff', COLOR_CUERDA);

  // Corte en c
  ctx.strokeStyle = COLOR_CORTE;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.moveTo(xC, yCero);
  ctx.lineTo(xC, rect.y + rect.alto);
  ctx.stroke();
  ctx.setLineDash([]);

  triangulo(ctx, xC, yCero, 6, COLOR_CORTE);
  ctx.fillStyle = COLOR_CORTE;
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText('c', xC, yCero + 8);

  ctx.strokeStyle = COLOR_CORTE;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(xC, yCero);
  ctx.lineTo(xC, yFc);
  ctx.stroke();
  ctx.setLineDash([]);

  circulo(ctx, xC, yFc, 5, COLOR_CORTE, '#ffffff');

  if (raiz !== undefined && Number.isFinite(raiz)) {
    const xR = aX(raiz);
    const yR = aY(0);
    const anchoBanda = Math.max(2, Math.abs(xA - xB) / 3);
    ctx.fillStyle = 'rgba(22, 163, 74, 0.12)';
    ctx.fillRect(xR - anchoBanda, rect.y, anchoBanda * 2, rect.alto);

    ctx.strokeStyle = COLOR_RAIZ;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xR, rect.y);
    ctx.lineTo(xR, rect.y + rect.alto);
    ctx.stroke();

    circulo(ctx, xR, yR, 5, COLOR_RAIZ, '#ffffff');

    ctx.fillStyle = COLOR_RAIZ;
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('raíz', xR + 8, yR);
  }

  ctx.restore();
};

function circulo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radio: number,
  relleno: string,
  borde: string,
): void {
  ctx.beginPath();
  ctx.arc(x, y, radio, 0, Math.PI * 2);
  ctx.fillStyle = relleno;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = borde;
  ctx.stroke();
}

function triangulo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lado: number,
  color: string,
): void {
  ctx.beginPath();
  ctx.moveTo(x, y - lado);
  ctx.lineTo(x - lado, y + lado);
  ctx.lineTo(x + lado, y + lado);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
