import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SECCIONES_MODULO1 } from '../modulo1';
import { Breadcrumb, type TramoBreadcrumb } from '../../../shared/layout/breadcrumb/breadcrumb';
import { Badge } from '../../../shared/ui/badge/badge';
import { Btn } from '../../../shared/ui/btn/btn';
import {
  FAMILIAS,
  metodosDeFamilia,
  rutaDeFamilia,
  type FamiliaKey,
} from '../../../shared/domain/numerico/registro';

/** Una familia con sus métodos ya resueltos y su conteo de disponibles. */
interface TarjetaFamilia {
  key: FamiliaKey;
  nombre: string;
  principio: string;
  descripcion: string;
  metodos: ReturnType<typeof metodosDeFamilia>;
  /** Cuántos métodos de esta familia se pueden abrir HOY. */
  disponibles: number;
}

/**
 * PANTALLA A — "¿Qué quieres aprender hoy?"
 *
 * ── Qué hace ─────────────────────────────────────────────────────────
 * Es la puerta de entrada al Módulo 1: muestra las TRES familias de
 * métodos (cerrados / abiertos / analíticos) con su principio y sus
 * métodos, y de ahí se baja a la lista de la familia elegida.
 *
 * ── Por qué todo sale del registro ───────────────────────────────────
 * Ni el nombre de las familias, ni la cantidad de métodos, ni quién está
 * "Próximamente" están escritos acá: vienen de `registro.ts`. Si mañana
 * se agrega un método cerrado, esta pantalla lo muestra solo, sin tocar
 * una línea de este componente. Si se escribiera a mano, en dos semanas
 * la landing anunciaría un método que no existe y callaría otro.
 *
 * ── Por qué abajo está el "Material general" ─────────────────────────
 * Las secciones viejas (Teoría, Ejemplos, Calculadoras, Gráficos...)
 * siguen siendo el material transversal de los cinco métodos. No se
 * esconden: se las muestra en un segundo plano, porque el recorrido que
 * queremos es familia → método, pero tirarlas sería perder todo lo que
 * ya está hecho.
 */
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, Breadcrumb, Badge, Btn],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {
  /** Ruta de la lista de métodos de una familia. */
  readonly rutaFamilia = rutaDeFamilia;

  readonly miga: TramoBreadcrumb[] = [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 1' },
  ];

  /** Las tres familias, cada una con sus métodos y cuántos están listos. */
  readonly familias = computed<TarjetaFamilia[]>(() =>
    FAMILIAS.map((f) => {
      const metodos = metodosDeFamilia(f.key);
      return {
        ...f,
        metodos,
        disponibles: metodos.filter((m) => m.estado === 'implementado').length,
      };
    }),
  );

  /** Las secciones generales que siguen disponibles (material transversal). */
  readonly secciones = SECCIONES_MODULO1;
}
