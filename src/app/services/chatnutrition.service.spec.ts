import { TestBed } from '@angular/core/testing';

import { ChatNutritionService } from './chatnutrition.service';

describe('ChatnutritionService', () => {
  let service: ChatNutritionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatNutritionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
