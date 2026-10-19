## 1. Teoría de errores

### 1.1 Error absoluto, relativo y porcentual

El error absoluto es la diferencia entre el valor verdadero (o de referencia) $x^*$ y una aproximación $x$:

$$E_a = |x^* - x|$$

Es siempre expresado con las mismas unidades que la magnitud medida y puede originarse por exceso o por defecto. Cuando el valor verdadero no está disponible (caso habitual en un método iterativo), se usa el error aproximado, calculado con dos aproximaciones sucesivas:

$$E_a \text{ (aprox)} = |x_{n+1} - x_n|$$

El error relativo normaliza el error absoluto respecto a la magnitud del valor de referencia, y resulta útil porque no depende de la escala del problema:

$$E_r = \frac{E_a}{|x^*|} \quad (\text{si } x^* \neq 0)$$

El error porcentual es simplemente el error relativo expresado en porcentaje:

$$E_{\%} = E_r \times 100$$

Si el valor de referencia es cero, el error relativo no está definido y debe reportarse únicamente el error absoluto; este es exactamente el criterio que exige aplicar la guía del proyecto al comparar contra una referencia.

### 1.2 Fuentes del error numérico: redondeo y truncamiento

* **Error de redondeo:** aparece porque una computadora representa los números reales con una cantidad finita de cifras (aritmética de punto flotante). Se produce al almacenar o al operar con un número que no tiene representación exacta en el sistema de la máquina.
* **Error de truncamiento:** aparece porque un método numérico reemplaza un proceso infinito o exacto (una serie, una derivada, una integral) por una aproximación finita; por ejemplo, cortar una expansión de Taylor en un número finito de términos, o detener una sucesión iterativa antes de que converja exactamente a la raíz.

Ambos errores conviven en cualquier programa: el de truncamiento depende del método elegido (y del número de iteraciones o del tamaño de paso), mientras que el de redondeo depende de la precisión numérica del lenguaje o software usado.

### 1.3 Exactitud, precisión y residuo

* **Exactitud:** qué tan cerca está una aproximación del valor verdadero.
* **Precisión:** qué tan cerca están entre sí varias aproximaciones repetidas (independientemente de si se acercan o no al valor verdadero).
* **Residuo:** al resolver $f(x) = 0$, el residuo es el valor $f(x_n)$ que devuelve la función al evaluarla en la aproximación actual. Un residuo pequeño no garantiza un error pequeño en la raíz: cerca de una raíz donde la función tiene pendiente muy pequeña, $f(x_n)$ puede ser diminuto aunque $x_n$ esté todavía lejos de $x^*$; y a la inversa, con pendiente muy grande, un residuo moderado puede corresponder a un error minúsculo. Por eso el residuo y el error de la raíz deben reportarse y compararse por separado y nunca confundirse.

### 1.4 Cifras significativas y criterio de parada por precisión

Una forma práctica de fijar cuándo detener un método iterativo es exigir un número $n$ de cifras significativas exactas. El criterio de Scarborough (equivalente al usado en los apuntes de referencia) establece que una aproximación es correcta con al menos $n$ cifras significativas si:

$$|E_a \text{ (aprox)}| \le 0.5 \times 10^{2-n} \% \quad (\text{en términos de error relativo porcentual})$$

En los apuntes consultados se aplica la misma idea en términos de error absoluto y la posición decimal del primer dígito significativo del resultado, verificando la desigualdad:

$$E_a \le 0.5 \times 10^{-n+1}$$

para deducir cuántas cifras significativas son confiables en una aproximación dada. Ambas formulaciones son consistentes: mientras más pequeño el error tolerado, más cifras significativas exactas se garantizan.

### 1.5 Tolerancia y criterios de parada en un algoritmo

Para que un módulo interactivo sea honesto con el usuario conviene distinguir tres tolerancias distintas:

1. **Tolerancia de parada interna:** el umbral que usa el algoritmo para decidir cuándo dejar de iterar (por ejemplo, $|x_{n+1} - x_n| < 10^{-6}$ o $|f(x_n)| < 10^{-6}$).
2. **Tolerancia de comparación con una referencia independiente:** el umbral que se usa solo para verificar el resultado contra un valor calculado por otra vía (Octave, cálculo manual, etc.), y que no forma parte del algoritmo mismo.
3. **Número de decimales mostrados:** una decisión únicamente de presentación, que no debe confundirse con la precisión real alcanzada internamente.

Para comparar un valor calculado con una referencia se recomienda combinar una tolerancia absoluta y una relativa:

$$\text{tol} = \text{tol}_{\text{abs}} + \text{tol}_{\text{rel}} \times |\text{referencia}|$$

Si la referencia es cero, se usa solo el error absoluto, porque el error relativo no está definido en ese caso. Además, un algoritmo nunca debe reportar "convergió" solo porque llegó al número máximo de iteraciones: alcanzar el límite es una condición de parada por agotamiento, no una prueba de convergencia, y debe comunicarse como tal.

---

