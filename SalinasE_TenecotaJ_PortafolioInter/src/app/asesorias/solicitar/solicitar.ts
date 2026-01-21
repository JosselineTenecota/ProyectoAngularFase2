import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Asesoria } from '../../core/models/asesoria.interface';

@Component({
  selector: 'app-solicitar', 
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './solicitar.html',
  styleUrls: ['./solicitar.scss']
})
export class Solicitar implements OnInit { 
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  misSolicitudes$!: Observable<Asesoria[]>;

  ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      this.cargarMisSolicitudes(user.uid);
    }
  }

  cargarMisSolicitudes(uid: string) {
    const asesoriaRef = collection(this.firestore, 'asesorias');
    // Busca las citas donde el cliente sea el usuario actual
    const q = query(asesoriaRef, where('clienteId', '==', uid));
    this.misSolicitudes$ = collectionData(q, { idField: 'id' }) as Observable<Asesoria[]>;
  }
}