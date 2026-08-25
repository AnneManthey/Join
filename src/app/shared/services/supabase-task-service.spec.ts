import { TestBed } from '@angular/core/testing';

import { SupabaseTaskService } from './supabase-task-service';

describe('SupabaseTaskService', () => {
  let service: SupabaseTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
