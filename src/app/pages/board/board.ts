import { Component } from '@angular/core';
import { Header } from '../../layout/header/header';
import { Navbar } from '../../layout/navbar/navbar';

@Component({
  selector: 'app-board',
  imports: [Navbar, Header],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {}
