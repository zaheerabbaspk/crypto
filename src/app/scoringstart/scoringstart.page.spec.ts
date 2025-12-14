import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScoringstartPage } from './scoringstart.page';

describe('ScoringstartPage', () => {
  let component: ScoringstartPage;
  let fixture: ComponentFixture<ScoringstartPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoringstartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
