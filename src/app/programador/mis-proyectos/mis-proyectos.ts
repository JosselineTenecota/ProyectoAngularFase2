import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Proyecto } from '../../core/models/proyecto.interface';
import { ProyectosService } from '../../core/services/proyectos';


@Component({
  selector: 'app-mis-proyectos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-proyectos.html',
  styleUrls: ['./mis-proyectos.scss']
})
export class MisProyectos implements OnInit {

  proyectos$!: Observable<Proyecto[]>;
  loading = true;

  private route = inject(ActivatedRoute);
  private proyectosService = inject(ProyectosService);

  ngOnInit() {
    const uid = this.route.snapshot.paramMap.get('id'); // debe coincidir con programmerId
    if (uid) {
      this.proyectos$ = this.proyectosService.getProyectosPorProgramador(uid);

      // Para quitar el loader cuando ya haya datos
      this.proyectos$.subscribe(() => this.loading = false);
    }
  }
}
