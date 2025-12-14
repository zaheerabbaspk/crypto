import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShoudilePage } from './shoudile.page';

describe('ShoudilePage', () => {
  let component: ShoudilePage;
  let fixture: ComponentFixture<ShoudilePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoudilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
