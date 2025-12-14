import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BattingData, InningsSummary } from '../models/batting-data.model';

@Injectable({ providedIn: 'root' })
export class TeamABattingService {
  private state: BattingData = { runs: 0, wickets: 0, balls: 0 };
  private completed = false;

  private state$ = new BehaviorSubject<BattingData>({ ...this.state });
  private completed$ = new BehaviorSubject<boolean>(this.completed);

  // Observables for components
  readonly battingState$ = this.state$.asObservable();
  readonly inningsCompleted$ = this.completed$.asObservable();

  reset() {
    this.state = { runs: 0, wickets: 0, balls: 0 };
    this.completed = false;
    this.state$.next({ ...this.state });
    this.completed$.next(this.completed);
  }

  // Utility
  private oversString(): string {
    const o = Math.floor(this.state.balls / 6);
    const b = this.state.balls % 6;
    return `${o}.${b}`;
  }

  setTotals(runs: number, wickets: number, overs: string) {
    const [oStr, bStr] = overs.split('.');
    const oversNum = parseInt(oStr || '0', 10);
    const ballsNum = parseInt(bStr || '0', 10);
    this.state = {
      runs,
      wickets,
      balls: (oversNum * 6) + (isNaN(ballsNum) ? 0 : ballsNum)
    };
    this.state$.next({ ...this.state });
  }

  markCompleted(done = true) {
    this.completed = done;
    this.completed$.next(this.completed);
  }

  addRuns(runs: number, countsBall = true) {
    if (this.completed) return;
    this.state.runs += runs;
    if (countsBall) this.state.balls += 1;
    this.state$.next({ ...this.state });
  }

  addWicket(countsBall = true) {
    if (this.completed) return;
    this.state.wickets += 1;
    if (countsBall) this.state.balls += 1;
    this.state$.next({ ...this.state });
  }

  addExtra(runs: number, countsBall = false) {
    if (this.completed) return;
    this.state.runs += runs;
    if (countsBall) this.state.balls += 1;
    this.state$.next({ ...this.state });
  }

  completeBall() {
    if (this.completed) return;
    this.state.balls += 1;
    this.state$.next({ ...this.state });
  }

  getSummary(): InningsSummary {
    return {
      runs: this.state.runs,
      wickets: this.state.wickets,
      overs: this.oversString(),
    };
  }

  getTotals(): BattingData {
    return { ...this.state };
  }
}
