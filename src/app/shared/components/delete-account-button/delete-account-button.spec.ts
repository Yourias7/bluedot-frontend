import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAccountButton } from './delete-account-button';

describe('DeleteAccountButton', () => {
  let component: DeleteAccountButton;
  let fixture: ComponentFixture<DeleteAccountButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteAccountButton],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteAccountButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
