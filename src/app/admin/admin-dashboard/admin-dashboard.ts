import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, doc, updateDoc, deleteDoc, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Programador } from '../../core/models/programador.interface';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard implements OnInit {
  private firestore = inject(Firestore);

  users$!: Observable<Programador[]>;
  editingId: string | null = null;
  editForm: any = {};
  showCreateModal = false;
  newUser: any = { displayName: '', email: '', role: 'programador' };

  horasPosibles: string[] = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  ngOnInit() {
    const usersRef = collection(this.firestore, 'users');
    this.users$ = collectionData(usersRef, { idField: 'uid' }) as Observable<Programador[]>;
  }

  startEdit(user: Programador) {
    this.editingId = user.uid;
    this.editForm = { 
      ...user,
      horaInicio: user.horaInicio || '08:00',
      horaFin: user.horaFin || '17:00',
      contactUrl: user.contactUrl || '',
      socialUrl: user.socialUrl || ''
    }; 
  }

  cancelEdit() {
    this.editingId = null;
    this.editForm = {};
  }

  async saveUser() {
    if (!this.editingId) return;
    const userRef = doc(this.firestore, `users/${this.editingId}`);
    
    try {
      await updateDoc(userRef, {
        displayName: this.editForm.displayName,
        role: this.editForm.role,
        specialty: this.editForm.specialty || '',
        description: this.editForm.description || '',
        horaInicio: this.editForm.horaInicio,
        horaFin: this.editForm.horaFin,
        contactUrl: this.editForm.contactUrl || '',
        socialUrl: this.editForm.socialUrl || ''
      });

    
      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: 'Los datos del usuario se han guardado correctamente.',
        timer: 1500,
        showConfirmButton: false
      });

      this.cancelEdit();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
    }
  }

  async deleteUser(uid: string) {
    
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Se eliminará este usuario y no podrás recuperarlo.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(this.firestore, `users/${uid}`));
      Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
    }
  }

  toggleCreateModal() {
    this.showCreateModal = !this.showCreateModal;
    if(this.showCreateModal) this.newUser = { displayName: '', email: '', role: 'programador' };
  }

  async createUser() {
  
    if (!this.newUser.displayName || !this.newUser.email) {
      Swal.fire('Faltan datos', 'Nombre y Correo son obligatorios', 'warning');
      return;
    }

    try {
      await addDoc(collection(this.firestore, 'users'), {
        ...this.newUser,
        createdAt: new Date(),
        horaInicio: '08:00',
        horaFin: '17:00',
        contactUrl: '',
        socialUrl: ''
      });

     
      Swal.fire({
        icon: 'success',
        title: 'Usuario Creado',
        text: 'Se ha registrado el nuevo usuario exitosamente.',
        timer: 1500,
        showConfirmButton: false
      });

      this.toggleCreateModal();
    } catch (error) { 
      console.error(error); 
      Swal.fire('Error', 'No se pudo crear el usuario', 'error');
    }
  }
}