import { Component, computed, signal } from '@angular/core';
import { DemoIteracion, ResumenIteracion } from '../../shared/demo-iteracion';

interface Despeje {
  etiqueta: string;
  titulo: string;
  como: string;
  formula: string;
  g: (x: number) => number;
  gp: number;
  x0: number;
  atractor: number;
}

interface FilaDemo {
  n: number;
  x: number;
  gx: number;
  dx: number;
}

interface EstadoDemo {
  filas: FilaDemo[];
  x: number;
  x0: number;
  terminado: boolean;
  fallido: boolean;
  mensaje: string;
}

interface Segmento {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  ancho: number;
  opacidad: number;
  flecha: boolean;
}

interface EtiquetaX {
  x: number;
  n: number;
}

interface PuntoRaiz {
  x: number;
  y: number;
  atractor: boolean;
}

/** Fundamentos, telaraña, convergencia, algoritmo y recomendaciones de punto fijo. */
@Component({
  selector: 'app-punto-fijo-teoria',
  standalone: true,
  imports: [DemoIteracion],
  templateUrl: './punto-fijo-teoria.html',
  styleUrl: './punto-fijo-teoria.scss',
})
export class PuntoFijoTeoria {
  readonly despejes: Despeje[] = [
    {
      etiqueta: '① (x² + 2) / 4',
      titulo: 'Despejar el término lineal',
      como: 'Pasas x² + 2 al otro lado y divides.',
      formula: 'x = (x² + 2) / 4',
      g: (x) => (x * x + 2) / 4,
      gp: 0.293,
      x0: 2.5,
      atractor: 0,
    },
    {
      etiqueta: '② 2 / (4 − x)',
      titulo: 'Factorizar x y dividir',
      como: 'x(x − 4) = −2, y se despeja.',
      formula: 'x = 2 / (4 − x)',
      g: (x) => 2 / (4 - x),
      gp: 0.172,
      x0: 0.2,
      atractor: 0,
    },
    {
      etiqueta: '③ √(4x − 2)',
      titulo: 'Despejar con raíz',
      como: 'x² = 4x − 2 y se saca la raíz.',
      formula: 'x = √(4x − 2)',
      g: (x) => Math.sqrt(4 * x - 2),
      gp: 0.586,
      x0: 1.5,
      atractor: 1,
    },
    {
      etiqueta: '④ x² − 3x + 2',
      titulo: 'Agregar x en cada lado',
      como: 'Sumas x a ambos lados de la ecuación.',
      formula: 'x = x² − 3x + 2',
      g: (x) => x * x - 3 * x + 2,
      gp: -1.83,
      x0: 0.5,
      atractor: -1,
    },
  ];

  readonly raices = [2 - Math.SQRT2, 2 + Math.SQRT2];

  // Formato horizontal compartido con las demostraciones de métodos abiertos.
  readonly L = 48;
  readonly R = 550;
  readonly T = 20;
  readonly B = 250;

  readonly despeje = signal(0);
  readonly semilla = signal(2.5);
  readonly tolerancia = signal(0.001);
  readonly estado = signal<EstadoDemo>(this.nuevoEstado());

  readonly actual = computed(() => this.despejes[this.despeje()]);
  readonly semillaTexto = computed(() => this.semilla().toFixed(1).replace('.', ','));
  readonly filas = computed(() => this.estado().filas);
  readonly terminado = computed(() => this.estado().terminado);
  readonly mensaje = computed(() => this.estado().mensaje);

  readonly rangoSemilla = computed(() => {
    if (this.despeje() === 2) {
      return { min: 0.6, max: 4, ayuda: 'Dominio: x ≥ 0,5. Usamos semillas desde 0,6 para que los siguientes pasos permanezcan en el dominio real.' };
    }
    if (this.despeje() === 1) {
      return { min: -2, max: 3.4, ayuda: 'Dominio: x ≠ 4. Las semillas van de −2 a 3,4 para mantener las iteraciones alejadas del polo x = 4.' };
    }
    if (this.despeje() === 3) {
      return { min: -1, max: 4, ayuda: 'Dominio: todos los números reales. Explora semillas entre −1 y 4; estar en el dominio no garantiza convergencia.' };
    }
    return { min: -4, max: 4, ayuda: 'Dominio: todos los números reales. También puedes explorar semillas negativas; estar en el dominio no garantiza convergencia.' };
  });

