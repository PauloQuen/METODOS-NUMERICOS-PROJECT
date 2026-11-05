import type { DatosModulo3, Punto } from '../modelos/modulo3.model';
import type { TemaBanco } from './banco';
import { lagrange, baseLagrange, polinomioLagrange } from '../tipos/interpolacion/lagrange/lagrange.algoritmo';
import { minimosCuadrados } from '../tipos/ajuste/minimos-cuadrados/minimos-cuadrados.algoritmo';

export interface OperacionVisualM3 {
  etiqueta: string;
  expresion?: string;
  numerador?: string;
  denominador?: string;
}
export interface VisualPasoM3 {
  operaciones: OperacionVisualM3[];
  resultado: string;
  tabla?: { columnas: string[]; filas: string[][]; totales?: string[] };
  grafico: {
    titulo: string;
    descripcion: string;
    puntos: Punto[];
    curva?: Punto[];
    estimacion?: Punto;
    residuos?: { x: number; observado: number; estimado: number }[];
    destacarPrimero: boolean;
  };
}
const f = (n: number) => Number(n.toFixed(6)).toString();
const producto = (valores: string[]) => valores.join(' · ');
const op = (etiqueta: string, expresion: string): OperacionVisualM3 => ({ etiqueta, expresion });
const fraccion = (etiqueta: string, numerador: string, denominador: string): OperacionVisualM3 => ({ etiqueta, numerador, denominador });

