import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddplayerPage } from './addplayer.page';

describe('AddplayerPage', () => {
  let component: AddplayerPage;
  let fixture: ComponentFixture<AddplayerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddplayerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
