import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearProgramador } from './crear-programador';

describe('CrearProgramador', () => {
  let component: CrearProgramador;
  let fixture: ComponentFixture<CrearProgramador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearProgramador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearProgramador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
