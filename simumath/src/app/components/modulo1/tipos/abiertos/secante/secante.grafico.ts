import type { DibujarMetodo } from '../../../../../shared/models/metodo.model';

export const dibujarSecante: DibujarMetodo = (ctx, rect, contexto) => {
  const { aX, aY, funcion, iteraciones, pasoActual } = contexto;
  if (!iteraciones.length) return;
  const paso = Math.max(0, pasoActual);
  const fila = iteraciones[paso];
  if (!fila) return;

  const xPrev = Number((fila as any).xPrev);
  const xCur = Number((fila as any).x);
  if (!Number.isFinite(xPrev) || !Number.isFinite(xCur)) return;

  const fPrev = funcion(xPrev);
  const fCur = funcion(xCur);
  if (!Number.isFinite(fPrev) || !Number.isFinite(fCur)) return;

  const denom = fCur - fPrev;
  let xNext: number | undefined;
  if (Math.abs(denom) > 1e-12) {
    xNext = xCur - (fCur * (xCur - xPrev)) / denom;
  }

  ctx.save();
  ctx.strokeStyle = '#0ea5e9';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  const x0g = Math.min(xPrev, xCur);
  const x1g = Math.max(xPrev, xCur);
  const margen = (x1g - x0g) * 0.25 || 0.5;
  const sx0 = x0g - margen;
  const sx1 = x1g + margen;
  const sy0 = fPrev + ((fCur - fPrev) * (sx0 - xPrev)) / (denom === 0 ? 1 : denom);
  const sy1 = fPrev + ((fCur - fPrev) * (sx1 - xPrev)) / (denom === 0 ? 1 : denom);
  ctx.moveTo(aX(sx0), aY(sy0));
  ctx.lineTo(aX(sx1), aY(sy1));
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#0ea5e9';
  ctx.beginPath();
  ctx.arc(aX(xPrev), aY(fPrev), 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(aX(xCur), aY(fCur), 4, 0, Math.PI * 2);
  ctx.fill();

  if (xNext !== undefined && Number.isFinite(xNext)) {
    ctx.strokeStyle = 'rgba(14,165,233,0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(aX(xNext), rect.y + rect.alto);
    ctx.lineTo(aX(xNext), aY(0));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.arc(aX(xNext), aY(0), 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(11,36,71,0.85)';
    ctx.fillText(`xₙ₊₁ ≈ ${xNext.toFixed(4)}`, aX(xNext), aY(0) - 8);
  }
  ctx.restore();
};
