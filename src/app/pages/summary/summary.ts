import { Component } from '@angular/core';
import { Header } from '../../layout/header/header';
import { Navbar } from '../../layout/navbar/navbar';

@Component({
  selector: 'app-summary',
  imports: [Header, Navbar],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary {}
