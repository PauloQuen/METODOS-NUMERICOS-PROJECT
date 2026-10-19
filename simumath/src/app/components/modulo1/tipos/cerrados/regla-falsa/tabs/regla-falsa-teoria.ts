import { Component, computed, inject, signal } from '@angular/core';
import { TEORIA_REGLA_FALSA } from '../regla-falsa.contenido';
import { COLUMNAS_REGLA_FALSA, DATOS_POR_DEFECTO } from '../regla-falsa.config';
import { ReglaFalsaService } from '../regla-falsa.service';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';
import { dibujarReglaFalsa } from '../regla-falsa.grafico';

@Component({
  selector: 'app-regla-falsa-teoria',
  standalone: true,
  imports: [UiCard, BloqueEjemplo],
  templateUrl: './regla-falsa-teoria.html',
  styleUrl: './regla-falsa-teoria.scss',
})
export class ReglaFalsaTeoria {
  readonly teoria = TEORIA_REGLA_FALSA;
  readonly columnas = COLUMNAS_REGLA_FALSA;
  readonly dibujar = dibujarReglaFalsa;

  private readonly servicio = inject(ReglaFalsaService);

  readonly ejemploNumerico = signal(
    this.servicio.calcularEjemplo(TEORIA_REGLA_FALSA.ejemploNormal),
  );

  readonly ejemploCasuistica = signal(
    this.servicio.calcularEjemplo(TEORIA_REGLA_FALSA.ejemploCasuistica),
  );

  protected readonly funcionNumerico = this.servicio.funcionDeEjemplo(
    TEORIA_REGLA_FALSA.ejemploNormal,
  );

  protected readonly funcionCasuistica = this.servicio.funcionDeEjemplo(
    TEORIA_REGLA_FALSA.ejemploCasuistica,
  );

  protected readonly rangoNumerico = computed(() =>
    this.servicio.rangoPara(DATOS_POR_DEFECTO),
  );

  protected readonly rangoCasuistica = computed(() =>
    this.servicio.rangoPara(TEORIA_REGLA_FALSA.ejemploCasuistica.calculo),
  );

  protected readonly abierta = signal<'fundamento' | 'falla' | 'orden' | null>(null);

  protected alternar(que: 'fundamento' | 'falla' | 'orden'): void {
    this.abierta.update((actual) => (actual === que ? null : que));
  }
}
