import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactDetailPlaceholder } from './contact-detail-placeholder';

describe('ContactDetailPlaceholder', () => {
  let component: ContactDetailPlaceholder;
  let fixture: ComponentFixture<ContactDetailPlaceholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDetailPlaceholder],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactDetailPlaceholder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
