export function marcas(min: number, max: number): number[] {
  const base = 10 ** Math.floor(Math.log10((max - min) / 6));
  const paso = [1, 2, 5, 10].find(v => v * base >= (max - min) / 6)! * base;
  const salida: number[] = [];
  for (let v = Math.ceil(min / paso) * paso; v <= max; v += paso) salida.push(v);
  return salida;
}

/** Escala basada solo en las semillas y los pasos ya revelados. */
export function graficaDemo(xs: number[], f: (x: number) => number) {
  const finitos = xs.filter(Number.isFinite);
  const xmin = Math.min(-1, ...finitos);
  const xmax = Math.max(2.5, ...finitos);
  const mx = (xmax - xmin) * 0.12;
  const ys = [0, -2, 2, ...finitos.map(f)].filter(Number.isFinite);
  const ymin = Math.min(...ys);
  const ymax = Math.max(...ys);
  const my = (ymax - ymin) * 0.16;
  const limites = { xmin: xmin - mx, xmax: xmax + mx, ymin: ymin - my, ymax: ymax + my };
  const px = (x: number) => 48 + (x - limites.xmin) / (limites.xmax - limites.xmin) * 502;
  const py = (y: number) => 250 - (y - limites.ymin) / (limites.ymax - limites.ymin) * 230;
  let curva = '';
  let pen = false;
  for (let i = 0; i <= 400; i++) {
    const x = limites.xmin + (limites.xmax - limites.xmin) * i / 400;
    const y = f(x);
    if (!Number.isFinite(y) || y < limites.ymin || y > limites.ymax) {
      pen = false;
      continue;
    }
    curva += `${pen ? 'L' : 'M'}${px(x)} ${py(y)} `;
    pen = true;
  }
  return { px, py, curva, marcasX: marcas(limites.xmin, limites.xmax), marcasY: marcas(limites.ymin, limites.ymax) };
}
