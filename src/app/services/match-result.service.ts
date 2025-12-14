import { Injectable } from '@angular/core';
import { TeamABattingService } from './team-a-batting.service';
import { TeamBBattingService } from './team-b-batting.service';
import { MatchComparisonResult } from '../models/batting-data.model';

@Injectable({ providedIn: 'root' })
export class MatchResultService {
  constructor(
    private teamA: TeamABattingService,
    private teamB: TeamBBattingService,
  ) {}

  compareTotals(): MatchComparisonResult {
    const a = this.teamA.getTotals();
    const b = this.teamB.getTotals();

    let winner: MatchComparisonResult['winner'];
    if (a.runs > b.runs) winner = 'Team A';
    else if (b.runs > a.runs) winner = 'Team B';
    else winner = 'Tie';

    return {
      teamARuns: a.runs,
      teamBRuns: b.runs,
      winner,
    };
  }
}
