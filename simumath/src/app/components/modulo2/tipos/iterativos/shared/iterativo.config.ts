import { InjectionToken } from '@angular/core';
import type { CampoCalculadora, Columna } from '../../../../../shared/models/metodo.model';
import type { MetodoIterativo, ResultadoIterativo } from './iterativo.algoritmo';

export const METODO_ITERATIVO = new InjectionToken<MetodoIterativo>('Método iterativo del sistema');
export const CONFIG_ITERATIVOS = {
  jacobi: { key: 'jacobi' as const, nombre: 'Jacobi', ruta: 'jacobi', color: '#1b365d',
    resumen: 'Calcula cada componente con el vector de la iteración anterior. Actualiza todas las incógnitas sin reutilizar resultados de la misma barrida.',
    formula: 'xᵢ⁽ᵏ⁺¹⁾ = (bᵢ − Σⱼ≠ᵢ aᵢⱼ xⱼ⁽ᵏ⁾) / aᵢᵢ' },
  'gauss-seidel': { key: 'gaussSeidel' as const, nombre: 'Gauss-Seidel', ruta: 'gauss-seidel', color: '#146358',
    resumen: 'Actualiza las incógnitas en orden y usa inmediatamente los valores nuevos. Cada barrida combina componentes recién calculadas con las anteriores.',
    formula: 'xᵢ⁽ᵏ⁺¹⁾ = (bᵢ − Σⱼ<ᵢ aᵢⱼ xⱼ⁽ᵏ⁺¹⁾ − Σⱼ>ᵢ aᵢⱼ xⱼ⁽ᵏ⁾) / aᵢᵢ' },
};
export const CAMPOS_ITERATIVOS: CampoCalculadora[] = [
  { key: 'matriz', etiqueta: 'Matriz de coeficientes A', tipo: 'text', multilinea: true, filas: 4,
    valorInicial: '10 -1 2\n-1 11 -1\n2 -1 10', ayuda: 'Una ecuación por fila. Separa coeficientes con espacios o comas; las filas también pueden separarse con punto y coma.', requisito: 'Entre 1 y 20 ecuaciones, matriz cuadrada y diagonal sin ceros.' },
  { key: 'ladoDerecho', etiqueta: 'Vector b', tipo: 'text', valorInicial: '6 22 -10', ayuda: 'Un término independiente por ecuación, en el mismo orden.' },
  { key: 'x0', etiqueta: 'Vector inicial x⁽⁰⁾', tipo: 'text', valorInicial: '0 0 0', ayuda: 'Un valor por incógnita. Si dejas el campo vacío se usa el vector cero.' },
  { key: 'tol', etiqueta: 'Tolerancia', tipo: 'number', valorInicial: '0.000001', ayuda: 'Número finito mayor que cero. Se aplica al cambio escalado y al residuo relativo.' },
  { key: 'maxIter', etiqueta: 'Máximo de iteraciones', tipo: 'number', valorInicial: '200', ayuda: 'Entero entre 1 y 5000. Alcanzar el límite no significa haber encontrado la solución.' },
];

export const numero = (n: number): string => Number.isFinite(n) ? (n === 0 ? '0' : Number(n.toPrecision(8)).toString().replace('-', '−')) : '—';
export const vector = (x: readonly number[]): string => '(' + x.map(numero).join('; ') + ')';
export function columnasIterativas(n: number): Columna[] {
  return [{ key: 'k', label: 'k', align: 'right' }, ...Array.from({ length: n }, (_, i): Columna => ({ key: `x${i}`, label: `x${i + 1}`, align: 'right' })),
    { key: 'cambioRelativo', label: 'Cambio escalado δ', align: 'right' },
    { key: 'residuoRelativo', label: 'Residuo relativo η', align: 'right' }];
}
export function filasIterativas(r: ResultadoIterativo): Record<string, number | string>[] {
  return [...(r.inicial ? [r.inicial] : []), ...r.iteracionesDetalle].map(f => ({
    k: f.k, ...Object.fromEntries(f.x.map((v, i) => [`x${i}`, numero(v)])),
    cambioRelativo: f.k === 0 ? '—' : numero(f.cambioRelativo), residuoRelativo: numero(f.residuoRelativo),
  }));
}
