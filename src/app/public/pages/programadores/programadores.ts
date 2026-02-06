import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsuariosService } from '../../../core/services/usuarios.service';

@Component({
  selector: 'app-programadores',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './programadores.html',
  styleUrls: ['./programadores.scss']
})
export class ProgramadoresComponent implements OnInit {
  private service = inject(UsuariosService);
  
  // Usamos esta variable simple en lugar de un Observable con $
  public programadores: any[] = [];

  ngOnInit(): void {
    this.cargarProgramadores();
  }

  cargarProgramadores(): void {
    this.service.listarProgramadores().subscribe({
      next: (res: any[]) => {
        // Filtramos para asegurar que solo se muestren programadores
        this.programadores = res.filter((u: any) => {
          const rol = (u.rol || u.persona?.rol || u.per_rol || '').toUpperCase();
          return rol === 'PROGRAMADOR';
        });
      },
      error: (err: any) => console.error("Error al cargar programadores:", err)
    });
  }
}