  readonly escala = computed(() => {
    const estado = this.estado();
    const valores = [-1, 4, estado.x0, ...estado.filas.map(f => f.gx)];
    const inicial = this.actual().g(estado.x0);
    if (Number.isFinite(inicial)) valores.push(inicial);
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const margen = (max - min) * 0.12;
    return { min: min - margen, max: max + margen };
  });

  readonly marcas = computed(() => {
    const { min, max } = this.escala();
    const base = 10 ** Math.floor(Math.log10((max - min) / 6));
    const paso = [1, 2, 5, 10].find(v => v * base >= (max - min) / 6)! * base;
    const valores: number[] = [];
    for (let v = Math.ceil(min / paso) * paso; v <= max; v += paso) valores.push(v);
    return valores;
  });

  /** Tipo de convergencia según |g′| en la raíz atractiva, como en el boceto. */
  readonly caso = computed(() => {
    const gp = this.actual().gp;
    return Math.abs(gp) < 1
      ? {
          tipo: 'ok',
          texto: gp > 0 ? 'convergencia monótona' : 'convergencia oscilatoria',
        }
      : {
          tipo: 'error',
          texto: gp > 0 ? 'divergencia monótona' : 'divergencia oscilatoria',
        };
  });

  readonly descripcion = computed(() => {
    const filas = this.filas();
    if (!filas.length) {
      return {
        titulo: 'Antes de empezar',
        tendencia: null as string | null,
        pasos: [] as string[],
        nota: `Partimos de la semilla x₀ = ${this.formato(this.semilla(), 2)} (punto azul sobre el eje). Pulsa «Siguiente paso» para ver cómo se mueve.`,
      };
    }
    const r = filas[filas.length - 1];
    const k = filas.length;
    // Compara errores respecto de una misma raíz, no desplazamientos entre pasos.
    // Sin atractor, usa como referencia la raíz más cercana a la semilla inicial.
    const indice = this.actual().atractor;
    const raiz = indice >= 0 ? this.raices[indice] : this.raices.reduce((a, b) =>
      Math.abs(a - this.estado().x0) <= Math.abs(b - this.estado().x0) ? a : b);
    const antes = Math.abs(r.x - raiz);
    const despues = Math.abs(r.gx - raiz);
    const tendencia = despues < antes ? 'se acerca' : despues > antes ? 'se aleja' : null;
    return {
      titulo: `Iteración ${k}`,
      tendencia,
      pasos: [
        `Partimos de x${this.sub(k - 1)} = ${this.formato(r.x)} sobre ${k === 1 ? 'el eje x' : 'la diagonal'}.`,
        `Nos desplazamos verticalmente hasta la curva: g(x${this.sub(k - 1)}) = ${this.formato(r.gx)}.`,
        `Cruzamos a la diagonal: ese valor es el nuevo x${this.sub(k)}. Nos movimos |Δx| = ${this.formatoDelta(r.dx)}.`,
      ],
      nota: '',
    };
  });

  readonly secuencia = computed(() => {
    const estado = this.estado();
    const valores = [estado.x0, ...estado.filas.map((f) => f.gx)];
    const inicio = Math.max(0, valores.length - 6);
    return valores.slice(-6).map((v, i) => ({
      n: inicio + i,
      valor: v.toFixed(4).replace('.', ','),
    }));
  });

