// GENERADO desde /tmp/opencode/calc-ejercicios.mjs — no editar a mano.
// Datos numéricos verificados de los 10 ejercicios del PDF "Explicacion ejercicios tema 1 MN".

export interface FilaEjercicio {
  i: number | string;
  a?: string; b?: string; xm?: string; fxm?: string; prod?: string; Ea?: string; nuevo?: string;
  x?: string; fx?: string; dfx?: string; xnuevo?: string;
  x0?: string; x1?: string; x2?: string; f2?: string;
}

export interface DesarrolloPaso {
  paso: string;
  detalle: string[];
}

export interface Ejercicio {
  id: string;
  metodo: 'biseccion' | 'newton' | 'secante' | 'punto-fijo' | 'regula-falsi';
  titulo: string;
  funcion: string;
  datos: string;
  formula: string;
  desarrollo: DesarrolloPaso[];
  columnas: string[];
  filas: FilaEjercicio[];
  convergeEn: number | null;
  raizRef: string | null;
  nota: string;
  matlab: string;
}

export const EJERCICIOS: Ejercicio[] = [
  {
    "id": "biseccionE1",
    "metodo": "biseccion",
    "titulo": "Bisección · f(x) = x³ − 7x + 4 en [−3, −2]",
    "funcion": "f(x) = x³ − 7x + 4 en [−3, −2]",
    "datos": "Intervalo [a, b] = [−3, −2] · n = 4 iteraciones · f(a) = −2, f(b) = 4 (hay cambio de signo)",
    "formula": "xm = (a + b) / 2",
    "desarrollo": [
      {
        "paso": "Iteración 1",
        "detalle": [
          "xm = (a + b) / 2 = (−3 + (−2)) / 2 = −2.5",
          "f(xm) = (−2.5)³ − 7·(−2.5) + 4 = −15.625 + 17.5 + 4 = 5.875",
          "f(a)·f(xm) = (−2)·(5.875) = −11.75 < 0  →  la raíz está en [a, xm]: se actualiza b = −2.5",
          "Nuevo intervalo: [−3, −2.5]"
        ]
      },
      {
        "paso": "Iteración 2",
        "detalle": [
          "xm = (−3 + (−2.5)) / 2 = −2.75",
          "f(xm) = (−2.75)³ − 7·(−2.75) + 4 = −20.796875 + 19.25 + 4 = 2.453125",
          "f(a)·f(xm) = (−2)·(2.453125) = −4.90625 < 0  →  se actualiza b = −2.75",
          "Nuevo intervalo: [−3, −2.75]"
        ]
      }
    ],
    "columnas": [
      "i",
      "a",
      "b",
      "xm",
      "f(xm)",
      "f(a)·f(xm)",
      "Ea %",
      "Nuevo intervalo"
    ],
    "filas": [
      {
        "i": 1,
        "a": "-3",
        "b": "-2",
        "xm": "-2.5",
        "fxm": "5.875",
        "prod": "-11.75",
        "Ea": "—",
        "nuevo": "[a=-3, xm=-2.5]"
      },
      {
        "i": 2,
        "a": "-3",
        "b": "-2.5",
        "xm": "-2.75",
        "fxm": "2.453125",
        "prod": "-4.90625",
        "Ea": "9.0909",
        "nuevo": "[a=-3, xm=-2.75]"
      },
      {
        "i": 3,
        "a": "-3",
        "b": "-2.75",
        "xm": "-2.875",
        "fxm": "0.36132813",
        "prod": "-0.72265625",
        "Ea": "4.3478",
        "nuevo": "[a=-3, xm=-2.875]"
      },
      {
        "i": 4,
        "a": "-3",
        "b": "-2.875",
        "xm": "-2.9375",
        "fxm": "-0.78491211",
        "prod": "1.56982422",
        "Ea": "2.1277",
        "nuevo": "[xm=-2.9375, b=-2.875]"
      }
    ],
    "convergeEn": null,
    "raizRef": "-2.89510652",
    "nota": "La raíz real en [−3, −2] es x* ≈ −2.895107. La cota teórica del error en la iteración n es |xm − x*| ≤ (b₀−a₀)/2ⁿ. Nota: en la iteración 4 el producto f(a)·f(xm) es positivo porque la raíz quedó en la mitad derecha.",
    "matlab": "f=@(x)x.^3-7*x+4;\na=-3; b=-2; n=4; xm_anterior=NaN;\nfor i=1:n\n  xm=(a+b)/2; fxm=f(xm); fa=f(a);\n  prod=fa*fxm; xm_nuevo=xm;\n  if ~isnan(xm_anterior)\n    Ea=abs((xm_nuevo-xm_anterior)/xm_nuevo)*100;\n  end\n  if prod<0, b=xm; else, a=xm; end\n  fprintf('%d | %.4f | %.4f | %.4f | %.4f\\n', i, a, b, xm, fxm);\n  xm_anterior=xm;\nend"
  },
  {
    "id": "biseccionE2",
    "metodo": "biseccion",
    "titulo": "Bisección · f(x) = x − e^(1/x) en [1, 2] con tol 10⁻⁴",
    "funcion": "f(x) = x − e^(1/x) en [1, 2] con tol 10⁻⁴",
    "datos": "Intervalo [a, b] = [1, 2] · tolerancia T = 10⁻⁴ · 3 iteraciones pedidas (converge en 14)",
    "formula": "xm = (a + b) / 2",
    "desarrollo": [
      {
        "paso": "Iteración 1",
        "detalle": [
          "xm = (1 + 2) / 2 = 1.5",
          "f(xm) = 1.5 − e^(1/1.5) = 1.5 − 1.947734 = −0.447734",
          "f(a)·f(xm) = (1 − e¹)·(−0.447734) = (−1.718282)·(−0.447734) = 0.769333 > 0  →  la raíz está en [xm, b]: se actualiza a = 1.5",
          "Nuevo intervalo: [1.5, 2]"
        ]
      },
      {
        "paso": "Iteración 2",
        "detalle": [
          "xm = (1.5 + 2) / 2 = 1.75",
          "f(xm) = 1.75 − e^(1/1.75) = 1.75 − 1.770795 = −0.020795",
          "f(a)·f(xm) = (−0.447734)·(−0.020795) = 0.009311 > 0  →  se actualiza a = 1.75",
          "Nuevo intervalo: [1.75, 2]"
        ]
      }
    ],
    "columnas": [
      "i",
      "a",
      "b",
      "xm",
      "f(xm)",
      "f(a)·f(xm)",
      "Ea %",
      "Nuevo intervalo"
    ],
    "filas": [
      {
        "i": 1,
        "a": "1",
        "b": "2",
        "xm": "1.5",
        "fxm": "-0.44773404",
        "prod": "0.76933327",
        "Ea": "—",
        "nuevo": "[xm=1.5, b=2]"
      },
      {
        "i": 2,
        "a": "1.5",
        "b": "2",
        "xm": "1.75",
        "fxm": "-0.02079495",
        "prod": "0.00931061",
        "Ea": "14.2857",
        "nuevo": "[xm=1.75, b=2]"
      },
      {
        "i": 3,
        "a": "1.75",
        "b": "2",
        "xm": "1.875",
        "fxm": "0.17039513",
        "prod": "-0.00354336",
        "Ea": "6.6667",
        "nuevo": "[a=1.75, xm=1.875]"
      },
      {
        "i": 4,
        "a": "1.75",
        "b": "1.875",
        "xm": "1.8125",
        "fxm": "0.07625604",
        "prod": "-0.00158574",
        "Ea": "3.4483",
        "nuevo": "[a=1.75, xm=1.8125]"
      },
      {
        "i": 5,
        "a": "1.75",
        "b": "1.8125",
        "xm": "1.78125",
        "fxm": "0.02811869",
        "prod": "-0.00058473",
        "Ea": "1.7544",
        "nuevo": "[a=1.75, xm=1.78125]"
      },
      {
        "i": 6,
        "a": "1.75",
        "b": "1.78125",
        "xm": "1.765625",
        "fxm": "0.00376216",
        "prod": "-0.00007823",
        "Ea": "0.885",
        "nuevo": "[a=1.75, xm=1.765625]"
      },
      {
        "i": 7,
        "a": "1.75",
        "b": "1.765625",
        "xm": "1.7578125",
        "fxm": "-0.0084909",
        "prod": "0.00017657",
        "Ea": "0.4444",
        "nuevo": "[xm=1.7578125, b=1.765625]"
      },
      {
        "i": 8,
        "a": "1.7578125",
        "b": "1.765625",
        "xm": "1.76171875",
        "fxm": "-0.00235805",
        "prod": "0.00002002",
        "Ea": "0.2217",
        "nuevo": "[xm=1.76171875, b=1.765625]"
      },
      {
        "i": 9,
        "a": "1.76171875",
        "b": "1.765625",
        "xm": "1.76367188",
        "fxm": "0.00070363",
        "prod": "-0.00000166",
        "Ea": "0.1107",
        "nuevo": "[a=1.76171875, xm=1.76367188]"
      },
      {
        "i": 10,
        "a": "1.76171875",
        "b": "1.76367188",
        "xm": "1.76269531",
        "fxm": "-0.00082682",
        "prod": "0.00000195",
        "Ea": "0.0554",
        "nuevo": "[xm=1.76269531, b=1.76367188]"
      },
      {
        "i": 11,
        "a": "1.76269531",
        "b": "1.76367188",
        "xm": "1.76318359",
        "fxm": "-0.0000615",
        "prod": "5e-8",
        "Ea": "0.0277",
        "nuevo": "[xm=1.76318359, b=1.76367188]"
      },
      {
        "i": 12,
        "a": "1.76318359",
        "b": "1.76367188",
        "xm": "1.76342773",
        "fxm": "0.00032109",
        "prod": "-2e-8",
        "Ea": "0.0138",
        "nuevo": "[a=1.76318359, xm=1.76342773]"
      },
      {
        "i": 13,
        "a": "1.76318359",
        "b": "1.76342773",
        "xm": "1.76330566",
        "fxm": "0.0001298",
        "prod": "-1e-8",
        "Ea": "0.0069",
        "nuevo": "[a=1.76318359, xm=1.76330566]"
      },
      {
        "i": 14,
        "a": "1.76318359",
        "b": "1.76330566",
        "xm": "1.76324463",
        "fxm": "0.00003415",
        "prod": "0",
        "Ea": "0.0035",
        "nuevo": "[a=1.76318359, xm=1.76324463]"
      }
    ],
    "convergeEn": 14,
    "raizRef": "1.76322283",
    "nota": "El número teórico de iteraciones para tol = 10⁻⁴ es n ≥ log₂((2−1)/10⁻⁴) ≈ 13.29 → 14, y el algoritmo converge exactamente en la iteración 14. La raíz de referencia es x* ≈ 1.763223.",
    "matlab": "f=@(x)x-exp(1./x);\na=1; b=2; T=1e-4;\nn=ceil(log2((b-a)/T));   % n teorico: 14\nfor i=1:n\n  xm=(a+b)/2;\n  if f(a)*f(xm)<0, b=xm; else, a=xm; end\n  if abs(b-a)/2<T, break; end\nend"
  },
  {
    "id": "newtonE1",
    "metodo": "newton",
    "titulo": "Newton-Raphson · f(x) = cos(x) − 3x con x₀ = π/8",
    "funcion": "f(x) = cos(x) − 3x con x₀ = π/8",
    "datos": "x₀ = π/8 ≈ 0.392699 · f'(x) = −sin(x) − 3 · tolerancia T = 10⁻⁷",
    "formula": "x_{n+1} = x_n − f(x_n) / f'(x_n)",
    "desarrollo": [
      {
        "paso": "Iteración 1 (n = 0 → 1)",
        "detalle": [
          "f(x₀) = cos(π/8) − 3·(π/8) = 0.923880 − 1.178097 = −0.254218",
          "f'(x₀) = −sin(π/8) − 3 = −0.382683 − 3 = −3.382683",
          "x₁ = x₀ − f(x₀)/f'(x₀) = 0.392699 − (−0.254218)/(−3.382683) = 0.392699 − 0.075153 = 0.317546"
        ]
      },
      {
        "paso": "Iteración 2 (n = 1 → 2)",
        "detalle": [
          "f(x₁) = cos(0.317546) − 3·(0.317546) = 0.949954 − 0.952639 = −0.002635",
          "f'(x₁) = −sin(0.317546) − 3 = −0.312236 − 3 = −3.312236",
          "x₂ = 0.317546 − (−0.002635)/(−3.312236) = 0.317546 − 0.000796 = 0.316751"
        ]
      }
    ],
    "columnas": [
      "i",
      "x",
      "f(x)",
      "f'(x)",
      "x_{n+1}",
      "Ea %"
    ],
    "filas": [
      {
        "i": 1,
        "x": "0.39269908",
        "fx": "-0.25421771",
        "dfx": "-3.38268343",
        "xnuevo": "0.31754641",
        "Ea": "23.6667"
      },
      {
        "i": 2,
        "x": "0.31754641",
        "fx": "-0.00263484",
        "dfx": "-3.31223658",
        "xnuevo": "0.31675092",
        "Ea": "0.2511"
      },
      {
        "i": 3,
        "x": "0.31675092",
        "fx": "-3e-7",
        "dfx": "-3.31148076",
        "xnuevo": "0.31675083",
        "Ea": "0"
      }
    ],
    "convergeEn": 3,
    "raizRef": "0.31675083",
    "nota": "Convergencia cuadrática: en 3 iteraciones se alcanza x ≈ 0.31675083 (x* ≈ 0.31675083), con Ea% pasando de 23.67% a ~0%.",
    "matlab": "f=@(x)cos(x)-3*x; df=@(x)-sin(x)-3;\nx=pi/8; T=1e-7; maxit=100;\nfor i=1:maxit\n  fx=f(x); dfx=df(x); x_nuevo=x-fx/dfx;\n  E=abs(x_nuevo-x);\n  if E<T, break; end\n  x=x_nuevo;\nend"
  },
  {
    "id": "newtonE2",
    "metodo": "newton",
    "titulo": "Newton-Raphson · f(x) = x³ + 2x² + 10x − 20 con x₀ = 1",
    "funcion": "f(x) = x³ + 2x² + 10x − 20 con x₀ = 1",
    "datos": "x₀ = 1 · f'(x) = 3x² + 4x + 10 · tolerancia T = 10⁻³ · maxit = 100",
    "formula": "x_{n+1} = x_n − f(x_n) / f'(x_n)",
    "desarrollo": [
      {
        "paso": "Iteración 1 (n = 0 → 1)",
        "detalle": [
          "f(x₀) = 1³ + 2·1² + 10·1 − 20 = −7",
          "f'(x₀) = 3·1² + 4·1 + 10 = 17",
          "x₁ = 1 − (−7)/17 = 1 + 0.41176471 = 1.411765"
        ]
      },
      {
        "paso": "Iteración 2 (n = 1 → 2)",
        "detalle": [
          "f(x₁) = 1.411765³ + 2·1.411765² + 10·1.411765 − 20 = 0.917566",
          "f'(x₁) = 3·1.411765² + 4·1.411765 + 10 = 21.626298",
          "x₂ = 1.411765 − 0.917566/21.626298 = 1.411765 − 0.042428 = 1.369336"
        ]
      }
    ],
    "columnas": [
      "i",
      "x",
      "f(x)",
      "f'(x)",
      "x_{n+1}",
      "Ea %"
    ],
    "filas": [
      {
        "i": 1,
        "x": "1",
        "fx": "-7",
        "dfx": "17",
        "xnuevo": "1.41176471",
        "Ea": "29.1667"
      },
      {
        "i": 2,
        "x": "1.41176471",
        "fx": "0.91756564",
        "dfx": "21.62629758",
        "xnuevo": "1.36933647",
        "Ea": "3.0985"
      },
      {
        "i": 3,
        "x": "1.36933647",
        "fx": "0.01114812",
        "dfx": "21.10259299",
        "xnuevo": "1.36880819",
        "Ea": "0.0386"
      }
    ],
    "convergeEn": 3,
    "raizRef": "1.36880811",
    "nota": "Convergencia en 3 iteraciones a x ≈ 1.36880819 (x* ≈ 1.36880811). El criterio de parada usado es |x_{n+1} − x_n| < 10⁻³ (el MATLAB usa E < T con break).",
    "matlab": "f=@(x)x.^3+2*x.^2+10*x-20;\ndf=@(x)3*x.^2+4*x+10;\nx=1; T=1e-3; maxit=100;\nfor i=1:maxit\n  x_nuevo=x-f(x)/df(x);\n  if abs(x_nuevo-x)<T, break; end\n  x=x_nuevo;\nend"
  },
  {
    "id": "secanteE1",
    "metodo": "secante",
    "titulo": "Secante · f(x) = cos(x) − x con x₀ = 0.5, x₁ = π/4",
    "funcion": "f(x) = cos(x) − x con x₀ = 0.5, x₁ = π/4",
    "datos": "x₀ = 0.5 · x₁ = π/4 ≈ 0.785398 · convergencia superlineal (p ≈ 1.618)",
    "formula": "x_{n+1} = x_n − f(x_n)·(x_n − x_{n−1}) / (f(x_n) − f(x_{n−1}))",
    "desarrollo": [
      {
        "paso": "Iteración 1",
        "detalle": [
          "f(x₀) = cos(0.5) − 0.5 = 0.877583 − 0.5 = 0.377583",
          "f(x₁) = cos(π/4) − π/4 = 0.707107 − 0.785398 = −0.078291",
          "x₂ = x₁ − f(x₁)·(x₁−x₀)/(f(x₁)−f(x₀)) = 0.785398 − (−0.078291)·(0.785398−0.5)/(−0.078291−0.377583)",
          "x₂ = 0.785398 − (−0.022340)/(−0.455874) = 0.785398 − 0.049013 = 0.736384"
        ]
      },
      {
        "paso": "Iteración 2",
        "detalle": [
          "f(x₁) = f(0.785398) = −0.078291;  f(x₂) = cos(0.736384) − 0.736384 = 0.740902 − 0.736384 = 0.004518",
          "x₃ = x₂ − f(x₂)·(x₂−x₁)/(f(x₂)−f(x₁)) = 0.736384 − 0.004518·(0.736384−0.785398)/(0.004518+0.078291)",
          "x₃ = 0.736384 − (−0.000221)/(0.082809) = 0.736384 + 0.002674 = 0.739058"
        ]
      }
    ],
    "columnas": [
      "i",
      "x₀",
      "x₁",
      "x₂",
      "f(x₂)",
      "Ea %"
    ],
    "filas": [
      {
        "i": 1,
        "x0": "0.5",
        "x1": "0.78539816",
        "x2": "0.73638414",
        "f2": "0.00451772",
        "Ea": "6.656"
      },
      {
        "i": 2,
        "x0": "0.78539816",
        "x1": "0.73638414",
        "x2": "0.73905814",
        "f2": "0.00004518",
        "Ea": "0.3618"
      },
      {
        "i": 3,
        "x0": "0.73638414",
        "x1": "0.73905814",
        "x2": "0.73908515",
        "f2": "-3e-8",
        "Ea": "0.0037"
      },
      {
        "i": 4,
        "x0": "0.73905814",
        "x1": "0.73908515",
        "x2": "0.73908513",
        "f2": "0",
        "Ea": "0"
      },
      {
        "i": 5,
        "x0": "0.73908515",
        "x1": "0.73908513",
        "x2": "0.73908513",
        "f2": "0",
        "Ea": "0"
      }
    ],
    "convergeEn": 5,
    "raizRef": "0.73908513",
    "nota": "La secante converge a x ≈ 0.73908513 (x* ≈ 0.73908513) en 5 iteraciones con tol 10⁻⁸; cuando Ea% llega a 0 se alcanzó la precisión de la máquina.",
    "matlab": "f=@(x)cos(x)-x;\nx0=0.5; x1=pi/4;\nfor i=1:10\n  x2=x1-f(x1)*(x1-x0)/(f(x1)-f(x0));\n  Ea=abs((x2-x1)/x2)*100;\n  x0=x1; x1=x2;\n  if Ea<1e-8, break; end\nend"
  },
  {
    "id": "secanteE2",
    "metodo": "secante",
    "titulo": "Secante · f(x) = x³ + 2x² + 10x − 20 con x₀ = 0, x₁ = 1",
    "funcion": "f(x) = x³ + 2x² + 10x − 20 con x₀ = 0, x₁ = 1",
    "datos": "x₀ = 0 · x₁ = 1 · tolerancia T = 10⁻³ · sin derivada explícita",
    "formula": "x_{n+1} = x_n − f(x_n)·(x_n − x_{n−1}) / (f(x_n) − f(x_{n−1}))",
    "desarrollo": [
      {
        "paso": "Iteración 1",
        "detalle": [
          "f(x₀) = f(0) = −20;  f(x₁) = f(1) = 1 + 2 + 10 − 20 = −7",
          "x₂ = x₁ − f(x₁)·(x₁−x₀)/(f(x₁)−f(x₀)) = 1 − (−7)·(1−0)/(−7−(−20)) = 1 + 7/13",
          "x₂ = 1 + 0.53846154 = 1.538462"
        ]
      },
      {
        "paso": "Iteración 2",
        "detalle": [
          "f(x₁) = −7;  f(x₂) = 1.538462³ + 2·1.538462² + 10·1.538462 − 20 = 3.759672",
          "x₃ = x₂ − f(x₂)·(x₂−x₁)/(f(x₂)−f(x₁)) = 1.538462 − 3.759672·0.538462/(3.759672+7)",
          "x₃ = 1.538462 − 0.188151 = 1.350311"
        ]
      }
    ],
    "columnas": [
      "i",
      "x₀",
      "x₁",
      "x₂",
      "f(x₂)",
      "Ea %"
    ],
    "filas": [
      {
        "i": 1,
        "x0": "0",
        "x1": "1",
        "x2": "1.53846154",
        "f2": "3.75967228",
        "Ea": "35"
      },
      {
        "i": 2,
        "x0": "1",
        "x1": "1.53846154",
        "x2": "1.35031093",
        "f2": "-0.38813615",
        "Ea": "13.9339"
      },
      {
        "i": 3,
        "x0": "1.53846154",
        "x1": "1.35031093",
        "x2": "1.36791735",
        "f2": "-0.01878679",
        "Ea": "1.2871"
      },
      {
        "i": 4,
        "x0": "1.35031093",
        "x1": "1.36791735",
        "x2": "1.36881289",
        "f2": "0.00010086",
        "Ea": "0.0654"
      }
    ],
    "convergeEn": 4,
    "raizRef": "1.36880811",
    "nota": "Converge en 4 iteraciones a x ≈ 1.36881289 con tol 10⁻³. Sin derivada explícita: la pendiente se aproxima con las dos últimas aproximaciones.",
    "matlab": "f=@(x)x.^3+2*x.^2+10*x-20;\nx0=0; x1=1; T=1e-3;\nfor i=1:100\n  x2=x1-f(x1)*(x1-x0)/(f(x1)-f(x0));\n  if abs(x2-x1)<T, break; end\n  x0=x1; x1=x2;\nend"
  },
  {
    "id": "puntoFijoE1",
    "metodo": "punto-fijo",
    "titulo": "Punto Fijo · g(x) = √(3x + 1) con x₀ = 3",
    "funcion": "g(x) = √(3x + 1) con x₀ = 3",
    "datos": "x₀ = 3 · 4 iteraciones · g'(x) = 3/(2√(3x+1)) → |g'(x*)| = 0.454163 < 1 ✓ (contracción)",
    "formula": "x_{n+1} = g(x_n)",
    "desarrollo": [
      {
        "paso": "Iteración 1",
        "detalle": [
          "x₁ = g(x₀) = √(3·3 + 1) = √10 = 3.162278",
          "Ea% = |x₁ − x₀|/|x₁|·100 = |3.162278 − 3|/3.162278·100 = 5.132%"
        ]
      },
      {
        "paso": "Iteración 2",
        "detalle": [
          "x₂ = g(x₁) = √(3·3.162278 + 1) = √10.486833 = 3.238338",
          "Ea% = |3.238338 − 3.162278|/3.238338·100 = 2.349%"
        ]
      }
    ],
    "columnas": [
      "i",
      "x",
      "x_{n+1} = g(x)",
      "Ea %"
    ],
    "filas": [
      {
        "i": 1,
        "x": "3",
        "xnuevo": "3.16227766",
        "Ea": "5.1317"
      },
      {
        "i": 2,
        "x": "3.16227766",
        "xnuevo": "3.238338",
        "Ea": "2.3487"
      },
      {
        "i": 3,
        "x": "3.238338",
        "xnuevo": "3.2733796",
        "Ea": "1.0705"
      },
      {
        "i": 4,
        "x": "3.2733796",
        "xnuevo": "3.28939794",
        "Ea": "0.487"
      }
    ],
    "convergeEn": null,
    "raizRef": "3.30277564",
    "nota": "Convergencia LINEAL con razón |g'(x*)| = 3/(2√(3x*+1)) = 0.454163 < 1: es una contracción, así que converge. El error se divide por ≈2.2 en cada iteración (Ea%: 5.13 → 2.35 → 1.07 → 0.49), NO una cifra por iteración: hacen falta ~5 pasos para llegar a 1e-3. Punto fijo exacto: x* = (3+√13)/2 ≈ 3.302776. Ojo con la raíz espuria: x² − 3x − 1 = 0 también da (3−√13)/2 ≈ −0.302776, pero NO es punto fijo de g porque √(3x+1) tiene rango [0,∞) — g(−0.302776) = +0.302776 ≠ −0.302776. Ese valor resuelve x = −√(3x+1), no x = +√(3x+1).",
    "matlab": "g=@(x)sqrt(3*x+1);\nx=3; n=4;\nfor i=1:n\n  x_nuevo=g(x);\n  E=abs(x_nuevo-x);\n  Ea=E/abs(x_nuevo)*100;\n  x=x_nuevo;\nend"
  },
  {
    "id": "puntoFijoE2",
    "metodo": "punto-fijo",
    "titulo": "Punto Fijo · g(x) = (9x¹⁰ + 1)/(9x¹⁰ − 2) con x₀ = 1.2",
    "funcion": "g(x) = (9x¹⁰ + 1)/(9x¹⁰ − 2) con x₀ = 1.2",
    "datos": "x₀ = 1.2 · tolerancia T = 10⁻³ · g requiere |g'(x)| < 1 (condición de contracción)",
    "formula": "x_{n+1} = g(x_n)",
    "desarrollo": [
      {
        "paso": "Iteración 1",
        "detalle": [
          "x₁ = g(1.2) = (9·1.2¹⁰ + 1)/(9·1.2¹⁰ − 2) = (9·6.191736 + 1)/(9·6.191736 − 2)",
          "x₁ = 56.725627/53.725627 = 1.055839",
          "Ea% = |1.055839 − 1.2|/1.055839·100 = 13.654%"
        ]
      },
      {
        "paso": "Iteración 2",
        "detalle": [
          "x₂ = g(1.055839) = (9·1.055839¹⁰ + 1)/(9·1.055839¹⁰ − 2)",
          "x₂ = 16.919900/14.919900 = 1.134049 → 1.222287 (valor real del algoritmo con precisión completa)",
          "Ea% = 13.618%  →  la sucesión NO se estabiliza"
        ]
      }
    ],
    "columnas": [
      "i",
      "x",
      "x_{n+1} = g(x)",
      "Ea %"
    ],
    "filas": [
      {
        "i": 1,
        "x": "1.2",
        "xnuevo": "1.05583927",
        "Ea": "13.6537"
      },
      {
        "i": 2,
        "x": "1.05583927",
        "xnuevo": "1.22228748",
        "Ea": "13.6178"
      },
      {
        "i": 3,
        "x": "1.22228748",
        "xnuevo": "1.04616465",
        "Ea": "16.8351"
      },
      {
        "i": 4,
        "x": "1.04616465",
        "xnuevo": "1.24725385",
        "Ea": "16.1226"
      },
      {
        "i": 5,
        "x": "1.24725385",
        "xnuevo": "1.03750202",
        "Ea": "20.217"
      },
      {
        "i": 6,
        "x": "1.03750202",
        "xnuevo": "1.2725873",
        "Ea": "18.473"
      },
      {
        "i": 7,
        "x": "1.2725873",
        "xnuevo": "1.03053191",
        "Ea": "23.4884"
      },
      {
        "i": 8,
        "x": "1.03053191",
        "xnuevo": "1.29533794",
        "Ea": "20.443"
      },
      {
        "i": 9,
        "x": "1.29533794",
        "xnuevo": "1.02548977",
        "Ea": "26.3141"
      },
      {
        "i": 10,
        "x": "1.02548977",
        "xnuevo": "1.31328555",
        "Ea": "21.9142"
      },
      {
        "i": 11,
        "x": "1.31328555",
        "xnuevo": "1.02216447",
        "Ea": "28.4808"
      },
      {
        "i": 12,
        "x": "1.02216447",
        "xnuevo": "1.32587469",
        "Ea": "22.9064"
      },
      {
        "i": 13,
        "x": "1.32587469",
        "xnuevo": "1.02012059",
        "Ea": "29.9723"
      },
      {
        "i": 14,
        "x": "1.02012059",
        "xnuevo": "1.33392969",
        "Ea": "23.5252"
      },
      {
        "i": 15,
        "x": "1.33392969",
        "xnuevo": "1.01892317",
        "Ea": "30.9156"
      },
      {
        "i": 16,
        "x": "1.01892317",
        "xnuevo": "1.33876576",
        "Ea": "23.8909"
      },
      {
        "i": 17,
        "x": "1.33876576",
        "xnuevo": "1.01824243",
        "Ea": "31.4781"
      },
      {
        "i": 18,
        "x": "1.01824243",
        "xnuevo": "1.34155465",
        "Ea": "24.0998"
      },
      {
        "i": 19,
        "x": "1.34155465",
        "xnuevo": "1.01786225",
        "Ea": "31.8012"
      },
      {
        "i": 20,
        "x": "1.01786225",
        "xnuevo": "1.34312484",
        "Ea": "24.2169"
      },
      {
        "i": 21,
        "x": "1.34312484",
        "xnuevo": "1.01765208",
        "Ea": "31.9827"
      },
      {
        "i": 22,
        "x": "1.01765208",
        "xnuevo": "1.3439968",
        "Ea": "24.2817"
      },
      {
        "i": 23,
        "x": "1.3439968",
        "xnuevo": "1.01753656",
        "Ea": "32.0834"
      },
      {
        "i": 24,
        "x": "1.01753656",
        "xnuevo": "1.34447729",
        "Ea": "24.3173"
      },
      {
        "i": 25,
        "x": "1.34447729",
        "xnuevo": "1.01747326",
        "Ea": "32.1388"
      },
      {
        "i": 26,
        "x": "1.01747326",
        "xnuevo": "1.34474093",
        "Ea": "24.3369"
      },
      {
        "i": 27,
        "x": "1.34474093",
        "xnuevo": "1.01743863",
        "Ea": "32.1692"
      },
      {
        "i": 28,
        "x": "1.01743863",
        "xnuevo": "1.34488524",
        "Ea": "24.3476"
      },
      {
        "i": 29,
        "x": "1.34488524",
        "xnuevo": "1.01741971",
        "Ea": "32.1859"
      },
      {
        "i": 30,
        "x": "1.01741971",
        "xnuevo": "1.34496413",
        "Ea": "24.3534"
      },
      {
        "i": 31,
        "x": "1.34496413",
        "xnuevo": "1.01740938",
        "Ea": "32.195"
      },
      {
        "i": 32,
        "x": "1.01740938",
        "xnuevo": "1.34500723",
        "Ea": "24.3566"
      },
      {
        "i": 33,
        "x": "1.34500723",
        "xnuevo": "1.01740373",
        "Ea": "32.2"
      },
      {
        "i": 34,
        "x": "1.01740373",
        "xnuevo": "1.34503077",
        "Ea": "24.3583"
      },
      {
        "i": 35,
        "x": "1.34503077",
        "xnuevo": "1.01740065",
        "Ea": "32.2027"
      },
      {
        "i": 36,
        "x": "1.01740065",
        "xnuevo": "1.34504362",
        "Ea": "24.3593"
      },
      {
        "i": 37,
        "x": "1.34504362",
        "xnuevo": "1.01739897",
        "Ea": "32.2041"
      },
      {
        "i": 38,
        "x": "1.01739897",
        "xnuevo": "1.34505064",
        "Ea": "24.3598"
      },
      {
        "i": 39,
        "x": "1.34505064",
        "xnuevo": "1.01739805",
        "Ea": "32.205"
      },
      {
        "i": 40,
        "x": "1.01739805",
        "xnuevo": "1.34505447",
        "Ea": "24.3601"
      },
      {
        "i": 41,
        "x": "1.34505447",
        "xnuevo": "1.01739755",
        "Ea": "32.2054"
      },
      {
        "i": 42,
        "x": "1.01739755",
        "xnuevo": "1.34505656",
        "Ea": "24.3602"
      },
      {
        "i": 43,
        "x": "1.34505656",
        "xnuevo": "1.01739728",
        "Ea": "32.2056"
      },
      {
        "i": 44,
        "x": "1.01739728",
        "xnuevo": "1.3450577",
        "Ea": "24.3603"
      },
      {
        "i": 45,
        "x": "1.3450577",
        "xnuevo": "1.01739713",
        "Ea": "32.2058"
      },
      {
        "i": 46,
        "x": "1.01739713",
        "xnuevo": "1.34505832",
        "Ea": "24.3604"
      },
      {
        "i": 47,
        "x": "1.34505832",
        "xnuevo": "1.01739705",
        "Ea": "32.2058"
      },
      {
        "i": 48,
        "x": "1.01739705",
        "xnuevo": "1.34505866",
        "Ea": "24.3604"
      },
      {
        "i": 49,
        "x": "1.34505866",
        "xnuevo": "1.017397",
        "Ea": "32.2059"
      },
      {
        "i": 50,
        "x": "1.017397",
        "xnuevo": "1.34505885",
        "Ea": "24.3604"
      },
      {
        "i": 51,
        "x": "1.34505885",
        "xnuevo": "1.01739698",
        "Ea": "32.2059"
      },
      {
        "i": 52,
        "x": "1.01739698",
        "xnuevo": "1.34505895",
        "Ea": "24.3604"
      },
      {
        "i": 53,
        "x": "1.34505895",
        "xnuevo": "1.01739697",
        "Ea": "32.2059"
      },
      {
        "i": 54,
        "x": "1.01739697",
        "xnuevo": "1.345059",
        "Ea": "24.3604"
      },
      {
        "i": 55,
        "x": "1.345059",
        "xnuevo": "1.01739696",
        "Ea": "32.2059"
      },
      {
        "i": 56,
        "x": "1.01739696",
        "xnuevo": "1.34505903",
        "Ea": "24.3604"
      },
      {
        "i": 57,
        "x": "1.34505903",
        "xnuevo": "1.01739696",
        "Ea": "32.2059"
      },
      {
        "i": 58,
        "x": "1.01739696",
        "xnuevo": "1.34505905",
        "Ea": "24.3604"
      },
      {
        "i": 59,
        "x": "1.34505905",
        "xnuevo": "1.01739695",
        "Ea": "32.2059"
      },
      {
        "i": 60,
        "x": "1.01739695",
        "xnuevo": "1.34505906",
        "Ea": "24.3604"
      }
    ],
    "convergeEn": null,
    "raizRef": null,
    "nota": "CASO DE CICLO LÍMITE (no caos): la sucesión NO tiene límite, pero tampoco es errática. |g'(x)| = 270x⁹/(9x¹⁰−2)² es SIEMPRE negativa (función estrictamente decreciente), y eso obliga a que cada iteración invierta el sentido del movimiento. Medido: los términos pares convergen a 1.017397 y los impares a 1.345059 — dos límites distintos, diferencia constante 0.327662. Como |g'(1.017397)·g'(1.345059)| = 4.1718 × 0.1308 = 0.546 < 1, el ciclo de 2 puntos es ATRAIGENTE: cada sub-sucesión sí converge, pero la sucesión completa no. Ojo: |g′(1.2)| = 0.483 < 1, o sea la condición de contracción SE CUMPLE en la semilla y aun así no converge — validar |g′| < 1 solo en x₀ no basta, hay que garantizarla en todo el recorrido iterativo. Causa estructural: el denominador 9x¹⁰−2 tiene un POLO en x = (2/9)^(1/10) ≈ 0.860357 y el modelo no significa nada ahí.",
    "matlab": "g=@(x)(9*x.^10+1)./(9*x.^10-2);\nx=1.2; T=1e-3; maxit=100;\nfor i=1:maxit\n  x_nuevo=g(x);\n  if abs(x_nuevo-x)<T, break; end\n  x=x_nuevo;\nend\n% ATENCION: no converge; |g'(x)| > 1 fuera de la region de la raiz"
  },
  {
    "id": "regulaFalsiE1",
    "metodo": "regula-falsi",
    "titulo": "Regula Falsi · f(x) = eˣ + 4x³ − 5 en [0, 1]",
    "funcion": "f(x) = eˣ + 4x³ − 5 en [0, 1]",
    "datos": "Intervalo [a, b] = [0, 1] · tolerancia T = 10⁻⁶ · f(a) = −4, f(b) = 1.718282",
    "formula": "xm = b − f(b)·(b − a) / (f(b) − f(a))",
    "desarrollo": [
      {
        "paso": "Iteración 1",
        "detalle": [
          "f(a) = e⁰ + 4·0³ − 5 = −4;  f(b) = e¹ + 4·1³ − 5 = 2.718282 + 4 − 5 = 1.718282",
          "xm = b − f(b)·(b−a)/(f(b)−f(a)) = 1 − 1.718282·1/(1.718282+4)",
          "xm = 1 − 1.718282/5.718282 = 1 − 0.300489 = 0.699511",
          "f(xm) = e^0.699511 + 4·0.699511³ − 5 = 2.012821 + 1.369252 − 5 = −1.617927",
          "f(a)·f(xm) = (−4)·(−1.617927) = 6.471708 > 0  →  se actualiza a = 0.699511"
        ]
      },
      {
        "paso": "Iteración 2",
        "detalle": [
          "f(a) = f(0.699511) = −1.617927;  f(b) = 1.718282",
          "xm = 1 − 1.718282·(1−0.699511)/(1.718282+1.617927) = 1 − 0.516301/3.336209",
          "xm = 1 − 0.154756 = 0.845244",
          "Nuevo intervalo: [0.845244, 1]"
        ]
      }
    ],
    "columnas": [
      "i",
      "a",
      "b",
      "xm",
      "f(xm)",
      "f(a)·f(xm)",
      "Ea %",
      "Nuevo intervalo"
    ],
    "filas": [
      {
        "i": 1,
        "a": "0",
        "b": "1",
        "xm": "0.69951082",
        "fxm": "-1.61810652",
        "prod": "6.47242609",
        "Ea": "—",
        "nuevo": "[xm=0.69951082, b=1]"
      },
      {
        "i": 2,
        "a": "0.69951082",
        "b": "1",
        "xm": "0.8452443",
        "fxm": "-0.255955",
        "prod": "0.41416246",
        "Ea": "17.2416",
        "nuevo": "[xm=0.8452443, b=1]"
      },
      {
        "i": 3,
        "a": "0.8452443",
        "b": "1",
        "xm": "0.865308",
        "fxm": "-0.03263733",
        "prod": "0.00835369",
        "Ea": "2.3187",
        "nuevo": "[xm=0.865308, b=1]"
      },
      {
        "i": 4,
        "a": "0.865308",
        "b": "1",
        "xm": "0.86781868",
        "fxm": "-0.00404097",
        "prod": "0.00013189",
        "Ea": "0.2893",
        "nuevo": "[xm=0.86781868, b=1]"
      },
      {
        "i": 5,
        "a": "0.86781868",
        "b": "1",
        "xm": "0.86812881",
        "fxm": "-0.00049849",
        "prod": "0.00000201",
        "Ea": "0.0357",
        "nuevo": "[xm=0.86812881, b=1]"
      },
      {
        "i": 6,
        "a": "0.86812881",
        "b": "1",
        "xm": "0.86816705",
        "fxm": "-0.00006147",
        "prod": "3e-8",
        "Ea": "0.0044",
        "nuevo": "[xm=0.86816705, b=1]"
      },
      {
        "i": 7,
        "a": "0.86816705",
        "b": "1",
        "xm": "0.86817177",
        "fxm": "-0.00000758",
        "prod": "0",
        "Ea": "0.0005",
        "nuevo": "[xm=0.86817177, b=1]"
      },
      {
        "i": 8,
        "a": "0.86817177",
        "b": "1",
        "xm": "0.86817235",
        "fxm": "-9.3e-7",
        "prod": "0",
        "Ea": "0.0001",
        "nuevo": "[xm=0.86817235, b=1]"
      }
    ],
    "convergeEn": 8,
    "raizRef": "0.86817243",
    "nota": "Converge en 8 iteraciones a x ≈ 0.86817235 (x* ≈ 0.86817243). Se observa el extremo estancado: b = 1 permanece fijo porque la función es convexa en todo el intervalo.",
    "matlab": "f=@(x)exp(x)+4*x.^3-5;\na=0; b=1; xm_anterior=NaN;\nfor i=1:40\n  fa=f(a); fb=f(b);\n  xm=b-fb*(b-a)/(fb-fa); fxm=f(xm);\n  Ea=abs((xm-xm_anterior)/xm)*100;\n  if fa*fxm<0, b=xm; else, a=xm; end\n  if abs(xm-xm_anterior)<1e-6, break; end\n  xm_anterior=xm;\nend"
  },
  {
    "id": "regulaFalsiE2",
    "metodo": "regula-falsi",
    "titulo": "Regula Falsi · f(x) = x¹⁰ − 1 en [0, 1.3]",
    "funcion": "f(x) = x¹⁰ − 1 en [0, 1.3]",
    "datos": "Intervalo [a, b] = [0, 1.3] · n = 3 iteraciones · f(b) = 12.785849",
    "formula": "xm = b − f(b)·(b − a) / (f(b) − f(a))",
    "desarrollo": [
      {
        "paso": "Iteración 1",
        "detalle": [
          "f(a) = 0¹⁰ − 1 = −1;  f(b) = 1.3¹⁰ − 1 = 13.785849 − 1 = 12.785849",
          "xm = b − f(b)·(b−a)/(f(b)−f(a)) = 1.3 − 12.785849·1.3/(12.785849+1)",
          "xm = 1.3 − 1.205700 = 0.094300",
          "f(a)·f(xm) = (−1)·(−1) = 1 > 0  →  se actualiza a = 0.094300"
        ]
      },
      {
        "paso": "Iteración 2",
        "detalle": [
          "f(a) = −1 (extremadamente cercano a −1);  f(b) = 12.785849",
          "xm = 1.3 − 12.785849·(1.3−0.094300)/(12.785849+1) = 1.3 − 12.785849·1.205700/13.785849",
          "xm = 1.3 − 1.118241 = 0.181759",
          "Nuevo intervalo: [0.181759, 1.3]  (el extremo b queda estancado)"
        ]
      }
    ],
    "columnas": [
      "i",
      "a",
      "b",
      "xm",
      "f(xm)",
      "f(a)·f(xm)",
      "Ea %",
      "Nuevo intervalo"
    ],
    "filas": [
      {
        "i": 1,
        "a": "0",
        "b": "1.3",
        "xm": "0.0942996",
        "fxm": "-1",
        "prod": "1",
        "Ea": "—",
        "nuevo": "[xm=0.0942996, b=1.3]"
      },
      {
        "i": 2,
        "a": "0.0942996",
        "b": "1.3",
        "xm": "0.18175887",
        "fxm": "-0.99999996",
        "prod": "0.99999996",
        "Ea": "48.1183",
        "nuevo": "[xm=0.18175887, b=1.3]"
      },
      {
        "i": 3,
        "a": "0.18175887",
        "b": "1.3",
        "xm": "0.26287401",
        "fxm": "-0.99999842",
        "prod": "0.99999838",
        "Ea": "30.857",
        "nuevo": "[xm=0.26287401, b=1.3]"
      }
    ],
    "convergeEn": null,
    "raizRef": "1",
    "nota": "Ejercicio de precisión: f(x) = x¹⁰−1 tiene la raíz exacta x* = 1, pero cerca de x = 0 la función vale ≈ −1 casi constante: la falsa posición avanza muy lento (en 3 iteraciones apenas llega a xm ≈ 0.262874).",
    "matlab": "f=@(x)x.^10-1;\na=0; b=1.3; n=3;\nfor i=1:n\n  fa=f(a); fb=f(b);\n  xm=b-fb*(b-a)/(fb-fa); fxm=f(xm);\n  if fa*fxm<0, b=xm; else, a=xm; end\nend"
  }
];
