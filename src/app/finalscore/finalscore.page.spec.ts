import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinalscorePage } from './finalscore.page';

describe('FinalscorePage', () => {
  let component: FinalscorePage;
  let fixture: ComponentFixture<FinalscorePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalscorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
