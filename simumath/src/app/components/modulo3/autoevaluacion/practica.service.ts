import { Injectable, signal, type WritableSignal } from '@angular/core';
import type { PreguntaCuestionarioM3 } from '../modelos/modulo3.model';
import type { EjercicioBancoM3 } from './banco';

/** Fisher–Yates: copia los datos, sin modificar el banco ni usar sort aleatorio. */
export function barajar<T>(valores: readonly T[], azar: () => number = Math.random): T[] {
  const copia = [...valores];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
export function mezclarPregunta(p: PreguntaCuestionarioM3): PreguntaCuestionarioM3 {
  return { ...p, opciones: barajar(p.opciones) };
}

@Injectable({providedIn:'root'})
export class PracticaM3Service {
  private readonly tandas = new Map<string, WritableSignal<EjercicioBancoM3[]>>();
  private readonly preparados = new Map<string, EjercicioBancoM3>();
  private readonly progreso = signal<Record<string, number>>({});

  tanda(metodo: string, banco: EjercicioBancoM3[]): WritableSignal<EjercicioBancoM3[]> {
    if (!this.tandas.has(metodo)) {
      this.tandas.set(metodo, signal<EjercicioBancoM3[]>([]));
      this.nuevaTanda(metodo, banco);
    }
    return this.tandas.get(metodo)!;
  }

  nuevaTanda(metodo: string, banco: EjercicioBancoM3[]): void {
    const tanda = this.tandas.get(metodo);
    if (!tanda) return;
    const anteriores = new Set(tanda().map(e=>e.id));
    const disponibles = banco.filter(e=> !anteriores.has(`${metodo}:${e.id}`));
    // Tres problemas numéricos y tres contextuales, aleatorios y sin repetirse
    // respecto a la tanda anterior. El banco completo permanece disponible.
    const elegidos = (['numerico', 'casuistica'] as const).flatMap(tipo =>
      barajar(disponibles.filter(e=>e.tipo === tipo)).slice(0,3));
    tanda.set(barajar(elegidos).map(e=>this.preparar(metodo, e)));
  }

  private preparar(metodo: string, ejercicio: EjercicioBancoM3): EjercicioBancoM3 {
    const id = `${metodo}:${ejercicio.id}`;
    if (!this.preparados.has(id)) {
      this.preparados.set(id, { ...ejercicio, id,
        cuestionario: barajar(ejercicio.cuestionario ?? []).slice(0,4).map(mezclarPregunta),
        guia: ejercicio.guia.map(p=>({...p, pregunta:p.pregunta ? mezclarPregunta(p.pregunta) : undefined})),
      });
    }
    return this.preparados.get(id)!;
  }

  pasoDe(id: string): number { return this.progreso()[id] ?? 0; }
  guardarPaso(id: string, paso: number): void {
    this.progreso.update(actual=>({...actual, [id]:paso}));
  }
}
