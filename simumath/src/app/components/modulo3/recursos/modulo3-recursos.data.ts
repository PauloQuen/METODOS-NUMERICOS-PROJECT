import type {
  GrupoRecursos,
  RecursoFuente,
  RecursoProfundizacion,
  RecursoVideo,
} from '../../../shared/recursos/recursos-section';

/**
 * RECURSOS DEL MÓDULO 3.
 *
 * Cada recurso declara su alcance y su `refId`:
 * · `modulo` + `modulo3`
 * · `tipo`   + `interpolacion` | `ajuste`
 * · `metodo` + `lagrange` | `lagrange-nuevo` | `minimos-cuadrados`
 *
 * ── Nada inventado ───────────────────────────────────────────────────
 * Las fuentes son canónicas y sus URL se comprobaron (HTTP 200) antes
 * de escribirlas. Los videos todavía no tienen una referencia elegida:
 * quedan en `estado: 'pendiente'`, se ven solo en desarrollo y no
 * crean ningún iframe.
 */
export interface CatalogoRecursosM3 {
  videos: RecursoVideo[];
  fuentes: RecursoFuente[];
  profundizacion: RecursoProfundizacion[];
}

export const RECURSOS_MODULO3: CatalogoRecursosM3 = {
  videos: [
    {
      id: 'm3-v-modulo',
      alcance: 'modulo',
      refId: 'modulo3',
      titulo: 'Análisis numérico: panorama del módulo',
      canal: 'Por definir',
      duracion: 'Por definir',
      descripcion: 'Qué se interpola, qué se ajusta y por qué son problemas distintos.',
      estado: 'pendiente',
    },
    {
      id: 'm3-v-interpolacion',
      alcance: 'tipo',
      refId: 'interpolacion',
      titulo: '¿Qué es interpolar?',
      canal: 'Por definir',
      duracion: 'Por definir',
      descripcion: 'La idea de construir un modelo que pasa exactamente por los datos.',
      estado: 'pendiente',
    },
    {
      id: 'm3-v-ajuste',
      alcance: 'tipo',
      refId: 'ajuste',
      titulo: 'Ajuste de curvas: idea general',
      canal: 'Por definir',
      duracion: 'Por definir',
      descripcion: 'Por qué con datos con error no se busca pasar por todos los puntos.',
      estado: 'pendiente',
    },
    {
      id: 'm3-v-lagrange',
      alcance: 'metodo',
      refId: 'lagrange',
      titulo: 'Interpolación de Lagrange paso a paso',
      canal: 'Por definir',
      duracion: 'Por definir',
      descripcion: 'Cómo se arman las bases Lᵢ(x) y cómo se suman los aportes.',
      estado: 'pendiente',
    },
    {
      id: 'm3-v-lagrange-nuevo',
      alcance: 'metodo',
      refId: 'lagrange-nuevo',
      titulo: 'Interpolación de Lagrange: bases y ejemplo',
      canal: 'Por definir',
      duracion: 'Por definir',
      descripcion: 'Las bases, la suma ponderada y la comparación con la función real.',
      estado: 'pendiente',
    },
    {
      id: 'm3-v-minimos-cuadrados',
      alcance: 'metodo',
      refId: 'minimos-cuadrados',
      titulo: 'Mínimos cuadrados con datos reales',
      canal: 'Por definir',
      duracion: 'Por definir',
      descripcion: 'Las ecuaciones normales, la recta ajustada y la lectura de r².',
      estado: 'pendiente',
    },
  ],

  fuentes: [
    {
      id: 'm3-f-modulo',
      alcance: 'modulo',
      refId: 'modulo3',
      titulo: 'Análisis numérico',
      entidad: 'Wikipedia en español',
      tipo: 'web',
      url: 'https://es.wikipedia.org/wiki/An%C3%A1lisis_num%C3%A9rico',
      estado: 'ok',
    },
    {
      id: 'm3-f-interpolacion',
      alcance: 'tipo',
      refId: 'interpolacion',
      titulo: 'Interpolación polinómica',
      entidad: 'Wikipedia en español',
      tipo: 'web',
      url: 'https://es.wikipedia.org/wiki/Interpolaci%C3%B3n_polin%C3%B3mica',
      estado: 'ok',
    },
    {
      id: 'm3-f-ajuste',
      alcance: 'tipo',
      refId: 'ajuste',
      titulo: 'Regresión lineal',
      entidad: 'Wikipedia en español',
      tipo: 'web',
      url: 'https://es.wikipedia.org/wiki/Regresi%C3%B3n_lineal',
      estado: 'ok',
    },
    {
      id: 'm3-f-lagrange',
      alcance: 'metodo',
      refId: 'lagrange',
      titulo: 'Polinomio de Lagrange',
      entidad: 'Wikipedia en español',
      tipo: 'web',
      url: 'https://es.wikipedia.org/wiki/Polinomio_de_Lagrange',
      estado: 'ok',
    },
    {
      id: 'm3-f-lagrange-mathworld',
      alcance: 'metodo',
      refId: 'lagrange',
      titulo: 'Lagrange interpolating polynomial',
      entidad: 'MathWorld (Wolfram)',
      tipo: 'web',
      url: 'https://mathworld.wolfram.com/LagrangeInterpolatingPolynomial.html',
      estado: 'ok',
    },
    {
      id: 'm3-f-lagrange-nuevo',
      alcance: 'metodo',
      refId: 'lagrange-nuevo',
      titulo: 'Polinomio de Lagrange',
      entidad: 'Wikipedia en español',
      tipo: 'web',
      url: 'https://es.wikipedia.org/wiki/Polinomio_de_Lagrange',
      estado: 'ok',
    },
    {
      id: 'm3-f-lagrange-nuevo-mathworld',
      alcance: 'metodo',
      refId: 'lagrange-nuevo',
      titulo: 'Lagrange interpolating polynomial',
      entidad: 'MathWorld (Wolfram)',
      tipo: 'web',
      url: 'https://mathworld.wolfram.com/LagrangeInterpolatingPolynomial.html',
      estado: 'ok',
    },
    {
      id: 'm3-f-minimos-cuadrados',
      alcance: 'metodo',
      refId: 'minimos-cuadrados',
      titulo: 'Mínimos cuadrados',
      entidad: 'Wikipedia en español',
      tipo: 'web',
      url: 'https://es.wikipedia.org/wiki/M%C3%ADnimos_cuadrados',
      estado: 'ok',
    },
    {
      id: 'm3-f-minimos-cuadrados-mathworld',
      alcance: 'metodo',
      refId: 'minimos-cuadrados',
      titulo: 'Least squares fitting',
      entidad: 'MathWorld (Wolfram)',
      tipo: 'web',
      url: 'https://mathworld.wolfram.com/LeastSquaresFitting.html',
      estado: 'ok',
    },
  ],

  profundizacion: [
    {
      id: 'm3-p-lagrange-teoria',
      alcance: 'metodo',
      refId: 'lagrange',
      texto: 'Si te trabaste, repasá la teoría de Lagrange',
      ruta: '/modulo3/tipos/interpolacion/lagrange/teoria',
      estado: 'ok',
    },
    {
      id: 'm3-p-lagrange-nuevo-teoria',
      alcance: 'metodo',
      refId: 'lagrange-nuevo',
      texto: 'Si te trabaste, repasá la teoría de Lagrange',
      ruta: '/modulo3/tipos/interpolacion/lagrange-nuevo/teoria',
      estado: 'ok',
    },
    {
      id: 'm3-p-lagrange-nuevo-ejemplos',
      alcance: 'metodo',
      refId: 'lagrange-nuevo',
      texto: 'Mirá un ejemplo resuelto antes de reintentar',
      ruta: '/modulo3/tipos/interpolacion/lagrange-nuevo/ejemplos',
      estado: 'ok',
    },
    {
      id: 'm3-p-minimos-cuadrados-teoria',
      alcance: 'metodo',
      refId: 'minimos-cuadrados',
      texto: 'Si te trabaste, repasá la teoría de mínimos cuadrados',
      ruta: '/modulo3/tipos/ajuste/minimos-cuadrados/teoria',
      estado: 'ok',
    },
  ],
};