## 2. Ecuaciones no lineales: fundamentos

### 2.1 ¿Qué es una ecuación no lineal y qué es una raíz?

Una ecuación no lineal es aquella en la que la incógnita $x$ no aparece únicamente elevada a la primera potencia ni combinada solo con sumas y productos por constantes; puede involucrar potencias, exponenciales, logaritmos o funciones trigonométricas ($x^3 - x - 2 = 0$, $x \cos(x) - 1 = 0$, etc.).

Resolverla significa encontrar el valor o los valores de $x$ llamados raíces o ceros de la función que satisfacen la igualdad.

### 2.2 Formulación estándar $f(x) = 0$

Cualquier ecuación $g(x) = c$ puede reescribirse restando $c$ a ambos lados para obtener la forma estándar de búsqueda de raíces:

$$f(x) = g(x) - c = 0$$

Esta reformulación es la que emplea directamente la guía del proyecto: la respuesta normalizada $g(x) = x^3 - x$ con objetivo $2$ se convierte en $f(x) = x^3 - x - 2 = 0$. Trabajar siempre con la forma $f(x) = 0$ permite aplicar el mismo aparato teórico (bisección, Newton, etc.) a cualquier problema de calibración o ajuste de un parámetro.

### 2.3 Localización de raíces: cambio de signo y Teorema de Bolzano

El Teorema de Bolzano (caso particular del Teorema del Valor Intermedio) es la base teórica que garantiza que existe una raíz dentro de un intervalo:

> Si $f$ es una función continua en $[a, b]$ y $f(a)$ y $f(b)$ tienen signos opuestos ($f(a) \cdot f(b) < 0$), entonces existe al menos un valor $x^* \in (a, b)$ tal que $f(x^*) = 0$.

En la práctica, la localización de raíces se hace evaluando $f(x)$ en una tabla de valores y observando en qué subintervalo cambia de signo el resultado; ese cambio de signo es la evidencia de que ahí hay (al menos) una raíz. Es importante notar dos límites de este criterio, relevantes para el módulo:

1. Si la función toca cero sin cruzarlo (raíz de multiplicidad par), no habrá cambio de signo aunque exista raíz.
2. Si hay un número par de raíces dentro del intervalo, tampoco se detectará cambio de signo en los extremos.

### 2.4 El papel del intervalo y de la aproximación inicial

* **En los métodos de intervalo** (como bisección): la información de partida es un intervalo $[a, b]$ que encierra a la raíz por cumplir la condición de cambio de signo; el método garantiza que la raíz permanece encerrada en cada nueva subdivisión.
* **En los métodos de punto** (como Newton-Raphson): la información de partida es un único valor $x_0$, llamado aproximación inicial, que debe estar razonablemente cerca de la raíz buscada para que el método converja; no hay garantía de "encierro" y una elección deficiente de $x_0$ puede provocar divergencia u oscilación.

---

## 3. Método de Bisección

### 3.1 Fundamento matemático

La bisección aplica reiteradamente el Teorema de Bolzano: dado un intervalo $[a, b]$ con $f(a) \cdot f(b) < 0$, se calcula el punto medio como la mejor estimación disponible de la raíz, y se decide en cuál de las dos mitades del intervalo se conserva el cambio de signo; esa mitad se convierte en el nuevo intervalo de trabajo. Al repetir el proceso, el intervalo que encierra a la raíz se reduce a la mitad en cada paso.

### 3.2 Algoritmo paso a paso

1. Verificar que $f$ es continua en $[a, b]$ y que $f(a) \cdot f(b) < 0$ (condición de Bolzano). Si no se cumple, el método no puede aplicarse a ese intervalo.
2. Calcular el punto medio: $x_m = \frac{a + b}{2}$.
3. Evaluar $f(x_m)$.
4. Decidir el nuevo intervalo:
   * Si $f(a) \cdot f(x_m) < 0$, la raíz está en $[a, x_m] \rightarrow$ se actualiza $b = x_m$.
   * Si $f(x_m) \cdot f(b) < 0$, la raíz está en $[x_m, b] \rightarrow$ se actualiza $a = x_m$.
   * Si $f(x_m) = 0$ (dentro de una tolerancia numérica), $x_m$ es la raíz y el proceso termina.
5. Repetir los pasos 2 a 4 hasta cumplir un criterio de parada.

### 3.3 Estimación y cota del error

Como la raíz siempre queda encerrada en el intervalo vigente, el error de la aproximación $x_m$ de la iteración $n$ está acotado por la mitad del ancho del intervalo que la produjo:

$$|x_m^{(n)} - x^*| \le \frac{b_0 - a_0}{2^n}$$

donde $(b_0 - a_0)$ es el ancho del intervalo inicial. Esta cota es la que debe mostrarse junto a cada punto medio en la calculadora, tal como exige el módulo (extremos, punto medio, valor de la función y cota del error del punto medio).

### 3.4 Criterios de parada

