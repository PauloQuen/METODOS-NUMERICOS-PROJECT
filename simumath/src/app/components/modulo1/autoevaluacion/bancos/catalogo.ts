import { crearBancoRaices, type MetodoRaices } from './crear-banco';
import { EJERCICIOS_BISECCION } from '../../tipos/cerrados/biseccion/biseccion.contenido';
import { EJERCICIOS_REGLA_FALSA } from '../../tipos/cerrados/regla-falsa/regla-falsa.contenido';
import { EJERCICIOS_NEWTON } from '../../tipos/abiertos/newton-raphson/newton-raphson.contenido';
import { EJERCICIOS_SECANTE } from '../../tipos/abiertos/secante/secante.contenido';
import { EJERCICIOS_PUNTO_FIJO } from '../../tipos/abiertos/punto-fijo/punto-fijo.contenido';
import { EJERCICIOS_CARDANO } from '../../tipos/polinomios/cardano/cardano.contenido';
/** También alimenta la práctica transversal, con un ejercicio de cada método. */
export const CATALOGO_MODULO1 = [
  {metodo:'biseccion',nombre:'Bisección',tipo:'cerrados',base:EJERCICIOS_BISECCION},
  {metodo:'regla-falsa',nombre:'Regla falsa',tipo:'cerrados',base:EJERCICIOS_REGLA_FALSA},
  {metodo:'newton-raphson',nombre:'Newton-Raphson',tipo:'abiertos',base:EJERCICIOS_NEWTON},
  {metodo:'secante',nombre:'Secante',tipo:'abiertos',base:EJERCICIOS_SECANTE},
  {metodo:'punto-fijo',nombre:'Punto fijo',tipo:'abiertos',base:EJERCICIOS_PUNTO_FIJO},
  {metodo:'cardano',nombre:'Cardano',tipo:'polinomios',base:EJERCICIOS_CARDANO},
].map(g=>({...g,banco:crearBancoRaices(g.base,g.metodo as MetodoRaices)}));
