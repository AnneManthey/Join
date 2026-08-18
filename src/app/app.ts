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
    
    void this.dataService.getContacts();contact_name:"Testi Testerine"

    this.dataService.addContact({contact_name: 'Testi Testerine', contact_mail: 'test@testerine.com', contact_phone: '+49 555 5 55'})
  }
}
