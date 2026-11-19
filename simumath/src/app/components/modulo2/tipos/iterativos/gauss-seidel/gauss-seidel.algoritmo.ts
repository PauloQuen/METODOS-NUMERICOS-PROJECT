import { resolverIterativo, type EntradaIterativa } from '../shared/iterativo.algoritmo';
export const ejecutarGaussSeidel = (entrada: EntradaIterativa) => resolverIterativo(entrada, 'gauss-seidel');
