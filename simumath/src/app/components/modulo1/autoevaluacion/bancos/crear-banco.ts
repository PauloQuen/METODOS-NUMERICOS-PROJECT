import type { Ejercicio, DatosCalculo } from '../../../../shared/models/metodo.model';
import { parsearFuncion } from '../../../../shared/domain/numerico/evaluador-funciones';
import { resolverCardano } from '../../../../shared/domain/numerico/cardano';
import { biseccion } from '../../tipos/cerrados/biseccion/biseccion.algoritmo';
import { reglaFalsa } from '../../tipos/cerrados/regla-falsa/regla-falsa.algoritmo';
import { newtonRaphson } from '../../tipos/abiertos/newton-raphson/newton-raphson.algoritmo';
import { ejecutarSecante } from '../../tipos/abiertos/secante/secante.algoritmo';
import { ejecutarPuntoFijo } from '../../tipos/abiertos/punto-fijo/punto-fijo.algoritmo';
import { numeroTexto as f, pregunta, preguntaNumero as pn, type ConGuia, type EtapaPractica, type GraficoPractica } from '../../../../shared/practica-guiada/modelos';
export type MetodoRaices='biseccion'|'regla-falsa'|'newton-raphson'|'secante'|'punto-fijo'|'cardano';
const cuenta=(etiqueta:string,expresion:string)=>({etiqueta,expresion});
const frac=(etiqueta:string,numerador:string,denominador:string)=>({etiqueta,numerador,denominador});
const casos:[string,string,number,number,string][]=[
 ['Raíz cuadrada de dos','x^2-2',1,2,'La diagonal de un cuadrado unitario satisface x² = 2.'],
 ['Raíz cuadrada de cinco','x^2-5',2,3,'Una longitud positiva satisface el balance geométrico x² = 5.'],
 ['Raíz cúbica de siete','x^3-7',1,2,'Un depósito cúbico tiene volumen de 7 unidades cúbicas. Busca su arista.'],
 ['Equilibrio cúbico','x^3+x-4',1,2,'Un modelo de equilibrio adimensional exige x³ + x = 4.'],
 ['Intersección trigonométrica','cos(x)-x',0,1,'Una condición de equilibrio angular es cos(x) = x, con x en radianes.'],
 ['Balance exponencial','exp(-x)-x',0,1,'Un modelo de decaimiento y reposición se equilibra cuando exp(−x) = x.'],
 ['Umbral logarítmico','ln(x)-1',2,3,'Una escala logarítmica alcanza el umbral 1 cuando ln(x) = 1.'],
 ['Crecimiento exponencial','exp(x)-4',1,2,'Un crecimiento adimensional cuadruplica el valor inicial: exp(x) = 4.'],
 ['Cúbica con término lineal','x^3+2*x-5',1,2,'Un modelo didáctico de flujo requiere resolver x³ + 2x = 5.'],
 ['Intersección de una parábola','x^2+x-6',1,3,'Un área adimensional se modela mediante x² + x = 6.'],
 ['Diseño de una longitud','x^2-7',2,3,'El área de un cuadrado debe ser de 7 unidades cuadradas. Estima su lado.'],
 ['Volumen de almacenamiento','x^3-10',2,3,'Un depósito cúbico requiere volumen de 10 unidades cúbicas. Estima su arista.'],
 ['Balance de energía','x^3+x-8',1,2,'Un balance simulado de energía conduce a x³ + x = 8.'],
 ['Umbral de señal','exp(x)-6',1,2,'Un amplificador ideal sigue exp(x) y se busca una salida igual a 6.'],
 ['Escala de concentración','ln(x)-0.5',1,2,'Un modelo de concentración normalizada requiere ln(x) = 0.5.'],
 ['Equilibrio de fuerza','x^2+2*x-5',1,2,'Un modelo didáctico de fuerza satisface x² + 2x = 5 para x positiva.'],
 ['Balance de caudal','x^3+3*x-9',1,2,'Una relación adimensional de caudal conduce a x³ + 3x = 9.'],
 ['Respuesta angular','cos(x)-2*x',0,1,'Un equilibrio angular simulado cumple cos(x) = 2x, en radianes.'],
 ['Tiempo de relajación','exp(-x)-2*x',0,1,'Un modelo de relajación adimensional se equilibra con exp(−x) = 2x.'],
 ['Diseño de superficie','x^2-11',3,4,'Una superficie cuadrada debe tener área de 11 unidades cuadradas.'],
 ['Volumen de una celda','x^3-15',2,3,'Una celda cúbica tiene volumen de 15 unidades cúbicas. Busca su arista.'],
];
function nuevos(metodo:MetodoRaices):Ejercicio[] {
 return casos.map(([titulo,funcion,a,b,contexto],i)=>{
  let expr=funcion,ecuacion=`${funcion} = 0`,x0=(a+b)/2;
  if(metodo==='punto-fijo') {
    // Familias de contracciones con distintos puntos fijos y velocidades.
    const c=2+i*.35, d=.15+(i%4)*.1;
    if(i%3===0)expr=`sqrt(${c}+${d}*x)`;
    else if(i%3===1)expr=`${.2+(i%5)*.1}+0.3*cos(x)`;
    else expr=`${.4+i*.07}+0.2*exp(-x)`;
    titulo=['Equilibrio por raíz cuadrada','Equilibrio angular amortiguado','Relajación exponencial'][i%3]+` · caso ${i+1}`;
    ecuacion=`x = ${expr}`;x0=1;
    contexto=`Un modelo adimensional simulado tiene la condición de equilibrio x = ${expr}. Determina el punto fijo desde x₀ = 1 y comprueba el residuo g(x) − x.`;
  }
  if(metodo==='cardano') {
    const desplazamiento=(i%5)-2;
    if(i%3===0)expr=`(x-(${desplazamiento}))^3+${1+i%4}*(x-(${desplazamiento}))-${2+i%7}`;
    else if(i%3===1)expr=`(x-(${desplazamiento-1}))*(x-(${desplazamiento+1}))*(x-(${desplazamiento+3}))`;
    else expr=`(x-(${desplazamiento}))^2*(x-(${desplazamiento+2}))`;
    titulo=['Cúbica con una raíz real','Cúbica con tres raíces reales','Cúbica con raíz doble'][i%3]+` · caso ${i+1}`;
    ecuacion=`${expr} = 0`;contexto=`Una condición algebraica de un modelo simulado es ${expr} = 0. Encuentra todas las raíces reales distintas y comprueba cuáles satisfacen la ecuación.`;
  }
  const datos:DatosCalculo={funcion:expr,a,b,x0,x1:b,tol:1e-6,maxIter:300};
  return {id:`${metodo}-banco-${i+1}`,titulo,tipo:i<10?'numerico':'casuistica',enunciado:i<10?undefined:contexto,
    ecuacion,calculo:datos,parametros:metodo==='cardano'?[]:[{etiqueta:'Datos iniciales',valor:metodo==='biseccion'||metodo==='regla-falsa'?`[${a}, ${b}]`:`x₀ = ${x0}${metodo==='secante'?`, x₁ = ${b}`:''}`},{etiqueta:'Tolerancia',valor:'0.000001'}],
    interpretacion:contexto,pasos:[],algoritmo:'Aplicar el método y comprobar la ecuación original.',criterio:'Verificar el resultado con los datos originales.',conclusion:''};
 });
}
export function crearBancoRaices(base:Ejercicio[],metodo:MetodoRaices):ConGuia<Ejercicio>[] {
 return [...base,...nuevos(metodo)].map(e=>enriquecer(e,metodo));
}
function grafico(fn:(x:number)=>number,min:number,max:number,puntos:GraficoPractica['puntos'],lineas:GraficoPractica['lineas']=[],identidad=false):GraficoPractica {
 const curva=Array.from({length:101},(_,i)=>{const x=min+(max-min)*i/100;return{x,y:fn(x)};}).filter(p=>Number.isFinite(p.y));
 return {curva,puntos,lineas,identidad};
}
function enriquecer(e:Ejercicio,metodo:MetodoRaices):ConGuia<Ejercicio> {
 const d=e.calculo,fn=parsearFuncion(d.funcion),tol=d.tol??1e-4;
 if(metodo==='cardano')return cardano(e,fn);
 const cerrado=metodo==='biseccion'||metodo==='regla-falsa';
 const opciones={f:fn,a:d.a!,b:d.b!,x0:d.x0!,x1:d.x1!,tol,maxIter:d.maxIter??300};
 const r=metodo==='biseccion'?biseccion(opciones):metodo==='regla-falsa'?reglaFalsa(opciones):metodo==='newton-raphson'?newtonRaphson(opciones):metodo==='secante'?ejecutarSecante(opciones):ejecutarPuntoFijo({...opciones,g:fn});
 if(!r.convergio||r.raiz===undefined)throw new Error(`El banco ${metodo}/${e.id} no converge: ${r.mensaje}`);
 const raiz=r.raiz, residual=metodo==='punto-fijo'?(x:number)=>fn(x)-x:fn;
 const inicial=cerrado?d.a!:d.x0!;
 const min=cerrado?d.a!:Math.min(inicial,raiz,d.x1??inicial)-.3;
 const max=cerrado?d.b!:Math.max(inicial,raiz,d.x1??inicial)+.3;
 const q=[pn('b-inicial',cerrado?'¿Cuál es el ancho del intervalo inicial?':'¿Cuál es la semilla inicial x₀?',cerrado?d.b!-d.a!:inicial,'Lee los datos iniciales antes de aplicar la recurrencia.'),
   pn('b-evaluacion',`¿Cuánto vale ${metodo==='punto-fijo'?'g':'f'}(${f(inicial)})?`,fn(inicial),'Sustituye el dato inicial en la expresión del ejercicio.'),
   pn('b-tolerancia','¿Qué tolerancia numérica se ha pedido?',tol,'La tolerancia controla el criterio de parada, no la precisión de cada operación.'),
   pregunta('b-validar','¿Cómo se comprueba el resultado?','Sustituyéndolo en la ecuación original.',['Mirando solo el número de iteraciones.','Redondeándolo a un entero.','Cambiando la función hasta obtener cero.'],'Un residuo pequeño es una comprobación adicional; no equivale por sí solo a una cota del error en x.'),
   pregunta('b-redondeo','¿Cuándo conviene redondear?','Al final del cálculo.',['Antes de evaluar la función.','A un entero en cada iteración.','Al elegir arbitrariamente una semilla.'],'Conserva precisión interna para no propagar errores de redondeo.'),
   pregunta('b-limite','¿Qué indica alcanzar el máximo de iteraciones sin cumplir el criterio?','Que aún no se ha demostrado convergencia con esos datos.',['Que la raíz es exactamente cero.','Que el último valor siempre es correcto.','Que hay infinitas raíces.'],'Revisa el dominio, los datos iniciales y el criterio de parada.'),
 ];
 const requisito=metodo==='biseccion'||metodo==='regla-falsa'
   ?pregunta('b-condicion','¿Qué condición permite aplicar Bolzano?','Continuidad en [a,b] y signos opuestos en los extremos.',['Una derivada nula en todo el intervalo.','Dos valores de función iguales.','Que ambos extremos sean positivos.'],'La continuidad y el cambio de signo garantizan al menos una raíz.')
   :metodo==='newton-raphson'?pregunta('b-condicion','¿Qué cantidad debe evitar ser nula al actualizar Newton?','La derivada en la aproximación actual.',['La semilla por definición.','La tolerancia.','El número de iteraciones.'],'La actualización divide por f′(xₙ); el motor aproxima la derivada numéricamente.')
   :metodo==='secante'?pregunta('b-condicion','¿Qué condición permite calcular la nueva secante?','Que las dos evaluaciones de f sean diferentes.',['Que las semillas siempre sean positivas.','Que la derivada sea cero.','Que las semillas sean idénticas.'],'El denominador f(xₙ) − f(xₙ₋₁) no puede ser cero.')
   :pregunta('b-condicion','¿Qué condición suficiente favorece la convergencia de punto fijo?','Que g preserve un intervalo cerrado y sea contractiva allí.',['Que g(x) sea positiva en cualquier lugar.','Que g′ sea mayor que 1 en módulo.','Que la semilla sea cero siempre.'],'Si g lleva el intervalo a sí mismo y |g′| ≤ q < 1, la iteración converge al punto fijo único.');
 q.push(requisito);
 const guia:EtapaPractica[]=[{titulo:'Preparar el método',explicacion:metodo==='punto-fijo'?`Aquí la función que itera es g(x) = ${d.funcion}; la ecuación a comprobar es g(x) − x = 0.`:`Usaremos f(x) = ${d.funcion}. Identifica los datos iniciales y las condiciones del método.`,cuentas:[cuenta('Ecuación',e.ecuacion),cuenta('Datos iniciales',cerrado?`a = ${d.a} ; b = ${d.b}`:`x₀ = ${inicial}`)],resultado:`tol = ${tol}`,pregunta:requisito,grafico:grafico(fn,min,max,[{x:inicial,y:fn(inicial),etiqueta:'inicial'}],metodo==='punto-fijo'?[[{x:min,y:min},{x:max,y:max}]]:[],metodo==='punto-fijo')}];
 let a=d.a!,b=d.b!,xAnterior=d.x0!,xActual=metodo==='secante'?d.x1!:d.x0!;
 // Tres primeras actualizaciones con números sin redondear. Se comparan con el motor en las pruebas.
 for(let i=0;i<Math.min(3,r.filas.length);i++) {
   let siguiente:number;let cuentas:EtapaPractica['cuentas'];let lineas:GraficoPractica['lineas']=[];
   if(cerrado) {
     siguiente=metodo==='biseccion'?(a+b)/2:a-fn(a)*(b-a)/(fn(b)-fn(a));
     cuentas=metodo==='biseccion'?[frac('Punto medio c = (a + b) / 2',`${f(a)} + (${f(b)})`,'2')]:[
       cuenta('Recurrencia', 'c = a − (f(a) · (b − a))/(f(b) − f(a))'),
       cuenta('Sustituir',`c = (${f(a)}) − ((${f(fn(a))}) · (${f(b)} − (${f(a)})))/((${f(fn(b))}) − (${f(fn(a))}))`)];
     cuentas.push(cuenta('Evaluar y conservar el cambio de signo',`f(c) ≈ ${f(fn(siguiente))} ; f(a) · f(c) ≈ ${f(fn(a)*fn(siguiente))}`));
     if(metodo==='regla-falsa')lineas=[[{x:a,y:fn(a)},{x:b,y:fn(b)}]];
   }else if(metodo==='punto-fijo') {
     siguiente=fn(xActual);cuentas=[cuenta('Iterar la reescritura','xₙ₊₁ = g(xₙ)'),cuenta('Sustituir',`xₙ = ${f(xActual)} ; xₙ₊₁ = g(${f(xActual)})`),cuenta('Medir el desplazamiento',`|Δx| = |(${f(siguiente)}) − (${f(xActual)})| ≈ ${f(Math.abs(siguiente-xActual))}`)];
     lineas=[[{x:min,y:min},{x:max,y:max}],[{x:xActual,y:xActual},{x:xActual,y:siguiente},{x:siguiente,y:siguiente}]];
   }else if(metodo==='newton-raphson') {
     const h=1e-6*Math.max(1,Math.abs(xActual)),der=(fn(xActual+h)-fn(xActual-h))/(2*h);
     siguiente=xActual-fn(xActual)/der;
     cuentas=[cuenta('Recurrencia de Newton','xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ)'),cuenta('Evaluaciones',`f(${f(xActual)}) ≈ ${f(fn(xActual))} ; f′(${f(xActual)}) ≈ ${f(der)}`),cuenta('Sustituir',`xₙ₊₁ = (${f(xActual)}) − (${f(fn(xActual))})/(${f(der)})`)];
     lineas=[[{x:xActual,y:fn(xActual)},{x:siguiente,y:0}]];
   }else {
     siguiente=xActual-fn(xActual)*(xActual-xAnterior)/(fn(xActual)-fn(xAnterior));
     cuentas=[cuenta('Recurrencia de la secante','xₙ₊₁ = xₙ − (f(xₙ) · (xₙ − xₙ₋₁))/(f(xₙ) − f(xₙ₋₁))'),cuenta('Evaluaciones',`f(${f(xAnterior)}) ≈ ${f(fn(xAnterior))} ; f(${f(xActual)}) ≈ ${f(fn(xActual))}`),cuenta('Sustituir',`xₙ₊₁ = (${f(xActual)}) − ((${f(fn(xActual))}) · (${f(xActual)} − (${f(xAnterior)})))/((${f(fn(xActual))}) − (${f(fn(xAnterior))}))`)];
     lineas=[[{x:xAnterior,y:fn(xAnterior)},{x:xActual,y:fn(xActual)},{x:siguiente,y:0}]];
   }
   const preguntaPaso=pn(`b-paso-${i}`,`¿Qué aproximación produce la actualización ${i+1}?`,siguiente,`Aplica la recurrencia con los valores de esta etapa. Se obtiene ${f(siguiente)}.`);
   q.push(preguntaPaso);
   guia.push({titulo:`Actualización ${i+1}`,explicacion:'Revela las operaciones para seguir la sustitución numérica. El gráfico muestra la construcción de esta aproximación.',cuentas,resultado:`${cerrado?'c':'xₙ₊₁'} ≈ ${f(siguiente)}`,pregunta:preguntaPaso,
     grafico:{...grafico(fn,Math.min(min,siguiente),Math.max(max,siguiente),[{x:siguiente,y:metodo==='punto-fijo'?siguiente:0,etiqueta:`aprox. ${i+1}`}],lineas,metodo==='punto-fijo'),intervalo:cerrado?[a,b]:undefined}});
   if(cerrado){if(fn(a)*fn(siguiente)<0)b=siguiente;else a=siguiente;}
   else{xAnterior=xActual;xActual=siguiente;}
 }
 const criterio=metodo==='biseccion'?'La cota del semiancho (b − a)/2, salvo raíz exacta.':'El desplazamiento absoluto entre aproximaciones, salvo raíz exacta.';
 q.push(pn('b-iteraciones','¿Cuántas actualizaciones realizó el motor hasta detenerse?',r.iteraciones,'Consulta la tabla completa de la solución después de terminar el recorrido.'),
   pn('b-residuo','¿Cuánto vale el módulo del residuo final?',Math.abs(residual(raiz)),'Sustituye la aproximación final en la ecuación original.'),
   pregunta('b-parada','¿Qué criterio utiliza esta ejecución?',criterio,['Se detiene siempre al tercer paso.','Basta que x sea positivo.','El gráfico debe parecer una recta.'],'El criterio se evalúa con la tolerancia indicada en el enunciado.'));
 guia.push({titulo:'Continuar hasta la tolerancia',explicacion:'Las primeras actualizaciones ilustran el procedimiento; el motor lo repite hasta satisfacer el criterio, sin redondear las cuentas intermedias.',cuentas:[cuenta('Criterio',metodo==='biseccion'?'(b − a)/2 ≤ tol':'|xₙ₊₁ − xₙ| ≤ tol'),cuenta('Resultado del motor',`x ≈ ${f(raiz)} ; actualizaciones = ${r.iteraciones}`)],resultado:`x ≈ ${f(raiz)}`,pregunta:q[q.length-1]});
 guia.push({titulo:'Comprobar e interpretar',explicacion:'Comprueba el residuo y el criterio de parada. Un desplazamiento pequeño por sí solo no es una garantía universal del error real.',cuentas:[cuenta('Sustituir en la ecuación',metodo==='punto-fijo'?`g(${f(raiz)}) − (${f(raiz)}) ≈ ${f(residual(raiz))}`:`f(${f(raiz)}) ≈ ${f(residual(raiz))}`)],resultado:`x ≈ ${f(raiz)}`,pregunta:q[3],grafico:grafico(fn,min,max,[{x:raiz,y:metodo==='punto-fijo'?raiz:0,etiqueta:'resultado'}],[],metodo==='punto-fijo')});
 return {...e,guia,cuestionario:[...(e.cuestionario??[]),...q],conclusion:`${metodo==='punto-fijo'?'Punto fijo':'Raíz'} x ≈ ${f(raiz)}; residuo ≈ ${f(residual(raiz))}.`,formatoRespuesta:'escalar',resolucion:{valorCorrecto:raiz,tolerancia:Math.max(tol*2,1e-6),etiqueta:'x',respuestaFinalTexto:`x ≈ ${f(raiz)}`}};
}
function cardano(e:Ejercicio,fn:(x:number)=>number):ConGuia<Ejercicio> {
 const r=resolverCardano(fn);if(r.error||!r.coeficientes)throw new Error(`Cúbica inválida: ${e.id}`);
 const {a,b,c,d}=r.coeficientes;
 const q=[pn('b-a','¿Cuál es el coeficiente cúbico a?',a,'Identifica el coeficiente de x³ al expandir la función.'),pn('b-b','¿Cuál es el coeficiente cuadrático b?',b,'Identifica el coeficiente de x².'),pn('b-c','¿Cuál es el coeficiente lineal c?',c,'Identifica el coeficiente de x.'),pn('b-d','¿Cuál es el término independiente d?',d,'Es f(0).'),pn('b-m','¿Cuánto vale el desplazamiento −b/(3a)?',r.desplazamiento,'El cambio x = t − b/(3a) elimina el término cuadrático.'),pn('b-p','¿Cuál es p en la cúbica deprimida?',r.p,'p = (3ac − b²)/(3a²).'),pn('b-q','¿Cuál es q en la cúbica deprimida?',r.q,'q = (2b³ − 9abc + 27a²d)/(27a³).'),pn('b-delta','¿Cuánto vale Δ = (q/2)² + (p/3)³?',r.delta,'El signo de Δ determina el tipo de raíces reales.'),pn('b-cantidad','¿Cuántas raíces reales distintas devuelve este problema?',r.raicesReales.length,'Cuenta las raíces distintas; una raíz múltiple no se repite en la respuesta.'),
 pregunta('b-criterio','¿Qué decide el caso de Cardano?','El signo de Δ = (q/2)² + (p/3)³.',['La tolerancia de una iteración.','El número de semillas.','La cantidad de filas de la tabla.'],'Δ > 0: una raíz real; Δ < 0: tres distintas; Δ = 0: raíces con multiplicidad.'),
 pregunta('b-validacion','¿Cómo verificas las raíces?','Sustituyendo cada raíz en el polinomio original.',['Comprobando que todas sean positivas.','Haciendo una sola iteración.','Dividiendo siempre por la raíz.'],'Cada raíz real debe producir residuo cercano a cero.'),
 pregunta('b-metodo','¿Cardano requiere iterar hasta una tolerancia?','No; resuelve la cúbica mediante fórmulas algebraicas o trigonométricas.',['Sí; siempre cien pasos.','Sí; requiere dos semillas.','Sí; exige intervalo con cambio de signo.'],'Es un método analítico para polinomios cúbicos.')];
 const base=(titulo:string,explicacion:string,cuentas:EtapaPractica['cuentas'],resultado:string,pregunta:typeof q[number]):EtapaPractica=>({titulo,explicacion,cuentas,resultado,pregunta});
 const raices=r.raicesReales.map(f).join(', ');
 const guia=[base('Identificar la cúbica','Expande los productos y ordena el polinomio por potencias.',[cuenta('Ecuación original',e.ecuacion),cuenta('Coeficientes',`a = ${f(a)} ; b = ${f(b)} ; c = ${f(c)} ; d = ${f(d)}`)],`a = ${f(a)}`,q[0]),
 base('Eliminar el término cuadrático','El cambio de variable produce una cúbica deprimida.',[cuenta('Cambio','x = t − b/(3*a)'),cuenta('Sustituir',`x = t − (${f(b)})/(3*(${f(a)}))`),cuenta('Calcular p',`p = (3*(${f(a)})*(${f(c)}) − (${f(b)})^2)/(3*(${f(a)})^2)`)],`p ≈ ${f(r.p)}`,q[5]),
 base('Calcular el término q','Conserva los signos de los coeficientes y calcula primero los productos.',[cuenta('Fórmula','q = (2*b^3 − 9*a*b*c + 27*a^2*d)/(27*a^3)'),cuenta('Sustituir',`q = (2*(${f(b)})^3 − 9*(${f(a)})*(${f(b)})*(${f(c)}) + 27*(${f(a)})^2*(${f(d)}))/(27*(${f(a)})^3)`) ],`q ≈ ${f(r.q)}`,q[6]),
 base('Evaluar el discriminante','El signo determina la fórmula que corresponde usar.',[cuenta('Discriminante','Δ = (q/2)^2 + (p/3)^3'),cuenta('Sustituir',`Δ = ((${f(r.q)})/2)^2 + ((${f(r.p)})/3)^3`)],`Δ ≈ ${f(r.delta)}`,q[7]),
 base('Obtener las raíces reales',r.delta<0?'El caso irreducible se resuelve con la forma trigonométrica de Viète.':r.delta>0?'Se usan raíces cúbicas reales de los dos términos de Cardano.':'Se distinguen las raíces múltiples, sin repetir valores en la lista.',[
 cuenta('Cúbica deprimida',`t^3 + (${f(r.p)})*t + (${f(r.q)}) = 0`),
 cuenta('Fórmula del caso',r.delta<0?'tₖ = 2*sqrt(−p/3)*cos(acos((3*q/(2*p))*sqrt(−3/p))/3 − 2*π*k/3)':r.delta>0?'t = ∛(−q/2 + √Δ) + ∛(−q/2 − √Δ)':'t₁ = 2*∛(−q/2) ; t₂ = −∛(−q/2)'),cuenta('Deshacer el cambio',`x = t + (${f(r.desplazamiento)})`),cuenta('Raíces distintas',`x = ${raices}`)],`x = ${raices}`,q[8]),
 base('Validar las raíces','Comprueba las soluciones en el polinomio original y considera las multiplicidades.',r.raicesReales.map(x=>cuenta('Residuo',`f(${f(x)}) ≈ ${f(fn(x))}`)),`x = ${raices}`,q[10])];
 const min=Math.min(...r.raicesReales)-1,max=Math.max(...r.raicesReales)+1;
 guia[5].grafico=grafico(fn,min,max,r.raicesReales.map((x,i)=>({x,y:0,etiqueta:`raíz ${i+1}`})));
 return {...e,guia,cuestionario:[...(e.cuestionario??[]),...q],formatoRespuesta:r.raicesReales.length===1?'escalar':'vector',conclusion:`Raíces reales distintas: ${raices}.`,resolucion:{valorCorrecto:r.raicesReales.length===1?r.raicesReales[0]:r.raicesReales,tolerancia:1e-5,respuestaFinalTexto:`Raíces reales distintas: ${raices}.`}};
}
