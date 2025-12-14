import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManofmatchPage } from './manofmatch.page';

describe('ManofmatchPage', () => {
  let component: ManofmatchPage;
  let fixture: ComponentFixture<ManofmatchPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManofmatchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