/** Las expresiones y dibujos usan los mismos datos y motores que la solución. */
export function crearVisuales(datos: DatosModulo3, tema: TemaBanco): VisualPasoM3[] {
  const { puntos } = datos;
  const x = datos.evaluarEn!;
  const n = puntos.length;
  const min = Math.min(x, ...puntos.map(p => p.x));
  const max = Math.max(x, ...puntos.map(p => p.x));
  const muestrear = (evaluar: (x: number) => number): Punto[] => Array.from({ length: 81 }, (_, i) => {
    const xi = min + (max - min) * i / 80;
    return { x: xi, y: evaluar(xi) };
  });
  const grafico = (paso: number, curva: Punto[], valor: number, residuos?: VisualPasoM3['grafico']['residuos']): VisualPasoM3['grafico'] => ({
    titulo: paso < 4 ? 'Ubicamos los datos' : tema === 'lagrange' ? 'El polinomio une los nodos' : 'La recta y sus residuos',
    descripcion: paso < 4 ? 'Cada punto representa un par (xᵢ, yᵢ) de la tabla.' : tema === 'lagrange'
      ? `La curva reproduce los datos. El punto destacado representa P(${x}) ≈ ${f(valor)}.`
      : 'Los segmentos verticales muestran la diferencia entre cada observación y la recta. Su longitud indica el tamaño del residuo.',
    puntos, destacarPrimero: paso > 0 && paso < 4,
    ...(paso >= 4 ? { curva, estimacion: { x, y: valor }, residuos } : {}),
  });
  let visuales: Omit<VisualPasoM3, 'grafico'>[];
  let curva: Punto[];
  let valor: number;
  let residuos: VisualPasoM3['grafico']['residuos'];
  if (tema === 'lagrange') {
    const r = lagrange(datos);
    valor = r.valor!;
    curva = muestrear(polinomioLagrange(puntos));
    const otros = puntos.slice(1);
    const den = otros.reduce((a, p) => a * (puntos[0].x - p.x), 1);
    const num = otros.reduce((a, p) => a * (x - p.x), 1);
    const base = baseLagrange(puntos, 0, x);
    const factores = producto(otros.map(p => `(${f(x)} − (${f(p.x)}))`));
    const divisores = producto(otros.map(p => `(${f(puntos[0].x)} − (${f(p.x)}))`));
    visuales = [
      { operaciones: [op('Contar los nodos', `n = ${n}`), op('Relacionar nodos y grado', 'grado máximo = n − 1')],
        resultado: `grado máximo = ${n} − 1 = ${n - 1}`,
        tabla: { columnas: ['i', 'xᵢ', 'yᵢ'], filas: puntos.map((p, i) => [String(i + 1), f(p.x), f(p.y)]) } },
      { operaciones: [fraccion('Definir la primera base', '∏ⱼ≠₁ (x − xⱼ)', '∏ⱼ≠₁ (x₁ − xⱼ)'),
          op('Sustituir en el denominador', `D₁ = ${divisores}`),
          op('Restar antes de multiplicar', `D₁ = ${producto(otros.map(p => `(${f(puntos[0].x - p.x)})`))}`)],
        resultado: `D₁ = ${f(den)}` },
      { operaciones: [fraccion(`Sustituir x = ${x} en L₁(x)`, factores, f(den)),
          fraccion('Calcular el producto del numerador', f(num), f(den))], resultado: `L₁(${x}) ≈ ${f(base)}` },
      { operaciones: [op('Ponderar la base', 'aporte₁ = y₁ · L₁(x*)'),
          op('Sustituir los valores', `aporte₁ = (${f(puntos[0].y)}) · (${f(base)})`)],
        resultado: `aporte₁ ≈ ${f(puntos[0].y * base)}` },
      { operaciones: [op('Repetir para cada nodo', 'P(x*) = Σ yᵢ · Lᵢ(x*)'),
          ...r.filas.map(fila => op(`Aporte del nodo ${fila.i}`, `(${f(fila.yi)}) · (${f(fila.li)}) ≈ ${f(fila.aporte)}`)),
          op('Sumar los aportes', `P(${x}) ≈ ${r.filas.map(fila => `(${f(fila.aporte)})`).join(' + ')}`)],
        resultado: `P(${x}) ≈ ${f(valor)}` },
      { operaciones: [op('Obtener el polinomio', r.polinomio!),
          op('Comprobar en los nodos', puntos.map(p => `P(${f(p.x)}) ≈ ${f(p.y)}`).join('   •   ')),
          op('Interpretar el alcance', 'Coincidir en los nodos no determina el error entre ellos.')],
        resultado: `Estimación final: P(${x}) ≈ ${f(valor)}` },
    ];
  } else {
    const r = minimosCuadrados(datos);
    valor = r.prediccion!;
    curva = muestrear(xi => r.a0 + r.a1 * xi);
    residuos = puntos.map(p => ({ x: p.x, observado: p.y, estimado: r.a0 + r.a1 * p.x }));
    const den = n * r.sumX2 - r.sumX ** 2;
    const num = n * r.sumXY - r.sumX * r.sumY;
    const primero = residuos[0];
    visuales = [
      { operaciones: [op('Trabajar por filas', 'xᵢ² = xᵢ · xᵢ     ;     xᵢyᵢ = xᵢ · yᵢ'),
          op('Sumar cada columna', 'Σxy = x₁y₁ + x₂y₂ + … + xₙyₙ')], resultado: `Σxy = ${f(r.sumXY)}`,
        tabla: { columnas: ['i', 'xᵢ', 'yᵢ', 'xᵢ²', 'xᵢyᵢ'], filas: puntos.map((p, i) => [String(i + 1), f(p.x), f(p.y), f(p.x * p.x), f(p.x * p.y)]),
          totales: ['Σ', f(r.sumX), f(r.sumY), f(r.sumX2), f(r.sumXY)] } },
      { operaciones: [op('Preparar el denominador', 'D = nΣx² − (Σx)²'),
          op('Sustituir las sumatorias', `D = ${n} · (${f(r.sumX2)}) − (${f(r.sumX)})²`),
          op('Multiplicar y elevar al cuadrado', `D = ${f(n * r.sumX2)} − ${f(r.sumX ** 2)}`)], resultado: `D = ${f(den)}` },
      { operaciones: [fraccion('Fórmula de la pendiente a₁', 'nΣxy − ΣxΣy', 'nΣx² − (Σx)²'),
          fraccion('Sustituir las sumatorias', `${n} · (${f(r.sumXY)}) − (${f(r.sumX)}) · (${f(r.sumY)})`, f(den)),
          fraccion('Simplificar el numerador', f(num), f(den))], resultado: `a₁ ≈ ${f(r.a1)}` },
      { operaciones: [op('Calcular los promedios', `x̄ = ${f(r.sumX)} / ${n} = ${f(r.mediaX)}     ;     ȳ = ${f(r.sumY)} / ${n} = ${f(r.mediaY)}`),
          op('Fórmula del intercepto', 'a₀ = ȳ − a₁x̄'),
          op('Sustituir', `a₀ = ${f(r.mediaY)} − (${f(r.a1)}) · (${f(r.mediaX)})`)], resultado: `a₀ ≈ ${f(r.a0)}` },
      { operaciones: [op('Construir la recta', r.recta),
          op(`Predecir en x = ${x}`, `ŷ(${x}) = ${f(r.a0)} + (${f(r.a1)}) · (${x}) ≈ ${f(valor)}`),
          op('Definir el residuo', 'eᵢ = yᵢ − ŷᵢ'),
          op('Usar el primer dato', `e₁ = ${f(primero.observado)} − (${f(primero.estimado)})`)],
        resultado: `e₁ ≈ ${f(primero.observado - primero.estimado)}` },
      { operaciones: [op('Cuantificar el error', 'SSE = Σ(yᵢ − ŷᵢ)²'),
          op('Comparar con la variación total', 'r² = 1 − SSE / Σ(yᵢ − ȳ)²'),
          op('Leer los indicadores', `r² ≈ ${f(r.r2)}     ;     error estándar ≈ ${f(r.errorEstandar)}`),
          op('Observar el gráfico', 'Busca patrones en los residuos y revisa si x* está dentro del intervalo de datos.')],
        resultado: `Recta: ${r.recta}     ;     ŷ(${x}) ≈ ${f(valor)}` },
    ];
  }
  return visuales.map((visual, paso) => ({ ...visual, grafico: grafico(paso, curva, valor, residuos) }));
}
