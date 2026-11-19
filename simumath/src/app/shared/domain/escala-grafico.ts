/**
 * Escala de un gráfico SVG que se adapta a la función y al intervalo de cada
 * ejemplo. Es el equivalente del cálculo que `grafico-metodo` hace en canvas,
 * pero pensado para dibujarse con SVG.
 *
 * El eje x parte del intervalo del ejemplo (con un margen pequeño) y el eje y
 * se calcula muestreando la función en ese intervalo. Así una misma tarjeta
 * sirve para x − cos(x) en [0, 1] y para 2x − 3 en [0, 5] sin escalas fijas.
 */

export interface EscalaGrafico {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  px: (valor: number) => number;
  py: (valor: number) => number;
  curva: string;
  marcasX: number[];
  marcasY: number[];
}

/** ViewBox compartido por los gráficos SVG de los métodos. */
export const VIEW_GRAFICO = {
  ancho: 600,
  alto: 300,
  izq: 48,
  der: 550,
  arriba: 20,
  abajo: 250,
};

/** Marcas "redondas" (1, 2, 5 × 10ⁿ) dentro de un rango. */
function marcas(min: number, max: number): number[] {
  const span = max - min;
  if (!(span > 0)) return [min];
  const base = 10 ** Math.floor(Math.log10(span / 6));
  const paso = [1, 2, 5, 10].find((valor) => valor * base >= span / 6)! * base;
  const salida: number[] = [];
  const primera = Math.ceil(min / paso) * paso;
  for (let i = 0; i < 40; i++) {
    const valor = primera + i * paso;
    if (valor > max + paso * 1e-6) break;
    salida.push(Number(valor.toPrecision(12)));
  }
  return salida;
}

export function escalaGrafico(
  funcion: (x: number) => number,
  rango: { min: number; max: number },
): EscalaGrafico {
  let xmin = rango.min;
  let xmax = rango.max;
  if (!Number.isFinite(xmin) || !Number.isFinite(xmax) || xmax <= xmin) {
    xmin = -1;
    xmax = 1;
  }
  const margenX = (xmax - xmin) * 0.06;
  xmin -= margenX;
  xmax += margenX;

  const muestras = 400;
  const valoresY: number[] = [0];
  for (let i = 0; i <= muestras; i++) {
    const x = xmin + ((xmax - xmin) * i) / muestras;
    const y = funcion(x);
    if (Number.isFinite(y) && Math.abs(y) < 1e6) valoresY.push(y);
  }

  let ymin = Math.min(...valoresY);
  let ymax = Math.max(...valoresY);
  if (!Number.isFinite(ymin) || !Number.isFinite(ymax)) {
    ymin = -1;
    ymax = 1;
  }
  if (ymax - ymin < 1e-9) {
    ymin -= 1;
    ymax += 1;
  }
  const margenY = (ymax - ymin) * 0.14;
  ymin -= margenY;
  ymax += margenY;

  const px = (valor: number): number =>
    VIEW_GRAFICO.izq + ((valor - xmin) / (xmax - xmin)) * (VIEW_GRAFICO.der - VIEW_GRAFICO.izq);
  const py = (valor: number): number =>
    VIEW_GRAFICO.abajo - ((valor - ymin) / (ymax - ymin)) * (VIEW_GRAFICO.abajo - VIEW_GRAFICO.arriba);

  let curva = '';
  let dibujando = false;
  for (let i = 0; i <= muestras; i++) {
    const x = xmin + ((xmax - xmin) * i) / muestras;
    const y = funcion(x);
    if (!Number.isFinite(y) || Math.abs(y) > 1e6 || y < ymin || y > ymax) {
      dibujando = false;
      continue;
    }
    curva += `${dibujando ? 'L' : 'M'}${px(x).toFixed(2)} ${py(y).toFixed(2)} `;
    dibujando = true;
  }

  return {
    xmin,
    xmax,
    ymin,
    ymax,
    px,
    py,
    curva,
    marcasX: marcas(xmin, xmax),
    marcasY: marcas(ymin, ymax),
  };
}
