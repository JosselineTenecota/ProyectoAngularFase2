import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisProyectos } from './mis-proyectos';

describe('MisProyectos', () => {
  let component: MisProyectos;
  let fixture: ComponentFixture<MisProyectos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisProyectos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisProyectos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
