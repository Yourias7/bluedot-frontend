import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginatorBasic } from './paginator-basic';

describe('PaginatorBasic', () => {
  let component: PaginatorBasic;
  let fixture: ComponentFixture<PaginatorBasic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatorBasic],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginatorBasic);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
