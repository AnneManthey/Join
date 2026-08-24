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
});
