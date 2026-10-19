import { Component, computed, model, signal } from '@angular/core';
import { RegistroNav } from '../../../shared/layout/registro-nav/registro-nav';
import { FormField } from '../../../shared/ui/form-field/form-field';
import { Btn } from '../../../shared/ui/btn/btn';
import { StatChip } from '../../../shared/domain/stat-chip/stat-chip';
import {
  IterationTable,
  IterationColumn,
} from '../../../shared/domain/iteration-table/iteration-table';
import { Badge } from '../../../shared/ui/badge/badge';
import { UiCard } from '../../../shared/ui/ui-card/ui-card';
import {
  biseccion,
  parseFuncion,
  MetodoResultado,
} from '../../../shared/domain/numerico/methods';
import {
  ejemploDe,
  ejecutarMetodo,
  familiaDe,
  metodo,
  pideEntrada,
  REGISTRO,
  REGISTRO_POR_KEY,
  type MetodoKey,
} from '../../../shared/domain/numerico/registro';
import {
  CRITERIOS,
  CRITERIO_POR_DEFECTO_DE,
  CriterioKey,
  criteriosDeMetodo,
  descripcionTolerancia,
  toleranciaDesdeDigitos,
} from '../../../shared/domain/numerico/criterio';
import {
  ApiError,
  API_BASE_URL,
  BiseccionRequestBody,
  calcularBiseccionApi,
  mapearBiseccionApi,
} from '../../../shared/services/api-calculadoras.service';

export type { MetodoKey };

/**
 * Columnas que SOLO trae la API (POST /metodos/biseccion): el producto
 * f(a)·f(c) que prueba el cambio de signo, y el error relativo en %. El
 * motor local no las emite, así que no van en el registro: son un agregado
 * del backend, no parte del método.
 */
const COLUMNAS_EXTRAS_API: IterationColumn[] = [
  { key: 'f(a)·f(c)', label: 'f(a)·f(c)', align: 'right' },
  { key: 'Error %', label: 'Error %', align: 'right' },
];

/**
 * Cómo expresa el estudiante la tolerancia. No son dos formas de escribir lo
 * mismo: los decimales piden un error ABSOLUTO y las cifras significativas
 * piden un error RELATIVO, así que elegir mal el criterio subestima o
 * sobreestima la precisión alcanzada.
 */
export type ModoTolerancia = 'decimales' | 'cifras';

/**
 * Rótulos de cada método (nombre y fórmula), derivados del registro.
 *
 * Antes era un `Record` escrito a mano. Ahora sale de `REGISTRO_POR_KEY`, así
 * que no puede quedar desactualizado respecto del registro: si se agrega un
 * método, el rótulo aparece solo.
 */
const METODO_INFO: Record<MetodoKey, { nombre: string; formula: string }> = Object.fromEntries(
  Object.values(REGISTRO_POR_KEY).map((m) => [m.key, { nombre: m.nombre, formula: m.formula }]),
) as Record<MetodoKey, { nombre: string; formula: string }>;

/**
 * Calculadoras Interactivas del Módulo 1.
 * Ejecuta los 5 métodos numéricos reales (shared/domain/numerico) sobre los
 * datos que ingresa el estudiante y muestra el paso a paso en una tabla.
 *
 * ── Integración con el backend (estado real) ────────────────────────────
 * La API (FastAPI en API_BASE_URL) ya expone Bisección:
 *
 *   POST /metodos/biseccion
 *     body: { funcion, a, b, max_iteraciones, tolerancia }  (a/b números)
 *     resp: { convergio, iteraciones_realizadas, iteraciones: [...] } y más
 *
 * `calcular()` → bisección se resuelve CONSUMIENDO la API y mapeando la
 * respuesta a MetodoResultado (ver api-calculadoras.service.ts). Si el
 * backend no responde (apagado/CORS), se cae al motor local para que la
 * demo nunca se rompa (el mensaje de fallback va por console.warn).
 *
 * Newton, Regla Falsa, Secante y Punto Fijo siguen ejecutándose con el
 * motor local mientras el backend no los exponga; los stubs documentados
 * para esos endpoints están en api-calculadoras.service.ts.
 */
@Component({
  selector: 'app-calculadoras',
  imports: [RegistroNav, FormField, Btn, StatChip, IterationTable, Badge, UiCard],
  templateUrl: './calculadoras.html',
  styleUrl: './calculadoras.scss',
})
export class Calculadoras {
  readonly info = METODO_INFO;

  // Método activo
  readonly metodo = signal<MetodoKey>('biseccion');

  /** Ficha completa del método activo: familia, orden, idea, requisitos. */
  readonly ficha = computed(() => metodo(this.metodo()));
  /** Familia a la que pertenece, para el badge y el color de la sección. */
  readonly familiaActiva = computed(() => familiaDe(this.metodo()));

