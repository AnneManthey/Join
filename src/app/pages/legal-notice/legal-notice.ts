import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Header } from '../../layout/header/header';
import { Navbar } from '../../layout/navbar/navbar';

@Component({
  selector: 'app-legal-notice',
  imports: [Header, Navbar],
  templateUrl: './legal-notice.html',
  styleUrl: './legal-notice.scss',
})
export class LegalNotice {
  private location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