En la práctica se combina más de un criterio, y conviene detectarlos explícitamente en vez de asumir convergencia:

* Ancho del intervalo o cota de error menor que la tolerancia: $\frac{b - a}{2} < \text{tol}$.
* Diferencia entre puntos medios sucesivos menor que la tolerancia: $|x_m^{(n+1)} - x_m^{(n)}| < \text{tol}$.
* $|f(x_m)|$ suficientemente pequeño (con cautela, ya que esto es un residuo, no el error de la raíz; ver §1.3).
* Número máximo de iteraciones alcanzado: debe reportarse como agotamiento del límite, no como convergencia.
* Casos de error a detectar explícitamente: intervalo sin cambio de signo real ($f(a) \cdot f(b) \ge 0$) o valores no finitos de $f$.

### 3.5 Número de iteraciones necesarias

Como el ancho del intervalo se reduce geométricamente (factor $\frac{1}{2}$ por iteración), es posible calcular de antemano cuántas iteraciones $n$ se necesitan para garantizar una tolerancia $\text{tol}$ dada, despejando de la cota de error:

$$n \ge \log_2\left(\frac{b_0 - a_0}{\text{tol}}\right)$$

Por ejemplo, para el intervalo $[1, 2]$ y una tolerancia de $10^{-6}$, se requieren al menos $n \approx 20$ iteraciones:

$$\log_2\left(\frac{1}{10^{-6}}\right) = \log_2(10^6) \approx 19.93$$

información útil para fijar o justificar el máximo de iteraciones del módulo.

### 3.6 Convergencia

La bisección tiene convergencia lineal garantizada con razón $1/2$; el error se reduce a la mitad en cada iteración, sin excepción, siempre que la condición inicial de cambio de signo se cumpla. Esta es su principal fortaleza: converge siempre (es robusta), aunque de forma relativamente lenta comparada con métodos de orden superior.

### 3.7 Ejemplo resuelto

Caso de calibración: $f(x) = x^3 - x - 2$, intervalo inicial $[1, 2]$ ($f(1) = -2$, $f(2) = 4$, hay cambio de signo). Raíz de referencia: $x^* \approx 1.5213797068$.

| Iter. $n$ | Intervalo $[a, b]$ | Punto medio $x_m$ | $f(x_m)$ | Nuevo intervalo |
| :---: | :---: | :---: | :---: | :---: |
| 1 | $[1, 2]$ | 1.5 | -0.125 | $[1.5, 2]$ |
| 2 | $[1.5, 2]$ | 1.75 | +1.609375 | $[1.5, 1.75]$ |
| 3 | $[1.5, 1.75]$ | 1.625 | +0.666016 | $[1.5, 1.625]$ |
| 4 | $[1.5, 1.625]$ | 1.5625 | +0.252197 | $[1.5, 1.5625]$ |
| 5 | $[1.5, 1.5625]$ | 1.53125 | +0.059113 | $[1.5, 1.53125]$ |

*(Iteración 1 verificada directamente en la fuente del proyecto; iteraciones 2 a 5 son cálculo directo del mismo algoritmo, mostrado para ilustrar cómo el intervalo se cierra monótonamente alrededor de $x^* \approx 1.5213797068$.)*

Nótese que el signo de $f(x_m)$ se mantiene positivo desde la iteración 2 en adelante porque la raíz está siempre en la mitad izquierda del intervalo vigente; el algoritmo debe basar su decisión en el producto de signos, no en la magnitud de $f$.

### 3.8 Ventajas y limitaciones

**Ventajas:**
* Siempre converge si se cumple la condición inicial.
* Es muy simple de implementar.
* Es numéricamente robusta (no usa derivadas, no puede "explotar" ni diverger).
* La cota del error es conocida de antemano.

**Limitaciones y casos problemáticos:**
* Requiere encontrar primero un intervalo válido con cambio de signo; no detecta raíces de multiplicidad par (la función toca el eje sin cruzarlo).
* Convergencia lenta (lineal) comparada con Newton-Raphson.
* Si el intervalo dado no tiene cambio de signo real, el algoritmo no debe "forzar" un resultado: debe advertir el error explícitamente. Caso de prueba típico: para $f(x) = x^3 - x - 2$, el intervalo $[2, 3]$ no presenta cambio de signo ($f(2) = 4$, $f(3) = 22$, ambos positivos) y el módulo debe reportarlo como entrada inválida en vez de iterar.
* Solo garantiza encontrar una raíz dentro del intervalo, aunque existan varias.

---

## 4. Método de Newton-Raphson

### 4.1 Fundamento matemático

El método se obtiene aproximando $f$ cerca del punto actual $x_n$ mediante su recta tangente (los dos primeros términos de su expansión de Taylor):

$$f(x) \approx f(x_n) + f'(x_n)(x - x_n)$$

Igualando esta aproximación lineal a cero y despejando $x$ se obtiene la siguiente aproximación de la raíz, que es el punto donde la recta tangente en $x_n$ corta al eje horizontal:

$$x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}$$

