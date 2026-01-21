import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Programador } from '../core/models/programadores.interface';

@Injectable({
  providedIn: 'root'
})
export class ProgramadoresService {
  private firestore = inject(Firestore);

  getProgramadores(): Observable<Programador[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('role', '==', 'programador'));
    
    return collectionData(q, { idField: 'uid' }) as Observable<Programador[]>;
  }
}
