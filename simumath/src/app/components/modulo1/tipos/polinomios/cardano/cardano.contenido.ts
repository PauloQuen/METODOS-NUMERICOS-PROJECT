import type {
  Ejemplo,
  Ejercicio,
  ContenidoTeoria,
} from '../../../../../shared/models/metodo.model';

/**
 * CONTENIDO DE CARDANO — todo el texto y los enunciados del método.
 *
 * ── Los números salen del motor, no de un libro ──────────────────────
 * Cada tabla y conclusión de este archivo salió de correr el motor
 * (`shared/domain/numerico/cardano.ts`) con los mismos parámetros
 * escritos acá. El test `cardano.contenido.spec.ts` debe vigilar el
 * contrato (pasos.length === filas.length, cada paso arranca con Paso N,
 * raíces anunciadas coherentes, etc.).
 *
 * ── Tres reglas de este archivo ──────────────────────────────────────
 * 1. Toda conclusión arranca con la raíz/raíces.
 * 2. Cardano es resolución cerrada: `iterations: 0`.
 * 3. Para casuísticas usar `extraccion` (busqueda>40, datos≥2, formulacion>60).
 *    Para ejercicios usar `pista>40`.
 */

export const TEORIA_CARDANO: ContenidoTeoria = {
  concepto:
    'La fórmula de Cardano resuelve la cúbica a·x³ + b·x² + c·x + d = 0 en forma cerrada. ' +
    'Primero se reduce a la forma deprimida x³ + p·x + q = 0 con el cambio x = t − b/(3a), ' +
    'luego se calcula el discriminante Δ = (q/2)² + (p/3)³ y, según su signo, se obtienen ' +
    'las raíces reales (y complejas) mediante radicales o mediante la trigonometría de Viète ' +
    'cuando Δ < 0 (tres raíces reales).',

  fundamento:
    'La idea es eliminar el término cuadrático: el desplazamiento m = −b/(3a) centra la cúbica. ' +
    'En la variable t = x − m queda t³ + p·t + q = 0 con p,q en función de a,b,c,d. ' +
    'Cardano propuso t = u+v con (u+v)³ = u³+v³ + 3uv(u+v)=u³+v³ + 3uv·t, lo que lleva a ' +
    '3uv = −p, u³+v³ = −q, y por tanto u³,v³ son raíces de y² − (u³+v³)y + (uv)³ = 0. ' +
    'Así se obtienen u³,v³ por fórmula cuadrática y luego t = ³√u³ + ³√v³ (con las raíces ' +
    'cúbicas adecuadas). Si Δ < 0, las raíces cúbicas son complejas conjugadas y conviene ' +
    'usar la forma trigonométrica de Viète para obtener las tres raíces reales directamente.',

  cuandoFalla:
    'Cardano requiere que el polinomio sea de grado 3 (a != 0). Si es de grado < 3 o > 3, ' +
    'no corresponde aplicar esta fórmula. Tampoco resuelve funciones trascendentes (eˣ, sen(x), ln(x)). ' +
    'Cuando hay raíces múltiples (Δ=0) las fórmulas siguen valiendo con cuidado numérico ' +
    '(umbral |Δ| ≤ 1e-12·max(1,|p|,|q|)). Además, la forma algebraica clásica puede presentar ' +
    'casus irreducibilis (Δ<0) que se maneja con Viète trigonométrico para obtener raíces reales ' +
    'sin pasar por complejos explícitos en esta implementación didáctica.',

  ordenConvergencia:
    'Es una resolución cerrada: no hay iteraciones, las raíces se calculan directamente ' +
    'mediante fórmulas algebraicas (o trigonométricas). Por eso decimos «0 iteraciones» ' +
    'y el resultado se obtiene en un único desarrollo paso a paso.',

  videoUrl: undefined,

  recursos: [
    {
      titulo: 'Ecuación de tercer grado (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Ecuaci%C3%B3n_de_tercer_grado',
      tipo: 'lectura',
      descripcion: 'La fórmula de Cardano, la forma deprimida y el discriminante.',
    },
    {
      titulo: 'Cubic Formula (MathWorld)',
      url: 'https://mathworld.wolfram.com/CubicFormula.html',
      tipo: 'lectura',
      descripcion: 'Las fórmulas cerradas y la clasificación de las raíces según el discriminante.',
    },
    {
      titulo: 'Videos de repaso: fórmula de Cardano',
      url: 'https://www.youtube.com/results?search_query=formula+de+cardano',
      tipo: 'video',
      descripcion: 'Desarrollo algebraico completo y ejemplos con una y tres raíces reales.',
    },
  ],

  algoritmo: {
    formula:
      'x = t − b/(3a), t³ + p·t + q = 0, p = (3a c − b²)/(3a²), q = (2b³ − 9a b c + 27a² d)/(27a³). ' +
      'Δ = (q/2)² + (p/3)³. Si Δ > 0: t_k = ω^k · A^(1/3) + ω^(2k) · B^(1/3), A = −q/2 + √Δ, B = −q/2 − √Δ, ω primitiva cúbica. ' +
      'Si Δ == 0: t₁ = −2·(q/2)^(1/3), t₂ = t₃ = (q/2)^(1/3). Si Δ < 0: t_k = 2·√(−p/3)·cos((φ − 2kπ)/3), φ = arccos((−q/2)/√(−(p/3)³)), k=0,1,2.',

    criterios: [
      {
        nombre: 'Grado del polinomio',
        explicacion:
          'Debe ser a·x³ + b·x² + c·x + d = 0 con a != 0. Si grado != 3, el método no aplica.',
      },
      {
        nombre: 'Discriminante Δ',
        explicacion:
          'Δ = (q/2)² + (p/3)³ decide el caso: Δ > 0 → una raíz real + dos complejas conjugadas (mostramos la real principal); Δ == 0 → raíz múltiple (al menos doble); Δ < 0 → tres raíces reales distintas (Viète trigonométrico).',
      },
      {
        nombre: 'Umbral numérico',
        explicacion:
          'Para evitar falsos positivos/negativos por redondeo, usamos |Δ| ≤ ε·M con ε=1e-12 y M = max(1, |p|, |q|) para tratar Δ≈0 como cero.',
      },
    ],

    pasos: [
      'Extraer coeficientes a,b,c,d de la función f(x)=a x³ + b x² + c x + d.',
      'Calcular m = −b/(3a) (desplazamiento) para reducir a forma deprimida.',
      'Calcular p = (3a c − b²)/(3a²), q = (2b³ − 9a b c + 27a² d)/(27a³). Obtener t³ + p t + q = 0.',
      'Calcular Δ = (q/2)² + (p/3)³. Aplicar umbral si corresponde.',
      'Según Δ: si > 0 obtener t con Cardano clásico (una real); si == 0 obtener raíces múltiples; si < 0 obtener tres t con Viète trigonométrico.',
      'Deshacer desplazamiento: x = t + m para cada raíz real encontrada.',
      'Verificar orden y presentar raíces reales (de menor a mayor).',
    ],

    ventajas: [
      'Resolución cerrada: no itera, obtiene raíces directamente.',
      'Entrega todas las raíces reales en un solo desarrollo.',
      'Útil didácticamente: muestra paso a paso coeficientes, p,q, Δ, caso.',
      'Maneja raíces múltiples y el caso con tres raíces reales vía trigonometría.',
    ],

    limitaciones: [
      'Solo aplica a polinomios de grado exactamente 3.',
      'No aplica a funciones trascendentes (eˣ, sen(x), ln(x), etc.).',
      'La forma clásica puede ser inestable con coeficientes muy grandes/pequeños (propio de radicales).',
      'Requiere cuidado con Δ muy próximo a cero por precisión numérica.',
    ],

    recomendaciones: [
      'Verificar siempre que el polinomio sea cúbico (grado 3).',
      'Usar el umbral para clasificar Δ correctamente cuando hay raíces múltiples.',
      'Al presentar resultados, mostrar raíces con formato razonable (8 decimales) y verificar f(x)≈0.',
      'Para tres raíces reales, preferir siempre la forma trigonométrica de Viète.',
    ],
  },

  ejemploNormal: {
    id: 'cardano-teoria-numerico',
    titulo: 'Cardano: cúbica con una raíz real',
    tipo: 'numerico',
    enunciado:
      'Resolver x³ − x − 2 = 0 con la fórmula de Cardano. a=1,b=0,c=−1,d=−2. ' +
      'Calcular m,p,q,Δ y obtener las raíces reales.',
    ecuacion: 'x³ − x − 2 = 0',
    parametros: [
      { etiqueta: 'Coeficientes', valor: 'a=1, b=0, c=-1, d=-2' },
      { etiqueta: 'Forma deprimida', valor: 't³ + p·t + q = 0' },
    ],
    interpretacion:
      'Δ = (q/2)² + (p/3)³ > 0: corresponde a una raíz real y dos complejas conjugadas. ' +
      'Aplicando Cardano clásico obtenemos la raíz real x = t + m. Las complejas no se listan ' +
      'en la tabla por ser raíces no reales buscadas en este contexto didáctico.',
    pasos: [
      'Paso 0 — Coeficientes: a=1, b=0, c=−1, d=−2. Verificar grado 3: ok.',
      'Paso 1 — Desplazamiento m = −b/(3a) = 0. Forma deprimida mantiene coeficientes.',
      'Paso 2 — p = (3a c − b²)/(3a²) = (3·1·(−1) − 0)/(3) = −3/3 = −1. q = (2b³ − 9a b c + 27a² d)/(27a³) = (0 − 0 + 27·1·(−2))/(27) = −54/27 = −2. t³ − t − 2 = 0.',
      'Paso 3 — q/2 = −1, (q/2)² = 1. p/3 = −1/3, (p/3)³ = −1/27. Δ = 1 + (−1/27) = 26/27 = 0.9629629629629629 > 0.',
      'Paso 4 — Caso Δ > 0 (una raíz real): A = −q/2 + √Δ = −(−1) + √(0.9629629629629629) = 1 + 0.9813067629253164 = 1.9813067629253163. B = −q/2 − √Δ = 1 − 0.9813067629253164 = 0.018693237074683622.',
      'Paso 5 — t = ³√A + ³√B = ³√1.9813067629253163 + ³√0.018693237074683622 = 1.2559834226476907 + 0.2653962841568766 = 1.5213797068045674.',
      'Paso 6 — Deshacer el desplazamiento: x = t + m = 1.5213797068045674 + 0 = 1.5213797068045674.',
    ],
    algoritmo:
      'Con m=0, p=−1, q=−2: Δ=(q/2)²+(p/3)³=(−1)²+(−1/3)³=0.96296296>0 → Cardano clásico. ' +
      't = ³√(1 + √Δ) + ³√(1 − √Δ)=1.5213797068045674.',
    criterio: 'Δ>0 ⇒ una raíz real. Raíz única real encontrada: x≈1.5213797068045674.',
    conclusion:
      'Raíz real: x ≈ 1.52137971. f(x)=x³−x−2 evaluada en esa raíz es ~0 (residuo numérico despreciable).',
    calculo: { funcion: 'x^3 - x - 2' },
  },

  ejemploCasuistica: {
    id: 'cardano-teoria-casuistica',
    titulo: 'Tres raíces reales: sensor Δ < 0 (Viète trigonométrico)',
    tipo: 'casuistica',
    enunciado:
      'El sensor de nivel se calibra con V(Δ)=Δ³ − 7Δ + 4 = 0 (mismo problema que otros métodos). ' +
      'Resolver con Cardano: a=1,b=0,c=−7,d=4. Obtener las tres raíces reales con Viète trigonométrico.',
    ecuacion: 'x^3 − 7x + 4 = 0',
    parametros: [
      { etiqueta: 'Ley', valor: 'V(Δ)=Δ³ − 7Δ + 4 = 0' },
      { etiqueta: 'Coeficientes', valor: 'a=1,b=0,c=-7,d=4' },
    ],
    extraccion: {
      busqueda:
        'las correcciones Δ que anulan V(Δ)=Δ³ − 7Δ + 4 (raíces reales) para calibrar el sensor.',
      datos: [
        { simbolo: 'a,b,c,d', valor: '1,0,-7,4', queEs: 'coeficientes de la cúbica' },
        { simbolo: 'p,q', valor: '-7,4', queEs: 'coeficientes forma deprimida t³ + p t + q = 0' },
        { simbolo: 'Δ', valor: '< 0', queEs: 'discriminante → tres raíces reales' },
      ],
      formulacion:
        'm=0, p=−7, q=4. Δ=(q/2)²+(p/3)³=(2)²+(−7/3)³=4 − 343/27=(108−343)/27=−235/27≈−8.7037037. ' +
        'Al ser Δ<0 usamos Viète trigonométrico: t_k = 2·√(−p/3)·cos((φ − 2kπ)/3), φ=arccos((−q/2)/√(−(p/3)³)), k=0,1,2. ' +
        'Desplazamiento m=0 ⇒ x_k = t_k.',
    },
    interpretacion:
      'Δ<0 implica tres raíces reales distintas. La forma trigonométrica evita el casus irreducibilis ' +
      'y entrega directamente las tres raíces con buena estabilidad numérica.',
    pasos: [
      'Paso 0 — Coeficientes: a=1,b=0,c=−7,d=4.',
      'Paso 1 — m=0. p=(3·1·(−7)−0)/(3)=−7. q=(0 − 0 + 27·1·4)/(27)=4. t³ − 7t + 4 = 0.',
      'Paso 2 — Δ=(q/2)²+(p/3)³=(2)²+(−7/3)³=4 − 343/27=−235/27=−8.703703703703704 < 0.',
      'Paso 3 — Caso Δ < 0 (tres raíces reales): −p/3 = −(−7)/3=7/3=2.3333333333333335, √(−p/3)=√2.3333333333333335=1.5275252316519468, factor 2·√(−p/3)=3.0550504633038936.',
      'Paso 4 — −(p/3)³ = −(−343/27)=343/27=12.703703703703704, √(−(p/3)³)=3.5637059362410924. −q/2=−2. (−q/2)/√(−(p/3)³)=−2/3.5637059362410924=−0.5612310241546865. φ=arccos(−0.5612310241546865)=2.164208272473024 rad.',
      'Paso 5 — k=0: (φ)/3=0.721402757491008, cos=0.7513101617791627, t₀=3.0550504633038936·0.7513101617791627=2.2924015852246216.',
      'Paso 6 — k=1: (φ − 2π)/3=(2.164208272473024 − 6.283185307179586)/3=−1.3729923449021873, cos(−1.3729923449021873)=0.19722627489287316, t₁=3.0550504633038936·0.19722627489287316=0.6027049307029097.',
      'Paso 7 — k=2: (φ − 4π)/3=(2.164208272473024 − 12.566370614359172)/3=−3.4673874472953827, cos(−3.4673874472953827)=−0.9475364366720358, t₂=3.0550504633038936·(−0.9475364366720358)=−2.895106515927531.',
      'Paso 8 — x = t + m = t: −2.895106515927531, 0.6027049307029097, 2.2924015852246216. Ordenadas de menor a mayor.',
    ],
    algoritmo:
      'p=−7,q=4, Δ<0. Viète: 2·√(7/3)=3.0550504633038936, φ=arccos(−q/2 / √(−(p/3)³))=arccos(−2/3.5637059362410924)=2.164208272473024. k=0,1,2 → tres t reales.',
    criterio: 'Δ<0 ⇒ tres raíces reales distintas. Tres raíces encontradas.',
    conclusion:
      'Raíces reales: x₁ ≈ −2.89510652, x₂ ≈ 0.60270493 y x₃ ≈ 2.29240159. Las tres ' +
      'verifican: al evaluar f en cada una queda un residuo numérico despreciable.',
    calculo: { funcion: 'x^3 - 7x + 4' },
  },
};

