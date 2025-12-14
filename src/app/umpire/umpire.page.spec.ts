import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UmpirePage } from './umpire.page';

describe('UmpirePage', () => {
  let component: UmpirePage;
  let fixture: ComponentFixture<UmpirePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UmpirePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
