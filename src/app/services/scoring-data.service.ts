import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface ScoringData {
  // Team and Match Info
  battingTeam: string;
  bowlingTeam: string;
  teamScore: number;
  wickets: number;
  currentOver: number;
  ballsInOver: number;
  totalOvers: number;
  runRate: number;
  
  // Batsmen Info
  strikerBatsman: string;
  nonStrikerBatsman: string;
  onStrike: 'striker' | 'nonStriker';
  
  // Striker Stats
  strikerRuns: number;
  strikerBalls: number;
  strikerFours: number;
  strikerSixes: number;
  
  // Non-Striker Stats
  nonStrikerRuns: number;
  nonStrikerBalls: number;
  nonStrikerFours: number;
  nonStrikerSixes: number;
  
  // Partnership Info
  partnershipRuns: number;
  partnershipBalls: number;
  partnershipRunRate: number;
  
  // Bowler Info
  currentBowler: string;
  bowlerType: string;
  bowlerOvers: string;
  bowlerRuns: number;
  bowlerMaidens: number;
  bowlerWickets: number;
  
  // Commentary and Over Details
  commentary: string;
  currentOverBalls: BallOutcome[];
  
  // Match Context
  targetScore: number;
  isSecondInnings: boolean;
  runsRequired: number;
  
  // Animation Data
  lastScoredRuns?: number;
  animationTrigger?: boolean;

  // Realtime metadata (for external consumers)
  updatedAt?: number; // epoch ms
  eventSeq?: number;  // monotonically increasing per match
}

export interface BallOutcome {
  display: string;
  color: string;
  runs: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScoringDataService {
  private readonly STORAGE_KEY = 'live_scoring_data';
  private scoringDataSubject = new BehaviorSubject<ScoringData | null>(null);
  public scoringData$ = this.scoringDataSubject.asObservable();

  constructor() {
    // Load initial data from localStorage
    this.loadFromStorage();
    
    // Listen for storage changes from other tabs
    fromEvent<StorageEvent>(window, 'storage')
      .pipe(filter(event => event.key === this.STORAGE_KEY))
      .subscribe(() => {
        this.loadFromStorage();
      });
  }

  updateScoringData(data: ScoringData) {
    // Save to localStorage for cross-tab sync
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    // Update current instance
    this.scoringDataSubject.next(data);
  }

  getCurrentScoringData(): ScoringData | null {
    return this.scoringDataSubject.value;
  }

  clearScoringData() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.scoringDataSubject.next(null);
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as ScoringData;
        this.scoringDataSubject.next(data);
      }
    } catch (error) {
      console.error('Error loading scoring data from storage:', error);
    }
  }
}
