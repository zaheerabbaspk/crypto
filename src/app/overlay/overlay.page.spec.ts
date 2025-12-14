import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayPage } from './overlay.page';

describe('OverlayPage', () => {
  let component: OverlayPage;
  let fixture: ComponentFixture<OverlayPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OverlayPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
