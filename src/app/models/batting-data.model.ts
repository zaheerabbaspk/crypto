export interface BattingData {
  runs: number;
  wickets: number;
  // total balls bowled in the innings (overs = Math.floor(balls/6).balls%6)
  balls: number;
  // convenience getter style string e.g. "10.4" (computed when needed)
}

export interface InningsSummary {
  runs: number;
  wickets: number;
  overs: string; // e.g. "10.4"
}

export interface MatchComparisonResult {
  teamARuns: number;
  teamBRuns: number;
  winner: 'Team A' | 'Team B' | 'Tie';
}