export const EJEMPLOS_CARDANO: Ejemplo[] = [
  {
    id: 'cardano-ej1-raiz-doble',
    titulo: 'Raíz doble y raíz simple (Δ=0)',
    tipo: 'numerico',
    enunciado: 'Resolver x³ − 3x + 2 = 0 con Cardano. Hallar raíces reales (doble y simple).',
    ecuacion: 'x³ − 3x + 2 = 0',
    parametros: [
      { etiqueta: 'Coeficientes', valor: 'a=1,b=0,c=-3,d=2' },
      { etiqueta: 'Caso', valor: 'Δ=0 (raíz múltiple)' },
    ],
    interpretacion:
      'Δ=0 indica al menos una raíz doble. Cardano da t₁=−2·(q/2)^(1/3), t₂=t₃=(q/2)^(1/3).',
    pasos: [
      'Paso 0 — a=1,b=0,c=−3,d=2. m=0.',
      'Paso 1 — p=(3·1·(−3))/(3)=−3. q=(27·1·2)/(27)=2. t³ − 3t + 2 = 0.',
      'Paso 2 — Δ=(q/2)²+(p/3)³: q/2=1, p/3=−1 ⇒ (1)² + (−1)³ = 1 − 1 = 0.',
      'Paso 3 — Δ==0: t₁ = −2·(q/2)^(1/3)=−2·1=−2. t₂=t₃ = (q/2)^(1/3)=1.',
      'Paso 4 — x = t+m: x=−2, x=1, x=1.',
      'Paso 5 — Raíces reales: −2, 1 (doble).',
      'Paso 6 — Verificación: f(−2)=−8+6+2=0, f(1)=1−3+2=0.',
    ],
    algoritmo:
      'm=0, p=−3, q=2, Δ=0. La deprimida t³−3t+2 se factoriza como (t+2)(t−1)²: ' +
      'sale t=−2 (raíz simple) y t=1 (raíz doble). Como m=0, x=t+m deja x=−2 y x=1.',
    criterio:
      'Δ==0 ⇒ hay raíz múltiple: una raíz doble (x=1) y una simple (x=−2). ' +
      'Cardano entrega las dos, y el detalle de la tabla dice cuál de ellas se repite.',
    conclusion:
      'Raíces reales: x ≈ −2 (raíz simple) y x ≈ 1 (raíz doble, multiplicidad 2). ' +
      'Verificación: f(−2)=0 y f(1)=0, y el polinomio se factoriza como (x+2)(x−1)².',
    calculo: { funcion: 'x^3 - 3x + 2' },
  },
  {
    id: 'cardano-ej2-tres-reales-viete',
    titulo: 'Tres raíces reales distintas (Viète)',
    tipo: 'numerico',
    enunciado: 'Resolver x³ − 3x + 1 = 0 con Cardano. Obtener las tres raíces reales.',
    ecuacion: 'x^3 − 3x + 1 = 0',
    parametros: [
      { etiqueta: 'Coeficientes', valor: 'a=1,b=0,c=-3,d=1' },
      { etiqueta: 'Caso', valor: 'Δ<0 → tres reales (Viète trig.)' },
    ],
    interpretacion: 'Δ<0: usar forma trigonométrica de Viète para obtener tres raíces reales.',
    pasos: [
      'Paso 0 — a=1,b=0,c=−3,d=1. m=0.',
      'Paso 1 — p=−3, q=1. t³ − 3t + 1 = 0.',
      'Paso 2 — Δ=(q/2)²+(p/3)³=(0.5)²+(−1)^3=0.25−1=−0.75 < 0.',
      'Paso 3 — −p/3=1, √(−p/3)=1, 2·√(−p/3)=2. −(p/3)³=1, √(−(p/3)³)=1. (−q/2)/1=(−0.5)/1=−0.5. φ=arccos(−0.5)=2π/3=2.0943951023931953.',
      'Paso 4 — k=0: φ/3=0.6981317007977318, cos=0.766044443118978, t₀=2·0.766044443118978=1.532088886237956.',
      'Paso 5 — k=1: (φ−2π)/3=(2.0943951023931953−6.283185307179586)/3=−1.3962634015954636, cos=cos(−1.396263)=cos(1.396263)=0.17364817766693041, t₁=2·0.17364817766693041=0.3472963553338607.',
      'Paso 6 — k=2: (φ−4π)/3=(2.0943951023931953−12.566370614359172)/3=−3.490658503988659, cos=cos(−3.490659)=cos(3.490659)=cos(200°)=−0.9396926207859084, t₂=2·(−0.9396926207859084)=−1.8793852415718169.',
      'Paso 7 — x = t: −1.8793852415718169, 0.3472963553338607, 1.532088886237956. Ordenadas.',
    ],
    algoritmo: 'p=−3,q=1, Δ<0. Viète con φ=2π/3 → tres raíces reales.',
    criterio:
      'Δ<0 ⇒ tres raíces reales distintas: el caso irreducible, que se resuelve con la ' +
      'forma trigonométrica de Viète en lugar de la fórmula de radicales.',
    conclusion: 'Raíces reales: x ≈ −1.87938524, x ≈ 0.34729636, x ≈ 1.53208889.',
    calculo: { funcion: 'x^3 - 3x + 1' },
  },
  {
    id: 'cardano-ej3-caja-cubic',
    titulo: 'Cubic con raíces múltiples (aplicación: volumen de caja)',
    tipo: 'casuistica',
    enunciado:
      'Se corta x dm de cada esquina de una plancha cuadrada de 12×12 dm y se dobla para formar una caja. ' +
      'Se quiere volumen V=128 dm³. Ecuación: (12−2x)²·x = 128 ⇒ x³ − 12x² + 36x − 32 = 0. Resolver con Cardano.',
    ecuacion: 'x^3 − 12x² + 36x − 32 = 0',
    parametros: [
      { etiqueta: 'Aplicación', valor: 'Volumen caja V=128 dm³' },
      { etiqueta: 'Ecuación', valor: 'x³ − 12x² + 36x − 32 = 0' },
      { etiqueta: 'Coeficientes', valor: 'a=1,b=-12,c=36,d=-32' },
    ],
    extraccion: {
      busqueda: 'altura x (dm) de la caja tal que (12−2x)²·x = 128.',
      datos: [
        { simbolo: '12×12', valor: 'dm²', queEs: 'plancha cuadrada' },
        { simbolo: 'x', valor: 'dm', queEs: 'corte en cada esquina' },
        { simbolo: 'V', valor: '128 dm³', queEs: 'volumen deseado' },
      ],
      formulacion:
        'V=(12−2x)² x = 128. Expandimos: (144 − 48x + 4x²)x = 144x − 48x² + 4x³ = 128 ⇒ 4x³ − 48x² + 144x − 128 = 0 ⇒ dividir por 4: x³ − 12x² + 36x − 32 = 0. ' +
        'Reducción: m=−b/(3a)=−(−12)/3=4. p=(3a c − b²)/(3a²)=(3·1·36 − 144)/3=(108−144)/3=−12. ' +
        'q=(2b³ − 9a b c + 27a² d)/(27a³): con b=−12, b³=−1728 ⇒ 2b³=−3456; −9·1·(−12)·36=+3888; 27·1·(−32)=−864. ' +
        'Numerador −3456+3888−864=−432, denominador 27a³=27 ⇒ q=−16. Deprimida: t³ − 12t − 16 = 0. ' +
        'Δ=(q/2)²+(p/3)³=(−8)²+(−4)³=64−64=0.',
    },
    interpretacion:
      'Δ=0 indica raíz múltiple. x = t+m. Solución física: x=2 (raíz doble) y x=8; x=8 fuera de dominio (12−2*8=−4), quedando x=2 (doble).',
    pasos: [
      'Paso 0 — a=1,b=−12,c=36,d=−32.',
      'Paso 1 — m=−b/(3a)=−(−12)/3=4.',
      'Paso 2 — p=(3a c − b²)/(3a²)=(3·1·36 − 144)/(3)=(108−144)/3=−12. q=(2b³ − 9a b c + 27a² d)/(27a³)= (2·(−1728) − 9·1·(−12)·36 + 27·1·(−32))/(27)= (−3456 + 3888 − 864)/27=(−432)/27=−16. t³ − 12t − 16 = 0.',
      'Paso 3 — Δ=(q/2)²+(p/3)³=(−8)²+(−4)^3=64−64=0.',
      'Paso 4 — Δ==0: t₁=−2·(q/2)^(1/3)=−2·(−2)=4. t₂=t₃=(q/2)^(1/3)=−2.',
      'Paso 5 — x = t+m: t=4→x=8, t=−2→x=2, t=−2→x=2.',
      'Paso 6 — Raíces: 2 (doble), 8. Dominio físico x∈(0,6) ⇒ x=2.',
      'Paso 7 — Verificación V=(12−4)²·2=8²·2=128. OK.',
    ],
    algoritmo:
      'm=4, p=−12, q=−16, Δ=0. La deprimida t³−12t−16 se factoriza como (t−4)(t+2)²: ' +
      'sale t=4 (raíz simple) y t=−2 (raíz doble). Deshaciendo el desplazamiento x=t+m ' +
      'quedan x=8 y x=2 (doble).',
    criterio: 'Δ==0 ⇒ raíz doble y raíz simple. Interpretación física requerida.',
    conclusion:
      'Raíces reales: x ≈ 2 (raíz doble), x ≈ 8. Para caja válida, x=2 dm (x=8 fuera de dominio).',
    calculo: { funcion: 'x^3 - 12x^2 + 36x - 32' },
  },
  {
    id: 'cardano-ej4-consecutivos',
    titulo: 'Números consecutivos (aplicación)',
    tipo: 'casuistica',
    enunciado:
      'Tres números enteros consecutivos multiplicados entre sí dan 24: (x−1)x(x+1)=x³ − x = 24 ⇒ x³ − x − 24 = 0. Resolver con Cardano.',
    ecuacion: 'x^3 − x − 24 = 0',
    parametros: [
      { etiqueta: 'Problema', valor: '(x−1)x(x+1)=24' },
      { etiqueta: 'Ecuación', valor: 'x^3 − x − 24 = 0' },
      { etiqueta: 'Coeficientes', valor: 'a=1,b=0,c=-1,d=-24' },
    ],
    extraccion: {
      busqueda: 'x tal que el producto de tres consecutivos (x−1,x,x+1)=24.',
      datos: [
        { simbolo: '(x−1),x,(x+1)', valor: 'enteros consecutivos', queEs: 'números buscados' },
        { simbolo: 'producto', valor: '24', queEs: 'producto de los tres números consecutivos' },
      ],
      formulacion:
        '(x−1)x(x+1)=x(x²−1)=x³−x=24 ⇒ x³−x−24=0. a=1,b=0,c=−1,d=−24. m=0, p=−1, q=−24. Δ=(q/2)²+(p/3)³=(−12)²+(−1/3)^3=144 − 1/27=143.96296296296296>0.',
    },
    interpretacion:
      'Δ>0 ⇒ una sola raíz real: las otras dos son complejas conjugadas y no interesan en ' +
      'este problema. La raíz real da el número central x=3, de modo que los tres números ' +
      'consecutivos buscados son 2, 3 y 4.',
    pasos: [
      'Paso 0 — Coeficientes: a=1, b=0, c=−1, d=−24. Verificar grado 3: ok.',
      'Paso 1 — m=−b/(3a)=0. p=(3a c − b²)/(3a²)=(−3−0)/3=−1. q=(2b³ − 9a b c + 27a² d)/(27a³)=(0 − 0 + 27·(−24))/27=−24. Deprimida: t³ − t − 24 = 0.',
      'Paso 2 — Δ=(q/2)²+(p/3)³=(−12)²+(−1/3)³=144 − 1/27 = 143.96296296296296 > 0.',
      'Paso 3 — Caso Δ > 0: −q/2 = 12, √Δ = 11.998456690881664.',
      'Paso 4 — A = −q/2 + √Δ = 12 + 11.998456690881664 = 23.998456690881664. B = −q/2 − √Δ = 12 − 11.998456690881664 = 0.0015433091183361114.',
      'Paso 5 — t = ³√A + ³√B = ³√23.998456690881664 + ³√0.0015433091183361114 = 2.8844373104863457 + 0.11556268951364888 = 2.9999999999999947, que redondeado es 3 (la raíz exacta es entera).',
      'Paso 6 — Deshacer el desplazamiento: x = t + m = 2.9999999999999947 + 0 = 3.',
      'Paso 7 — Raíz real: x=3. Los tres números consecutivos son 2, 3 y 4 (2·3·4=24).',
    ],
    algoritmo:
      'm=0, p=−1, q=−24, Δ>0 ⇒ una raíz real. Con A=−q/2+√Δ=23.998456690881664 y ' +
      'B=−q/2−√Δ=0.0015433091183361114 sale t=³√A+³√B=2.9999999999999947, de donde ' +
      'x=t+m=3.',
    criterio:
      'Δ>0 ⇒ una única raíz real, que en este caso da un entero: x=3 (los tres números ' +
      'consecutivos son 2, 3 y 4).',
    conclusion: 'Raíz real: x ≈ 3.0. Los tres números consecutivos son 2,3,4 (2·3·4=24).',
    calculo: { funcion: 'x^3 - x - 24' },
  },
];