  // Entradas del problema (two-way con app-form-field)
  readonly funcion = model('x^3 - x - 2');
  readonly valorA = model('1');
  readonly valorB = model('2');
  readonly semilla = model('1.5'); // x₀ (newton, secante, punto fijo)
  readonly semilla2 = model('2'); // x₁ (secante)
  readonly tolerancia = model('0.0001');

  /**
   * Criterio de convergencia elegido. `''` significa "el default del método",
   * que NO es el mismo para los cinco (ver CRITERIO_POR_DEFECTO_DE: la
   * bisección usa intervalo y la regla falsa no, porque su intervalo no se
   * contrae).
   */
  readonly criterio = model<CriterioKey | ''>('');

  /**
   * La tolerancia se puede pedir de dos formas, y no son intercambiables:
   * una cantidad de DECIMALES (error absoluto) o una cantidad de CIFRAS
   * SIGNIFICATIVAS (error relativo). El student's enunciado dice una de las
   * dos, así que el formulario tiene que expresarlo.
   */
  readonly modoTolerancia = model<ModoTolerancia>('decimales');
  /** Cantidad pedida: 4 decimales, o 4 cifras significativas. */
  readonly precision = model('4');

  // Última ejecución
  readonly resultado = signal<MetodoResultado | null>(null);
  readonly ejecutando = signal(false);

  /**
   * Qué entradas son visibles según el método.
   *
   * Antes eran cuatro comparaciones `=== 'biseccion' || === 'reglaFalsa'` que
   * se tenían que actualizar cada vez que se agregaba un método. Ahora salen
   * de las entradas declaradas en el registro, así que un método nuevo trae
   * su formulario ya resuelto.
   */
  readonly usaIntervalo = computed(() => this.ficha().requiereIntervalo);
  readonly usaSemilla = computed(() => pideEntrada(this.metodo(), 'x0'));
  readonly usaSemilla2 = computed(() => pideEntrada(this.metodo(), 'x1'));
  readonly usaG = computed(() => this.ficha().operaSobreG);

  /* ------------------------------------------------------------------ */
  /* Criterio de convergencia                                            */
  /* ------------------------------------------------------------------ */

  /** El método activo mantiene un intervalo vivo (bisección, regla falsa). */
  private readonly metodoConIntervalo = computed(() => this.ficha().requiereIntervalo);

  /** Criterios que el método activo admite. */
  readonly criteriosDisponibles = computed<CriterioKey[]>(() =>
    criteriosDeMetodo(this.metodoConIntervalo()),
  );

  /**
   * Criterio que realmente se va a usar: el elegido, o el default del método.
   *
   * Si el estudiante elige cifras significativas pero el método terminó
   * usando el default absoluto, la respuesta sería silenciosamente incorrecta
   * (él pidió error relativo y no lo gustaría), así que acá se resuelve de
   * forma explícita: `relativo` siempre gana, en cualquier método.
   */
  readonly criterioEfectivo = computed<CriterioKey>(() => {
    const elegido = this.criterio();
    if (elegido) return elegido;
    // Pedir cifras significativas implica error relativo siempre.
    if (this.modoTolerancia() === 'cifras') return 'relativo';
    return CRITERIO_POR_DEFECTO_DE[this.metodo()] ?? 'absoluto';
  });

  readonly criterioActual = computed(() => CRITERIOS[this.criterioEfectivo()]);

  /**
   * Tolerancia efectiva en número, derivada de la precisión pedida.
   * Con decimales → error absoluto. Con cifras → error relativo, y para
   * traducirlo a absoluto hace falta conocer la magnitud de la raíz: se usa
   * la semilla o el punto medio del intervalo como estimación.
   */
  readonly toleranciaEfectiva = computed<number | null>(() => {
    const n = parseInt(this.precision(), 10);
    if (!Number.isFinite(n) || n < 1) return null;

    if (this.modoTolerancia() === 'decimales') {
      // Con n decimales el error absoluto no puede pasar la mitad de la
      // última posición, o el redondeo al decimal sale mal.
      return 0.5 * 10 ** -n;
    }

    // Con n cifras significativas: se usa el error relativo equivalente. La
    // magnitud estimada sale de la semilla, o del punto medio del intervalo.
    const magnitudEstimada = this.metodoConIntervalo()
      ? (this.leer(this.valorA) + this.leer(this.valorB)) / 2
      : this.leer(this.semilla);
    return toleranciaDesdeDigitos({ digitos: n, magnitud: magnitudEstimada });
  });

