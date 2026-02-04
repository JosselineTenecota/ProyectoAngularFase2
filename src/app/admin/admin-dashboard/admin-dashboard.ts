import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../core/services/usuarios.service';
import { Usuario } from '../../core/models/usuario.model';
import { RegistroDTO } from '../../core/models/registro.dto';
import Swal from 'sweetalert2'; 
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard implements OnInit {
  private usuariosService = inject(UsuariosService);

  private usersSubject = new BehaviorSubject<any[]>([]);
  users$ = this.usersSubject.asObservable();

  editingId: string | null = null;
  editForm: any = {};
  showCreateModal = false;
  
  newUser: RegistroDTO = { 
    cedula: '',
    nombre: '', 
    correo: '', 
    password: '123', 
    rol: 'CLIENTE'
  };

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosService.listar().subscribe({
      next: (data) => this.usersSubject.next(data),
      error: (err) => console.error('Error cargando desde Java:', err)
    });
  }

  // Corregido: Usamos 'any' para evitar que TS reclame por propiedades inexistentes
  startEdit(user: any) {
    this.editingId = user.correo; 
    this.editForm = { 
      ...user,
      // Mapeamos el nombre para que el input de edición lo encuentre fácil
      nombre: user.persona?.nombre || user.persona?.per_nombre || user.nombre 
    }; 
  }

  cancelEdit() {
    this.editingId = null;
    this.editForm = {};
  }

  saveUser() {
    if (!this.editingId) return;
    this.usuariosService.actualizar(this.editForm).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1500, showConfirmButton: false });
        this.cargarUsuarios();
        this.cancelEdit();
      },
      error: () => Swal.fire('Error', 'No se pudo actualizar', 'error')
    });
  }

  deleteUser(correo: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Se eliminará permanentemente de PostgreSQL.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuariosService.eliminar(correo).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Usuario borrado', 'success');
            this.cargarUsuarios();
          }
        });
      }
    });
  }

  toggleCreateModal() {
    this.showCreateModal = !this.showCreateModal;
    if(this.showCreateModal) {
      this.newUser = { cedula: '', nombre: '', correo: '', password: '123', rol: 'CLIENTE' };
    }
  }

  createUser() {
    if (!this.newUser.cedula || !this.newUser.nombre || !this.newUser.correo) {
      Swal.fire('Atención', 'Cédula, Nombre y Correo son obligatorios', 'warning');
      return;
    }

    this.usuariosService.registrar(this.newUser).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Guardado en DB', timer: 1500, showConfirmButton: false });
        this.cargarUsuarios();
        this.toggleCreateModal();
      },
      error: () => Swal.fire('Error', 'El servidor rechazó el registro', 'error')
    });
  }
}