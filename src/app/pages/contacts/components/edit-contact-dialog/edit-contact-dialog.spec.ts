import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditContactDialog } from './edit-contact-dialog';

describe('EditContactDialog', () => {
  let component: EditContactDialog;
  let fixture: ComponentFixture<EditContactDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditContactDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EditContactDialog);
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
});
