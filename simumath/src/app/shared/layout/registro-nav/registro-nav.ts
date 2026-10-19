import { Component, computed, input, output, signal } from '@angular/core';
import { Badge } from '../../ui/badge/badge';
import {
  FAMILIAS,
  familiaDe,
  metodo,
  metodosDeFamilia,
  resumenDeMetodo,
  type FamiliaKey,
  type MetodoKey,
  type MetodoRegistrado,
} from '../../domain/numerico/registro';

interface GrupoFamilia {
  familia: (typeof FAMILIAS)[number];
  metodos: MetodoRegistrado[];
}

/**
 * Navegación jerárquica de métodos: FAMILIA → MÉTODO.
 *
 * Reemplaza a las tabs planas de cinco métodos. La jerarquía no es adorno:
 * es lo que el alumno necesita para ELEGIR. Saber que existe un método
 * "abierto" y otro "cerrado", y que la diferencia es si te/ampara cuando
 * la semilla es mala, vale más que ver cinco nombres en fila.
 *
 * Muestra el orden de convergencia y los requisitos de cada método en la
 * propia lista, para que la decisión se tome con el criterio a la vista y
 * no haya que recordar la tabla.
 *
 * Deriva TODO de `registro.ts`: agregar un método al registro lo agrega acá
 * sin tocar este archivo.
 */
@Component({
  selector: 'app-registro-nav',
  standalone: true,
  imports: [Badge],
  templateUrl: './registro-nav.html',
  styleUrl: './registro-nav.scss',
})
export class RegistroNav {
  /** Método seleccionado en la página que hospeda esta navegación. */
  readonly activo = input<MetodoKey | null>(null);
  /** Muestra el resumen (orden + requisitos). Para navegación compacta, `false`. */
  readonly resumen = input(true);

  /** Emite la key del método elegido. No navega: la página decide qué hacer. */
  readonly seleccionar = output<MetodoKey>();

  /** Familias con al menos un método, con sus métodos ya resueltos. */
  readonly grupos = computed<GrupoFamilia[]>(() =>
    FAMILIAS.map((familia) => ({
      familia,
      metodos: metodosDeFamilia(familia.key),
    })).filter((g) => g.metodos.length > 0),
  );

  /**
   * Familias que el alumno abrió a mano. Empieza con la primera abierta: si
   * todocollapsed no hay ningún método visible y la página parece vacía.
   */
  private readonly _abiertas = signal<Set<FamiliaKey>>(new Set([FAMILIAS[0].key]));

  /**
   * Qué se ve: lo que el abrió, MÁS la familia del método activo (siempre).
   *
   * Es una `computed` y no un `effect` a propósito: así la familia del
   * método activo se deriva sola, sin depender del orden en que corren los
   * efectos. Con un `effect` había dos casos raros donde la familia no se
   * abría a tiempo y el alumno veía un árbol sin el método que tenía
   * elegido.
   *
   * El efecto secundario es desirable: no se puede esconder el método con el
   * que se está trabajando.
   */
  readonly abiertas = computed<Set<FamiliaKey>>(() => {
    const abiertos = new Set(this._abiertas());
    const activo = this.activo();
    if (activo) abiertos.add(familiaDe(activo).key);
    return abiertos;
  });

  esActiva(familia: FamiliaKey): boolean {
    return this.abiertas().has(familia);
  }

  alternar(familia: FamiliaKey): void {
    this._abiertas.update((s) => {
      const copia = new Set(s);
      if (copia.has(familia)) {
        copia.delete(familia);
      } else {
        copia.add(familia);
      }
      return copia;
    });
  }

  elegir(m: MetodoRegistrado): void {
    if (m.estado !== 'implementado') return;
    this.seleccionar.emit(m.key);
  }

  nombre(key: MetodoKey): string {
    return metodo(key).nombre;
  }

  /**
   * El resumen de una línea lo arma `resumenDeMetodo`, que vive en el
   * registro: lo comparte con la lista por familia y así las dos pantallas
   * no pueden decir cosas distintas del mismo método.
   */
  readonly resumenDe = resumenDeMetodo;
}