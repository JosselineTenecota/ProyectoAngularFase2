import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../core/services/usuarios.service';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard implements OnInit {
  private usuariosService = inject(UsuariosService);

  // Lista reactiva de usuarios
  private usersSubject = new BehaviorSubject<any[]>([]);
  users$ = this.usersSubject.asObservable();

  // Variables para edición y creación
  editingId: string | null = null;
  editForm: any = {};
  showCreateModal = false;
  
  newUser: any = { 
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
      next: (data) => {
        console.log('Datos recibidos del servidor:', data);
        this.usersSubject.next(data);
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        Swal.fire('Error', 'No se pudo obtener la lista de usuarios. Revisa la consola de Eclipse.', 'error');
      }
    });
  }

  // Lógica de Edición
  startEdit(user: any) {
    this.editingId = user.correo;
    this.editForm = { 
      ...user,
      nombre: user.persona?.nombre || user.persona?.per_nombre || ''
    };
  }

  cancelEdit() {
    this.editingId = null;
    this.editForm = {};
  }

  saveUser() {
    this.usuariosService.actualizar(this.editForm).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Actualizado correctamente', timer: 1500, showConfirmButton: false });
        this.cargarUsuarios();
        this.cancelEdit();
      },
      error: () => Swal.fire('Error', 'Error al actualizar el usuario', 'error')
    });
  }

  // Lógica de Eliminación
  deleteUser(correo: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "El usuario se eliminará permanentemente de PostgreSQL",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuariosService.eliminar(correo).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El usuario ha sido borrado.', 'success');
            this.cargarUsuarios();
          }
        });
      }
    });
  }

  // Lógica de Creación
  toggleCreateModal() {
    this.showCreateModal = !this.showCreateModal;
    if (!this.showCreateModal) {
      this.newUser = { cedula: '', nombre: '', correo: '', password: '123', rol: 'CLIENTE' };
    }
  }

  createUser() {
    this.usuariosService.registrar(this.newUser).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Usuario registrado', timer: 1500, showConfirmButton: false });
        this.cargarUsuarios();
        this.toggleCreateModal();
      },
      error: () => Swal.fire('Error', 'No se pudo registrar el usuario', 'error')
    });
  }
}