  readonly resumen = computed<ResumenIteracion>(() => {
    const fila = this.filas().at(-1);
    const descripcion = this.descripcion();
    return {
      n: this.filas().length,
      tendencia: descripcion.tendencia,
      pasos: fila ? descripcion.pasos : [descripcion.nota],
      indicadores: [
        { etiqueta: 'Aproximación xₙ₊₁', valor: fila ? this.formato(fila.gx) : '—' },
        { etiqueta: 'Desplazamiento |Δx|', valor: fila ? this.formatoDelta(fila.dx) : '—' },
        { etiqueta: 'Residuo |g(xₙ₊₁) − xₙ₊₁|', valor: fila ? this.formatoDelta(Math.abs(this.actual().g(fila.gx) - fila.gx)) : '—' },
      ],
      secuencia: this.secuencia(),
      mensaje: this.mensaje(),
      estado: this.terminado() ? (this.estado().fallido ? 'error' : 'exito') : fila ? 'activo' : 'inicio',
    };
  });

  px(v: number): number {
    const { min, max } = this.escala();
    return this.L + (v - min) / (max - min) * (this.R - this.L);
  }
  py(v: number): number {
    const { min, max } = this.escala();
    return this.B - (v - min) / (max - min) * (this.B - this.T);
  }

  /** Curva g(x) en 241 muestras; levanta el lápiz fuera de dominio o de escala. */
  readonly curva = computed(() => {
    const g = this.actual().g;
    let d = '';
    let dibujando = false;
    for (let i = 0; i <= 240; i++) {
      const { min, max } = this.escala();
      const x = min + (max - min) * i / 240;
      const y = g(x);
      if (!Number.isFinite(y) || y < min || y > max) { dibujando = false; continue; }
      d += `${dibujando ? 'L' : 'M'}${this.px(x).toFixed(1)} ${this.py(y).toFixed(1)}`;
      dibujando = true;
    }
    return d;
  });

  /** Escalera de la telaraña: sube a g(x), cruza a la diagonal y repite. */
  readonly segmentos = computed<Segmento[]>(() => {
    const estado = this.estado();
    const puntos: Array<[number, number]> = [[estado.x0, 0]];
    for (const fila of estado.filas) {
      puntos.push([fila.x, fila.gx]);
      puntos.push([fila.gx, fila.gx]);
    }
    const salida: Segmento[] = [];
    for (let i = 1; i < puntos.length; i++) {
      const a = puntos[i - 1];
      const b = puntos[i];
      const ultimos = i >= puntos.length - 2;
      salida.push({
        x1: this.px(a[0]), y1: this.py(a[1]),
        x2: this.px(b[0]), y2: this.py(b[1]),
        ancho: ultimos ? 4 : 2.4,
        opacidad: ultimos ? 1 : 0.8,
        flecha: Math.hypot(this.px(b[0]) - this.px(a[0]), this.py(b[1]) - this.py(a[1])) > 14,
      });
    }
    return salida;
  });

  /** Rótulos x₀, x₁… sobre el eje, con el mismo filtro de solapamiento del boceto. */
  readonly etiquetasX = computed<EtiquetaX[]>(() => {
    const estado = this.estado();
    const candidatas: EtiquetaX[] = [
      { x: estado.x0, n: 0 },
      ...estado.filas.map((f, k) => ({ x: f.gx, n: k + 1 })),
    ];
    const salida: EtiquetaX[] = [];
    for (const c of candidatas) {
      const X = this.px(c.x);
      if (X < this.L || X > this.R) continue;
      if (salida.some(e => Math.abs(X - this.px(e.x)) < 28)) continue;
      salida.push(c);
    }
    return salida;
  });

  readonly puntosRaices = computed<PuntoRaiz[]>(() => this.raices.map((r, k) => ({
    x: this.px(r), y: this.py(r), atractor: this.actual().atractor === k,
  })));

  readonly etiquetaG = computed(() => {
    const g = this.actual().g;
    for (let i = 240; i > 0; i--) {
      const { min, max } = this.escala();
      const x = min + (max - min) * i / 240;
      const y = g(x);
      if (Number.isFinite(y) && this.py(y) > this.T + 25 && this.py(y) < this.B - 20 && Math.abs(this.py(y) - this.py(x)) > 20) {
        return { x: Math.min(this.px(x) + 8, this.R - 32), y: this.py(y) - 8 };
      }
    }
    return null;
  });

