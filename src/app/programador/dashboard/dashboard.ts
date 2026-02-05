import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
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
  asesorias$: Observable<any[]> = of([]);

  // Objeto inicial con todos los campos necesarios para tu portafolio
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
      const activeUser = user || this.authService.currentUser;
      if (activeUser?.cedula) {
        this.currentUser = activeUser;
        this.loadMyProjects(activeUser.cedula);
      }
    });
  }

  loadMyProjects(cedula: string) {
    if (!cedula) return;
    this.proyectosService.getProyectosPorProgramador(cedula).subscribe(all => {
      // Filtrado por tipo (normalizado para evitar errores de mayúsculas)
      this.academicos$ = of(all.filter(p => this.norm(p.tipo) === 'academico'));
      this.laborales$ = of(all.filter(p => this.norm(p.tipo) === 'laboral'));
    });
  }

  private norm(t: string): string {
    return t ? t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
  }

  addProject() {
    if (!this.currentUser?.cedula) return;

    // Se envían TODOS los atributos que requiere tu portafolio
    const proyectoData: Proyecto = {
      titulo: this.newProject.titulo,
      descripcion: this.newProject.descripcion,
      tipo: this.newProject.tipo,
      participacion: this.newProject.participacion,
      tecnologias: this.newProject.tecnologias,
      urlRepo: this.newProject.urlRepo,
      urlDeploy: this.newProject.urlDeploy
    };

    this.proyectosService.crearProyecto(proyectoData, this.currentUser.cedula).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Proyecto guardado con todos sus detalles', 'success');
        this.loadMyProjects(this.currentUser.cedula);
        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo guardar. Revisa la consola.', 'error');
      }
    });
  }

  deleteProject(codigo?: number) {
    if (!codigo) return;
    this.proyectosService.eliminar(codigo).subscribe(() => this.loadMyProjects(this.currentUser.cedula));
  }

  resetForm() {
    this.newProject = { 
      titulo: '', 
      descripcion: '', 
      tipo: 'Academico', 
      participacion: 'Frontend', 
      tecnologias: '', 
      urlRepo: '', 
      urlDeploy: '' 
    };
  }
}