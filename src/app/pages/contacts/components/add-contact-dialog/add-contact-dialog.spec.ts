import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AddContactDialog } from './add-contact-dialog';
import { SupabaseService } from '../../../../shared/services/supabase-service';

describe('AddContactDialog', () => {
  let component: AddContactDialog;
  let fixture: ComponentFixture<AddContactDialog>;
  const addContact = vi.fn();

  beforeEach(async () => {
    addContact.mockReset();

    await TestBed.configureTestingModule({
      imports: [AddContactDialog],
      providers: [
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

  it('requires an email address with a top-level domain', () => {
    const emailControl = component.contactForm.controls['email'];

    emailControl.setValue('ada@example');
    expect(emailControl.invalid).toBe(true);

    emailControl.setValue('ada@example.de');
    expect(emailControl.valid).toBe(true);
  });

  it('allows spaces within a phone number', () => {
    const phoneControl = component.contactForm.controls['phone'];

    phoneControl.setValue('+49 123 456');
    expect(phoneControl.valid).toBe(true);

    phoneControl.setValue('+49 123A456');
    expect(phoneControl.invalid).toBe(true);
  });

  it('creates a normalized contact and requests closing', async () => {
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
    const contactCreated = vi.spyOn(component.contactCreated, 'emit');
    const closeRequested = vi.spyOn(component.closeRequested, 'emit');

    await component.onSubmit();

    expect(addContact).toHaveBeenCalledWith({
      contact_name: 'Ada Lovelace',
      contact_mail: 'ada@example.com',
      contact_phone: null,
    });
    expect(contactCreated).toHaveBeenCalled();
    expect(closeRequested).toHaveBeenCalled();
  });
});
