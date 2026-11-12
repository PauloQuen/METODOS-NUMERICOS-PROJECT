import type { EjercicioSistema } from '../../../shared/models/sistema.model';
import { ejecutarGauss } from '../tipos/directos/gauss/gauss.algoritmo';
import { ejecutarLu } from '../tipos/directos/lu/lu.algoritmo';
import { numeroTexto as f, pregunta, preguntaNumero as pn, type ConGuia, type EtapaPractica } from '../../../shared/practica-guiada/modelos';
export type MetodoSistemas='gauss'|'lu';
const copia=(A:number[][])=>A.map(f=>[...f]);
const cuenta=(etiqueta:string,expresion:string)=>({etiqueta,expresion});
const contextos=['Mezcla de materias primas','Distribución de producción','Balance de corrientes','Asignación de recursos','Balance térmico lineal','Composición de una mezcla','Reparto de cargas','Precios de una compra','Balance de inventario','Calibración lineal','Flujos entre depósitos'];
function nuevos(metodo:MetodoSistemas):EjercicioSistema[] {
 return Array.from({length:21},(_,i)=>{
   const n=i%3===0?2:3;
   const A=Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>r===c?6+(i+r)%5:((i+2*r+c)%5)-2));
   if(metodo==='gauss'&&i%4===0)[A[0],A[n-1]]=[A[n-1],A[0]];
   const x=Array.from({length:n},(_,j)=>i<10?((i+j)%7)-3:1+(i+j)%5);
   const b=A.map(fila=>fila.reduce((s,a,j)=>s+a*x[j],0));
   const aplicado=i>=10;
   const contexto=contextos[i-10]??'Sistema numérico';
   return {id:`${metodo}-banco-${i+1}`,titulo:aplicado?contexto:`Sistema ${n} × ${n} · caso ${i+1}`,tipo:aplicado?'casuistica':'numerico',
     enunciado:aplicado?`En un modelo didáctico de ${contexto.toLowerCase()}, las incógnitas representan ${n} cantidades desconocidas. Cada fila de la tabla indica los coeficientes de una restricción y su total. Usa esos balances para determinar las cantidades. Datos simulados.`:undefined,
     ecuacion:A.map((fila,r)=>fila.map((a,j)=>`(${a})x${j+1}`).join(' + ')+` = ${b[r]}`).join('\n'),
     parametros:[{etiqueta:'Dimensión',valor:`${n} × ${n}`}],calculo:{A,b},interpretacion:'Cada fila representa una ecuación y cada columna una incógnita; el término independiente es el total de esa ecuación.',pasos:[],algoritmo:'Transformar el sistema sin cambiar su solución.',criterio:'Verificar A·x = b.',conclusion:''};
 });
}
export function crearBancoSistemas(base:EjercicioSistema[],metodo:MetodoSistemas):ConGuia<EjercicioSistema>[] {
 return [...base,...nuevos(metodo)].map(e=>enriquecer(e,metodo));
}
function enriquecer(e:EjercicioSistema,metodo:MetodoSistemas):ConGuia<EjercicioSistema> {
 const {A,b}=e.calculo,n=A.length;
 const solucion=metodo==='gauss'?ejecutarGauss(e.calculo):ejecutarLu(e.calculo);
 if(!solucion.exito && metodo==='gauss' && n===2)return diagnosticoSingular(e);
 if(!solucion.exito||!solucion.solucion)throw new Error(`Sistema inválido ${metodo}/${e.id}: ${solucion.mensaje}`);
 const x=solucion.solucion;
 const q=[pn('b-dimension','¿Cuántas incógnitas tiene este sistema?',n,'Cuenta las columnas de A; la última columna de [A | b] es el término independiente.'),
   pn('b-primero','¿Cuál es el término independiente de la primera ecuación?',b[0],'Es el primer componente del vector b.'),
   pn('b-coef','¿Cuál es el coeficiente a₁₁ de la matriz original?',A[0][0],'La primera coordenada indica la fila y la segunda indica la columna.'),
   pregunta('b-equivalencia','¿Qué operación conserva las soluciones del sistema?','Sumar a una fila un múltiplo de otra.',['Sumar uno solo al término independiente.','Borrar una ecuación arbitrariamente.','Dividir toda una fila por cero.'],'Las operaciones elementales se aplican a toda la fila, incluido el término independiente.'),
   pregunta('b-validar','¿Cómo se comprueba el vector obtenido?','Calculando A·x − b con la matriz original.',['Reutilizando solamente una fila triangular.','Comprobando que x sea positivo.','Ordenando las incógnitas por tamaño.'],'La comprobación utiliza el sistema original.'),
   pregunta('b-redondeo','¿Cómo se maneja el redondeo?','Se conservan cifras internas y se redondea al presentar.',['Se redondea cada multiplicador a un entero.','Se eliminan los coeficientes pequeños sin criterio.','Se cambian los datos para simplificar la tabla.'],'Los errores intermedios pueden amplificarse, sobre todo con pivotes pequeños.'),
   pregunta('b-metodo','¿Este método necesita una tolerancia de iteración?','No; es un método directo con un número finito de operaciones.',['Sí; siempre cien iteraciones.','Sí; necesita una semilla x₀.','Sí; se detiene al tercer cambio de signo.'],'El residuo mide la precisión del resultado, no una convergencia iterativa.'),
   pregunta('b-singular','¿Qué requiere atención al encontrar un pivote cero?','Revisar el pivoteo y si el sistema tiene solución única.',['Dividir por cero y seguir.','Declarar que x es el vector cero.','Cambiar el vector b arbitrariamente.'],'Gauss busca otro pivote en la columna; LU sin pivoteo puede requerir reordenar las filas.'),
   pregunta('b-objetivo',metodo==='gauss'?'¿Qué forma se busca antes de sustituir?':'¿Qué identidad se busca en esta factorización?',metodo==='gauss'?'Un sistema triangular superior.':'A = L·U, con diagonal de L igual a 1.',metodo==='gauss'?['Una matriz con todas las entradas iguales.','Un vector de semillas.','Un polinomio interpolante.']:['A = L + U siempre.','A = U·L por definición.','L con toda su diagonal igual a cero.'],metodo==='gauss'?'Los ceros debajo de la diagonal permiten despejar desde la última incógnita.':'Doolittle construye L triangular inferior unitaria y U triangular superior.')];
 const M=A.map((fila,i)=>[...fila,b[i]]);
 const L:number[][]=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0));
 const guia:EtapaPractica[]=[{titulo:'Organizar el sistema',explicacion:'Identifica las incógnitas, los coeficientes y los términos independientes. La barra separa A del vector b.',cuentas:[cuenta('Modelo','A · x = b')],resultado:`n = ${n}`,pregunta:q[0],matrices:[{titulo:'Matriz aumentada [A | b]',valores:copia(M),aumentada:true}]}];
 for(let k=0;k<n-1;k++) {
   if(metodo==='gauss') {
     let p=k;for(let i=k+1;i<n;i++)if(Math.abs(M[i][k])>Math.abs(M[p][k]))p=i;
     if(p!==k) {
       const antes=copia(M),pivot=M[p][k];[M[k],M[p]]=[M[p],M[k]];
       const pr=pn(`b-pivote-${k}`,`¿Qué valor pasa a ser el pivote en la columna ${k+1}?`,pivot,'El pivoteo parcial elige el coeficiente de mayor valor absoluto entre las filas disponibles.');q.push(pr);
       guia.push({titulo:`Pivoteo de la columna ${k+1}`,explicacion:`Compara los valores absolutos e intercambia las filas ${k+1} y ${p+1}.`,cuentas:[cuenta('Intercambiar filas',`R${k+1} ↔ R${p+1}`)],resultado:`pivote = ${f(pivot)}`,pregunta:pr,matrices:[{titulo:'Antes',valores:antes,aumentada:true,columna:k},{titulo:'Después del intercambio',valores:copia(M),aumentada:true,fila:k}]});
     }
   }
   for(let i=k+1;i<n;i++) {
     const factor=M[i][k]/M[k][k],antes=copia(M),elemento=M[i][k],pivote=M[k][k];
     for(let j=k;j<=n;j++)M[i][j]-=factor*M[k][j];M[i][k]=0;L[i][k]=factor;
     const pr=pn(`b-factor-${k}-${i}`,`¿Cuál es el multiplicador para anular la entrada (${i+1}, ${k+1})?`,factor,'Divide el coeficiente que quieres anular entre el pivote de su columna.');q.push(pr);
     guia.push({titulo:`Anular a${i+1}${k+1}`,explicacion:metodo==='lu'?'Guarda el multiplicador en L y aplica la operación sobre U.':'Aplica la misma operación a toda la fila, incluido su término independiente.',cuentas:[{etiqueta:'Calcular el multiplicador',numerador:f(elemento),denominador:f(pivote)},cuenta('Operación elemental',`R${i+1} ← R${i+1} − (${f(factor)}) · R${k+1}`)],resultado:`a${i+1}${k+1} = 0`,pregunta:pr,matrices:[{titulo:'Antes',valores:antes,aumentada:true,fila:i},{titulo:'Después',valores:copia(M),aumentada:true,fila:i},...(metodo==='lu'?[{titulo:'Multiplicadores en L',valores:copia(L),fila:i}]:[])]});
   }
 }
 let U=M.map(fila=>fila.slice(0,n));
 let rhs=M.map(fila=>fila[n]);
 if(metodo==='lu') {
   const r=ejecutarLu(e.calculo);U=r.U!;
   guia.push({titulo:'Revisar la factorización',explicacion:'Comprueba que el producto L·U reproduce A. La diagonal de L es unitaria.',cuentas:[cuenta('Factorización','A = L · U')],resultado:'A = L · U',pregunta:q[8],matrices:[{titulo:'L',valores:r.L!},{titulo:'U',valores:r.U!}]});
   const y:number[]=[];
   for(let i=0;i<n;i++) {
     const suma=L[i].slice(0,i).reduce((s,a,j)=>s+a*y[j],0);y[i]=b[i]-suma;
     const pr=pn(`b-y-${i}`,`¿Cuánto vale y${i+1} en L·y = b?`,y[i],'Usa los componentes de y ya calculados y la diagonal unitaria de L.');q.push(pr);
     guia.push({titulo:`Sustitución adelante · y${i+1}`,explicacion:'Resuelve de arriba hacia abajo utilizando los valores recién obtenidos.',cuentas:[cuenta('Despejar',`y${i+1} = ${f(b[i])} − (${f(suma)})`)],resultado:`y${i+1} ≈ ${f(y[i])}`,pregunta:pr,matrices:[{titulo:'[L | b]',valores:L.map((fila,j)=>[...fila,b[j]]),aumentada:true,fila:i}]});
   }
   rhs=y;
 }
 const calculado:number[]=Array(n).fill(0);
 for(let i=n-1;i>=0;i--) {
   const suma=U[i].slice(i+1).reduce((s,a,j)=>s+a*calculado[i+1+j],0);
   calculado[i]=(rhs[i]-suma)/U[i][i];
   const pr=pn(`b-x-${i}`,`¿Cuánto vale x${i+1} al sustituir los valores conocidos?`,calculado[i],'Resta la contribución de las incógnitas conocidas y divide entre el coeficiente diagonal.');q.push(pr);
   guia.push({titulo:`Sustitución atrás · x${i+1}`,explicacion:'Despeja desde la última fila hacia la primera, conservando el orden de las incógnitas.',cuentas:[{etiqueta:`Despejar x${i+1}`,numerador:`${f(rhs[i])} − (${f(suma)})`,denominador:f(U[i][i])}],resultado:`x${i+1} ≈ ${f(calculado[i])}`,pregunta:pr,matrices:[{titulo:metodo==='lu'?'[U | y]':'Sistema triangular',valores:U.map((fila,j)=>[...fila,rhs[j]]),aumentada:true,fila:i}]});
 }
 const residuos=A.map((fila,i)=>fila.reduce((s,a,j)=>s+a*x[j],0)-b[i]);
 const norma=Math.max(...residuos.map(Math.abs));
 q.push(pn('b-residuo','¿Cuánto vale la norma infinita del residuo, ‖Ax − b‖∞?',norma,'Es el mayor valor absoluto de las diferencias entre los dos miembros de las ecuaciones.'));
 guia.push({titulo:'Validar en el sistema original',explicacion:'Sustituye el vector completo en cada ecuación original. Un residuo pequeño indica buena satisfacción del sistema; el condicionamiento también influye en la sensibilidad de la solución.',cuentas:A.map((fila,i)=>cuenta(`Ecuación ${i+1}`,`${fila.map((a,j)=>`(${f(a)})*(${f(x[j])})`).join(' + ')} ≈ ${f(b[i])}`)),resultado:`‖A · x − b‖∞ ≈ ${f(norma)}`,pregunta:q[4],matrices:[{titulo:'Vector solución x',valores:x.map(v=>[v])},{titulo:'Residuo Ax − b',valores:residuos.map(v=>[v])}]});
 return {...e,guia,cuestionario:[...(e.cuestionario??[]),...q],formatoRespuesta:'vector',resolucion:{valorCorrecto:x,tolerancia:1e-5,etiqueta:'Vector x (en orden)',respuestaFinalTexto:`x = (${x.map(f).join('; ')}). Residuo ∞ ≈ ${f(norma)}.`},conclusion:`x = (${x.map(f).join('; ')}). ‖Ax − b‖∞ ≈ ${f(norma)}.`};
}

