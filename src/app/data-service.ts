import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Team {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  public teams$ = this.teamsSubject.asObservable();
  private storageKey = 'cricket-teams';

  constructor() {
    console.log('DataService constructor called');
    this.loadTeamsFromStorage();
  }

  private loadTeamsFromStorage(): void {
    try {
      const storedTeams = localStorage.getItem(this.storageKey);
      const teams = storedTeams ? JSON.parse(storedTeams) : [];
      this.teamsSubject.next(teams);
      console.log('Teams loaded from storage:', teams);
    } catch (error) {
      console.error('Error loading teams from storage:', error);
      this.teamsSubject.next([]);
    }
  }

  private saveTeamsToStorage(teams: Team[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(teams));
      console.log('Teams saved to storage:', teams);
    } catch (error) {
      console.error('Error saving teams to storage:', error);
    }
  }

  getTeams(): Team[] {
    const currentTeams = this.teamsSubject.value;
    console.log('getTeams called, returning:', currentTeams);
    return [...currentTeams];
  }

  addTeam(team: Team): void {
    const currentTeams = this.teamsSubject.value;
    const updatedTeams = [...currentTeams, team];
    this.teamsSubject.next(updatedTeams);
    this.saveTeamsToStorage(updatedTeams);
    console.log('DataService: Team added, current teams:', updatedTeams);
  }

  deleteTeam(index: number): void {
    const currentTeams = this.teamsSubject.value;
    const updatedTeams = currentTeams.filter((_, i) => i !== index);
    this.teamsSubject.next(updatedTeams);
    this.saveTeamsToStorage(updatedTeams);
    console.log('DataService: Team deleted, current teams:', updatedTeams);
  }

  deleteTeamById(id: number): void {
    const currentTeams = this.teamsSubject.value;
    const updatedTeams = currentTeams.filter(team => team.id !== id);
    this.teamsSubject.next(updatedTeams);
    this.saveTeamsToStorage(updatedTeams);
    console.log('DataService: Team deleted by ID, current teams:', updatedTeams);
  }
}
