import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicFooter } from '../../layout/public-footer/public-footer';

@Component({
  selector: 'app-welcome',
  imports: [RouterLink, PublicFooter],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
})
export class Welcome implements OnInit {
  /** Controls whether the splash overlay exists in the DOM at all. */
  readonly showOverlay = signal(!(history.state as { skipIntro?: boolean })?.skipIntro);

  /** Controls whether the overlay is currently fading out (triggers the CSS transition). */
  readonly isFadingOut = signal(false);

  ngOnInit(): void {
    if (this.showOverlay()) {
      setTimeout(() => this.isFadingOut.set(true), 800);
    }
  }

  /** Called once the CSS opacity transition on the overlay finishes. */
  onOverlayTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName === 'opacity') {
      this.showOverlay.set(false);
    }
  }
}
