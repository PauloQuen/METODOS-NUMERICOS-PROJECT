import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BloqueEjercicioDatos } from './bloque-ejercicio-datos';
import type { EjercicioModulo3 } from '../../modelos/modulo3.model';

/**
 * Test de comportamiento del bloque de autoevaluación.
 *
 * Comprueba lo que ve el alumno: los tres botones, el acordeón de un
 * solo panel, la corrección del cuestionario, la verificación numérica
 * y que el estado sobreviva a recrear el componente (equivalente a
 * cambiar de pestaña y volver).
 */
const EJERCICIO: EjercicioModulo3 = {
  id: 'test-ejercicio',
  titulo: 'Ejercicio de prueba',
  tipo: 'numerico',
  planteamiento: 'Con (0; 0), (1; 1) y (4; 2), estimar en x = 2.25.',
  parametros: [],
  interpretacion: '',
  pasos: [],
  algoritmo: '',
  criterio: '',
  conclusion: '',
  pista: 'Los nodos no son equidistantes.',
  calculo: {
    puntos: [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 4, y: 2 },
    ],
    evaluarEn: 2.25,
  },
  cuestionario: [
    {
      id: 'q1',
      tipo: 'opcion-multiple',
      enunciado: '¿Cuánto vale la base del punto (1; 1) en x = 2.25?',
      opciones: [
        { id: 'a', texto: '−0.546875' },
        { id: 'b', texto: '1.3125' },
        { id: 'c', texto: '0.234375' },
        { id: 'd', texto: '1.78125' },
      ],
      correcta: 'b',
      explicacion: 'La base de (1; 1) da 1.3125 en x = 2.25.',
    },
    {
      id: 'q2',
      tipo: 'verdadero-falso',
      enunciado: 'Con tres puntos el polinomio puede tener grado 3.',
      opciones: [
        { id: 'v', texto: 'Verdadero' },
        { id: 'f', texto: 'Falso' },
      ],
      correcta: 'f',
      explicacion: 'Con tres puntos el grado es a lo sumo 2.',
    },
    {
      id: 'q3',
      tipo: 'opcion-multiple',
      enunciado: '¿Qué explica el error entre los nodos?',
      opciones: [
        { id: 'a', texto: 'Que √x no es un polinomio.' },
        { id: 'b', texto: 'Que las x son positivas.' },
        { id: 'c', texto: 'Que faltan datos.' },
        { id: 'd', texto: 'Que el polinomio está mal calculado.' },
      ],
      correcta: 'a',
      explicacion: 'Pasar por los puntos no garantiza reproducir la función real.',
    },
  ],
  resolucion: {
    valorCorrecto: 1.78125,
    tolerancia: 0.01,
    etiqueta: 'P(2.25)',
    respuestaFinalTexto: 'P(x) = −x²/6 + 7x/6; P(2.25) = 1.78125',
  },
};

const SIN_DATOS: EjercicioModulo3 = {
  ...EJERCICIO,
  id: 'test-sin-datos',
  cuestionario: undefined,
  resolucion: undefined,
};

