import { Injectable, signal, type WritableSignal } from '@angular/core';
import type { EjercicioBase } from '../models/metodo.model';
import { barajar } from '../autoevaluacion-mejorada/barajar';
import type { ConGuia, EtapaPractica, PreguntaPractica } from './modelos';

export const mezclar = barajar;
type Seleccion<T extends EjercicioBase> = (disponibles: ConGuia<T>[]) => ConGuia<T>[];
const mezclarOpciones = (p: PreguntaPractica): PreguntaPractica => ({ ...p, opciones: mezclar(p.opciones) });

/** Tandas y progreso en memoria: se conservan al navegar y se renuevan al recargar. */
@Injectable({ providedIn: 'root' })
export class SesionPracticaService {
  private readonly tandas = new Map<string, WritableSignal<ConGuia<EjercicioBase>[]>>();
  private readonly preparados = new Map<string, ConGuia<EjercicioBase>>();
  private readonly progresos = signal<Record<string, number>>({});

  tanda<T extends EjercicioBase>(clave: string, banco: ConGuia<T>[], seleccionar?: Seleccion<T>): WritableSignal<ConGuia<T>[]> {
    if (!this.tandas.has(clave)) {
      this.tandas.set(clave, signal<ConGuia<EjercicioBase>[]>([]));
      this.renovar(clave, banco, seleccionar);
    }
    return this.tandas.get(clave)! as WritableSignal<ConGuia<T>[]>;
  }

  renovar<T extends EjercicioBase>(clave: string, banco: ConGuia<T>[], seleccionar?: Seleccion<T>): void {
    const tanda = this.tandas.get(clave);
    if (!tanda) return;
    const previos = new Set(tanda().map(e => e.id));
    const disponibles = banco.filter(e => !previos.has(`${clave}:${e.id}`));
    const elegidos = seleccionar ? seleccionar(disponibles) :
      (['numerico', 'casuistica'] as const).flatMap(tipo => {
        const delTipo = disponibles.filter(e => e.tipo === tipo);
        const pool = delTipo.length >= 3 ? delTipo : banco.filter(e => e.tipo === tipo);
        return mezclar(pool).slice(0, 3);
      });
    tanda.set(mezclar(elegidos).map(e => {
      const id = `${clave}:${e.id}`;
      if (!this.preparados.has(id)) {
        this.preparados.set(id, {
          ...e, id,
          pasos: e.pasos.length ? e.pasos : e.guia.map(textoDeEtapa),
          cuestionario: mezclar(e.cuestionario ?? []).slice(0, 4).map(mezclarOpciones),
          guia: e.guia.map(p => ({ ...p, pregunta: p.pregunta ? mezclarOpciones(p.pregunta) : undefined })),
        });
      }
      return this.preparados.get(id)!;
    }));
  }

  paso(id: string): number { return this.progresos()[id] ?? 0; }
  guardar(id: string, paso: number): void {
    this.progresos.update(p => ({ ...p, [id]: paso }));
  }
}

function textoDeEtapa(paso: EtapaPractica): string {
  return [paso.explicacion,
    ...paso.cuentas.map(c => `${c.etiqueta}: ${c.expresion ?? `(${c.numerador})/(${c.denominador})`}`),
    ...(paso.matrices ?? []).map(m => `${m.titulo} = ${JSON.stringify(m.valores)}`),
    paso.resultado,
  ].join('\n');
}
