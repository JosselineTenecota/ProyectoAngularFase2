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
      // Intentamos capturar el usuario activo
      const activeUser = user || this.authService.currentUser;
      
      // Buscamos per_cedula_fk que es el nombre real en tu BD
      const cedulaIdentificada = activeUser?.per_cedula_fk || activeUser?.cedula;

      if (cedulaIdentificada) {
        this.currentUser = activeUser;
        this.loadMyProjects(cedulaIdentificada);
      }
    });
  }

  loadMyProjects(cedula: string) {
    if (!cedula || cedula === 'undefined') return;
    this.proyectosService.getProyectosPorProgramador(cedula).subscribe({
      next: (all) => {
        this.academicos$ = of(all.filter(p => this.norm(p.tipo) === 'academico'));
        this.laborales$ = of(all.filter(p => this.norm(p.tipo) === 'laboral'));
      },
      error: (err) => console.error("Error cargando proyectos:", err)
    });
  }

  private norm(t: string): string {
    return t ? t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
  }

  async addProject() {
    const userStorage = JSON.parse(localStorage.getItem('user') || '{}');
    
    // PRIORIDAD: per_cedula_fk (Nombre en tu base de datos)
    let idFinal = this.currentUser?.per_cedula_fk || 
                  userStorage.per_cedula_fk || 
                  this.currentUser?.cedula || 
                  userStorage.cedula;

    // Plan de rescate si el login no trajo la relación
    if (!idFinal || idFinal === 'undefined') {
      const { value: cedulaManual } = await Swal.fire({
        title: 'Cédula no detectada',
        text: 'No logramos vincular tu correo con una cédula automáticamente.',
        input: 'text',
        inputLabel: 'Ingresa tu cédula (Ej: 0107478213):',
        showCancelButton: true,
        confirmButtonText: 'Vincular y Guardar',
        inputValidator: (value) => {
          if (!value) return '¡La cédula es obligatoria para la base de datos!';
          return null;
        }
      });

      if (cedulaManual) {
        idFinal = cedulaManual;
      } else {
        return;
      }
    }

    const proyectoData: Proyecto = {
      titulo: this.newProject.titulo,
      descripcion: this.newProject.descripcion,
      tipo: this.newProject.tipo,
      participacion: this.newProject.participacion,
      tecnologias: this.newProject.tecnologias,
      urlRepo: this.newProject.urlRepo,
      urlDeploy: this.newProject.urlDeploy
    };

    Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() });

    this.proyectosService.crearProyecto(proyectoData, idFinal).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Proyecto vinculado a la cédula: ' + idFinal, 'success');
        this.loadMyProjects(idFinal);
        this.resetForm();
      },
      error: (err) => {
        console.error("Error 500:", err);
        Swal.fire('Error de Base de Datos', 'El ID ' + idFinal + ' no existe en la tabla Personas.', 'error');
      }
    });
  }

  deleteProject(codigo?: number) {
    if (!codigo) return;
    const cedula = this.currentUser?.per_cedula_fk || this.currentUser?.cedula;
    this.proyectosService.eliminar(codigo).subscribe(() => this.loadMyProjects(cedula));
  }

  resetForm() {
    this.newProject = { titulo: '', descripcion: '', tipo: 'Academico', participacion: 'Frontend', tecnologias: '', urlRepo: '', urlDeploy: '' };
  }
}