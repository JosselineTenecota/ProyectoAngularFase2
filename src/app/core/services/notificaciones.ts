import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Notificacion } from '../models/notificacion.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private firestore = inject(Firestore);

  /**
   * Envía una notificación agregándola a la colección 'notificaciones'.
   * Se agrega automáticamente createdAt y read: false.
   */
  async enviarNotificacion(notificacion: Notificacion): Promise<void> {
    await addDoc(collection(this.firestore, 'notificaciones'), {
      ...notificacion,
      createdAt: new Date(), // fecha/hora de creación
      read: false            // inicialmente no leída
    });
  }
}
