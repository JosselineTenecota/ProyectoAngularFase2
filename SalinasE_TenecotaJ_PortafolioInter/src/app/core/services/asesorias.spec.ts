import { TestBed } from '@angular/core/testing';

import { AsesoriasService } from './asesorias';

describe('Asesorias', () => {
  let service: AsesoriasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsesoriasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
