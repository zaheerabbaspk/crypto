import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TwopagePage } from './twopage.page';

describe('TwopagePage', () => {
  let component: TwopagePage;
  let fixture: ComponentFixture<TwopagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TwopagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
