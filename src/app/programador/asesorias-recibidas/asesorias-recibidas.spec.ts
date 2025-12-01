import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsesoriasRecibidas } from './asesorias-recibidas';

describe('AsesoriasRecibidas', () => {
  let component: AsesoriasRecibidas;
  let fixture: ComponentFixture<AsesoriasRecibidas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsesoriasRecibidas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsesoriasRecibidas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
