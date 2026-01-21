import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { Programador } from '../../../core/models/programadores.interface';
import { ProgramadoresService } from '../../../services/programadores';

@Component({
  selector: 'app-programadores',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './programadores.html',
  styleUrls: ['./programadores.scss']
})
export class Programadores implements OnInit {

  programmers$!: Observable<Programador[]>;
  loading = true;

  constructor(private programadoresService: ProgramadoresService) {}

  ngOnInit() {
    this.programmers$ = this.programadoresService.getProgramadores();

    // Opcional: ocultar loader cuando lleguen los datos
    this.programmers$.subscribe(() => this.loading = false);
  }
}
