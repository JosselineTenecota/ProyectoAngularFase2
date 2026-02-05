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
    // El 'id' de la URL debe ser la CÉDULA de la persona para que Postgres filtre bien
    const cedula = this.route.snapshot.paramMap.get('id'); 
    
    if (cedula) {
      this.proyectos$ = this.proyectosService.getProyectosPorProgramador(cedula);
      
      this.proyectos$.subscribe({
        next: () => this.loading = false,
        error: (err) => {
          console.error('Error cargando proyectos de Postgres:', err);
          this.loading = false;
        }
      });
    }
  }
}