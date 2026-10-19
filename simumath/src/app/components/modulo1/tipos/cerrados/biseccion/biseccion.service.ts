import { Injectable, signal } from '@angular/core';
import type {
  DatosCalculo,
  Ejemplo,
  RespuestaCalculadora,
} from '../../../../../shared/models/metodo.model';
import { parsearFuncion } from '../../../../../shared/domain/numerico/evaluador-funciones';
import { biseccion, type FilaBiseccion } from './biseccion.algoritmo';

/**
 * Orquestador de Bisección: el pegamento entre el contenido y el motor.
 *
 * ── Dónde vive cada cosa ─────────────────────────────────────────────
 *   biseccion.algoritmo.ts  → la matemática (función pura, sin Angular)
 *   biseccion.contenido.ts  → los textos y los enunciados
 *   biseccion.config.ts     → las columnas y los campos de la calculadora
 *   ESTE archivo             → el pegamento entre los tres
 *
 * ── Por qué un servicio y no lógica en el componente ─────────────────
 * Porque el cálculo tiene que sobrevivir a que el alumno cambie de
 * pestaña. Con un signal acá, si va a Teoría, vuelve a Ejemplos y sus
 * iteraciones siguen ahí. Con lógica dentro del componente, se perderían
 * al destruirse.
 *
 * ── La separación con otros métodos ──────────────────────────────────
 * Este servicio NO importa nada de Regla Falsa, Newton ni Secante: cada
 * uno va a tener el suyo. Lo único compartido es la forma de los datos
 * (shared/models) y el parser de expresiones (shared/domain/numerico).
 *
 * ── Por qué `providedIn: 'any'` y no `root` ni `providers` ───────────
 * `root` daría un singleton de toda la app: su cálculo en curso
 * sobreviviría aunque el alumno salga de bisección y entre a Newton, y
 * la calculadora podría mostrar la cuenta del método anterior. Con
 * `any` hay una instancia por injector de carga diferida: las cuatro
 * pestañas son `loadComponent` dentro del mismo bundle lazy, así que
 * comparten esta instancia y el cálculo sobrevive al cambio de pestaña,
 * pero muere al salir del método.
 *
 * Un `@Injectable()` pelado, sin `providedIn` ni `providers` en la ruta,
 * no funcionaría: nadie lo proveería y `inject()` lanzaría
 * NullInjectorError en runtime, aunque los tests de tipos passaran.
 */
@Injectable({ providedIn: 'any' })
export class BiseccionService {
  /** El resultado del último cálculo, o null si todavía no calculó. */
  private readonly estado = signal<BiseccionEstado | null>(null);

  /** Para leer el estado desde los componentes. */
  readonly resultado = this.estado.asReadonly();

  /**
   * Corre la bisección con los datos que le pasaron.
   *
   * Devuelve el estado ya formateado. Si algo no cuadra (función
   * inválida, falta cambio de signo), NO lanza una excepción: devuelve
   * un estado con `convergio: false` y el mensaje en la respuesta. La
   * calculadora le muestra el mensaje al alumno en vez de romper la
   * pantalla.
   */
  calcular(datos: DatosCalculo): BiseccionEstado {
    const estado = this.ejecutar(datos);
    this.estado.set(estado);
    return estado;
  }

  /** Borra el cálculo. Lo llama el botón "Limpiar". */
  limpiar(): void {
    this.estado.set(null);
  }

  /* ---------------------------------------------------------------- */
  /* El trabajo de verdad, acá adentro                                 */
  /* ---------------------------------------------------------------- */

  private ejecutar(datos: DatosCalculo): BiseccionEstado {
    // ── 1. Parsear la función ────────────────────────────────────────
    // OJO: `parsearFuncion` NO devuelve null cuando la expresión está
    // mala: lanza `ErrorExpresion`. Por eso va dentro de un try. Sin el
    // try, un typo del alumno (un paréntesis de más) escapaba como
    // excepción sin manejar, la pantalla se quedaba en blanco y el
    // alumno no recibía ningún mensaje. Una calculadora tiene que
    // explicar el problema, no romperse.
    const f = this.parsearSeguro(datos.funcion);
    if (!f) {
      return fallo(
        datos,
        'No se pudo entender la función. Revisá la sintaxis: se admiten ^ para ' +
          'potencias, exp(), ln(), sen(), cos(), tan(), log() y sqrt().',
      );
    }

    const a = Number(datos.a);
    const b = Number(datos.b);
    const tol = Number(datos.tol);
    const maxIter = datos.maxIter ?? 100;

    // ── 2. Correr el algoritmo ───────────────────────────────────────
    const r = biseccion({ f, a, b, tol, maxIter });

    // ── 3. Convertir las filas al formato de la tabla ────────────────
    // El algoritmo devuelve números; la tabla muestra texto ya
    // formateado. La conversión va acá, no adentro del algoritmo, para
    // que la matemática no sepa nada de pantallas.
    const filas = r.filas.map((fila: FilaBiseccion) => ({
      n: fila.n,
      a: formatear(fila.a),
      b: formatear(fila.b),
      c: formatear(fila.c),
      fc: formatear(fila.fc),
      error: formatear(fila.error),
    }));

    const filaFinal = r.convergio ? filas.length - 1 : undefined;

    // ── 4. Armar la respuesta que ve el alumno ───────────────────────
    const respuesta: RespuestaCalculadora = r.convergio
      ? {
          exito: true,
          raiz: formatear(r.raiz!),
          iteraciones: r.iteraciones,
          error: formatear(r.error!),
          conclusion:
            `Bisección convergió en ${r.iteraciones} iteraciones. La raíz es ` +
            `x ≈ ${formatear(r.raiz!)} con un error garantizado menor que ` +
            `${formatear(r.error!)}. El método se detuvo porque la cota ` +
            `(b − a)/2 quedó por debajo de la tolerancia ${datos.tol}.`,
        }
      : {
          exito: false,
          conclusion:
            r.mensaje ??
            'No se pudo completar el cálculo con los datos ingresados.',
        };

    return {
      datos,
      filas,
      filaFinal,
      raiz: r.raiz,
      error: r.error,
      iteraciones: r.iteraciones,
      convergio: r.convergio,
      respuesta,
    };
  }

