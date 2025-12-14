import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Select2Page } from './select2.page';

describe('Select2Page', () => {
  let component: Select2Page;
  let fixture: ComponentFixture<Select2Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Select2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
