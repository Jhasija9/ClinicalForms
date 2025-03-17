import { TestBed } from '@angular/core/testing';

import { VisitDataService } from './visit-data.service';

describe('VisitDataService', () => {
  let service: VisitDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisitDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
