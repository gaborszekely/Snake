import { TestBed } from '@angular/core/testing';

import { SnakeService } from './snake.service';

describe('SnakeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SnakeService = TestBed.get(SnakeService);
    expect(service).toBeTruthy();
  });
});