  readonly pasos = [
    ['error', 'Reescribe la ecuación', 'Despeja la incógnita de f(x) = 0 para tener x = g(x) y elige una semilla x₀ cerca de la raíz. No hay intervalo.'],
    ['primario', 'Evalúa g(x₀)', 'Si da exactamente x₀, ya es el punto fijo.'],
    ['primario', 'Guarda x₁ = g(x₀)', 'Y mide el desplazamiento |Δx| = |x₁ − x₀|.'],
    ['acento', 'Proyecta contra la diagonal', 'El siguiente paso arranca en x₁, no en g(x₀): cada punto rebota contra y = x.'],
    ['ok', 'Compara con la tolerancia', 'Si |Δx| queda debajo, para y devuelve el último punto como aproximación.'],
    ['neutro', 'Repite desde el paso 2', 'Con el punto nuevo: la reescritura se evalúa siempre sobre la última x.'],
    ['error', 'Revisa el tope y el resultado', 'Si se agota el máximo de iteraciones, avisa que no convergió. Verifica además que g(raíz) = raíz: un punto fijo de g que no anule f delata una reescritura mal elegida.'],
  ];

  readonly casos = [
    ['0 < g′ < 1', 'ok', 'Convergencia monótona: la escalera baja o sube en un solo sentido.'],
    ['−1 < g′ < 0', 'ok', 'Convergencia oscilatoria: los pasos saltan a ambos lados y se cierran en espiral.'],
    ['g′ > 1', 'error', 'Divergencia monótona: la escalera se aleja siempre hacia el mismo lado.'],
    ['g′ < −1', 'error', 'Divergencia oscilatoria: la espiral se abre.'],
  ];

  readonly criterios = [
    ['ok', 'Desplazamiento |Δx|', 'El que usa por defecto', 'Mide cuánto se movió la x entre dos iteraciones: |xₙ₊₁ − xₙ|. Como es una diferencia en x, no le importa si alguien escribió la misma reescritura multiplicada por 1000: el paso es idéntico. Ojo: es una medición a posteriori; con g muy plana, un Δx chico puede esconder un error grande.'],
    ['error', '¿Y la cota de Bolzano?', 'No existe aquí', 'Bolzano necesita un intervalo con cambio de signo, y punto fijo es un método abierto: no hay red de seguridad y un paso puede salirse del dominio de g. La garantía real es verificar al final que g(raíz) = raíz y que f(raíz) = 0.'],
    ['error', 'Residuo |g(x) − x|', 'Frágil', 'Mide qué tan cerca quedó xₙ de ser un punto fijo. Es el equivalente del residuo |f(x)| cuando la ecuación se escribe como f(x) = g(x) − x, y tiene el mismo problema de escala: si escribes 1000·g(x), el residuo crece 1000 veces.'],
    ['primario', 'Residuo relativo', 'Parcial', 'Divide |g(x) − x| por una escala de g cerca de la raíz. Corrige en parte el problema de la escala, pero sigue midiendo la función y no la distancia real de x a la raíz, y es más difícil de explicar.'],
    ['primario', 'Cota teórica |g′(x)| < 1', 'Para diagnosticar', 'Si la derivada de g se mantiene por debajo de 1 en una vecindad de la raíz, la iteración converge desde cualquier semilla de esa vecindad, y |g′| es el factor de contracción por paso. Sirve para diagnosticar antes de iterar, aunque en la práctica el criterio de parada se deja en |Δx|.'],
  ];

  readonly ventajas = [
    'Pide UNA sola semilla: menos información de arranque que cualquier otro método del módulo.',
    'No necesita derivada ni intervalo: solo evaluar g en cada paso.',
    'La cuenta por iteración es la más barata: una evaluación de g y una resta para |Δx|.',
    'El criterio |Δx| es invariante a la escala de g.',
    'Con g′(raíz) ≈ 0 la convergencia se vuelve casi cuadrática con la cuenta más simple.',
  ];