### 4.2 Algoritmo paso a paso

1. Elegir una aproximación inicial $x_0$, razonablemente cercana a la raíz buscada.
2. Evaluar $f(x_n)$ y $f'(x_n)$.
3. Verificar que $f'(x_n)$ no sea cero (ni demasiado pequeña); si lo es, el método no puede continuar en ese punto.
4. Calcular la siguiente aproximación: $x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}$.
5. Verificar que $x_{n+1}$ sea un valor finito (detectar overflow o resultados no numéricos).
6. Repetir desde el paso 2 hasta cumplir un criterio de parada.

### 4.3 Condiciones de aplicación

* $f$ debe ser derivable (idealmente dos veces continuamente diferenciable) en la región de trabajo, porque se necesita $f'(x)$ en cada paso.
* Se requiere una aproximación inicial $x_0$ suficientemente cercana a la raíz: a diferencia de la bisección, Newton-Raphson no exige un intervalo con cambio de signo, pero tampoco garantiza convergencia si el punto de partida es deficiente.
* La derivada $f'(x_n)$ no debe anularse (ni acercarse demasiado a cero) durante el proceso, pues aparece en el denominador.

Como guía práctica para elegir un buen punto de partida cuando $f''$ no cambia de signo en el intervalo de trabajo, puede aplicarse el criterio de que $f(x_0)$ y $f''(x_0)$ tengan el mismo signo:

$$f(x_0) \cdot f''(x_0) > 0$$

esto favorece una convergencia monótona hacia la raíz sin oscilaciones.

### 4.4 Criterios de parada y estimación del error

Al igual que en bisección, deben combinarse varios criterios y reportarse por separado:

* Diferencia entre iteraciones sucesivas: $|x_{n+1} - x_n| < \text{tol}$; esta es la estimación práctica del error, ya que el error real $|x_n - x^*|$ no se conoce sin una referencia externa.
* Residuo $|f(x_n)| < \text{tol}$: debe mostrarse junto con, pero no en lugar de, el cambio entre iteraciones, porque un residuo pequeño no implica necesariamente un error pequeño (§1.3).
* Número máximo de iteraciones alcanzado: reportado explícitamente como agotamiento del límite, no como convergencia.
* Detección de fallos: derivada nula o casi nula, valores no finitos, divergencia (la sucesión se aleja de la región de la raíz).

### 4.5 Convergencia

