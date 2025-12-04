import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, doc, updateDoc, deleteDoc, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Programador } from '../../core/models/programador.interface';
import { FormsModule } from '@angular/forms';

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
  newUser: any = { displayName: '', email: '', role: 'programador', specialty: '', description: '' };

  // --- LISTA MAESTRA DE HORAS (Para elegir inicio y fin) ---
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
    // Cargamos los datos existentes o valores por defecto
    this.editForm = { 
      ...user,
      horaInicio: user.horaInicio || '08:00',
      horaFin: user.horaFin || '17:00'
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
        
        // --- GUARDAMOS EL RANGO SELECCIONADO ---
        horaInicio: this.editForm.horaInicio,
        horaFin: this.editForm.horaFin
      });
      alert('Datos actualizados correctamente');
      this.cancelEdit();
    } catch (error) {
      console.error(error);
      alert('Error al actualizar');
    }
  }

  async deleteUser(uid: string) {
    if(confirm('¿Estás seguro de eliminar este usuario?')) {
      await deleteDoc(doc(this.firestore, `users/${uid}`));
    }
  }

  toggleCreateModal() {
    this.showCreateModal = !this.showCreateModal;
    if(this.showCreateModal) this.newUser = { displayName: '', email: '', role: 'programador' };
  }

  async createUser() {
    try {
      await addDoc(collection(this.firestore, 'users'), {
        ...this.newUser,
        createdAt: new Date(),
        horaInicio: '08:00', // Valor por defecto al crear
        horaFin: '17:00'
      });
      alert('Usuario creado');
      this.toggleCreateModal();
    } catch (error) { console.error(error); }
  }
}