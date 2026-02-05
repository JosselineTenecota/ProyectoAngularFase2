import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { Proyecto } from '../../core/models/proyecto.interface';
import { ProyectosService } from '../../core/services/proyectos';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  private proyectosService = inject(ProyectosService);
  private authService = inject(AuthService);

  currentUser: any = null;
  academicos$: Observable<Proyecto[]> = of([]);
  laborales$: Observable<Proyecto[]> = of([]);

  // ARREGLO: Añadimos la variable que pide el HTML
  asesorias$: Observable<any[]> = of([]);

  submitted = false;

  newProject: any = {
    titulo: '',
    descripcion: '',
    tipo: 'Academico',
    participacion: 'Frontend',
    tecnologias: '',
    urlRepo: '',
    urlDeploy: ''
  };

  ngOnInit() {
    this.authService.userData$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.loadMyProjects(user.cedula);
      } else {
        const fallbackUser = this.authService.currentUser;
        if (fallbackUser) {
          this.currentUser = fallbackUser;
          this.loadMyProjects(fallbackUser.cedula);
        }
      }
    });
  }

  loadMyProjects(cedula: string) {
    if (!cedula) return;
    const allProjects$ = this.proyectosService.getProyectosPorProgramador(cedula);

    this.academicos$ = allProjects$.pipe(
      map(projects => projects.filter(p => p.tipo === 'Academico'))
    );

    this.laborales$ = allProjects$.pipe(
      map(projects => projects.filter(p => p.tipo === 'Laboral'))
    );
  }

  addProject() {
    if (!this.currentUser?.correo) return;

    // Creamos el objeto limpio para evitar enviar IDs nulos o basura
    const proyectoData: Proyecto = {
      titulo: this.newProject.titulo,
      descripcion: this.newProject.descripcion,
      tipo: this.newProject.tipo,
      participacion: this.newProject.participacion,
      tecnologias: this.newProject.tecnologias,
      urlRepo: this.newProject.urlRepo,
      urlDeploy: this.newProject.urlDeploy
    };

    this.proyectosService.crearProyecto(proyectoData, this.currentUser.correo).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Proyecto guardado', 'success');
        this.loadMyProjects(this.currentUser.cedula);
        this.resetForm();
      },
      error: (err) => {
        console.error("Error detallado:", err);
        Swal.fire('Error', 'Error de persistencia en PostgreSQL (programador_id null)', 'error');
      }
    });
  }

  deleteProject(codigo: number) {
    if (!codigo) return;
    this.proyectosService.eliminar(codigo).subscribe(() => {
      this.loadMyProjects(this.currentUser.cedula);
      Swal.fire('Eliminado', 'Proyecto borrado', 'success');
    });
  }

  resetForm() {
    this.submitted = false;
    this.newProject = {
      titulo: '', descripcion: '', tipo: 'Academico',
      participacion: 'Frontend', tecnologias: '', urlRepo: '', urlDeploy: ''
    };
  }
}