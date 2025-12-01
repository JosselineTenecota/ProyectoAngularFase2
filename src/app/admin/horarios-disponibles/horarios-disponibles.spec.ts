import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosDisponibles } from './horarios-disponibles';

describe('HorariosDisponibles', () => {
  let component: HorariosDisponibles;
  let fixture: ComponentFixture<HorariosDisponibles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorariosDisponibles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorariosDisponibles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