  /**
   * Texto que explica qué tolerancia se está aplicando.
   *
   * Con criterio ABSOLUTO (decimales) se puede traducir la tolerancia a
   * "n decimales correctos", que es como el enunciado lo pide.
   *
   * Con criterio RELATIVO (cifras significativas) NO se puede: `tol` es un
   * porcentaje de error, no un número de decimales. Decir "4 decimales
   * correctos" para una tolerancia relativa de 6.3e-4 sería mentirle al
   * alumno, así que en ese caso se muestra la magnitud y el porcentaje tal
   * cual, que es la información honesta.
   */
  readonly toleranciaExplicada = computed(() => {
    const tol = this.toleranciaEfectiva();
    if (tol === null || !Number.isFinite(tol)) return '';

    if (this.criterioEfectivo() === 'relativo') {
      const porcentaje = tol * 100;
      return `${porcentaje.toPrecision(2)} % de error relativo`;
    }
    return descripcionTolerancia(tol);
  });

  /**
   * Columnas según el método.
   *
   * Antes eran cinco listas escritas a mano dentro de un `switch`, y el
   * `switch` tenía que crecer cada vez que se agregaba un método (con el
   * agravante de que el `default` era "bisección", así que un método nuevo
   * sin caso propio caía en las columnas equivocadas sin avisar). Ahora se
   * arma desde `columnas` del registro: si un runner cambia sus claves, el
   * registro lo declara y la tabla sale bien sola.
   *
   * La única excepción son las dos columnas extra del backend
   * (`f(a)·f(c)` y `Error %`), que no las produce el motor local y por eso
   * se agregan solo cuando la respuesta vino de la API.
   */
  readonly columnas = computed<IterationColumn[]>(() => {
    const resultado = this.resultado();
    // ¿El resultado vino del backend? Las filas mapeadas traen las
    // columnas extra 'f(a)·f(c)' y 'Error %' (solo bisección por ahora).
    const desdeApi = !!resultado?.rows.length && 'f(a)·f(c)' in resultado.rows[0];

    const base: IterationColumn[] = this.ficha().columnas.map((key) => ({
      key,
      label: key,
      // La columna 'i' es el contador: centrado/izquierda. Todo lo demás
      // son magnitudes y van a la derecha para que las decimales alineen.
      align: key === 'i' ? ('left' as const) : ('right' as const),
    }));

    return desdeApi
      ? [...base, ...COLUMNAS_EXTRAS_API]
      : base;
  });

  readonly filaDestacada = computed<number | undefined>(() => {
    const r = this.resultado();
    return r?.converged ? r.iterations - 1 : undefined;
  });

  readonly badgeConvergencia = computed(() => {
    const r = this.resultado();
    return r?.converged ? `Criterio en iteración ${r.iterations}` : '';
  });

  /**
   * Por qué se detuvo el método, en una línea legible.
   *
   * Esto es lo que hace útil el contrato nuevo: el alumno no solo ve que
   * "convergió", ve QUÉ magnitud se midió y contra qué tolerancia se comparó.
   * Antes el motor paraba por criterios distintos según el método y la UI
   * solo mostraba el número de iteración, así que cualquier justificación de
   * la respuesta final quedaba en el aire.
   */
  readonly razonParada = computed(() => this.resultado()?.parada?.resumen ?? '');

  /**
   * Cambia de método y ajusta los datos al ejemplo canónico del nuevo.
   *
   * El ajuste solo ocurre si el alumno NO toquesu función a mano. Si escribe
   * la suya, se respeta: cambiar de pestaña no puede borrar trabajo. Si lo
   * que tiene en el campo es el ejemplo de otro método (o sea, está
   * intacto), se reemplaza por el del método nuevo.
   *
   * Esto importa de verdad: el ejemplo de Punto Fijo tiene que ser una g
   * reescrita (∛(x + 2)), no la f que comparten los otros cuatro. Con f
   * como g la sucesión diverge siempre y el alumno ve un error en su primer
   * clic, sin haber hecho nada malo.
   */
  cambiarMetodo(key: MetodoKey): void {
    this.metodo.set(key);
    this.resultado.set(null);

    if (!this.funcionEsEjemploDeAlguien()) return;

    const ej = ejemploDe(key);
    this.funcion.set(ej.funcion);
    if (ej.x0 !== undefined) this.semilla.set(ej.x0);
    if (ej.x1 !== undefined) this.semilla2.set(ej.x1);
  }

  /** ¿El campo de función sigue teniendo el ejemplo de algún método? */
  private funcionEsEjemploDeAlguien(): boolean {
    const actual = this.funcion().trim();
    return REGISTRO.some((m) => m.ejemplo.funcion.trim() === actual);
  }

