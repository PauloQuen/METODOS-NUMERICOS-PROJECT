import { Component, computed, inject, signal } from '@angular/core';
import { GaussService } from '../gauss.service';
import { CAMPOS_CALCULADORA, COLUMNAS_GAUSS } from '../gauss.config';
import { dibujarGauss } from '../gauss.grafico';
import { formatearResiduo, formatearSolucion } from '../gauss.algoritmo';
import { CalculadoraShell } from '../../../../../../shared/domain/calculadora-shell/calculadora-shell';
import { IterationTable } from '../../../../../../shared/domain/iteration-table/iteration-table';
import { PasosControl } from '../../../../../../shared/domain/pasos-control/pasos-control';
import { GraficoSistema } from '../../../../../../shared/domain/grafico-sistema/grafico-sistema';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import type { RespuestaCalculadora } from '../../../../../../shared/models/metodo.model';

/**
 * PESTAÑA DE CALCULADORA de la eliminación gaussiana.
 *
 * ── Quién hace qué ────────────────────────────────────────────────────
 * `CalculadoraShell` solo junta lo que el alumno escribe: no sabe qué
 * método es ni qué es una matriz. Este componente recibe ese evento, se
 * lo pasa al `GaussService`, y reparte el resultado entre la tabla, el
 * visor de pasos y el gráfico. La matemática vive en el servicio y en el
 * motor; esta pantalla solo las conecta.
 *
 * ── Por qué el estado vive en el servicio ──────────────────────────────
 * El resultado se lee de los signals del servicio, no de signals
 * propios: si fuera local, el cálculo moriría al salir de la pestaña.
 * El alumno puede ir a Teoría, volver, y seguir con la misma cuenta.
 *
 * ── El puente hacia los componentes compartidos ────────────────────────
 * Los componentes genéricos (shell, tabla, visor) no conocen a Gauss.
 * Acá se traduce: los campos salen del config, la respuesta se arma
 * desde los signals del servicio y el texto de cada paso sale del motor.
 *
 * ── "Pasos" y no "iteraciones" ────────────────────────────────────────
 * Un método directo NO itera: hace una cantidad fija de operaciones. Por
 * eso la respuesta usa `conteo` con la etiqueta "Pasos", y no el
 * `iteraciones` del Módulo 1. Decir "iteraciones" acá sería mentirle
 * al alumno.
 */
@Component({
  selector: 'app-gauss-calculadora',
  standalone: true,
  imports: [CalculadoraShell, IterationTable, PasosControl, GraficoSistema, UiCard],
  templateUrl: './gauss-calculadora.html',
  styleUrl: './gauss-calculadora.scss',
})
export class GaussCalculadora {
  private readonly servicio = inject(GaussService);

  /** Los campos del formulario: los define `gauss.config.ts`. */
  readonly campos = CAMPOS_CALCULADORA;

  /** Las columnas de la tabla de pasos. */
  readonly columnas = COLUMNAS_GAUSS;

  /** El dibujo del método (las rectas auxiliares de la sustitución). */
  readonly dibujar = dibujarGauss;

  /** Lo que el alumno escribió. Va en dos direcciones con el shell. */
  protected readonly valores = signal<Record<string, string>>({});

  /** Qué paso está mostrando el visor de pasos. */
  protected readonly paso = signal(0);

  // ── Lectura del estado del servicio ────────────────────────────────
  protected readonly sistema = this.servicio.sistema;
  protected readonly filas = this.servicio.filas;
  protected readonly textosPasos = this.servicio.textosPasos;
  protected readonly solucion = this.servicio.solucion;
  protected readonly residuo = this.servicio.residuo;
  protected readonly mensaje = this.servicio.mensaje;

  /** ¿Hay cálculo para mostrar? La tabla y el gráfico se ocultan sin filas. */
  protected readonly hayCalculo = computed(() => this.filas().length > 0);

  /**
   * El rango del gráfico.
   *
   * Lo arma el servicio con la solución y los cortes de las rectas: si
   * el sistema es de 3 ecuaciones, el gráfico avisa que no aplica (eso
   * lo resuelve el propio `grafico-sistema`) y el rango queda en el
   * genérico.
   */
  protected readonly rango = computed(() =>
    this.servicio.rangoPara(this.servicio.sistema(), this.servicio.solucion()),
  );

  /**
   * La respuesta que muestra el shell, armada desde los signals del
   * servicio.
   *
   * Es `null` mientras no haya cálculo: el shell no dibuja nada. Si el
   * alumno escribió algo inválido, el servicio deja un mensaje y se
   * muestra como respuesta fallida.
   */
  protected readonly respuesta = computed<RespuestaCalculadora | null>(() => {
    const filas = this.filas();
    const mensaje = this.mensaje();

    if (filas.length === 0) {
      return mensaje ? { exito: false, conclusion: mensaje } : null;
    }

    const solucion = this.solucion();

    if (!solucion) {
      return {
        exito: false,
        conclusion:
          mensaje ??
          'No se pudo completar la eliminación con los datos ingresados.',
      };
    }

    const residuo = this.residuo();

    return {
      exito: true,
      solucion: formatearSolucion(solucion),
      conteo: filas.length,
      etiquetaConteo: 'Pasos',
      error: `‖Ax − b‖∞ = ${formatearResiduo(residuo)}`,
      conclusion:
        `Eliminación gaussiana con pivoteo parcial: ${filas.length} pasos ` +
        `para resolver un sistema de ${solucion.length} ecuaciones. ` +
        `La solución es ${formatearSolucion(solucion)} y el residuo ` +
        `‖Ax − b‖∞ quedó en ${formatearResiduo(residuo)}. ` +
        'Como el método es directo, no hay convergencia: el número de ' +
        'pasos es fijo y se conoce de antemano.',
    };
  });

  /** Cuántos pasos hay, para el total del visor de pasos. */
  protected readonly total = computed(() => this.filas().length);

  /**
   * La explicación del paso que se está mirando.
   *
   * Sale del motor (`textosPasos`), no de un texto escrito a mano: así
   * la narración y los números de la tabla no pueden contradecirse.
   */
  protected readonly textoDelPaso = computed(() => {
    const textos = this.textosPasos();
    const indice = this.paso();
    const texto = textos[indice];
    if (!texto) return '';

    const fila = this.filas()[indice];
    const etapa = fila?.['etapa'] ?? '';
    const ultima = indice === this.filas().length - 1;

    return ultima
      ? `${texto} Este es el último paso: con la sustitución hacia atrás ` +
        'completa, el sistema queda resuelto.'
      : `${texto} Etapa: ${etapa}.`;
  });

  /**
   * El alumno apretó Calcular.
   *
   * Los dos campos llegan como strings porque así los da el input: la
   * matriz es un textarea y el lado derecho un input de texto. El
   * servicio se encarga de parsearlos y de avisar si no tienen sentido.
   */
  protected alCalcular(escrito: Record<string, string>): void {
    this.servicio.calcular(
      escrito['matriz'] ?? '',
      escrito['ladoDerecho'] ?? '',
    );
    this.paso.set(0);
  }

  /** El visor de pasos pasó a otro paso. */
  protected alCambiarPaso(paso: number): void {
    this.paso.set(paso);
  }

  /** El alumno apretó Limpiar: se borra el cálculo. */
  protected alLimpiar(): void {
    this.servicio.reiniciar();
    this.valores.set({});
    this.paso.set(0);
  }
}
