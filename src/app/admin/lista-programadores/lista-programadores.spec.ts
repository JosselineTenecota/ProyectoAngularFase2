import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaProgramadores } from './lista-programadores';

describe('ListaProgramadores', () => {
  let component: ListaProgramadores;
  let fixture: ComponentFixture<ListaProgramadores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaProgramadores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaProgramadores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
