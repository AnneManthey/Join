import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-list',
  imports: [],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList {
  contacts: { name: string; email: string }[] = [
    {
      name: 'Benedikt Ziegler',
      email: 'benedikt@gmail.com'
    },
    {
      name: 'Anton Mayer',
      email: 'antonm@gmail.com'
    },
    {
      name: 'Barbara Schöneberger',
      email: 'schoenberger@hotmail.com'
    },
        {
      name: 'Edith Peters',
      email: 'peters@hotmail.com'
    }

  ];
// localeCompare für Umlaute (z.B. damit Özdemir bei = einsortiert wird)
  ngOnInit() {
    this.contacts.sort((a, b) => a.name.localeCompare(b.name));
    console.log(this.contacts);
  };

  // to do: fallback, falls nur ein name existiert
  // to do: als pipe auslagern
  getInitials(name: string) {
    let names = name.split(" ");
    console.log(names);
    let initials = names[0].charAt(0) + names[1].charAt(0);
    console.log(initials);
    return initials
  };


}
