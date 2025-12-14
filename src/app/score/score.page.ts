import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonList, IonBadge,
  IonGrid, IonRow, IonCol, IonSelect, IonSelectOption 
} from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-score',
  templateUrl: './score.page.html',
  styleUrls: ['./score.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol,
    IonButton, IonList, IonItem, IonLabel, IonSelect, IonSelectOption, IonBadge, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon,
    CommonModule, FormsModule
  ]
})
export class ScorePage implements OnInit {

  matches: any[] = [];
  currentMatch: any = null;
  filterOption: string = 'All';

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.loadMatches();
    this.route.queryParams.subscribe(params => {
      if (params['matchId']) {
        const matchId = params['matchId'];
        this.currentMatch = this.matches.find(match => match.id === matchId);
        if (this.currentMatch) {
          let changed = false;
          if (params['matchDate']) { this.currentMatch.matchDate = params['matchDate']; changed = true; }
          if (params['matchTime']) { this.currentMatch.matchTime = params['matchTime']; changed = true; }
          if (params['numberOfOvers']) { this.currentMatch.numberOfOvers = Number(params['numberOfOvers']); changed = true; }
          if (params['bowlerOverLimit']) { this.currentMatch.bowlerOverLimit = Number(params['bowlerOverLimit']); changed = true; }
          if (changed) {
            // Persist back to matches list
            this.matches = this.matches.map(m => m.id === this.currentMatch.id ? this.currentMatch : m);
            localStorage.setItem('matches', JSON.stringify(this.matches));
          }
        }
      }
    });
  }

  openOverlayControls(match: any) {
    if (match?.id) {
      localStorage.setItem('currentMatchId', match.id);
    }
    this.router.navigate(['/overlay']);
  }

  loadMatches() {
    const savedMatches = localStorage.getItem('matches');
    if (savedMatches) {
      this.matches = JSON.parse(savedMatches);
      // Update match status based on schedule
      const now = new Date();
      let changed = false;
      this.matches.forEach((match: any) => {
        try {
          const scheduled = new Date(`${match.matchDate}T${(match.matchTime || '00:00')}:00`);
          if (match.status === 'scheduled' && now >= scheduled) {
            match.status = 'in-progress';
            changed = true;
          }
        } catch {}
        this.updateMatchDisplayData(match);
      });
      if (changed) {
        localStorage.setItem('matches', JSON.stringify(this.matches));
      }
    }
  }

  updateMatchDisplayData(match: any) {
    const matchData = this.getMatchData(match.id);
    match.isCompleted = matchData.isCompleted || false;
    match.isSecondInnings = matchData.secondInningsComplete || false;
    match.firstInningsComplete = matchData.firstInningsComplete || false;
    match.firstInningsScore = matchData.firstInningsScore || 0;
    match.secondInningsScore = matchData.secondInningsScore || 0;
    match.battingFirst = matchData.battingFirst || null;
    match.battingSecond = matchData.battingSecond || null;
    match.winner = matchData.winner || null;
  }

  getMatchData(matchId: string): any {
    const savedData = localStorage.getItem(`match_${matchId}`);
    if (savedData) return JSON.parse(savedData);
    return {
      isCompleted: false,
      firstInningsComplete: false,
      secondInningsComplete: false,
      firstInningsScore: 0,
      secondInningsScore: 0,
      battingFirst: null,
      battingSecond: null,
      winner: null
    };
  }

  saveMatchData(matchId: string, data: any) {
    localStorage.setItem(`match_${matchId}`, JSON.stringify(data));
  }

  // Start first innings
  startScoring(match: any) {
    const matchData = this.getMatchData(match.id);

    if (!matchData.battingFirst) {
      matchData.battingFirst = match.tossWinner;
      matchData.battingSecond = (match.tossWinner === match.team1.name) ? match.team2.name : match.team1.name;
    }

    localStorage.setItem('currentMatchId', match.id);
    this.router.navigate(['/press']); // First innings scoring page (updated)
  }

  // End first innings
  endFirstInnings(match: any, score: number) {
    const matchData = this.getMatchData(match.id);
    matchData.firstInningsScore = score;
    matchData.firstInningsComplete = true;
    this.saveMatchData(match.id, matchData);
    alert(`First innings completed. ${matchData.battingFirst} scored ${score} runs.`);
    this.loadMatches();
  }

  // Start second innings
  startSecondInnings(match: any) {
    const matchData = this.getMatchData(match.id);
    localStorage.setItem('currentMatchId', match.id);
    this.router.navigate(['/sequard']); // Go to squad page for next team before scoring
  }

  // End second innings
  endSecondInnings(match: any, score: number) {
    const matchData = this.getMatchData(match.id);
    matchData.secondInningsScore = score;
    matchData.secondInningsComplete = true;

    if (matchData.secondInningsScore > matchData.firstInningsScore) {
      matchData.winner = matchData.battingSecond;
    } else if (matchData.secondInningsScore < matchData.firstInningsScore) {
      matchData.winner = matchData.battingFirst;
    } else {
      matchData.winner = 'Tie';
    }

    matchData.isCompleted = true;
    this.saveMatchData(match.id, matchData);
    alert(`Match completed! Winner: ${matchData.winner}`);
    this.loadMatches();
  }

  isFirstInningsComplete(match: any): boolean {
    const matchData = this.getMatchData(match.id);
    return matchData.firstInningsComplete;
  }

  closeMatch(match: any) {
    const confirmed = confirm('Are you sure you want to close this match?');
    if (!confirmed) return;
    this.matches = this.matches.filter(m => m.id !== match.id);
    localStorage.setItem('matches', JSON.stringify(this.matches));
    // Remove stored match-specific blob
    localStorage.removeItem(`match_${match.id}`);

    // If the deleted match is the current active match, clear related global keys
    const currentId = localStorage.getItem('currentMatchId');
    if (currentId === match.id) {
      const keysToClear = [
        // innings/target context
        'firstInningsScore', 'firstInningsWickets', 'firstInningsOvers', 'firstInningsTeam', 'firstInningsComplete',
        'isSecondInnings', 'currentBattingTeam', 'currentBowlingTeam',
        // selection context
        'selectedBatsman1', 'selectedBatsman2', 'selectedBowler',
        'strikerBatsman', 'nonStrikerBatsman', 'openingBowler',
        // results
        'matchWinner', 'teamARuns', 'teamBRuns',
      ];
      keysToClear.forEach(k => localStorage.removeItem(k));
      localStorage.removeItem('currentMatchId');
    }

    this.loadMatches();
  }

  goBack() {
    console.log('ScorePage: Back clicked -> navigating to /twopage');
    this.router.navigateByUrl('/twopage', { replaceUrl: true });
  }

  startNewTournament() {
    this.router.navigate(['/select']);
  }

  startNewFriendly() {
    this.router.navigate(['/select']);
  }

  continueScoring(match: any) {
    localStorage.setItem('currentMatchId', match.id);
    this.router.navigate(['/scoreropen']);
  }

  openManOfTheMatch(match: any) {
    // Ensure the intended match context is active, then navigate
    if (match?.id) {
      localStorage.setItem('currentMatchId', match.id);
    }
    this.router.navigate(['/manofmatch']);
  }

  // Single entry point to control both innings with one button
  startOrResumeScoring(match: any) {
    // Block starting before scheduled time
    if (match?.matchDate && match?.matchTime) {
      const scheduled = new Date(`${match.matchDate}T${(match.matchTime || '00:00')}:00`);
      const now = new Date();
      if (now < scheduled) {
        alert(`Match is scheduled at ${match.matchDate} ${match.matchTime}. You can start scoring once it begins.`);
        return;
      }
    }
    
    // Check if there's a saved match state to resume from
    const savedMatchState = localStorage.getItem('cricketMatchState');
    if (savedMatchState) {
      try {
        const state = JSON.parse(savedMatchState);
        // If there's meaningful match progress (runs scored or wickets taken), resume directly
        if (state.teamScore > 0 || state.wickets > 0 || state.currentOver > 0) {
          console.log('Resuming match from saved state:', state);
          
          // Set up match context for resumption
          localStorage.setItem('currentMatchId', match.id);
          
          // Pass match settings to localStorage for scoringstart page
          if (match.numberOfOvers) {
            localStorage.setItem('totalOvers', match.numberOfOvers.toString());
          }
          if (match.bowlerOverLimit) {
            localStorage.setItem('limitPerBowler', match.bowlerOverLimit.toString());
          }
          
          // Navigate directly to scoring page to resume
          this.router.navigate(['/scoringstart']);
          return;
        }
      } catch (e) {
        console.error('Error parsing saved match state:', e);
      }
    }

    const d = this.getMatchData(match.id);

    // Ensure we have battingFirst/Second set
    if (!d.battingFirst) {
      d.battingFirst = match.tossWinner || match.team1?.name || 'Team A';
      d.battingSecond = (d.battingFirst === match.team1?.name) ? match.team2?.name : match.team1?.name;
      this.saveMatchData(match.id, d);
    }

    // Activate this match context
    localStorage.setItem('currentMatchId', match.id);
    
    // Pass match settings to localStorage for scoringstart page
    if (match.numberOfOvers) {
      localStorage.setItem('totalOvers', match.numberOfOvers.toString());
    }
    if (match.bowlerOverLimit) {
      localStorage.setItem('limitPerBowler', match.bowlerOverLimit.toString());
    }

    if (!d.firstInningsComplete) {
      // Before first innings: go to Press page first
      // Press -> Squad -> Umpire -> Scoring
      localStorage.setItem('isSecondInnings', 'false');
      this.router.navigate(['/press']);
      return;
    }

    if (!d.secondInningsComplete && d.firstInningsComplete) {
      // Prepare for second innings via squad selection
      localStorage.setItem('currentBattingTeam', d.battingSecond);
      localStorage.setItem('currentBowlingTeam', d.battingFirst);
      localStorage.setItem('isSecondInnings', 'true');
      this.router.navigate(['/sequard']);
      return;
    }

    // If match completed, check for Tie to trigger Super Over; else go to MoM
    if (d.isCompleted) {
      if ((d.winner || localStorage.getItem('matchWinner')) === 'Tie') {
        // Initialize Super Over context
        localStorage.setItem('superOverActive', 'true');
        localStorage.removeItem('superOverInitialized');
        // Configure 1 over per side, 1 over per bowler
        localStorage.setItem('totalOvers', '1');
        localStorage.setItem('limitPerBowler', '1');
        // Start first Super Over innings
        localStorage.setItem('isSecondInnings', 'false');
        localStorage.setItem('currentBattingTeam', d.battingFirst || match.team1?.name || 'Team A');
        localStorage.setItem('currentBowlingTeam', d.battingSecond || match.team2?.name || 'Team B');
        // Clear any saved live state
        localStorage.removeItem('cricketMatchState');
        // Navigate to squad selection for Super Over
        this.router.navigate(['/sequard']);
        return;
      }
      // Normal completed match flow
      this.openManOfTheMatch(match);
      return;
    }
  }

  // -- Helpers used by template ------------------------------------------------
  getFirstInningsTeam(match: any): string {
    const d = this.getMatchData(match.id);
    return d.battingFirst || match.battingFirst || (match.tossWinner ?? 'Team A');
  }

  getSecondInningsTeam(match: any): string {
    const d = this.getMatchData(match.id);
    return d.battingSecond || match.battingSecond || (match.tossWinner === match?.team1?.name ? match?.team2?.name : match?.team1?.name) || 'Team B';
  }

  getFirstInningsScore(match: any): number {
    const d = this.getMatchData(match.id);
    return Number(d.firstInningsScore || 0);
  }

  getSecondInningsScore(match: any): number {
    const d = this.getMatchData(match.id);
    return Number(d.secondInningsScore || 0);
  }

  getFirstInningsOvers(match: any): number {
    const d = this.getMatchData(match.id) as any;
    return Number((d.firstInningsOvers ?? match.firstInningsOvers) || 0);
  }

  getSecondInningsOvers(match: any): number {
    const d = this.getMatchData(match.id) as any;
    return Number((d.secondInningsOvers ?? match.secondInningsOvers) || 0);
  }

  getRunsNeeded(match: any): number {
    const target = this.getFirstInningsScore(match) + 1;
    const chasing = this.getSecondInningsScore(match);
    return Math.max(0, target - chasing);
  }

  ionViewWillEnter() {
    this.loadMatches();
  }

  // Check if there's a saved match state that can be resumed
  hasSavedMatchState(): boolean {
    const savedMatchState = localStorage.getItem('cricketMatchState');
    if (savedMatchState) {
      try {
        const state = JSON.parse(savedMatchState);
        return state.teamScore > 0 || state.wickets > 0 || state.currentOver > 0;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  // Get saved match info for display
  getSavedMatchInfo(): any {
    const savedMatchState = localStorage.getItem('cricketMatchState');
    if (savedMatchState) {
      try {
        const state = JSON.parse(savedMatchState);
        return {
          teamScore: state.teamScore || 0,
          wickets: state.wickets || 0,
          currentOver: state.currentOver || 0,
          ballsInOver: state.ballsInOver || 0,
          battingTeam: state.strikerBatsman ? 'In Progress' : 'Match State'
        };
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
