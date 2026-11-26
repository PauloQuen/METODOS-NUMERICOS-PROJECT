import { crearBancoIterativo, ejemplosIterativos, cuentasIteracion, teoriaIterativa } from './iterativo.contenido';
import { resolverIterativo, normaInfinito, residuos } from './iterativo.algoritmo';
import { SesionPracticaService } from '../../../../../shared/practica-guiada/sesion-practica.service';
import { FUENTES_CONTENIDO } from '../../../../../shared/search/fuentes-contenido';

describe('Contenido y bancos de métodos iterativos', () => {
  it('incorpora teoría, recursos y los bancos de ambos métodos al buscador global', async () => {
    for (const key of ['jacobi', 'gaussSeidel']) {
      const fuente = FUENTES_CONTENIDO.find(f => f.clave === 'modulo2/iterativos/' + key)!;
      expect(fuente).toBeDefined();
      const contenido = await fuente.cargar();
      expect(contenido.ejercicios.length).toBe(24);
      expect(contenido.teoria.tercera).toContain('residuo');
      expect(contenido.teoria.recursos.length).toBeGreaterThan(0);
    }
  });
  for (const metodo of ['jacobi', 'gauss-seidel'] as const) {
    it(`${metodo} ofrece teoría, cuatro ejemplos y un banco válido de 24 problemas`, () => {
      const banco = crearBancoIterativo(metodo);
      expect(banco.length).toBe(24);
      expect(new Set(banco.map(e => e.id)).size).toBe(24);
      expect(banco.filter(e => e.tipo === 'numerico').length).toBe(12);
      expect(banco.filter(e => e.tipo === 'casuistica').length).toBe(12);
      const ejemplos = ejemplosIterativos(metodo);
      expect(ejemplos.length).toBe(4);
      for (const e of [...banco, ...ejemplos]) {
        const r = resolverIterativo(e.calculo, metodo);
        expect(r.convergio).withContext(e.id).toBeTrue();
        const exacta = e.resolucion!.valorCorrecto as number[];
        expect(normaInfinito(residuos(e.calculo.A, e.calculo.b, exacta))).toBeLessThan(1e-10);
        r.solucion!.forEach((v, i) => expect(Math.abs(v - exacta[i])).toBeLessThan(e.resolucion!.tolerancia!));
        expect(e.guia.length).toBeGreaterThanOrEqual(4);
        expect(e.cuestionario!.length).toBeGreaterThanOrEqual(12);
        expect(new Set(e.cuestionario!.map(q => q.id)).size).toBe(e.cuestionario!.length);
        for (const q of e.cuestionario!) {
          expect(q.opciones.filter(o => o.id === q.correcta).length).toBe(1);
          expect(new Set(q.opciones.map(o => o.texto)).size).toBe(q.opciones.length);
        }
        const barrida = e.guia.find(p => p.titulo === 'Barrida 1')!;
        const vectores = barrida.matrices!;
        expect(vectores[0].valores.map(f => f[0])).toEqual(e.calculo.x0!);
        expect(vectores[1].valores.map(f => f[0])).toEqual(r.iteracionesDetalle[0].x);
        expect(barrida.cuentas).toEqual(cuentasIteracion(e.calculo.A, e.calculo.b, e.calculo.x0!, r.iteracionesDetalle[0].x, metodo));
      }
      const teoria = teoriaIterativa(metodo);
      expect(teoria.recursos!.length).toBeGreaterThan(0);
      expect(teoria.algoritmo.formula).toContain('xᵢ');
      expect(teoria.precision).toContain('residuo');
    });

    it(`${metodo} renueva tandas disjuntas de seis y mantiene cuatro preguntas por ejercicio`, () => {
      const banco = crearBancoIterativo(metodo), sesion = new SesionPracticaService();
      const tanda = sesion.tanda(`modulo2:iterativos:${metodo}`, banco);
      for (let i = 0; i < 8; i++) {
        const anterior = tanda();
        expect(anterior.length).toBe(6);
        expect(anterior.filter(e => e.tipo === 'numerico').length).toBe(3);
        expect(anterior.filter(e => e.tipo === 'casuistica').length).toBe(3);
        anterior.forEach(e => expect(e.cuestionario!.length).toBe(4));
        sesion.renovar(`modulo2:iterativos:${metodo}`, banco);
        expect(tanda().some(e => anterior.some(a => a.id === e.id))).toBeFalse();
      }
      expect(banco.every(e => e.cuestionario!.length >= 12)).toBeTrue();
    });
  }
});
