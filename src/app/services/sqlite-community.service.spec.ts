import { TestBed } from '@angular/core/testing';

import { SqliteCommunityService } from './sqlite-community.service';

describe('SqliteCommunityService', () => {
  let service: SqliteCommunityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqliteCommunityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
