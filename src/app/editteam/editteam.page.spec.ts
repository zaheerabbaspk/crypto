import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditteamPage } from './editteam.page';

describe('EditteamPage', () => {
  let component: EditteamPage;
  let fixture: ComponentFixture<EditteamPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditteamPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
