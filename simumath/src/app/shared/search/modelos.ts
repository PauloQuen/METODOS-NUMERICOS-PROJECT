import type { FragmentoResaltado } from './normalizacion';

/** Qué clase de cosa encontró el buscador. */
export type TipoEntrada =
  | 'modulo'
  | 'submodulo'
  | 'metodo'
  | 'pestana'
  | 'ejercicio'
  | 'concepto'
  | 'recurso'
  | 'seccion';

/** Una entrada del índice: todo lo que el buscador puede devolver. */
export interface EntradaBusqueda {
  id: string;
  tipo: TipoEntrada;
  titulo: string;
  /** Una línea que explica qué es. */
  descripcion: string;
  /** Ruta de destino, o null si el contenido todavía no existe. */
  ruta: string | null;
  /** Ruta completa legible: Módulo › Submódulo › Método › Pestaña. */
  rutaTexto: string;
  /** Palabras con las que también se debe encontrar. */
  claves: string[];
  /** Texto largo para el ranking y el fragmento. */
  cuerpo?: string;
}

/** Una entrada ya puntuada, lista para pintar. */
export interface ResultadoBusqueda extends EntradaBusqueda {
  puntaje: number;
  fragmento: FragmentoResaltado | null;
  /** Los tokens con los que se resaltó el fragmento. */
  tokens: string[];
}

/** Un grupo de resultados, en el orden en que se muestran. */
export interface GrupoResultados {
  tipo: TipoEntrada;
  etiqueta: string;
  resultados: ResultadoBusqueda[];
}

export const ETIQUETA_GRUPO: Record<TipoEntrada, string> = {
  modulo: 'Módulos',
  submodulo: 'Submódulos',
  metodo: 'Métodos',
  pestana: 'Pestañas',
  ejercicio: 'Ejercicios',
  concepto: 'Conceptos',
  recurso: 'Recursos',
  seccion: 'Material del portal',
};
