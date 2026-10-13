import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Task } from '../../../../shared/interfaces/task';
import { SupabaseService } from '../../../../shared/services/supabase-service';
import { SupabaseTaskService } from '../../../../shared/services/supabase-task-service';
import { TaskDetailDialog } from './task-detail-dialog';

describe('TaskDetailDialog', () => {
  let component: TaskDetailDialog;
  let fixture: ComponentFixture<TaskDetailDialog>;
  let tasks: ReturnType<typeof signal<Task[]>>;

  const makeTask = (contactCount: number, subtaskCount: number): Task => ({
    id: 1,
    title: 'Test task',
    description: 'Test description',
    due_date: '2026-10-13',
    priority: 'medium',
    category: 'technical_task',
    status: 'todo',
    subtasks: Array.from({ length: subtaskCount }, (_, index) => ({
      id: index + 1,
      task_id: 1,
      title: `Subtask ${index + 1}`,
      done: false,
    })),
    task_contacts: Array.from({ length: contactCount }, (_, index) => ({
      contact_id: index + 1,
      contacts: {
        id: index + 1,
        created_at: '2026-10-13',
        contact_name: `Contact ${index + 1}`,
        contact_mail: `contact${index + 1}@example.com`,
        contact_phone: null,
      },
    })),
    creator_email: null,
    creator_type: 'external',
    source: 'manual',
    ai_generated: false,
  });

  beforeEach(async () => {
    tasks = signal([makeTask(3, 3)]);
    await TestBed.configureTestingModule({
      imports: [TaskDetailDialog],
      providers: [
        provideRouter([]),
        {
          provide: SupabaseTaskService,
          useValue: { tasks, deleteTask: vi.fn(), toggleSubtask: vi.fn() },
        },
        {
          provide: SupabaseService,
          useValue: { contacts: signal([]), client: {} },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailDialog);
    fixture.componentRef.setInput('isTaskDetailDialogOpen', true);
    fixture.componentRef.setInput('taskId', 1);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts sections with more than two entries collapsed and shows their counts', () => {
    expect(component.assigneesExpanded()).toBe(false);
    expect(component.subtasksExpanded()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Assigned To (3)');
    expect(fixture.nativeElement.textContent).toContain('Subtasks (3)');
  });

  it('starts sections with at most two entries expanded', () => {
    tasks.set([makeTask(2, 2)]);
    fixture.detectChanges();

    expect(component.assigneesExpanded()).toBe(true);
    expect(component.subtasksExpanded()).toBe(true);
  });

  it('resets the section state to the entry-count defaults each time it opens', async () => {
    component.toggleAssignees();
    component.toggleSubtasks();
    expect(component.assigneesExpanded()).toBe(true);
    expect(component.subtasksExpanded()).toBe(true);

    fixture.componentRef.setInput('isTaskDetailDialogOpen', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('isTaskDetailDialogOpen', true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.assigneesExpanded()).toBe(false);
    expect(component.subtasksExpanded()).toBe(false);
  });
});
