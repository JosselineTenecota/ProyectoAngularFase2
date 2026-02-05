import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-programadores',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // Asegúrate de que HttpClientModule esté aquí
  template: `
    <div style="color: white; padding: 20px;">
      <h2>Lista de Programadores</h2>
      <button (click)="cargarManual()">Forzar Carga desde Postgres</button>
      
      <div *ngFor="let p of lista">
        <p>{{ p.nombre }} - {{ p.especialidad }}</p>
      </div>
      
      <p *ngIf="lista.length === 0">No se encontraron datos en el servidor.</p>
    </div>
  `
})
export class Programadores implements OnInit {
  private service = inject(UsuariosService);
  lista: any[] = [];

  ngOnInit() {
    this.cargarManual();
  }

  cargarManual() {
    console.log("Intentando conectar con Java...");
    this.service.listarProgramadores().subscribe({
      next: (res) => {
        console.log("Respuesta de Postgres:", res);
        this.lista = res;
      },
      error: (err) => {
        console.error("Error de conexión:", err);
        alert("El servidor Java no responde. Revisa WildFly.");
      }
    });
  }
}