  readonly limitaciones = [
    'Convergencia LINEAL: el más lento de los abiertos cuando |g′| no es chica.',
    'Si |g′(raíz)| ≥ 1 DIVERGE u oscila: la semilla y el despeje deben elegirse juntos.',
    'Sin intervalo no hay red de seguridad: un paso puede salirse del dominio de g.',
    'La reescritura define qué raíces se ven: un despeje con raíz cuadrada deja raíces fuera de alcance.',
    'Puede converger a un punto fijo de g que NO anula f, si la reescritura se hizo mal.',
  ];

  readonly recomendaciones = [
    'Elige g mirando |g′| cerca de la raíz: si es menor que 1, va bien. Compruébalo con el demo.',
    'Corre SIEMPRE con tope de iteraciones: es la única defensa razonable contra un despeje malo.',
    'Verifica al final que f(raíz) ≈ 0 y no solo que Δx sea chico.',
    'Si diverge, prueba otro despeje de la misma ecuación antes de cambiar de método.',
    'Usa |Δx| como criterio de parada, con 10⁻⁴ a 10⁻⁶.',
  ];

  /** Decimal con coma, sin notación científica. */
  formato(x: number, decimales = 5): string {
    return Number.isFinite(x) ? x.toFixed(decimales).replace('.', ',') : '—';
  }

  formatoDelta(x: number): string {
    if (!Number.isFinite(x)) return '—';
    return x.toFixed(6).replace(/\.?0+$/, '').replace('.', ',');
  }

  sub(n: number): string {
    return String(n).replace(/\d/g, (c) => '₀₁₂₃₄₅₆₇₈₉'[Number(c)]);
  }

  private nuevoEstado(): EstadoDemo {
    return {
      filas: [], x: this.semilla(), x0: this.semilla(),
      terminado: false, fallido: false, mensaje: '',
    };
  }

  reiniciar(): void {
    this.estado.set(this.nuevoEstado());
  }

  elegirDespeje(indice: number): void {
    this.despeje.set(indice);
    this.semilla.set(this.despejes[indice].x0);
    this.reiniciar();
  }

  cambiarSemilla(event: Event): void {
    const valor = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(valor)) return;
    const { min, max } = this.rangoSemilla();
    this.semilla.set(Math.min(max, Math.max(min, valor)));
    this.reiniciar();
  }

  cambiarTolerancia(event: Event): void {
    this.tolerancia.set(Number((event.target as HTMLSelectElement).value));
    this.reiniciar();
  }

  siguiente(): void {
    const estado = this.estado();
    if (estado.terminado) return;

    const gx = this.actual().g(estado.x);
    if (!Number.isFinite(gx)) {
      this.estado.set({
        ...estado, terminado: true, fallido: true,
        mensaje: 'El valor salió del dominio de g: no se puede continuar.',
      });
      return;
    }

    const fila: FilaDemo = {
      n: estado.filas.length, x: estado.x, gx, dx: Math.abs(gx - estado.x),
    };
    const filas = [...estado.filas, fila];
    let terminado = false;
    let fallido = false;
    let mensaje = '';

    if (fila.dx < this.tolerancia()) {
      terminado = true;
      mensaje = `Criterio |Δx| < tolerancia cumplido. Punto fijo ≈ ${this.formato(gx)}.`;
    } else if (Math.abs(gx) > 8) {
      terminado = true;
      fallido = true;
      mensaje = 'Diverge: la iteración se aleja de la raíz.';
    } else if (filas.length >= 25) {
      terminado = true;
      fallido = true;
      mensaje = 'Se agotó el máximo de iteraciones: no converge.';
    }

    this.estado.set({ ...estado, filas, x: gx, terminado, fallido, mensaje });
  }
}