Cuando $x_0$ está suficientemente cerca de una raíz simple ($f'(x^*) \neq 0$) y $f$ es dos veces derivable en un entorno de la raíz, Newton-Raphson tiene convergencia cuadrática: el número de cifras decimales correctas se duplica aproximadamente en cada iteración. Formalmente, si $e_n = x_n - x^*$ es el error en la iteración $n$:

$$e_{n+1} \approx \left[\frac{f''(x^*)}{2 f'(x^*)}\right] e_n^2$$

Esta es la razón por la que Newton-Raphson suele necesitar muchas menos iteraciones que bisección para alcanzar la misma tolerancia, siempre que la aproximación inicial sea adecuada. (Si la raíz es múltiple, es decir $f'(x^*) = 0$, la convergencia se degrada a lineal; detalle que conviene tener presente, aunque no sea el caso de los ejemplos del módulo.)

### 4.6 Ejemplo resuelto

Mismo caso: $f(x) = x^3 - x - 2$, con $f'(x) = 3x^2 - 1$, $x_0 = 1.5$, tolerancia $10^{-6}$. Raíz de referencia: $x^* \approx 1.5213797068$.

| Iter. $n$ | $x_n$ | $f(x_n)$ | $f'(x_n)$ | $x_{n+1}$ | $\|x_{n+1} - x_n\|$ |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 0 | 1.5 | -0.125 | 5.75 | 1.5217391304 | 0.0217391304 |
| 1 | 1.5217391304 | $\approx 0.0021369$ | $\approx 5.9470697$ | 1.5213798 | $\approx 0.0003593$ |

*(Iteración 0 verificada directamente en la fuente del proyecto; la iteración 1 es cálculo directo del mismo algoritmo, incluido para mostrar la reducción cuadrática del error: tras solo dos pasos, la aproximación ya coincide con la referencia hasta la sexta cifra decimal, $1.5213798$ frente a $1.5213797068$.)*

**Caso de prueba de fallo específico:** usando el modelo alternativo $f(x) = x^3 - 1$ con $x_0 = 0$, se obtiene $f'(0) = 3 \cdot 0^2 - 1 = -1$ (o en modelos donde la derivada se anula estrictamente al inicio). El algoritmo debe detectar la división por cero (o por un valor numéricamente cercano a cero) y detenerse con un mensaje explícito en vez de continuar iterando.

### 4.7 Ventajas, limitaciones y casos de fallo

**Ventajas:**
* Convergencia cuadrática (muy rápida) cerca de la raíz.
* Requiere pocas iteraciones cuando el punto inicial es bueno.
* Solo necesita un punto de partida, no un intervalo.

**Limitaciones y casos de fallo típicos:**
* **Derivada nula o muy pequeña:** provoca división por cero o un salto desproporcionado en la siguiente iteración.
* **Punto inicial alejado de la raíz:** puede llevar a divergencia, a converger a una raíz distinta de la deseada, o a salir del dominio válido de la función.
* **Oscilación o ciclos:** para algunas funciones, ciertos puntos de partida generan una secuencia que oscila entre dos valores sin converger.
* **Valores no finitos:** la iteración puede producir resultados fuera de rango (*overflow*) si la pendiente es casi horizontal.
* **Raíces múltiples:** si $f'(x^*) = 0$ en la raíz buscada, la convergencia deja de ser cuadrática y se vuelve lineal.
* No hay garantía de convergencia global como en bisección: el algoritmo debe monitorear explícitamente estos fallos y no limitarse a iterar hasta el máximo.

---

## 5. Método de Regula Falsi (Falsa Posición)

### 5.1 Fundamento matemático

Regula Falsi es, como la bisección, un método de intervalo: parte de $[a, b]$ con $f(a) \cdot f(b) < 0$ y garantiza que la raíz queda siempre encerrada. La diferencia es la forma de elegir el punto de prueba: en vez del promedio simple (punto medio), usa el promedio ponderado de los extremos, es decir, el punto donde la recta secante que une $(a, f(a))$ y $(b, f(b))$ corta al eje horizontal:

$$x_r = \frac{a \cdot f(b) - b \cdot f(a)}{f(b) - f(a)}$$

Al usar la pendiente real de la cuerda en vez de solo el punto medio, Regula Falsi suele acercarse más rápido a la raíz que la bisección cuando la función es aproximadamente lineal cerca de esta.

### 5.2 Algoritmo paso a paso

1. Verificar $f(a) \cdot f(b) < 0$ (condición de Bolzano).
2. Calcular el punto de falsa posición: $x_r = \frac{a \cdot f(b) - b \cdot f(a)}{f(b) - f(a)}$.
3. Evaluar $f(x_r)$.
4. Decidir el nuevo intervalo, igual que en bisección:
   * Si $f(a) \cdot f(x_r) < 0$, la raíz está en $[a, x_r] \rightarrow b = x_r$.
   * Si $f(x_r) \cdot f(b) < 0$, la raíz está en $[x_r, b] \rightarrow a = x_r$.
   * Si $f(x_r) = 0$ (dentro de tolerancia), $x_r$ es la raíz.
5. Repetir desde el paso 2 hasta cumplir un criterio de parada.

### 5.3 Condiciones de aplicación, criterios de parada y estimación del error

Requiere las mismas condiciones que bisección: $f$ continua en $[a, b]$ y cambio de signo en los extremos. A diferencia de bisección, no existe una cota de error teórica simple como $\frac{b-a}{2^n}$ porque el ancho del intervalo no decrece de forma predecible; por eso el criterio de parada se basa en la diferencia entre puntos sucesivos o en el residuo:

* $|x_r^{(n+1)} - x_r^{(n)}| < \text{tol}$
* $|f(x_r)| < \text{tol}$ (siempre reportado por separado del cambio entre iteraciones; ver §1.3).
* Número máximo de iteraciones agotado $\rightarrow$ reportar como agotamiento, no como convergencia.
* Detección explícita de intervalos sin cambio de signo real y valores no finitos de $f$.

### 5.4 Convergencia y limitación característica: el extremo estancado

Regula Falsi converge de forma lineal, en general más rápido que bisección, pero con una limitación conocida: si la función es convexa o cóncava en todo el intervalo, uno de los dos extremos puede quedar fijo durante muchas iteraciones mientras solo el otro se acerca a la raíz; el ancho del intervalo entonces no tiende necesariamente a cero, aunque la sucesión de puntos de prueba sí converge a la raíz. 

*(La variante conocida como método de Illinois corrige este problema reduciendo a la mitad el valor de $f$ en el extremo estancado; no forma parte del alcance mínimo de este módulo, pero puede mencionarse como mejora opcional).*

### 5.5 Ejemplo resuelto

Mismo caso base: $f(x) = x^3 - x - 2$, intervalo inicial $[1, 2]$ ($f(1) = -2$, $f(2) = 4$).

| Iter. | $a$ | $b$ | $x_r$ | $f(x_r)$ | Extremo reemplazado |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 2 | 1.333333 | -0.962963 | $a$ (mismo signo que $f(a)$) |
| 2 | 1.333333 | 2 | 1.462687 | -0.333338 | $a$ |
| 3 | 1.462687 | 2 | 1.504023 | -0.101793 | $a$ |
| 4 | 1.504023 | 2 | 1.516382 | -0.029589 | $a$ |

*(Cálculo propio sobre el mismo caso base del proyecto, para comparabilidad directa con bisección y Newton-Raphson.)*

Nótese cómo el extremo $b = 2$ permanece fijo en las cuatro iteraciones mientras $a$ se acerca lentamente a $x^* \approx 1.5213797068$: es el ejemplo perfecto del "extremo estancado" descrito en §5.4: el ancho del intervalo apenas se reduce, aunque $x_r$ sí se aproxima a la raíz.

### 5.6 Ventajas y limitaciones

**Ventajas:**
* Converge siempre que se cumpla la condición inicial (es tan robusto como bisección).
* Normalmente necesita menos iteraciones que bisección porque aprovecha la forma de la función.

**Limitaciones:**
* Puede converger más lento de lo esperado cuando un extremo queda estancado (ver §5.4).
* No existe una cota de error tan simple y confiable como en bisección.
* Sigue exigiendo un intervalo inicial con cambio de signo, con las mismas limitaciones frente a raíces de multiplicidad par que la bisección.

---

## 6. Método de la Secante

### 6.1 Fundamento matemático

La Secante puede verse como una versión de Newton-Raphson que reemplaza la derivada por una aproximación numérica: en vez de la pendiente exacta de la tangente, usa la pendiente de la recta secante que pasa por las dos últimas aproximaciones $x_{n-1}$ y $x_n$:

$$f'(x_n) \approx \frac{f(x_n) - f(x_{n-1})}{x_n - x_{n-1}}$$

Sustituyendo esta aproximación en la fórmula de Newton-Raphson se obtiene la relación de recurrencia de la Secante:

$$x_{n+1} = x_n - f(x_n) \cdot \frac{x_n - x_{n-1}}{f(x_n) - f(x_{n-1})}$$

A diferencia de Regula Falsi, la Secante no exige que los dos puntos encierren la raíz (no hay verificación de cambio de signo): simplemente usa las dos aproximaciones más recientes, encierren o no a $x^*$.

### 6.2 Algoritmo paso a paso

1. Elegir dos aproximaciones iniciales distintas, $x_0$ y $x_1$ (no necesitan cumplir $f(x_0) \cdot f(x_1) < 0$).
2. Evaluar $f(x_{n-1})$ y $f(x_n)$.
3. Verificar que $f(x_n) - f(x_{n-1})$ no sea cero (ni demasiado pequeño); si lo es, la recta secante es horizontal y el método no puede continuar.
4. Calcular la siguiente aproximación:
   $$x_{n+1} = x_n - f(x_n) \cdot \frac{x_n - x_{n-1}}{f(x_n) - f(x_{n-1})}$$
5. Verificar que $x_{n+1}$ sea finito.
6. Repetir desde el paso 2, desplazando los índices ($x_{n-1} \leftarrow x_n$, $x_n \leftarrow x_{n+1}$), hasta cumplir un criterio de parada.

### 6.3 Condiciones de aplicación, criterios de parada y estimación del error

* $f$ debe ser continua (no requiere que exista o se calcule su derivada, lo cual es su principal ventaja frente a Newton-Raphson).
* Se necesitan dos aproximaciones iniciales, idealmente cercanas a la raíz.
* Criterios de parada iguales en espíritu a los de Newton:
  * $|x_{n+1} - x_n| < \text{tol}$
  * Residuo $|f(x_n)| < \text{tol}$ reportado por separado.
  * Máximo de iteraciones agotado (reportado como tal, no como convergencia).
  * Detección explícita de división por un denominador casi nulo o de valores no finitos.

### 6.4 Convergencia

La Secante tiene convergencia superlineal, con orden aproximadamente igual a la razón áurea:

$$p \approx \frac{1 + \sqrt{5}}{2} \approx 1.618$$

Es más lenta que la convergencia cuadrática de Newton-Raphson, pero más rápida que la convergencia lineal de bisección, Regula Falsi o punto fijo. A cambio de esta velocidad ligeramente menor que Newton, evita el costo (y a veces la imposibilidad) de calcular $f'(x)$ analíticamente.

### 6.5 Ejemplo resuelto

Mismo caso base: $f(x) = x^3 - x - 2$, con $x_0 = 1$, $x_1 = 2$ (sin exigir que encierren la raíz, aunque en este caso sí lo hacen).

| $n$ | $x_n$ | $f(x_n)$ |
| :---: | :---: | :---: |
| 0 | 1 | -2 |
| 1 | 2 | 4 |
| 2 | 1.333333 | -0.962963 |
| 3 | 1.462688 | -0.333338 |
| 4 | 1.531185 | +0.058722 |
| 5 | 1.520927 | -0.002678 |
| 6 | 1.521374 | $\approx -0.00003$ |

*(Cálculo propio sobre el mismo caso base, aplicando la recurrencia del §6.1.)*

En seis pasos la aproximación ya coincide con la referencia $x^* \approx 1.5213797068$ hasta la quinta cifra decimal: más rápido que Regula Falsi (que en cuatro iteraciones apenas alcanzaba 1.516382), aunque más lento que Newton-Raphson (que en solo dos pasos llegó a 1.5213798).

Obsérvese también que, a partir de $n = 4$, la secante ya no mantiene un intervalo que encierre la raíz ($f(x_4)$ es positivo mientras que la sucesión sigue moviéndose libremente): esto ilustra por qué el método no ofrece la garantía de robustez de los métodos de intervalo.

### 6.6 Ventajas y limitaciones

**Ventajas:**
* No requiere calcular la derivada de $f$ (útil cuando $f'(x)$ es difícil o costosa de obtener).
* Converge considerablemente más rápido que los métodos de intervalo.

**Limitaciones:**
* No garantiza convergencia (como Newton, puede divergir, oscilar o salir del dominio si los puntos iniciales son deficientes).
* Puede fallar si $f(x_n) = f(x_{n-1})$ (secante horizontal, división por cero).
* Requiere guardar y actualizar dos puntos en cada paso en lugar de uno.

---

## 7. Método de Punto Fijo (Iteración de Aproximaciones Sucesivas)

### 7.1 Fundamento matemático

El método de punto fijo transforma la ecuación $f(x) = 0$ en una forma equivalente $x = g(x)$, donde $g$ se llama función de iteración. Un valor $x^*$ que satisface $x^* = g(x^*)$ se denomina punto fijo de $g$, y por construcción es también raíz de $f$. La sucesión se genera evaluando repetidamente $g$:

$$x_{n+1} = g(x_n), \quad n = 0, 1, 2, \dots$$

Una misma ecuación $f(x) = 0$ admite varios despejes posibles de $x = g(x)$; no todos convergen, así que la elección de $g$ es una decisión matemática que debe justificarse (§7.3).

### 7.2 Algoritmo paso a paso

1. Despejar $x$ de $f(x) = 0$ para obtener una forma $x = g(x)$.
2. Verificar las condiciones de convergencia de $g$ en un intervalo $[a, b]$ (§7.3).
3. Elegir un valor inicial $x_0 \in [a, b]$.
4. Calcular $x_{n+1} = g(x_n)$.
5. Repetir el paso 4 hasta cumplir un criterio de parada.

### 7.3 Condiciones de aplicación: el criterio de convergencia

Para garantizar que la sucesión $\{x_n\}$ converge a un único punto fijo $x^*$ en $[a, b]$, deben cumplirse dos condiciones:

1. **$g$ mapea el intervalo en sí mismo:** si $x \in [a, b]$ entonces $g(x) \in [a, b]$.
2. **$g$ es una contracción:** $g$ es derivable en $[a, b]$ y existe una constante $L < 1$ (constante de Lipschitz) tal que $|g'(x)| \le L$ para todo $x \in [a, b]$. En la práctica, $L = \max\{|g'(a)|, |g'(b)|\}$.

Si ambas condiciones se cumplen, el Teorema del Punto Fijo garantiza que existe un único punto fijo en $[a, b]$ y que la iteración converge a él sin importar el valor inicial $x_0$ elegido dentro del intervalo. Cuanto más pequeña es $L$, más rápida es la convergencia.

### 7.4 Criterios de parada y estimación del error

* $|x_{n+1} - x_n| < \text{tol}$: criterio habitual, ya que el error real requiere conocer $x^*$.
* Si se conoce $L$, puede acotarse el error de antemano con:
  $$|x_n - x^*| \le \frac{L^n}{1 - L} |x_1 - x_0|$$
* Máximo de iteraciones agotado: reportar explícitamente como tal, no como convergencia.
* Debe detectarse si algún $x_n$ sale del intervalo $[a, b]$ donde $g$ fue validada, o si $g$ produce valores no finitos (por ejemplo, un logaritmo o raíz de un argumento inválido).

### 7.5 Convergencia

La convergencia del punto fijo es lineal, con razón asintótica igual a $|g'(x^*)|$: el error de cada iteración es aproximadamente $|g'(x^*)|$ veces el error de la iteración anterior. Por eso la elección de $g$ es determinante: dos despejes algebraicos distintos de la misma ecuación pueden dar una $g$ que converge rápido, una que converge muy lento, o una que directamente diverge porque $|g'(x)| > 1$.

### 7.6 Ejemplo resuelto

Mismo caso base: $f(x) = x^3 - x - 2 = 0$. Despejando $x^3 = x + 2$ se obtiene la función de iteración:

$$g(x) = (x + 2)^{1/3}$$

Verificación de convergencia en $[1, 2]$:
* $g(1) = 3^{1/3} \approx 1.442$, $g(2) = 4^{1/3} \approx 1.587$, ambos dentro de $[1, 2]$ (condición 1).
* Además $g'(x) = \frac{1}{3}(x+2)^{-2/3}$, cuyo máximo en valor absoluto en el intervalo es $|g'(1)| \approx 0.160 < 1$ (condición 2, con $L \approx 0.16$).

Ambas condiciones se cumplen, así que la convergencia está garantizada.

| $n$ | $x_n$ | $\|x_n - x^*\|$ | Razón respecto al error anterior |
| :---: | :---: | :---: | :---: |
| 0 | 1.5 | 0.021380 | — |
| 1 | 1.518297 | 0.003083 | 0.144 |
| 2 | 1.520903 | 0.000477 | 0.155 |
| 3 | 1.521311 | $\approx 0.000069$ | $\approx 0.144$ |

*(Cálculo propio; $x^* \approx 1.5213797068$.)*

La razón entre errores sucesivos se estabiliza cerca de $0.144$, exactamente el valor de $|g'(x^*)| = \frac{1}{3 (x^*)^2} \approx 0.144$ predicho por la teoría (§7.5); una forma directa de verificar, en el propio módulo, que la convergencia observada coincide con la convergencia teórica.

### 7.7 Ventajas y limitaciones

**Ventajas:**
* Conceptualmente muy simple (una sola evaluación de $g$ por iteración).
* No requiere derivada de $f$ para iterar (solo para verificar la condición de convergencia).
* Permite razonar visualmente sobre la convergencia mediante diagramas de telaraña.

**Limitaciones:**
* Requiere encontrar manualmente un despeje $x = g(x)$ que cumpla las condiciones de convergencia; no siempre es evidente ni único.
* Convergencia solo lineal (más lenta que Newton o Secante).
* Si $|g'(x)| > 1$ en la región de trabajo, la sucesión diverge en vez de converger, incluso si el punto de partida parece razonable.
* Distintos despejes de la misma ecuación pueden comportarse de forma opuesta (uno converge, otro diverge), por lo que el módulo debe validar la condición de Lipschitz antes de iterar y no asumir que cualquier despeje funciona.

---

## 8. Comparación entre los cinco métodos

| Aspecto | Bisección | Regula Falsi | Secante | Punto Fijo | Newton-Raphson |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Información inicial requerida** | Intervalo $[a, b]$ con $f(a) \cdot f(b) < 0$ | Intervalo $[a, b]$ con $f(a) \cdot f(b) < 0$ | Dos puntos $x_0, x_1$ cualesquiera | Un punto $x_0$ y una función $g(x)$ validada | Un punto $x_0$ cercano a la raíz |
| **¿Necesita la derivada?** | No | No | No (la aproxima con diferencias) | No para iterar; sí para verificar $\|g'(x)\| < 1$ | Sí, $f'(x)$ en cada iteración |
| **¿Encierra la raíz durante el proceso?** | Sí, siempre | Sí, siempre | No | No | No |
| **Garantía de convergencia** | Sí, si se cumple la condición inicial | Sí, si se cumple la condición inicial | No garantizada | Sí, si $g$ cumple las dos condiciones del §7.3 | No garantizada |
| **Orden de convergencia** | Lineal (razón $1/2$) | Lineal (razón variable, típicamente $< 1/2$) | Superlineal ($p \approx 1.618$) | Lineal (razón $\|g'(x^*)\|$) | Cuadrático |
| **Velocidad típica** | Lenta pero muy predecible | Moderada; puede estancarse en un extremo | Rápida | Lenta a moderada, según $g$ elegida | Muy rápida cerca de la raíz |
| **Robustez** | Alta | Alta | Media (puede divergir u oscilar) | Depende enteramente de la $g$ elegida | Media (sensible a $f'(x) \approx 0$ o a $x_0$) |
| **Estimación de error** | Cota exacta $\frac{b-a}{2^n}$ | Sin cota simple; se usa $\|x_r^{(n+1)} - x_r^{(n)}\|$ | Sin cota simple; se usa $\|x_{n+1} - x_n\|$ | Cota teórica $\frac{L^n}{1-L} \|x_1 - x_0\|$ si se conoce $L$ | Sin cota simple; se usa $\|x_{n+1} - x_n\|$ |
| **Limitación principal** | No detecta raíces de multiplicidad par | Un extremo puede quedar estancado | Puede fallar si $f(x_n) = f(x_{n-1})$ | Exige hallar y validar un despeje $g$ adecuado | Requiere derivada y buen punto de partida |

En la práctica pedagógica, contrastar los cinco métodos sobre el mismo caso (mismo $f(x)$, misma tolerancia) permite mostrar de forma concreta el compromiso entre robustez garantizada (Bisección, Regula Falsi, Punto Fijo con $g$ válida) y velocidad de convergencia (Secante, Newton-Raphson); comparación explícitamente pedida en el módulo, incluyendo cantidad de iteraciones, residuo y robustez frente a los mismos casos de prueba.

Como referencia rápida con el caso base $f(x) = x^3 - x - 2$, $x^* \approx 1.5213797068$:
* **Newton-Raphson:** necesitó 2 iteraciones para 6 cifras decimales correctas.
* **Secante:** necesitó 6 iteraciones para 5 cifras.
* **Punto Fijo:** (con la $g$ del §7.6) alcanzó 3 cifras en 3 iteraciones.
* **Regula Falsi:** apenas alcanzaba 2 cifras tras 4 iteraciones por el estancamiento del extremo $b$.
