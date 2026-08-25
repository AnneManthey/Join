import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardColumnComponent } from './board-column';

describe('BoardColumn', () => {
  let component: BoardColumnComponent;
  let fixture: ComponentFixture<BoardColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardColumnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardColumnComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
