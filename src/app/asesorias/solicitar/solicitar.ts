import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { AuthService } from '../../core/services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-solicitar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitar.html',
  styleUrls: ['./solicitar.scss']
})
export class Solicitar implements OnInit {

  solicitudes: any[] = [];

  constructor(
    private firestore: Firestore,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    await this.cargarSolicitudes();
  }

  // ------------------------------------------------------
  // 1. Cargar SOLO las solicitudes del programador logueado
  // ------------------------------------------------------
  async cargarSolicitudes() {
    const user = await new Promise<any>(resolve => {
      this.auth.userData$.subscribe(u => resolve(u));
    });

    if (!user) return;

    console.log("UID del programador logueado:", user.uid);

    const ref = collection(this.firestore, "asesorias");

    const q = query(
      ref,
      where("programadorId", "==", user.uid),
      where("estado", "==", "Pendiente")
    );

    const snap = await getDocs(q);

    this.solicitudes = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    console.log("Solicitudes encontradas:", this.solicitudes);
  }

  // ------------------------------------------------------
  // 2. Aceptar solicitud
  // ------------------------------------------------------
  async aceptar(id: string) {
    await updateDoc(doc(this.firestore, "asesorias", id), {
      estado: "Aceptada"
    });

    alert("Solicitud aceptada.");
    this.cargarSolicitudes();
  }

  // ------------------------------------------------------
  // 3. Rechazar solicitud
  // ------------------------------------------------------
  async rechazar(id: string) {
    await updateDoc(doc(this.firestore, "asesorias", id), {
      estado: "Rechazada"
    });

    alert("Solicitud rechazada.");
    this.cargarSolicitudes();
  }
}
