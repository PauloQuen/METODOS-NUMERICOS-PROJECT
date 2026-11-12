import { Injectable, signal, type WritableSignal } from '@angular/core';
import type { PreguntaCuestionarioM3 } from '../modelos/modulo3.model';
import { barajar } from '../../../shared/autoevaluacion-mejorada/barajar';
import type { EjercicioBancoM3 } from './banco';

/**
 * SELECCIÓN DE TANDAS DE AUTOEVALUACIÓN.
 *
 * El banco completo no se borra: cada tanda elige seis ejercicios, tres
 * numéricos y tres de aplicación, sin repetir los de la tanda anterior.
 * Cada ejercicio llega con cuatro preguntas barajadas y su guía con una
 * comprobación por paso.
 *
 * La tanda, las preguntas y el progreso viven en este servicio en raíz,
 * así que cambiar de pestaña no los reinicia.
 */
@Injectable({ providedIn: 'root' })
export class PracticaM3Service {
  private readonly tandas = new Map<string, WritableSignal<EjercicioBancoM3[]>>();
  private readonly preparados = new Map<string, EjercicioBancoM3>();
  private readonly progreso = signal<Record<string, number>>({});

  tanda(metodo: string, banco: readonly EjercicioBancoM3[]): WritableSignal<EjercicioBancoM3[]> {
    if (!this.tandas.has(metodo)) {
      this.tandas.set(metodo, signal<EjercicioBancoM3[]>([]));
      this.nuevaTanda(metodo, banco);
    }
    return this.tandas.get(metodo)!;
  }

  nuevaTanda(metodo: string, banco: readonly EjercicioBancoM3[]): void {
    const tanda = this.tandas.get(metodo);
    if (!tanda) return;

    const anteriores = new Set(tanda().map((e) => e.id));
    const disponibles = banco.filter((e) => !anteriores.has(`${metodo}:${e.id}`));

    const elegidos = (['numerico', 'casuistica'] as const).flatMap((tipo) => {
      const delTipo = disponibles.filter((e) => e.tipo === tipo);
      const pool = delTipo.length >= 3 ? delTipo : banco.filter((e) => e.tipo === tipo);
      return barajar(pool).slice(0, 3);
    });

    tanda.set(barajar(elegidos).map((e) => this.preparar(metodo, e)));
  }

  private preparar(metodo: string, ejercicio: EjercicioBancoM3): EjercicioBancoM3 {
    const id = `${metodo}:${ejercicio.id}`;
    if (!this.preparados.has(id)) {
      this.preparados.set(id, {
        ...ejercicio,
        id,
        cuestionario: barajar(ejercicio.cuestionario ?? [])
          .slice(0, 4)
          .map((p) => this.mezclarPregunta(p)),
        guia: ejercicio.guia.map((paso) => ({
          ...paso,
          pregunta: paso.pregunta ? this.mezclarPregunta(paso.pregunta) : undefined,
        })),
      });
    }
    return this.preparados.get(id)!;
  }

  /** Baraja las opciones sin cambiar cuál es la correcta. */
  private mezclarPregunta(pregunta: PreguntaCuestionarioM3): PreguntaCuestionarioM3 {
    return { ...pregunta, opciones: barajar(pregunta.opciones) };
  }

  pasoDe(id: string): number {
    return this.progreso()[id] ?? 0;
  }

  guardarPaso(id: string, paso: number): void {
    this.progreso.update((actual) => ({ ...actual, [id]: paso }));
  }
}
