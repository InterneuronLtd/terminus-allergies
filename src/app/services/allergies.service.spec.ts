import { TestBed } from '@angular/core/testing';

import { AllergiesService } from './allergies.service';

describe('AllergiesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AllergiesService = TestBed.get(AllergiesService);
    expect(service).toBeTruthy();
  });
});