describe('BloqueEjercicioDatos', () => {
  let fixture: ComponentFixture<BloqueEjercicioDatos>;

  function crear(ejercicio: EjercicioModulo3 = EJERCICIO): void {
    fixture = TestBed.createComponent(BloqueEjercicioDatos);
    fixture.componentRef.setInput('ejercicio', ejercicio);
    fixture.componentRef.setInput('funcion', (x: number) => x);
    fixture.detectChanges();
  }

  function boton(texto: string): HTMLButtonElement {
    const encontrado = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((b) => (b as HTMLButtonElement).textContent?.trim() === texto);

    if (!encontrado) throw new Error(`No se encontró el botón "${texto}".`);
    return encontrado as HTMLButtonElement;
  }

  function panel(): HTMLElement | null {
    return fixture.nativeElement.querySelector('[role="region"]');
  }

  function clic(elemento: HTMLElement): void {
    elemento.click();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloqueEjercicioDatos],
      // La app es zoneless (app.config.ts): el TestBed necesita el mismo modo.
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('muestra los tres botones cuando el ejercicio trae las actividades', () => {
    crear();

    expect(boton('Ver solución')).toBeTruthy();
    expect(boton('Cuestionario')).toBeTruthy();
    expect(boton('Resolución')).toBeTruthy();
    expect(panel()).toBeNull();
  });

  it('sin cuestionario ni resolución solo muestra Ver solución (compatibilidad)', () => {
    crear(SIN_DATOS);

    expect(boton('Ver solución')).toBeTruthy();
    expect(
      Array.from(fixture.nativeElement.querySelectorAll('button')).some(
        (b) => (b as HTMLButtonElement).textContent?.trim() === 'Cuestionario',
      ),
    ).toBeFalse();
  });

  it('abre un solo panel por ejercicio y actualiza aria-expanded', () => {
    crear();

    clic(boton('Cuestionario'));
    expect(boton('Cuestionario').getAttribute('aria-expanded')).toBe('true');
    expect(boton('Cuestionario').getAttribute('aria-controls')).toBe(
      'ae-panel-test-ejercicio-cuestionario',
    );
    expect(panel()?.id).toBe('ae-panel-test-ejercicio-cuestionario');
    expect(panel()?.getAttribute('aria-labelledby')).toBe(
      'ae-btn-test-ejercicio-cuestionario',
    );

    clic(boton('Resolución'));
    expect(boton('Cuestionario').getAttribute('aria-expanded')).toBe('false');
    expect(boton('Resolución').getAttribute('aria-expanded')).toBe('true');
    expect(panel()?.id).toBe('ae-panel-test-ejercicio-resolucion');

    clic(boton('Resolución'));
    expect(boton('Resolución').getAttribute('aria-expanded')).toBe('false');
    expect(panel()).toBeNull();
  });

  it('corrige el cuestionario, muestra el puntaje y permite reintentar', () => {
    crear();
    clic(boton('Cuestionario'));

    const marcar = (pregunta: string, opcion: string): void => {
      const radio = fixture.nativeElement.querySelector(
        `input[name="ae-test-ejercicio-${pregunta}"][value="${opcion}"]`,
      ) as HTMLInputElement;
      radio.click();
      fixture.detectChanges();
    };

    marcar('q1', 'b');
    marcar('q2', 'f');
    marcar('q3', 'a');
    clic(boton('Comprobar'));

    expect(fixture.nativeElement.textContent).toContain('Puntaje: 3 de 3');
    expect(fixture.nativeElement.textContent).toContain('¡Todo correcto!');
    expect(boton('Reintentar')).toBeTruthy();

    clic(boton('Reintentar'));
    expect(fixture.nativeElement.textContent).not.toContain('Puntaje:');
    expect(
      (fixture.nativeElement.querySelector('input[name="ae-test-ejercicio-q1"]') as HTMLInputElement)
        .checked,
    ).toBeFalse();
  });

  it('verifica el resultado con coma decimal y no revela la cifra hasta pedirla', () => {
    crear();
    clic(boton('Resolución'));

    const input = fixture.nativeElement.querySelector('.resolucion__input') as HTMLInputElement;
    input.value = '1,78125';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    clic(boton('Verificar'));
    expect(fixture.nativeElement.textContent).toContain('¡Correcto!');
    expect(fixture.nativeElement.textContent).not.toContain('P(2.25) = 1.78125');

    clic(boton('Mostrar respuesta final'));
    expect(fixture.nativeElement.textContent).toContain('P(2.25) = 1.78125');
  });

  it('bloquea Ver solución y no escribe el valor correcto en el DOM', () => {
    crear();

    const verSolucion = boton('Ver solución');
    expect(verSolucion.disabled).toBeTrue();
    expect(verSolucion.getAttribute('aria-disabled')).toBe('true');
    expect(verSolucion.getAttribute('aria-describedby')).toBe('ae-ayuda-test-ejercicio');
    expect(fixture.nativeElement.textContent).toContain(
      'Resuelve el cuestionario o verifica tu respuesta',
    );
    expect(fixture.nativeElement.textContent).not.toContain('1.78125');
    expect(fixture.nativeElement.textContent).not.toContain('−x²/6');
  });

  it('desbloquea Ver solución al aprobar el cuestionario y lo anuncia', () => {
    crear();
    clic(boton('Cuestionario'));

    const marcar = (pregunta: string, opcion: string): void => {
      const radio = fixture.nativeElement.querySelector(
        `input[name="ae-test-ejercicio-${pregunta}"][value="${opcion}"]`,
      ) as HTMLInputElement;
      radio.click();
      fixture.detectChanges();
    };

    marcar('q1', 'b');
    marcar('q2', 'f');
    marcar('q3', 'a');
    clic(boton('Comprobar'));

    const verSolucion = boton('Ver solución');
    expect(verSolucion.disabled).toBeFalse();
    expect(verSolucion.hasAttribute('aria-disabled')).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Solución desbloqueada.');

    clic(verSolucion);
    expect(panel()?.id).toBe('ae-panel-test-ejercicio-solucion');
  });

  it('tras tres intentos fallidos ofrece la salida y la confirma', () => {
    const ejercicio = { ...EJERCICIO, id: 'test-rendirse' };
    crear(ejercicio);
    clic(boton('Resolución'));

    const input = fixture.nativeElement.querySelector('.resolucion__input') as HTMLInputElement;
    input.value = '0';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    for (let intento = 0; intento < 3; intento++) {
      clic(boton('Verificar'));
    }

    expect(boton('Ver solución').disabled).toBeTrue();
    const rendirse = boton('Ver solución de todos modos');
    clic(rendirse);

    expect(fixture.nativeElement.textContent).toContain('¿Mostrar la solución completa?');
    clic(boton('Sí, mostrarla'));

    const verSolucion = boton('Ver solución');
    expect(verSolucion.disabled).toBeFalse();
    clic(verSolucion);
    expect(panel()?.id).toBe('ae-panel-test-rendirse-solucion');
  });

  it('conserva respuestas y panel al recrear el componente (cambio de pestaña)', () => {
    crear();
    clic(boton('Cuestionario'));

    const radio = fixture.nativeElement.querySelector(
      'input[name="ae-test-ejercicio-q1"][value="b"]',
    ) as HTMLInputElement;
    radio.click();
    fixture.detectChanges();

    fixture.destroy();
    crear();

    expect(boton('Cuestionario').getAttribute('aria-expanded')).toBe('true');
    const mismoRadio = fixture.nativeElement.querySelector(
      'input[name="ae-test-ejercicio-q1"][value="b"]',
    ) as HTMLInputElement;
    expect(mismoRadio.checked).toBeTrue();
  });
});
