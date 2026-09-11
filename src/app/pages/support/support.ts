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
/** Displays the support page and provides navigation back to the previous page. */
export class Support {
  /** Provides access to the browser history. */
  private location = inject(Location);

  /** Navigates back to the previously visited page. */
  goBack(): void {
    this.location.back();
  }
}
