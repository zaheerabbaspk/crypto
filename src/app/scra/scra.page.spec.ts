import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScraPage } from './scra.page';

describe('ScraPage', () => {
  let component: ScraPage;
  let fixture: ComponentFixture<ScraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ScraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
