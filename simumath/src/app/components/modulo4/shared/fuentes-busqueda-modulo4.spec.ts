import { FUENTES_CONTENIDO } from '../../../shared/search/fuentes-contenido';
import { IndiceBusquedaService } from '../../../shared/search/indice-busqueda.service';

/** El buscador solo indexa lo que declara FUENTES_CONTENIDO. */
describe('índice de búsqueda del Módulo 4', () => {
  const CLAVES = ['modulo4/newton-cotes/trapecio', 'modulo4/newton-cotes/simpson'];

  it('declara una fuente por método con la clave del catálogo', () => {
    const claves = FUENTES_CONTENIDO.map((f) => f.clave);
    for (const clave of CLAVES) expect(claves).toContain(clave);
  });

  it('carga teoría y ejemplos/ejercicios de los dos métodos', async () => {
    for (const clave of CLAVES) {
      const fuente = FUENTES_CONTENIDO.find((f) => f.clave === clave)!;
      const contenido = await fuente.cargar();
      expect(contenido.teoria.concepto.length).withContext(clave).toBeGreaterThan(0);
      expect(contenido.teoria.fundamento.length).withContext(clave).toBeGreaterThan(0);
      expect(contenido.teoria.tercera.length).withContext(clave).toBeGreaterThan(0);
      expect(contenido.ejercicios.length).withContext(clave).toBeGreaterThan(0);
      expect(contenido.ejercicios.every((e) => e.planteamiento.length > 0))
        .withContext(clave)
        .toBeTrue();
    }
  });

  it('encuentra conceptos y ejercicios de M4 con rutas que existen', async () => {
    const servicio = new IndiceBusquedaService();
    await servicio.asegurarContenido();

    for (const termino of ['trapecio', 'Simpson']) {
      const resultados = servicio.buscar(termino).flatMap((g) => g.resultados);
      expect(resultados.length).withContext(termino).toBeGreaterThan(0);
      const delModulo4 = resultados.filter((r) => r.ruta?.startsWith('/modulo4/'));
      expect(delModulo4.length).withContext(termino).toBeGreaterThan(0);
      expect(delModulo4.some((r) => r.tipo === 'concepto'))
        .withContext(termino)
        .toBeTrue();
      expect(delModulo4.some((r) => r.tipo === 'ejercicio'))
        .withContext(termino)
        .toBeTrue();
    }
  });
});
