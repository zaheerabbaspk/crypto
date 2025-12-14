import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SequardPage } from './sequard.page';

describe('SequardPage', () => {
  let component: SequardPage;
  let fixture: ComponentFixture<SequardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SequardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
