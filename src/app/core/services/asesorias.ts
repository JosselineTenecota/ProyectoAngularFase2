import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Asesoria } from '../models/asesoria.interface';

@Injectable({ providedIn: 'root' })
export class AsesoriasService {
  private firestore = inject(Firestore);

  // Crear nueva asesoría
  async crearAsesoria(asesoria: Asesoria) {
    const docRef = await addDoc(collection(this.firestore, 'asesorias'), asesoria);
    return docRef;
  }

  // Obtener asesorías pendientes de un programador
  async getSolicitudesPendientes(programadorId: string): Promise<Asesoria[]> {
    const ref = collection(this.firestore, 'asesorias');
    const q = query(ref, where('programadorId', '==', programadorId), where('estado', '==', 'Pendiente'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Asesoria));
  }

  // Actualizar estado de una asesoría
  async actualizarEstado(id: string, estado: 'Aprobada' | 'Rechazada', respuesta?: string) {
    const docRef = doc(this.firestore, 'asesorias', id);
    await updateDoc(docRef, { estado, respuesta: respuesta || '' });
  }
}
