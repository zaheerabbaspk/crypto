import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface TeamPlayer {
  id: number;
  name: string;
  avatar?: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private players$ = new BehaviorSubject<TeamPlayer[]>([]);

  constructor() {}

  // Load players for a team from localStorage or fallback to sample data
  loadTeamPlayers(teamId: string | number, fallbackTeamName?: string) {
    const key = this.storageKey(teamId);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const list: TeamPlayer[] = JSON.parse(raw);
        this.players$.next(list);
        return;
      } catch {}
    }
    // Seed with sample players if no data exists yet
    const sample: TeamPlayer[] = [
      { id: 36, name: 'Zahidul Hasan', avatar: 'assets/avatars/p1.jpg', active: true },
      { id: 4824, name: 'zaheer Sa', avatar: 'assets/avatars/p2.png', active: true },
      { id: 4825, name: 'asad SD', avatar: 'assets/avatars/p3.png', active: true },
      { id: 4826, name: 'zaheerdf Sad', avatar: 'assets/avatars/p4.png', active: true },
      { id: 4827, name: 'asad ll', avatar: 'assets/avatars/p5.png', active: true },
      { id: 4824, name: 'zaheer Sa', active: true },
      { id: 4825, name: 'asad SD', active: true },
      { id: 4826, name: 'zaheerdf Sad', active: true },
      { id: 4827, name: 'asad ll', active: true },
    ];
    this.players$.next(sample);
    localStorage.setItem(key, JSON.stringify(sample));
  }

  getPlayers(): Observable<TeamPlayer[]> {
    return this.players$.asObservable();
  }

  savePlayers(teamId: string | number, players: TeamPlayer[]) {
    localStorage.setItem(this.storageKey(teamId), JSON.stringify(players));
    this.players$.next(players);
  }

  private storageKey(teamId: string | number) {
    return `teamPlayers:${teamId}`;
  }
}
