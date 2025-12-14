import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TossPage } from './toss.page';

describe('TossPage', () => {
  let component: TossPage;
  let fixture: ComponentFixture<TossPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TossPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
