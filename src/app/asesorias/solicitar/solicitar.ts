import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsesoriasService } from '../../core/services/asesorias';
import { NotificacionesService } from '../../core/services/notificaciones';
import { AuthService } from '../../core/services/auth';
import { Asesoria } from '../../core/models/asesoria.interface';
import { Notificacion } from '../../core/models/notificacion.interface';

@Component({
  selector: 'app-solicitar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitar.html',
  styleUrls: ['./solicitar.scss']
})
export class Solicitar implements OnInit {
  solicitudes: Asesoria[] = [];

  private asesoriasService = inject(AsesoriasService);
  private notificacionesService = inject(NotificacionesService);
  private auth = inject(AuthService);

  async ngOnInit() {
    await this.cargarSolicitudes();
  }

  async cargarSolicitudes() {
    const user = await new Promise<any>(resolve => {
      this.auth.userData$.subscribe(u => resolve(u));
    });
    if (!user) return;

    this.solicitudes = await this.asesoriasService.getSolicitudesPendientes(user.uid);
  }

  async responder(asesoria: Asesoria, estado: 'Aprobada' | 'Rechazada', respuesta?: string) {
    if (!asesoria.id) return;

    // 1. Actualizar estado en Firestore
    await this.asesoriasService.actualizarEstado(asesoria.id, estado, respuesta);

    // 2. Crear objeto Notificacion completo
    const notificacion: Notificacion = {
      userId: asesoria.clienteId,
      type: estado === 'Aprobada' ? 'aprobacion' : 'rechazo',
      message: estado === 'Aprobada'
        ? `Tu solicitud fue aprobada por ${asesoria.programadorNombre}`
        : `Tu solicitud fue rechazada por ${asesoria.programadorNombre}. ${respuesta || ''}`,
      relatedAsesoriaId: asesoria.id,
      createdAt: new Date(),
      read: false
    };

    // 3. Enviar notificación
    await this.notificacionesService.enviarNotificacion(notificacion);

    // 4. Refrescar lista
    await this.cargarSolicitudes();
  }
}
