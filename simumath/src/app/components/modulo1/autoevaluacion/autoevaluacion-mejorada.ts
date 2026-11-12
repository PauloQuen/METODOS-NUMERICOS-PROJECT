import { Component, computed, inject } from '@angular/core';
import { BloqueEjercicio } from '../../../shared/domain/bloque-ejercicio/bloque-ejercicio';
import { SesionPracticaService } from '../../../shared/practica-guiada/sesion-practica.service';
import { politicaDeMetodoM1 } from '../autoevaluacion.config';
import { CATALOGO_MODULO1 } from './bancos/catalogo';
@Component({
  selector:'app-autoevaluacion-mejorada',standalone:true,imports:[BloqueEjercicio],
  templateUrl:'./autoevaluacion-mejorada.html',styleUrl:'./autoevaluacion-mejorada.scss',
})
export class AutoevaluacionMejorada {
  private readonly sesion=inject(SesionPracticaService);
  readonly grupos=CATALOGO_MODULO1.map(g=>({...g,
    tanda:this.sesion.tanda(`modulo1/transversal/${g.metodo}`,g.banco),
    desbloqueo:politicaDeMetodoM1(g.tipo,g.metodo),
  }));
  readonly ejercicios=computed(()=>this.grupos.map(g=>({...g,ejercicio:g.tanda()[0]})));
  nuevaTanda():void{for(const g of this.grupos)this.sesion.renovar(`modulo1/transversal/${g.metodo}`,g.banco);}
}