function corresponde(
  recurso: { alcance?: string; refId?: string },
  alcance: 'modulo' | 'tipo' | 'metodo',
  tipoId: string,
  metodoId: string,
): boolean {
  if (alcance === 'modulo') {
    return recurso.alcance === 'modulo' && recurso.refId === 'modulo3';
  }
  if (alcance === 'tipo') {
    return recurso.alcance === 'tipo' && recurso.refId === tipoId;
  }
  return (recurso.alcance === 'metodo' || recurso.alcance === undefined) && recurso.refId === metodoId;
}

/**
 * Arma los grupos que ve un método: primero sus recursos propios,
 * después los del tipo y al final los del módulo.
 */
export function gruposDeRecursosM3(
  tipoId: string,
  metodoId: string,
  tipoNombre: string,
  metodoNombre: string,
): GrupoRecursos[] {
  const grupo = (
    id: string,
    titulo: string,
    descripcion: string,
    alcance: 'modulo' | 'tipo' | 'metodo',
  ): GrupoRecursos => ({
    id,
    titulo,
    descripcion,
    videos: RECURSOS_MODULO3.videos.filter((r) => corresponde(r, alcance, tipoId, metodoId)),
    fuentes: RECURSOS_MODULO3.fuentes.filter((r) => corresponde(r, alcance, tipoId, metodoId)),
    profundizacion: RECURSOS_MODULO3.profundizacion.filter((r) =>
      corresponde(r, alcance, tipoId, metodoId),
    ),
  });

  return [
    grupo('metodo', `De ${metodoNombre}`, 'Material específico de este método.', 'metodo'),
    grupo('tipo', `Del tipo ${tipoNombre}`, 'Material común a todos los métodos del tipo.', 'tipo'),
    grupo('modulo', 'Del módulo', 'Material general del Módulo 3.', 'modulo'),
  ].filter(
    (g) => g.videos.length + g.fuentes.length + g.profundizacion.length > 0,
  );
}
