import { TestBed } from '@angular/core/testing';

import { Asesorias } from './asesorias';

describe('Asesorias', () => {
  let service: Asesorias;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Asesorias);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
