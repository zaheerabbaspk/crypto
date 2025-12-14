import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginftPage } from './loginft.page';

describe('LoginftPage', () => {
  let component: LoginftPage;
  let fixture: ComponentFixture<LoginftPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginftPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
