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

  private usersSubject = new BehaviorSubject<any[]>([]);
  users$ = this.usersSubject.asObservable();

  editingId: string | null = null;
  editForm: any = {};
  showCreateModal = false;

  newUser: any = {
    cedula: '',
    nombre: '',
    correo: '',
    password: '123',
    rol: 'CLIENTE',
    telefono: '' // Implementado para WhatsApp
  };

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosService.listar().subscribe({
      next: (data) => {
        this.usersSubject.next(data);
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        Swal.fire('Error', 'No se pudo obtener la lista de usuarios.', 'error');
      }
    });
  }

  startEdit(user: any) {
    this.editingId = user.correo;
    // Clonamos el objeto y mapeamos campos temporales para los inputs
    this.editForm = {
      ...user,
      tempNombre: user.persona?.nombre || '',
      tempTelefono: user.persona?.telefono || '' // Cargamos el teléfono actual
    };
  }

  cancelEdit() {
    this.editingId = null;
    this.editForm = {};
  }

  saveUser() {
    // Construimos el objeto respetando la estructura de Usuario.java y Persona.java
    const usuarioLimpio = {
      correo: this.editForm.correo,
      rol: this.editForm.rol,
      activo: this.editForm.activo,
      persona: {
        ...this.editForm.persona, // Mantiene la cédula y otros datos
        nombre: this.editForm.tempNombre,
        telefono: this.editForm.tempTelefono // Enviamos el teléfono actualizado
      }
    };

    this.usuariosService.actualizar(usuarioLimpio as any).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: '¡Actualizado!', timer: 1500, showConfirmButton: false });
        this.cargarUsuarios();
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Error del servidor:', err);
        Swal.fire('Error', 'El servidor rechazó los datos. Revisa el @PUT en Java.', 'error');
      }
    });
  }

  deleteUser(correo: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "El usuario se desactivará en la base de datos.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuariosService.eliminar(correo).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Operación exitosa.', 'success');
            this.cargarUsuarios();
          }
        });
      }
    });
  }

  toggleCreateModal() {
    this.showCreateModal = !this.showCreateModal;
    if (!this.showCreateModal) {
      this.newUser = { cedula: '', nombre: '', correo: '', password: '123', rol: 'CLIENTE', telefono: '' };
    }
  }

  createUser() {
    this.usuariosService.registrar(this.newUser).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Usuario registrado', timer: 1500, showConfirmButton: false });
        this.cargarUsuarios();
        this.toggleCreateModal();
      },
      error: () => Swal.fire('Error', 'No se pudo registrar. Revisa RegistroDTO.', 'error')
    });
  }
}