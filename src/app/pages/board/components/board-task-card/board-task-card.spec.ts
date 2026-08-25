import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardTaskCard } from './board-task-card';

describe('BoardTaskCard', () => {
  let component: BoardTaskCard;
  let fixture: ComponentFixture<BoardTaskCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardTaskCard],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardTaskCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
