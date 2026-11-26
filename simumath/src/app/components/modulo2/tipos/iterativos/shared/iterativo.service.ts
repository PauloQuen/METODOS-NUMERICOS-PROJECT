import { computed, inject, Injectable, signal } from '@angular/core';
import type { DatosSistema } from '../../../../../shared/models/sistema.model';
import type { RespuestaCalculadora } from '../../../../../shared/models/metodo.model';
import { parsearMatriz, parsearVector } from '../../../shared/sistema';
import { resolverIterativo, type ResultadoIterativo } from './iterativo.algoritmo';
import { CAMPOS_ITERATIVOS, CONFIG_ITERATIVOS, filasIterativas, METODO_ITERATIVO, numero, vector } from './iterativo.config';

/** Una instancia por ruta de método: conserva entradas y resultado al cambiar de pestaña. */
@Injectable()
export class IterativoService {
  readonly metodo = inject(METODO_ITERATIVO);
  readonly config = CONFIG_ITERATIVOS[this.metodo];
  readonly valores = signal<Record<string, string>>(this.predeterminados());
  readonly resultado = signal<ResultadoIterativo | null>(null);
  readonly datos = signal<DatosSistema | null>(null);
  readonly comparacion = signal<ResultadoIterativo | null>(null);
  readonly paso = signal(0);
  readonly otroMetodo = this.metodo === 'jacobi' ? 'gauss-seidel' : 'jacobi';
  readonly otroNombre = CONFIG_ITERATIVOS[this.otroMetodo].nombre;
  readonly filas = computed(() => this.resultado() ? filasIterativas(this.resultado()!) : []);
  readonly estados = computed(() => {
    const r = this.resultado();
    return r ? [...(r.inicial ? [r.inicial] : []), ...r.iteracionesDetalle] : [];
  });
  readonly actual = computed(() => this.estados()[this.paso()]);
  readonly respuesta = computed<RespuestaCalculadora | null>(() => {
    const r = this.resultado();
    if (!r) return null;
    const final = r.iteracionesDetalle.at(-1) ?? r.inicial;
    return { exito: r.convergio, solucion: r.solucion ? vector(r.solucion) : undefined,
      iteraciones: r.iteraciones, error: final ? `δ = ${numero(final.cambioRelativo)}; η = ${numero(final.residuoRelativo)}` : undefined,
      conclusion: r.mensaje };
  });

  calcular(entrada: Record<string, string>): void {
    this.valores.set({ ...entrada });
    this.paso.set(0);
    this.comparacion.set(null);
    this.datos.set(null);
    const textoA = (entrada['matriz'] ?? '').trim();
    let A: number[][];
    if (/^\[\s*\[/.test(textoA)) {
      try {
        const json: unknown = JSON.parse(textoA.replace(/−/g, '-'));
        if (!Array.isArray(json) || !json.every(f => Array.isArray(f) && f.every(a => typeof a === 'number'))) {
          this.fallar('La matriz JSON debe contener filas de números.'); return;
        }
        A = json;
      } catch { this.fallar('La matriz JSON no tiene un formato válido.'); return; }
    } else {
      const matriz = parsearMatriz(textoA);
      if (matriz.error) { this.fallar(matriz.error); return; }
      A = matriz.A;
    }
    if (A.length > 20) { this.fallar('La calculadora didáctica admite hasta 20 ecuaciones.'); return; }
    const b = parsearVector(entrada['ladoDerecho'] ?? '');
    if (b.error) { this.fallar(`Vector b: ${b.error}`); return; }
    const textoX0 = (entrada['x0'] ?? '').trim();
    const x0 = textoX0 ? parsearVector(textoX0) : { b: A.map(() => 0) };
    if (x0.error) { this.fallar(`Vector inicial: ${x0.error}`); return; }
    const datos: DatosSistema = { A, b: b.b, x0: x0.b, tol: Number(entrada['tol']), maxIter: Number(entrada['maxIter']) };
    const resultado = resolverIterativo(datos, this.metodo);
    if (resultado.estado !== 'entrada-invalida') this.datos.set(datos);
    this.resultado.set(resultado);
  }

  comparar(): void {
    const datos = this.datos();
    if (datos) this.comparacion.set(resolverIterativo(datos, this.otroMetodo));
  }

  probarDivergencia(): void {
    this.calcular({ matriz: '1 2\n2 1', ladoDerecho: '3 3', x0: '0 0', tol: '0.000001', maxIter: '12' });
  }

  reiniciar(): void {
    this.resultado.set(null); this.datos.set(null); this.comparacion.set(null); this.paso.set(0);
    this.valores.set(this.predeterminados());
  }

  private predeterminados(): Record<string, string> {
    return Object.fromEntries(CAMPOS_ITERATIVOS.map(c => [c.key, c.valorInicial]));
  }
  private fallar(mensaje: string): void {
    this.resultado.set({ estado: 'entrada-invalida', mensaje, convergio: false, iteraciones: 0, iteracionesDetalle: [], diagonalDominante: false });
  }
}
