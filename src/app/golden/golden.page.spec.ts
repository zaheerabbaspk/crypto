import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoldenPage } from './golden.page';

describe('GoldenPage', () => {
  let component: GoldenPage;
  let fixture: ComponentFixture<GoldenPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GoldenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
