export interface Notificacion {
  id?: string;
  userId: string;               // Quien recibe la notificación
  type: 'solicitud' | 'aprobacion' | 'rechazo';
  message: string;
  createdAt: any;               // Timestamp de Firebase
  read: boolean;
  relatedAsesoriaId?: string;   // Para enlazar con la asesoría
}