/** El ejercicio original de Gauss incluye rectas coincidentes: se diagnostica, sin inventar un vector. */
function diagnosticoSingular(e:EjercicioSistema):ConGuia<EjercicioSistema> {
 const {A,b}=e.calculo;
 const inicial=A.map((fila,i)=>[...fila,b[i]]),M=copia(inicial);
 if(Math.abs(M[1][0])>Math.abs(M[0][0]))[M[0],M[1]]=[M[1],M[0]];
 const pivot=copia(M),factor=M[1][0]/M[0][0];
 M[1]=M[1].map((v,j)=>v-factor*M[0][j]);
 const compatible=Math.abs(M[1][2])<1e-10;
 const clasificacion=compatible?'Infinitas soluciones.':'Ninguna solución.';
 const q=[
  pn('b-dimension','¿Cuántas incógnitas tiene el sistema?',2,'La matriz de coeficientes tiene dos columnas.'),
  pn('b-factor','¿Qué multiplicador anula la primera entrada de la segunda fila después del pivoteo?',factor,'Divide la entrada que quieres anular entre el pivote.'),
  pn('b-pivote','¿Qué pivote se obtiene después del pivoteo parcial?',M[0][0],'Se elige la fila con el mayor valor absoluto en la primera columna.'),
  pn('b-cero','¿Cuál es el coeficiente de la última incógnita después de eliminar?',M[1][1],'Las ecuaciones tienen coeficientes proporcionales.'),
  pn('b-total','¿Cuál es el término independiente de la última fila después de eliminar?',M[1][2],'La operación también se aplica a la columna b.'),
  pregunta('b-clase','¿Cuántas soluciones tiene este sistema?',clasificacion,[compatible?'Ninguna solución.':'Infinitas soluciones.','Exactamente una.','Exactamente dos.'],'Una fila 0 = 0 no añade una restricción; una fila 0 = c con c distinto de cero es incompatible.'),
  pregunta('b-singular','¿Qué indica el pivote final nulo?','Que no se puede obtener una solución única por sustitución.',['Que x es el vector cero.','Que basta repetir cien veces.','Que se debe dividir por cero.'],'El rango no alcanza el número de incógnitas.'),
  pregunta('b-operacion','¿Dónde se aplica una operación elemental?','En toda la fila, incluido el término independiente.',['Solo en b.','Solo en la diagonal.','Solo en la incógnita que se despeja.'],'Se conserva la equivalencia del sistema al operar toda la ecuación.'),
  pregunta('b-division','¿Qué se debe hacer al encontrar un pivote nulo sin reemplazo?','Analizar la compatibilidad, sin dividir por cero.',['Dividir por cero.','Asignar cero a todas las incógnitas.','Borrar la fila y declarar unicidad.'],'Un pivote nulo requiere un diagnóstico del sistema.'),
  pregunta('b-criterio','¿El fallo se resuelve aumentando iteraciones?','No: la dependencia entre las ecuaciones es algebraica.',['Sí: siempre con diez más.','Sí: cambiando la semilla.','Sí: redondeando los coeficientes.'],'Gauss es un método directo; la singularidad no es una falta de convergencia.'),
  pregunta('b-validacion','¿Cómo compruebas un candidato a solución?','Sustituyéndolo en ambas ecuaciones originales.',['Mirando solo la matriz singular.','Exigiendo que las incógnitas sean positivas.','Ignorando el lado derecho.'],'Cada ecuación original debe cumplirse.')
 ];
 const guia:EtapaPractica[]=[
  {titulo:'Leer las ecuaciones',explicacion:'Antes de despejar, examina la relación entre las dos filas.',cuentas:[cuenta('Sistema original',e.ecuacion)],resultado:'n = 2',pregunta:q[0],matrices:[{titulo:'[A | b]',valores:inicial,aumentada:true}]},
  {titulo:'Elegir el pivote',explicacion:'Ubica la mayor entrada en valor absoluto de la primera columna.',cuentas:[cuenta('Pivote elegido',`a₁₁ = ${f(M[0][0])}`)],resultado:`pivote = ${f(M[0][0])}`,pregunta:q[2],matrices:[{titulo:'Después del pivoteo',valores:pivot,aumentada:true,fila:0}]},
  {titulo:'Eliminar la segunda fila',explicacion:'Resta el múltiplo de la primera fila y observa qué queda en el lado derecho.',cuentas:[{etiqueta:'Multiplicador',numerador:f(pivot[1][0]),denominador:f(pivot[0][0])},cuenta('Eliminar',`R₂ ← R₂ − (${f(factor)}) · R₁`)],resultado:`0 = ${f(M[1][2])}`,pregunta:q[1],matrices:[{titulo:'Después de eliminar',valores:M,aumentada:true,fila:1}]},
  {titulo:'Interpretar la fila final',explicacion:compatible?'La fila 0 = 0 es una identidad: queda una ecuación independiente y una variable libre.':'La fila 0 = c, con c distinto de cero, es una contradicción.',cuentas:[cuenta('Fila final',`0*x₁ + 0*x₂ = ${f(M[1][2])}`)],resultado:clasificacion,pregunta:q[5]},
  {titulo:'Concluir sin dividir por cero',explicacion:'El diagnóstico forma parte de resolver el problema: no se debe inventar un vector solución único.',cuentas:[cuenta('Pivote final',`a₂₂ = ${f(M[1][1])}`)],resultado:clasificacion,pregunta:q[8]}
 ];
 return {...e,guia,cuestionario:[...(e.cuestionario??[]),...q],resolucion:undefined,conclusion:clasificacion};
}
