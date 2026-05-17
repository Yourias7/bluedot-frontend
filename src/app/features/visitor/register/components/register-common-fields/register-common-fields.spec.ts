import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCommonFields } from './register-common-fields';

describe('RegisterCommonFields', () => {
  let component: RegisterCommonFields;
  let fixture: ComponentFixture<RegisterCommonFields>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterCommonFields],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterCommonFields);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
