export interface Asesoria {
  id?: string;
  clienteId: string;      // ID del usuario que pide la cita
  clienteNombre: string;  // Nombre para mostrar al programador
  clienteEmail: string;
  programadorId: string;  // A quién va dirigida
  programadorNombre: string; // Para mostrar en historial
  fecha: string;          // Ej: 2023-11-20
  hora: string;           // Ej: 10:00
  tema: string;           // Motivo de la consulta
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
  respuesta?: string;     // Mensaje opcional del programador
  //comentario de prueba
}