import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterConfirm } from './register-confirm';

describe('RegisterConfirm', () => {
  let component: RegisterConfirm;
  let fixture: ComponentFixture<RegisterConfirm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterConfirm],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterConfirm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
