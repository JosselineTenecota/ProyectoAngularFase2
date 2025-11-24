import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home 
{
  menuOpen = false;
}



//Agregacion de nvar responsive y guardado de cambios
