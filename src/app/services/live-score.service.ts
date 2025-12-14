import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ScoringData } from './scoring-data.service';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, Database, off, DataSnapshot } from 'firebase/database';

@Injectable({ providedIn: 'root' })
export class LiveScoreService {
  private app: FirebaseApp | null = null;
  private db: Database | null = null;
  private matchId: string | null = null;
  private unsubscribeFn: (() => void) | null = null;

  private ensureInit() {
    if (!this.app) {
      try {
        this.app = initializeApp(environment.firebase);
        // Explicitly bind to the configured databaseURL to avoid any default project mismatch
        this.db = getDatabase(this.app, (environment as any).firebase?.databaseURL);
        console.log('Firebase initialized successfully with DB URL:', (environment as any).firebase?.databaseURL);
      } catch (error) {
        console.error('Firebase initialization error:', error);
        throw error;
      }
    }
  }

  setMatch(matchId: string) {
    try {
      this.ensureInit();
      this.matchId = matchId;
      console.log('Match ID set:', matchId);
    } catch (error) {
      console.error('Error setting match ID:', error);
      throw error;
    }
  }

  listen(callback: (data: ScoringData | null) => void) {
    try {
      this.ensureInit();
      
      if (!this.db || !this.matchId) {
        console.error('Database not initialized or matchId not set');
        return () => {};
      }

      const matchRef = ref(this.db, `matches/${this.matchId}/live`);
      console.log('Setting up realtime listener for match:', this.matchId);

      // Remove previous listener/interval if any
      if (this.unsubscribeFn) {
        console.log('Removing previous listener');
        this.unsubscribeFn();
        this.unsubscribeFn = null;
      }
      // No polling interval in realtime mode

      // Realtime subscription
      const handler = onValue(matchRef, (snap: DataSnapshot) => {
        const val = snap.val();
        console.log('Realtime live update:', val);
        callback(val ? (val as ScoringData) : null);
      }, (error) => {
        console.error('Error in live update listener:', error);
        callback(null);
      });

      // Store unsubscribe function
      this.unsubscribeFn = () => {
        console.log('Unsubscribing from realtime updates');
        off(matchRef, 'value', handler);
      };

      return this.unsubscribeFn;
    } catch (error) {
      console.error('Error in listen:', error);
      return () => {}; // Return empty cleanup function
    }
  }

  // Add cleanup method to call when component is destroyed
  destroy() {
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
      this.unsubscribeFn = null;
    }
    // No polling interval in realtime mode
  }

  async pushUpdate(data: ScoringData) {
    try {
      this.ensureInit();
      if (!this.db || !this.matchId) {
        console.error('Cannot push update: Database not initialized or matchId not set');
        return Promise.reject('Database not initialized or matchId not set');
      }

      const matchRef = ref(this.db, `matches/${this.matchId}/live`);
      console.log('[LiveScoreService] Pushing update path:', `matches/${this.matchId}/live`);
      console.log('[LiveScoreService] Payload preview:', { teamScore: data.teamScore, wickets: data.wickets, ballsInOver: data.ballsInOver, eventSeq: data.eventSeq });

      // Derive helpful realtime fields
      const now = Date.now();
      const innings = data.isSecondInnings ? 2 : 1;
      const overNumber = data.currentOver;
      const ballNumber = data.ballsInOver; // 1..6 within current over for legal deliveries
      const crr = data.runRate; // already calculated in component
      const target = data.isSecondInnings ? (data.targetScore || 0) : undefined;
      const rrr = data.isSecondInnings && target && target > data.teamScore
        ? parseFloat((((target - data.teamScore) / Math.max(1, (data.totalOvers * 6) - (overNumber * 6 + ballNumber))) * 6).toFixed(2))
        : 0;
      // Try to capture the last ball symbol like 1, 4, 6, W, NB, Wd, LB, B, etc.
      const lastBall = (Array.isArray((data as any).currentOverBalls) && (data as any).currentOverBalls.length > 0)
        ? (data as any).currentOverBalls[(data as any).currentOverBalls.length - 1]
        : null;
      const lastBallDisplay = lastBall && typeof lastBall.display === 'string' ? lastBall.display : undefined;

      // Add timestamp and derived fields to the update
      const updateData: any = {
        ...data,
        innings,
        overNumber,
        ballNumber,
        crr,
        rrr,
        target,
        lastBallDisplay,
        lastUpdated: now
      };

      await update(matchRef, updateData);
      console.log('[LiveScoreService] Update successful');

      // Additionally, write a per-ball log entry so data is permanently recorded ball-by-ball
      try {
        const seq = updateData.eventSeq || Date.now();
        const ballRef = ref(this.db, `matches/${this.matchId}/balls/${seq}`);
        const ballPayload = {
          // Snapshot essentials
          teamScore: updateData.teamScore,
          wickets: updateData.wickets,
          strikerBatsman: updateData.strikerBatsman,
          nonStrikerBatsman: updateData.nonStrikerBatsman,
          onStrike: updateData.onStrike,
          currentBowler: updateData.currentBowler,
          // Over/ball context
          innings: updateData.innings,
          over: updateData.overNumber,
          ball: updateData.ballNumber,
          // Display and commentary
          lastBallDisplay: updateData.lastBallDisplay,
          commentary: updateData.commentary,
          // Rates/targets
          crr: updateData.crr,
          rrr: updateData.rrr,
          target: updateData.target,
          // Animation/event helpers
          lastScoredRuns: updateData.lastScoredRuns ?? 0,
          eventSeq: updateData.eventSeq,
          updatedAt: updateData.lastUpdated
        } as any;
        await set(ballRef, ballPayload);
        console.log('[LiveScoreService] Ball log written with key:', seq);
      } catch (e) {
        console.warn('[LiveScoreService] Failed to write ball log (non-fatal):', e);
      }
      return true;
    } catch (error) {
      console.error('[LiveScoreService] Error pushing update:', error);
      throw error;
    }
  }

  endMatch(finalData?: Partial<ScoringData>) {
    this.ensureInit();
    if (!this.db || !this.matchId) return;

    const matchRef = ref(this.db, `matches/${this.matchId}/live`);
    const statusRef = ref(this.db, `matches/${this.matchId}/status`);
    const payload: any = finalData ? finalData : {};
    payload.isCompleted = true;
    return Promise.all([
      update(matchRef, payload),
      set(statusRef, { isCompleted: true, timestamp: Date.now() })
    ]);
  }
}
