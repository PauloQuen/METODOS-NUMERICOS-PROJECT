import { Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import type { RecursoVideo } from '../recursos-section';

/**
 * TARJETA DE VIDEO CON CARGA DIFERIDA.
 *
 * No crea el iframe hasta que el alumno pide ver el video. Si es de
 * YouTube usa `youtube-nocookie.com` (dominio de privacidad ampliada)
 * y deja un enlace alternativo para abrirlo en una pestaña nueva.
 */
@Component({
  selector: 'app-video-card',
  standalone: true,
  templateUrl: './video-card.html',
  styleUrl: './video-card.scss',
})
export class VideoCard {
  readonly video = input.required<RecursoVideo>();

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly abierto = signal(false);

  protected readonly embedUrl = computed(() => {
    const video = this.video();
    if (video.youtubeId) {
      return `https://www.youtube-nocookie.com/embed/${video.youtubeId}`;
    }
    return video.url ?? '';
  });

  /**
   * Angular exige un `SafeResourceUrl` para el `src` de un iframe. Solo
   * se confían URLs https del catálogo interno; el resto no se incrusta.
   */
  protected readonly embedUrlSeguro = computed<SafeResourceUrl | null>(() => {
    const url = this.embedUrl();
    if (!url) {
      return null;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') {
        return null;
      }
      return this.sanitizer.bypassSecurityTrustResourceUrl(parsed.toString());
    } catch {
      return null;
    }
  });

  /** Enlace para abrir fuera del portal (YouTube normal o fuente original). */
  protected readonly urlExterna = computed(() => {
    const video = this.video();
    if (video.youtubeId) {
      return `https://www.youtube.com/watch?v=${video.youtubeId}`;
    }
    return video.url ?? '';
  });

  protected readonly frameId = computed(() => `video-${this.video().id}`);

  protected alternar(): void {
    this.abierto.update((valor) => !valor);
  }
}