  /**
   * Corre el algoritmo para un ejemplo del contenido, sin guardar el
   * resultado.
   *
   * Se usa por la pestaña de Ejemplos: el contenido ya viene con sus
   * datos, así que no hace falta tocar la calculadora. El cálculo es de
   * todas formas, no texto copiado: si el motor cambia, la tabla cambia
   * con él y el ejemplo no puede mentir.
   */
  calcularEjemplo(ejemplo: Ejemplo): BiseccionEstado {
    return this.ejecutar(ejemplo.calculo);
  }

  /* ---------------------------------------------------------------- */
  /* Utilidades para los componentes                                   */
  /* ---------------------------------------------------------------- */

  /**
   * Parsea la función de un ejemplo del contenido, para el gráfico.
   *
   * Los ejemplos del contenido ya se verificaron en los tests: si uno
   * llegara a fallar acá, es que alguien cambió el `calculo.funcion`
   * sin correr los tests.
   */
  funcionDeEjemplo(ejemplo: Ejemplo): (x: number) => number {
    return this.funcionDesdeTexto(ejemplo.calculo.funcion);
  }

  /**
   * Parsea una función escrita a mano, para el gráfico de la calculadora.
   *
   * Va acá y no en el componente para que el parseo tenga un solo dueño
   * en toda la página: si el componente lo hiciera, cada pestaña
   * terminaría importando el evaluador y el parser quedaría repartido
   * en tres lugares.
   *
   * El `?? (() => 0)` es solo para el gráfico: si el texto no se pudo
   * parsear, mejor una recta en cero que un canvas vacío que parece
   * un error de dibujo.
   */
  funcionDesdeTexto(texto: string): (x: number) => number {
    return this.parsearSeguro(texto) ?? (() => 0);
  }

  /**
   * Parsea sin dejar escapar la excepción.
   *
   * Devuelve null en vez de tirar `ErrorExpresion`, para que quien llama
   * pueda tratar el caso "el alumno escribió algo que no es una función"
   * y mostrarle un mensaje.
   */
  private parsearSeguro(texto: string): ((x: number) => number) | null {
    try {
      return parsearFuncion(texto);
    } catch {
      return null;
    }
  }

  /**
   * El rango del eje X que conviene mostrar.
   *
   * Si no se fizer nada, el gráfico podría mostrar [-5, 5] y la raíz
   * de 1.52 quedaría en una esquina ilegible. Acá se elige un rango
   * que contenga el intervalo inicial con un margen.
   */
  rangoPara(datos: DatosCalculo): { min: number; max: number } {
    const a = Number(datos.a);
    const b = Number(datos.b);

    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return { min: -5, max: 5 };
    }

    const min = Math.min(a, b);
    const max = Math.max(a, b);
    const ancho = max - min || 1;
    const margen = ancho * 0.25;

    return { min: min - margen, max: max + margen };
  }
}

/* ------------------------------------------------------------------ */
/* Tipos y funciones libres                                             */
/* ------------------------------------------------------------------ */

/** Lo que este servicio recuerda entre pestañas. */
export interface BiseccionEstado {
  /** Qué datos se usaron para calcular. */
  datos: DatosCalculo;
  /** Las filas de la tabla de iteraciones, ya formateadas. */
  filas: Record<string, number | string>[];
  /** Índice de la fila que cumplió el criterio de parada. */
  filaFinal?: number;
  /** La raíz encontrada, como número (para el gráfico). */
  raiz?: number;
  /** El error de esa raíz. */
  error?: number;
  /** Cuántas iteraciones hizo. */
  iteraciones: number;
  /** Si terminó bien. */
  convergio: boolean;
  /** La respuesta formateada para la calculadora. */
  respuesta: RespuestaCalculadora;
}

/** Estado de fallo, cuando ni siquiera se pudo arrancar. */
function fallo(datos: DatosCalculo, mensaje: string): BiseccionEstado {
  return {
    datos,
    filas: [],
    iteraciones: 0,
    convergio: false,
    respuesta: { exito: false, conclusion: mensaje },
  };
}

/**
 * Formatea un número con 8 decimales, sin ceros colgantes.
 *
 * Es el mismo formato que usa el resto del portal, para que el número
 * de la tabla y el número de la conclusión se vean iguales.
 */
function formatear(v: number): string {
  if (!Number.isFinite(v)) return '—';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(8).replace(/\.?0+$/, '');
}