export const EJERCICIOS_CARDANO: Ejercicio[] = [
  {
    id: 'cardano-ejercicio-triple',
    titulo: 'Raíz triple',
    tipo: 'numerico',
    enunciado: 'Resolver (x+1)^3 = 0 con Cardano. Identificar la naturaleza de las raíces.',
    ecuacion: '(x+1)^3 = 0',
    parametros: [
      { etiqueta: 'Forma expandida', valor: 'x^3 + 3x^2 + 3x + 1 = 0' },
      { etiqueta: 'Coeficientes', valor: 'a=1,b=3,c=3,d=1' },
    ],
    pista: 'Expandir (x+1)^3 = x³+3x²+3x+1. Reducir: m=−b/(3a)=−1. Calcular p,q y ver Δ.',
    interpretacion:
      'Δ=0 y además p=q=0: la deprimida es t³=0, o sea una raíz triple. Las tres raíces ' +
      'coinciden en x=−1 y el polinomio se factoriza como (x+1)³.',
    pasos: [
      'Paso 0 — Expandir: (x+1)^3=x³+3x²+3x+1, a=1,b=3,c=3,d=1.',
      'Paso 1 — m=−b/(3a)=−1.',
      'Paso 2 — p=(3a c − b²)/(3a²)=(9 − 9)/(3)=0. q=(2b³ − 9a b c + 27a² d)/(27a³). b³=27, 2b³=54. −9a b c = −9·1·3·3 = −81. 27a² d = 27. Numerador: 54 − 81 + 27 = 0. q=0. t³ + 0·t + 0 = t³=0.',
      'Paso 3 — Δ=(q/2)²+(p/3)³=0. Con p=0 y q=0 ⇒ Δ=0.',
      'Paso 4 — Δ==0: t₁=−2·(q/2)^(1/3)=0. t₂=t₃=0.',
      'Paso 5 — x = t+m = −1, −1, −1.',
      'Paso 6 — Raíz triple: x=−1.',
    ],
    algoritmo:
      'm=−1, p=0, q=0, Δ=0. Como p=q=0, la deprimida es t³=0 y sale la raíz triple t=0; ' +
      'deshaciendo el desplazamiento, x=t+m=−1.',
    criterio:
      'Δ==0 con p=q=0 ⇒ raíz triple: las tres raíces coinciden en el mismo valor y no hay ' +
      'raíces complejas.',
    conclusion:
      'Raíz real triple: x ≈ −1 (multiplicidad 3). Es la única raíz real: al evaluar f(−1) ' +
      'queda (−1)³+3(−1)²+3(−1)+1=0, por eso el polinomio se anula solo en ese punto.',
    calculo: { funcion: 'x^3 + 3x^2 + 3x + 1' },
  },
  {
    id: 'cardano-ejercicio-a-diferente',
    titulo: 'Cúbica con coeficiente a!=1',
    tipo: 'numerico',
    enunciado: 'Resolver 2x³ + 3x² − 11x − 6 = 0 con Cardano.',
    ecuacion: '2x^3 + 3x^2 − 11x − 6 = 0',
    parametros: [
      { etiqueta: 'Coeficientes', valor: 'a=2,b=3,c=-11,d=-6' },
      { etiqueta: 'Caso', valor: 'Δ<0 → tres raíces reales (Viète trigonométrico)' },
    ],
    pista:
      'Usar fórmulas con a=2: m=−b/(3a), p=(3a c − b²)/(3a²), q=(2b³ − 9a b c + 27a² d)/(27a³).',
    interpretacion:
      'Tres raíces reales, aunque el coeficiente de x³ no sea 1: el motor lee a=2 del ' +
      'polinomio y aplica la fórmula con ese valor, no con uno normalizado a 1.',
    pasos: [
      'Paso 0 — a=2,b=3,c=−11,d=−6.',
      'Paso 1 — m=−b/(3a)=−3/6=−0.5.',
      'Paso 2 — 3a c = 3·2·(−11)=−66. b²=9. Numerador p: −66−9=−75. 3a²=3·4=12. p=−75/12=−25/4=−6.25.',
      'Paso 3 — b³=27, 2b³=54. −9a b c = −9·2·3·(−11)= +594. 27a² d = 27·4·(−6)=−648. Numerador q: 54 + 594 − 648 = 0. Denom 27a³=27·8=216. q=0/216=0. t³ − 6.25t + 0 = t(t² − 6.25)=0.',
      'Paso 4 — t³ + p t + q = t³ − 6.25t = 0 ⇒ t(t² − 25/4)=0 ⇒ t=0, t=±5/2=±2.5.',
      'Paso 5 — x = t+m = t − 0.5: t=2.5→2.0, t=0→−0.5, t=−2.5→−3.0.',
      'Paso 6 — Raíces: −3, −0.5, 2.',
    ],
    algoritmo:
      'm=−0.5, p=−6.25, q=0. Δ=(q/2)²+(p/3)³=0 + (−2.0833)³=−9.042245370370372 < 0. Tres raíces reales.',
    criterio: 'Tres raíces reales. Caso con q=0 simplificado.',
    conclusion:
      'Raíces reales: x ≈ −3, x ≈ −0.5 y x ≈ 2. Verificación: el factorizado es ' +
      '2(x+3)(x+0.5)(x−2), así que cada uno de los tres valores anula f(x).',
    calculo: { funcion: '2x^3 + 3x^2 - 11x - 6' },
  },
  {
    id: 'cardano-ejercicio-dron',
    titulo: 'Dron: tiempo de encuentro',
    tipo: 'casuistica',
    enunciado:
      'La altura de un dron sigue h(t)=t³ − 6t² + 11t − 6 metros. ¿En qué instantes h(t)=0? Resolver con Cardano.',
    ecuacion: 't^3 − 6t² + 11t − 6 = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'h(t)=t³ − 6t² + 11t − 6' },
      { etiqueta: 'Pregunta', valor: 'h(t)=0' },
      { etiqueta: 'Coeficientes', valor: 'a=1,b=-6,c=11,d=-6' },
    ],
    pista: 'm=−b/(3a)=2. Calcular p,q. Δ puede ser negativo o positivo según valores.',
    extraccion: {
      busqueda: 'instantes t cuando la altura del dron es cero.',
      datos: [
        { simbolo: 'h(t)', valor: 'm', queEs: 'altura en función del tiempo' },
        { simbolo: 't', valor: 's', queEs: 'tiempo transcurrido desde el despegue' },
      ],
      formulacion:
        'h(t)=t³ − 6t² + 11t − 6 = 0. m=−(−6)/3=2. p=(3·1·11 − 36)/3=(33−36)/3=−1. ' +
        'q=(2b³ − 9a b c + 27a² d)/(27a³): con b=−6, b³=−216 ⇒ 2b³=−432; −9·1·(−6)·11=+594; 27·1·(−6)=−162. ' +
        'Numerador −432+594−162=0 ⇒ q=0. Deprimida: t³ − t = t(t²−1)=0 ⇒ t=0,±1. Deshacer: x=t+m = 1,2,3. Ordenados 1,2,3.',
    },
    interpretacion:
      'Tres raíces reales: 1,2,3 segundos. El dron pasa por altura 0 en esos instantes.',
    pasos: [
      'Paso 0 — a=1,b=−6,c=11,d=−6.',
      'Paso 1 — m=2.',
      'Paso 2 — p=(3·11 − 36)/(3)=−1. q=(2·(−216) − 9·(−6)·11 + 27·(−6))/(27)= (−432 + 594 − 162)/27=0. t³ − t = 0.',
      'Paso 3 — t(t−1)(t+1)=0 ⇒ t=−1,0,1.',
      'Paso 4 — x = t+m = 1,2,3.',
      'Paso 5 — Raíces: 1,2,3 s.',
    ],
    algoritmo: 'm=2,p=−1,q=0, Δ=(0)² + (−1/3)^3 = −1/27 < 0. Tres raíces reales 1,2,3.',
    criterio: 'Tres raíces reales (Δ<0) con resultado entero.',
    conclusion: 'Raíces reales: x ≈ 1, x ≈ 2, x ≈ 3 segundos. h(1)=h(2)=h(3)=0.',
    calculo: { funcion: 'x^3 - 6x^2 + 11x - 6' },
  },
];
