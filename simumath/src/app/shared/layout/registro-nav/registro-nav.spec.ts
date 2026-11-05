import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroNav } from './registro-nav';
import {
  REGISTRO_POR_KEY,
  metodosDeFamilia,
  type MetodoKey,
} from '../../domain/numerico/registro';

@Component({
  standalone: true,
  imports: [RegistroNav],
  // `activo` es un signal y no una propiedad plana a propósito: mutarla desde
  // el test después del primer detectChanges() dispara NG0100 en el harness
  // (ExpressionChangedAfterItHasBeenChecked), que es un artefacto del test y
  // no un bug del componente.
  template: `<app-registro-nav [activo]="activo()" (seleccionar)="elegidos.push($event)" />`,
})
class Host {
  readonly activo = signal<MetodoKey | null>(null);
  elegidos: MetodoKey[] = [];
}

describe('RegistroNav', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  beforeEach(async () => {
    // El proyecto es zoneless: sin este provider, el TestBed exige Zone.js
    // (NG0908) y todos los tests de componente fallan.
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const disparador = (i = 0): HTMLButtonElement =>
    fixture.nativeElement.querySelectorAll('.familia__disparador')[i] as HTMLButtonElement;

  /** Todos los métodos del DOM, colapsados incluidos. */
  const metodos = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.metodo'));

  /** Solo los que están a la vista. */
  const metodosVisibles = (): HTMLButtonElement[] =>
    metodos().filter((b) => !b.closest('[hidden]'));

  /**
   * Expande las tres familias del fixture actual. Cardano vive en
   * `polinomios`, que arranca colapsada: sin esto no está a la vista.
   */
  const abrirTodasLasFamilias = (): void => {
    for (let i = 0; i < 3; i++) {
      if (disparador(i).getAttribute('aria-expanded') === 'false') {
        disparador(i).click();
        fixture.detectChanges();
      }
    }
  };

  describe('jerarquía', () => {
    it('muestra una sección por cada familia con métodos', () => {
      expect(fixture.nativeElement.querySelectorAll('.familia').length).toBe(3);
    });

    it('cada familia muestra su principio de clasificación', () => {
      const principios = Array.from(
        fixture.nativeElement.querySelectorAll('.familia__principio') as NodeListOf<Element>,
      ).map((e) => e.textContent?.trim() ?? '');
      expect(principios.length).toBe(3);
      expect(principios.some((p) => p.includes('Acotan'))).toBeTrue();
      expect(principios.some((p) => p.includes('No acotan'))).toBeTrue();
      expect(principios.some((p) => p.includes('álgebra'))).toBeTrue();
    });

    it('nace con la primera familia abierta para no esconder los métodos', () => {
      // Si todo arrancara colapsado la página parecería vacía.
      expect(metodosVisibles().length).toBe(2);
      expect(metodosVisibles()[0].textContent).toContain('Bisección');
    });

    it('colapsa y expande una familia al tocar su encabezado', () => {
      // Familia 1 (abiertos): arranca cerrada, así se puede probar el ciclo.
      const b = disparador(1);
      expect(b.getAttribute('aria-expanded')).toBe('false');

      b.click();
      fixture.detectChanges();
      expect(b.getAttribute('aria-expanded')).toBe('true');
      expect(metodosVisibles().some((x) => x.textContent?.includes('Newton'))).toBeTrue();

      b.click();
      fixture.detectChanges();
      expect(b.getAttribute('aria-expanded')).toBe('false');
      expect(metodosVisibles().some((x) => x.textContent?.includes('Newton'))).toBeFalse();
    });

    it('el botón de familia declara aria-expanded y aria-controls', () => {
      const b = disparador();
      expect(b.getAttribute('aria-expanded')).toBeTruthy();
      const idControlado = b.getAttribute('aria-controls');
      expect(idControlado).toBeTruthy();
      // El <ul> tiene que existir SIEMPRE, colapsado o no: aria-controls que
      // apunta a un id inexistente no le sirve a nadie.
      const lista = fixture.nativeElement.querySelector('#' + idControlado);
      expect(lista).toBeTruthy();
      expect(lista.hidden).toBeFalse();
    });

    it('la lista colapsada queda oculta pero presente en el DOM', () => {
      // Familia 1 (abiertos) arranca cerrada.
      const b = disparador(1);
      expect(b.getAttribute('aria-expanded')).toBe('false');
      const lista = fixture.nativeElement.querySelector('#' + b.getAttribute('aria-controls'));
      expect(lista).toBeTruthy();
      expect(lista.hidden).toBeTrue();
    });
  });

  describe('métodos', () => {
    beforeEach(() => {
      // Abrir todo para poder consultar la lista completa.
      for (let i = 0; i < 3; i++) {
        if (disparador(i).getAttribute('aria-expanded') === 'false') {
          disparador(i).click();
          fixture.detectChanges();
        }
      }
    });

    it('lista todos los métodos registrados', () => {
      // 6 implementados: el Módulo 1 está completo (Cardano fue el último).
      expect(metodos().length).toBe(6);
    });

    it('emite la key del método elegido', () => {
      metodos()[0].click();
      fixture.detectChanges();
      expect(host.elegidos).toEqual(['biseccion']);
    });

    it('no emite nada para un método planificado', () => {
      // Ya no queda ningún planificado real: el Módulo 1 cerró con los seis
      // implementados. La rama sigue existiendo en el componente para el
      // próximo método que se anuncie antes de estar listo, así que la
      // ejercitamos simulando el estado.
      //
      // Hay que destruir el fixture del beforeEach: en zoneless,
      // `detectChanges()` tickea TODAS las vistas vivas, y la vieja ya
      // renderizó a Cardano como implementado. Si sigue viva, el tick nuevo
      // ve un cambio a mitad de pasada y tira NG0100.
      const cardano = REGISTRO_POR_KEY['cardano'];
      const estadoOriginal = cardano.estado;
      cardano.estado = 'planificado';
      try {
        fixture.destroy();
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        fixture.detectChanges();
        abrirTodasLasFamilias();

        const boton = metodosVisibles().find((b) => b.textContent?.includes('Cardano'));
        expect(boton).toBeTruthy();
        boton!.click();
        fixture.detectChanges();
        expect(host.elegidos.length).toBe(0);
      } finally {
        cardano.estado = estadoOriginal;
        // Sin detectChanges acá: el próximo beforeEach monta un fixture nuevo.
      }
    });

    it('marca el planificado como deshabilitado y con badge', () => {
      // Misma simulación que el test anterior, por la misma razón.
      const cardano = REGISTRO_POR_KEY['cardano'];
      const estadoOriginal = cardano.estado;
      cardano.estado = 'planificado';
      try {
        fixture.destroy();
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        fixture.detectChanges();
        abrirTodasLasFamilias();

        const boton = metodosVisibles().find((b) => b.textContent?.includes('Cardano'));
        expect(boton!.disabled).toBeTrue();
        expect(boton!.textContent).toContain('Próximamente');
      } finally {
        cardano.estado = estadoOriginal;
      }
    });

    it('el resumen combina orden y requisitos, y coincide con el registro', () => {
      const newton = metodosVisibles().find((b) => b.textContent?.includes('Newton'));
      const texto = newton!.textContent ?? '';
      expect(texto).toContain('cuadrática');
      expect(texto).toContain('semilla');
      expect(texto).toContain('usa f′');

      const biseccion = metodosVisibles().find((b) => b.textContent?.includes('Bisección'));
      expect(biseccion!.textContent).toContain('cambio de signo');
    });
  });

  describe('estado activo', () => {
    it('marca el método activo y lo anuncia con aria-current', () => {
      host.activo.set('secante');
      fixture.detectChanges();

      const activo = fixture.nativeElement.querySelector('.metodo--activo') as HTMLElement;
      expect(activo.textContent).toContain('Secante');
      expect(activo.getAttribute('aria-current')).toBe('true');
    });

    it('abre sola la familia del método activo', () => {
      host.activo.set('puntoFijo');
      fixture.detectChanges();

      // Punto fijo es de la familia "abiertos" (segunda), que arrancaba
      // cerrada: al activarlo debe quedar visible sin que el alumno toque
      // nada.
      expect(metodosVisibles().some((b) => b.textContent?.includes('Punto Fijo'))).toBeTrue();
    });

    it('no deja colapsar la familia del método activo', () => {
      host.activo.set('puntoFijo');
      fixture.detectChanges();

      // Si el alumno colapsa la familia de su propio método, quedaría sin ver
      // qué tiene seleccionado. La familia activa manda sobre el estado manual.
      const b = disparador(1);
      b.click();
      fixture.detectChanges();
      expect(b.getAttribute('aria-expanded')).toBe('true');
      expect(metodosVisibles().some((x) => x.textContent?.includes('Punto Fijo'))).toBeTrue();
    });

    it('no marca ninguno cuando no hay activo', () => {
      expect(fixture.nativeElement.querySelector('.metodo--activo')).toBeNull();
    });
  });

  describe('coherencia con el registro', () => {
    it('no inventa métodos: la cantidad coincide con el registro', () => {
      for (let i = 0; i < 3; i++) {
        if (disparador(i).getAttribute('aria-expanded') === 'false') {
          disparador(i).click();
          fixture.detectChanges();
        }
      }
      const delRegistro = ['cerrados', 'abiertos', 'polinomios'].reduce(
        (n, f) => n + metodosDeFamilia(f as 'cerrados' | 'abiertos' | 'polinomios').length,
        0,
      );
      expect(metodos().length).toBe(delRegistro);
    });
  });
});