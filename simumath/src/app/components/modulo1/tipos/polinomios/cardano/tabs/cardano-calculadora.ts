import { Component, computed, inject, signal } from '@angular/core';
import { CardanoService } from '../cardano.service';
import { CAMPOS_CALCULADORA, COLUMNAS_CARDANO, DATOS_POR_DEFECTO } from '../cardano.config';
import { dibujarCardano } from '../cardano.grafico';
import { CalculadoraShell } from '../../../../../../shared/domain/calculadora-shell/calculadora-shell';
import { IterationTable } from '../../../../../../shared/domain/iteration-table/iteration-table';
import { PasosControl } from '../../../../../../shared/domain/pasos-control/pasos-control';
import { GraficoMetodo } from '../../../../../../shared/domain/grafico-metodo/grafico-metodo';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import { parseFuncion } from '../../../../../../shared/domain/numerico/methods';
import type {
  DatosCalculo,
  RespuestaCalculadora,
} from '../../../../../../shared/models/metodo.model';

@Component({
  selector: 'app-cardano-calculadora',
  standalone: true,
  imports: [CalculadoraShell, IterationTable, PasosControl, GraficoMetodo, UiCard],
  templateUrl: './cardano-calculadora.html',
  styleUrl: './cardano-calculadora.scss',
})
export class CardanoCalculadora {
  private readonly servicio = inject(CardanoService);

  readonly campos = CAMPOS_CALCULADORA;
  readonly columnas = COLUMNAS_CARDANO;
  readonly dibujar = dibujarCardano;

  protected readonly valores = signal<Record<string, string>>({});
  protected readonly paso = signal(0);
  protected readonly funcion = signal<(x: number) => number>(() => 0);
  protected readonly rango = signal<{ min: number; max: number }>({
    min: -5,
    max: 5,
  });

  protected readonly filas = this.servicio.filas;
  protected readonly raices = this.servicio.raices;
  protected readonly resuelto = this.servicio.resuelto;
  protected readonly mensaje = this.servicio.mensaje;

  protected readonly hayCalculo = computed(() => this.filas().length > 0);
  protected readonly filaFinal = computed(() => undefined);

  protected readonly respuesta = computed<RespuestaCalculadora | null>(() => {
    const filas = this.filas();
    const mensaje = this.mensaje();
    const raicesArr = this.raices();

    if (filas.length === 0) {
      return mensaje ? { exito: false, conclusion: mensaje } : null;
    }

    if (this.resuelto()) {
      return {
        exito: true,
        raiz: this.servicio.raicesTexto(raicesArr),
        iteraciones: 0,
        conclusion: '',
      };
    }

    return {
      exito: false,
      conclusion: mensaje ?? 'No se pudo resolver con Cardano.',
    };
  });

  protected readonly total = computed(() => this.filas().length);

  protected readonly textoDelPaso = computed(() => {
    const filas = this.filas();
    const fila = filas[this.paso()];
    if (!fila) return '';
    return String(fila['detalle'] ?? '');
  });

  protected alCalcular(escrito: Record<string, string>): void {
    const datos: DatosCalculo = {
      funcion: escrito['funcion'] ?? DATOS_POR_DEFECTO.funcion,
    };

    this.servicio.calcular(datos);
    this.funcion.set(parseSeguro(datos.funcion));
    this.rango.set(this.servicio.rangoPara(this.servicio.raices()));
    this.paso.set(0);
  }

  protected alCambiarPaso(paso: number): void {
    this.paso.set(paso);
  }

  protected alLimpiar(): void {
    this.servicio.reiniciar();
    this.valores.set({});
    this.paso.set(0);
  }
}

function parseSeguro(texto: string): (x: number) => number {
  try {
    return parseFuncion(texto);
  } catch {
    return () => NaN;
  }
}
