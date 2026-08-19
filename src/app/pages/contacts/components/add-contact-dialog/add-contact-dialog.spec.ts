import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { AddContactDialog } from './add-contact-dialog';
import { SupabaseService } from '../../../../shared/services/supabase-service';

describe('AddContactDialog', () => {
  let component: AddContactDialog;
  let fixture: ComponentFixture<AddContactDialog>;
  const navigate = vi.fn();
  const addContact = vi.fn();

  beforeEach(async () => {
    navigate.mockReset();
    addContact.mockReset();

    await TestBed.configureTestingModule({
      imports: [AddContactDialog],
      providers: [
        { provide: Router, useValue: { navigate } },
        { provide: SupabaseService, useValue: { addContact } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddContactDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('creates a normalized contact and opens its detail route', async () => {
    addContact.mockResolvedValue({
      data: [{
        id: 7,
        created_at: '2026-08-18T12:00:00.000Z',
        contact_name: 'Ada Lovelace',
        contact_mail: 'ada@example.com',
        contact_phone: null,
      }],
      error: null,
    });
    component.contactForm.setValue({
      name: ' Ada Lovelace ',
      email: ' ADA@EXAMPLE.COM ',
      phone: ' ',
    });

    await component.onSubmit();

    expect(addContact).toHaveBeenCalledWith({
      contact_name: 'Ada Lovelace',
      contact_mail: 'ada@example.com',
      contact_phone: null,
    });
    expect(navigate).toHaveBeenCalledWith(['/contacts', 7], {
      state: {
        contact: expect.objectContaining({ id: 7 }),
        successMessage: 'Contact succesfully created.',
      },
    });
  });
});
