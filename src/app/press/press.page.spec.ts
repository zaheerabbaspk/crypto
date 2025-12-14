import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PressPage } from './press.page';

describe('PressPage', () => {
  let component: PressPage;
  let fixture: ComponentFixture<PressPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
