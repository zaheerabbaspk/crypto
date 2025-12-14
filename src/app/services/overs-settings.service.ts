import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MatchSettingsLite {
  numberOfOvers: number;
  bowlerOverLimit: number;
}

// Exporting MatchService class name to avoid changing consuming code
@Injectable({ providedIn: 'root' })
export class MatchService {
  private readonly LS_OVERS = 'numberOfOvers';
  private readonly LS_LIMIT = 'bowlerOverLimit';

  private subject: BehaviorSubject<MatchSettingsLite>;
  public readonly settings$: Observable<MatchSettingsLite>;

  constructor() {
    const initial = this.load();
    console.log('[MatchService] initial from load()', initial);
    this.subject = new BehaviorSubject<MatchSettingsLite>(initial);
    this.settings$ = this.subject.asObservable();
  }

  get current(): MatchSettingsLite {
    return this.subject.value;
  }

  setOvers(overs: number) {
    if (!overs || overs <= 0) return;
    const merged = { ...this.current, numberOfOvers: overs };
    console.log('[MatchService] setOvers ->', overs, 'merged:', merged);
    this.subject.next(merged);
    this.save(merged);
  }

  setBowlerLimit(limit: number) {
    if (!limit || limit <= 0) return;
    const merged = { ...this.current, bowlerOverLimit: limit };
    console.log('[MatchService] setBowlerLimit ->', limit, 'merged:', merged);
    this.subject.next(merged);
    this.save(merged);
  }

  private load(): MatchSettingsLite {
    const ov = parseInt(localStorage.getItem(this.LS_OVERS) || '20', 10) || 20;
    const lim = parseInt(localStorage.getItem(this.LS_LIMIT) || '4', 10) || 4;
    return { numberOfOvers: ov, bowlerOverLimit: lim };
  }

  private save(s: MatchSettingsLite) {
    try {
      localStorage.setItem(this.LS_OVERS, String(s.numberOfOvers));
      localStorage.setItem('totalOvers', String(s.numberOfOvers));
      localStorage.setItem(this.LS_LIMIT, String(s.bowlerOverLimit));
      localStorage.setItem('limitPerBowler', String(s.bowlerOverLimit));
      console.log('[MatchService] saved to localStorage', s);
    } catch (e) {
      console.error('MatchService save error', e);
    }
  }
}
