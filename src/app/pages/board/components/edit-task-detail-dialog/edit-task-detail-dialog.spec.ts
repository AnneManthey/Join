import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTaskDetailDialog } from './edit-task-detail-dialog';

describe('EditTaskDetailDialog', () => {
  let component: EditTaskDetailDialog;
  let fixture: ComponentFixture<EditTaskDetailDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTaskDetailDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EditTaskDetailDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
