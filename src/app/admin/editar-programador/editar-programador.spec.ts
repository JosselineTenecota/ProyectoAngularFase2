import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarProgramador } from './editar-programador';

describe('EditarProgramador', () => {
  let component: EditarProgramador;
  let fixture: ComponentFixture<EditarProgramador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarProgramador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarProgramador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
