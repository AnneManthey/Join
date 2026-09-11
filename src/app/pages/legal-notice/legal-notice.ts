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
/** Displays the legal notice and provides navigation back to the previous page. */
export class LegalNotice {
  /** Provides access to the browser history. */
  private location = inject(Location);

  /** Navigates back to the previously visited page. */
  goBack(): void {
    this.location.back();
  }
}
