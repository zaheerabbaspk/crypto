import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Scoreboard1Page } from './scoreboard1.page';

describe('Scoreboard1Page', () => {
  let component: Scoreboard1Page;
  let fixture: ComponentFixture<Scoreboard1Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Scoreboard1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
