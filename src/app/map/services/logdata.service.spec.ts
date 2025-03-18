import { TestBed } from '@angular/core/testing';

import { LogdataService } from './logdata.service';

describe('LogdataService', () => {
  let service: LogdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
