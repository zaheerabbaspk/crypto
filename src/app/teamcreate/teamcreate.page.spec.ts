import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamcreatePage } from './teamcreate.page';

describe('TeamcreatePage', () => {
  let component: TeamcreatePage;
  let fixture: ComponentFixture<TeamcreatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamcreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
