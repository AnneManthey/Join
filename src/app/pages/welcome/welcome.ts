import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicFooter } from '../../layout/public-footer/public-footer';

@Component({
  selector: 'app-welcome',
  imports: [RouterLink, PublicFooter],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
})
export class Welcome {}
