import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stakeholder } from './stakeholder';

describe('Stakeholder', () => {
  let component: Stakeholder;
  let fixture: ComponentFixture<Stakeholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stakeholder],
    }).compileComponents();

    fixture = TestBed.createComponent(Stakeholder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