  /**
   * Ejecuta el método activo con los datos del formulario.
   *
   * Bisección se resuelve contra la API real (POST /metodos/biseccion) y,
   * si el backend no responde, cae al motor local. Los demás métodos se
   * ejecutan localmente hasta que el backend los exponga (los stubs de
   * esos endpoints están en api-calculadoras.service.ts).
   */
  async calcular(): Promise<void> {
    this.ejecutando.set(true);
    try {
      // Validación común a los 5 métodos.
      //
      // La tolerancia sale de la PRECISIÓN PEDIDA (decimales o cifras
      // significativas), no de un número suelto: eso es lo que hace que el
      // criterio y la tolerancia cuenten la misma historia. El campo numérico
      // queda comooverride manual para esos casos, y si está vacío manda la
      // tolerancia derivada.
      const tolManual = parseFloat(this.tolerancia());
      const tolDerivada = this.toleranciaEfectiva();
      const tol = Number.isFinite(tolManual) && tolManual > 0 ? tolManual : tolDerivada;

      if (tol === null || !Number.isFinite(tol) || tol <= 0) {
        this.fallar('Indicá una tolerancia positiva o una cantidad de decimales válida.');
        return;
      }

      const m = this.metodo();
      if (m === 'biseccion') {
        // ── Bisección: consume la API del backend ─────────────────────
        // POST {API_BASE_URL}/metodos/biseccion — body: BiseccionRequestBody
        this.resultado.set(await this.calcularBiseccion(tol));
        return;
      }

      // ── El resto: motor local, resuelto por el registro ──────────────
      // Antes esto era un switch con un caso por método. Ahora se le pasa la
      // key y el registro se encarga de llamar al runner con la firma
      // correcta, así que agregar un método NO obliga a tocar este archivo.
      //
      // Ojo con punto fijo: para ese método la `funcion` del formulario es
      // g(x), no f(x). El registro lo declara con `operaSobreG`.
      const fn = parseFuncion(this.funcion());
      this.resultado.set(
        ejecutarMetodo(
          m,
          fn,
          {
            a: this.usarSiHay(this.valorA),
            b: this.usarSiHay(this.valorB),
            x0: this.usarSiHay(this.semilla),
            x1: this.usarSiHay(this.semilla2),
          },
          { tol, maxIter: 50, criterio: this.criterioEfectivo() },
        ),
      );
    } catch (e) {
      this.fallar(e instanceof Error ? e.message : 'Error inesperado al evaluar.');
    } finally {
      this.ejecutando.set(false);
    }
  }

  /**
   * Bisección vía API con fallback al motor local.
   *
   * Flujo: arma el BiseccionRequestBody → llama a calcularBiseccionApi →
   * mapea la respuesta a MetodoResultado. Si el backend está caído o el
   * origen no pasa CORS (ApiError tipo 'conexion'), usa biseccion() local
   * (mismos resultados: el motor es el espejo 1:1 del algoritmo). Si el
   * backend RESPONDE pero rechaza el cálculo (422/400/500), se muestra el
   * detalle del backend, porque ahí hay info valiosa de validación.
   */
  private async calcularBiseccion(tol: number): Promise<MetodoResultado> {
    const body: BiseccionRequestBody = {
      funcion: this.funcion(),
      a: this.leer(this.valorA),
      b: this.leer(this.valorB),
      // El front no expone límite de iteraciones: 50 (igual que el motor
      // local). Si lo querés configurar, agregá el input y pasalo acá.
      max_iteraciones: 50,
      tolerancia: tol,
    };

    try {
      const resp = await calcularBiseccionApi(body);
      return mapearBiseccionApi(resp);
    } catch (err) {
      if (err instanceof ApiError && err.tipo === 'backend') {
        // La API respondió con un rechazo: mostramos el detalle tal cual.
        return { rows: [], converged: false, iterations: 0, error: err.message };
      }
      // No se llegó al backend (apagado/CORS): fallback al motor local.
      console.warn(
        `[calculadoras] API (${API_BASE_URL}) no disponible; usando motor local.`,
        err,
      );
      return biseccion(
        parseFuncion(this.funcion()),
        body.a,
        body.b,
        body.tolerancia,
        body.max_iteraciones,
      );
    }
  }

  limpiar(): void {
    this.resultado.set(null);
  }

  /**
   * Lee un campo del formulario solo si el método activo lo pide. Los campos
   * que no aplican vienen vacíos y no deben romper la validación: quien decide
   * si un parámetro es obligatorio es el registro, a través de sus entradas.
   */
  private usarSiHay(campo: { (): string }): number | undefined {
    const v = parseFloat(campo());
    return Number.isFinite(v) ? v : undefined;
  }

  private leer(signal: { (): string }): number {
    const v = parseFloat(signal());
    if (!Number.isFinite(v)) {
      throw new Error('Todos los valores deben ser números válidos.');
    }
    return v;
  }

  private fallar(mensaje: string): void {
    this.resultado.set({ rows: [], converged: false, iterations: 0, error: mensaje });
  }
}