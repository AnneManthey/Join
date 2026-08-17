import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SupabaseService } from './shared/services/supabase-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  readonly dataService = inject(SupabaseService);

  ngOnInit(): void {
    void this.dataService.getContacts();
  }
}
