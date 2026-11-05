import { Component, computed, input, isDevMode } from '@angular/core';
import { VideoCard } from './video-card/video-card';
import { SourceList } from './source-list/source-list';

/** Nivel al que pertenece un recurso. */
export type AlcanceRecurso = 'modulo' | 'tipo' | 'metodo';

export interface RecursoComun {
  id: string;
  /** Nivel del recurso; si falta, se trata como material del método. */
  alcance?: AlcanceRecurso;
  /** Id del módulo, tipo o método al que pertenece. */
  refId?: string;
  estado?: 'ok' | 'pendiente';
}

export interface RecursoVideo extends RecursoComun {
  titulo: string;
  canal?: string;
  duracion?: string;
  descripcion?: string;
  youtubeId?: string;
  url?: string;
}

export interface RecursoFuente extends RecursoComun {
  titulo: string;
  autor?: string;
  entidad?: string;
  anio?: string;
  tipo: 'libro' | 'articulo' | 'web' | 'video' | 'apuntes' | 'documentacion';
  url?: string;
}

export interface RecursoProfundizacion extends RecursoComun {
  texto: string;
  ruta?: string;
  url?: string;
}

/** Un bloque de recursos ya separado por nivel. */
export interface GrupoRecursos {
  id: string;
  titulo: string;
  descripcion?: string;
  videos: RecursoVideo[];
  fuentes: RecursoFuente[];
  profundizacion: RecursoProfundizacion[];
}

/**
 * SECCIÓN DE RECURSOS.
 *
 * Acepta dos formas de uso:
 * · `grupos`: la recomendada para un método. Cada grupo es un nivel
 *   (método, tipo, módulo) y se muestra con su propio encabezado.
 * · `videos`, `fuentes`, `profundizacion`: la forma plana histórica,
 *   que sigue funcionando para no romper las páginas viejas.
 *
 * Los recursos `pendiente` solo se muestran en desarrollo: en
 * producción no tiene sentido enseñarle al alumno un enlace que no
 * existe.
 */
@Component({
  selector: 'app-recursos-section',
  standalone: true,
  imports: [VideoCard, SourceList],
  templateUrl: './recursos-section.html',
  styleUrl: './recursos-section.scss',
})
export class RecursosSection {
  readonly grupos = input<GrupoRecursos[]>([]);
  readonly videos = input<RecursoVideo[]>([]);
  readonly fuentes = input<RecursoFuente[]>([]);
  readonly profundizacion = input<RecursoProfundizacion[]>([]);

  private readonly esDesarrollo = isDevMode();

  /** Normaliza la entrada plana a un único grupo y filtra pendientes. */
  readonly gruposVisibles = computed<GrupoRecursos[]>(() => {
    const base: GrupoRecursos[] = this.grupos().length
      ? this.grupos()
      : [
          {
            id: 'planos',
            titulo: 'Recursos',
            videos: this.videos(),
            fuentes: this.fuentes(),
            profundizacion: this.profundizacion(),
          },
        ];

    return base
      .map((grupo) => ({
        ...grupo,
        videos: grupo.videos.filter((r) => this.visible(r)),
        fuentes: grupo.fuentes.filter((r) => this.visible(r)),
        profundizacion: grupo.profundizacion.filter((r) => this.visible(r)),
      }))
      .filter((g) => g.videos.length + g.fuentes.length + g.profundizacion.length > 0);
  });

  readonly hayRecursos = computed(() => this.gruposVisibles().length > 0);

  private visible(recurso: RecursoComun): boolean {
    return recurso.estado !== 'pendiente' || this.esDesarrollo;
  }
}
