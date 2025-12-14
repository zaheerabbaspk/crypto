import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Golden1Page } from './golden1.page';

describe('Golden1Page', () => {
  let component: Golden1Page;
  let fixture: ComponentFixture<Golden1Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Golden1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
