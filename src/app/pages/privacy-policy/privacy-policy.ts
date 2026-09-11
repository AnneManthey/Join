import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Header } from '../../layout/header/header';
import { Navbar } from '../../layout/navbar/navbar';

@Component({
  selector: 'app-privacy-policy',
  imports: [Header, Navbar],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
/** Displays the privacy policy and provides navigation back to the previous page. */
export class PrivacyPolicy {
  /** Provides access to the browser history. */
   private location = inject(Location);

  /** Navigates back to the previously visited page. */
  goBack(): void {
    this.location.back();
  }
}
