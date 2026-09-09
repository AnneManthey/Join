import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Header } from '../../layout/header/header';
import { Navbar } from '../../layout/navbar/navbar';

@Component({
  selector: 'app-support',
  imports: [Header, Navbar],
  templateUrl: './support.html',
  styleUrl: './support.scss',
})
export class Support {
  private location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
