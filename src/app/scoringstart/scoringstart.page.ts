import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonModal, 
  IonList, IonItem, IonLabel, IonButton, IonBadge, IonGrid, IonRow, IonCol 
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TeamABattingService } from '../services/team-a-batting.service';
import { TeamBBattingService } from '../services/team-b-batting.service';
import { MatchResultService } from '../services/match-result.service';
import { ScoringDataService } from '../services/scoring-data.service';
import { LiveScoreService } from '../services/live-score.service';
import { MatchService } from '../services/overs-settings.service';
import { Subscription } from 'rxjs';

interface Player {
  name: string;
  displayName?: string;
}

interface BallOutcome {
  display: string;
  color: string;
  runs: number;
  note?: string; // optional small label under the circle (e.g., +2 for wides extras)
}

interface GameState {
  teamScore: number;
  wickets: number;
  currentOver: number;
  ballsInOver: number;
  onStrike: 'striker' | 'nonStriker';
  strikerBatsman: string;
  nonStrikerBatsman: string;
  strikerRuns: number;
  strikerBalls: number;
  strikerFours: number;
  strikerSixes: number;
  nonStrikerRuns: number;
  nonStrikerBalls: number;
  nonStrikerFours: number;
  nonStrikerSixes: number;
  partnershipRuns: number;
  partnershipBalls: number;
  bowlerRuns: number;
  bowlerWickets: number;
  bowlerOvers: string;
  bowlerBallsMap: { [key: string]: number };
  currentBowler: string;
  battingTeamPlayers: Player[];
  commentary: string;
  currentOverBalls: BallOutcome[];
}

@Component({
  selector: 'app-scoringstart',
  templateUrl: './scoringstart.page.html',
  styleUrls: ['./scoringstart.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonIcon, IonModal, IonList, IonItem, IonLabel, IonButton, IonBadge, IonGrid, IonRow, IonCol]
})
export class ScoringstartPage implements OnInit, OnDestroy {
  // Team and match data
  battingTeam = '';
  bowlingTeam = '';
  battingTeamPlayers: Player[] = [];
  bowlingTeamPlayers: Player[] = [];
  
  // Match settings
  totalOvers = 20;
  limitPerBowler = 4;
  isSecondInnings = false;
  targetScore = 0;
  
  // Current match state
  teamScore = 0;
  wickets = 0;
  currentOver = 0;
  ballsInOver = 0;
  runRate = 0;
  runsRequired = 0;
  
  // Current players
  strikerBatsman = '';
  nonStrikerBatsman = '';
  currentBowler = '';
  onStrike: 'striker' | 'nonStriker' = 'striker';
  
  // Player stats
  strikerRuns = 0;
  strikerBalls = 0;
  strikerFours = 0;
  strikerSixes = 0;
  nonStrikerRuns = 0;
  nonStrikerBalls = 0;
  nonStrikerFours = 0;
  nonStrikerSixes = 0;
  
  // Partnership
  partnershipRuns = 0;
  partnershipBalls = 0;
  partnershipRunRate = 0;
  
  // Bowler stats
  bowlerRuns = 0;
  bowlerWickets = 0;
  bowlerMaidens = 0;
  bowlerOvers = '0.0';
  bowlerType = 'Right arm fast';
  bowlerBallsMap: { [key: string]: number } = {};
  
  // UI state
  commentary = 'Match started! Good luck to both teams.';
  showNextButton = false;
  showInningsCloseButton = false;
  showNextInningsButton = false;
  scoringDisabled = false;
  currentSelectionType = '';
  showMoreOptions = false;
  
  // Modals
  isPlayerModalOpen = false;
  isInningsCloseModalOpen = false;
  isInningsConfirmModalOpen = false;
  isSettingsModalOpen = false;
  isScorerModalOpen = false;
  // Settings modal fields
  settingsOvers = 0;
  settingsLimit = 0;
  // Scorer modal fields
  scorerName: string = '';
  scorerPhone: string = '';
  playerModalTitle = '';
  availablePlayersForSelection: Player[] = [];
  // Match identity
  currentMatchId: string = '';
  private eventSeq: number = 0;
  
  // Ball tracking
  currentOverBalls: BallOutcome[] = [];
  gameHistory: GameState[] = [];
  private settingsSub?: Subscription;
  // Wide modal state
  isWideModalOpen = false;
  wideExtraRuns = 0; // additional runs over the base 1 for wide
  isWideSelectModalOpen = false; // keypad modal for selecting extra runs
  // LB modal state
  isLbModalOpen = false;
  lbExtraRuns = 0;
  isLbSelectModalOpen = false;
  // BY modal state
  isByModalOpen = false;
  byExtraRuns = 0;
  isBySelectModalOpen = false;
  // NB modal state
  isNbModalOpen = false;
  nbExtraRuns = 0; // additional over base 1
  isNbSelectModalOpen = false;

  constructor(
    private router: Router,
    private teamAService: TeamABattingService,
    private teamBService: TeamBBattingService,
    private matchResultService: MatchResultService,
    private scoringDataService: ScoringDataService,
    private liveScore: LiveScoreService,
    private matchService: MatchService
  ) {}

  ngOnInit() {
    this.debugLocalStorage();
    // Subscribe to live settings from Venue (service + observable)
    this.settingsSub = this.matchService.settings$.subscribe(s => {
      console.log('[Scoringstart] settings$ emission:', s);
      let changed = false;
      if (s && s.numberOfOvers && s.numberOfOvers !== this.totalOvers) {
        this.totalOvers = s.numberOfOvers;
        localStorage.setItem('numberOfOvers', String(s.numberOfOvers));
        localStorage.setItem('totalOvers', String(s.numberOfOvers));
        changed = true;
      }
      if (s && s.bowlerOverLimit && s.bowlerOverLimit !== this.limitPerBowler) {
        this.limitPerBowler = s.bowlerOverLimit;
        localStorage.setItem('bowlerOverLimit', String(s.bowlerOverLimit));
        localStorage.setItem('limitPerBowler', String(s.bowlerOverLimit));
        changed = true;
      }
      if (changed) {
        console.log('[Scoringstart] applied settings to component', { totalOvers: this.totalOvers, limitPerBowler: this.limitPerBowler });
        this.updateScoringDataService();
        this.saveMatchState();
      }
    });
    // Load settings directly from MatchService/localStorage (no query params)
    this.loadMatchData();
    // Initialize live score sync BEFORE first push so initial state is sent to cloud
    let mid = localStorage.getItem('currentMatchId');
    if (!mid || mid === 'default_match') {
      mid = Date.now().toString();
      localStorage.setItem('currentMatchId', mid);
    }
    this.currentMatchId = mid;
    this.liveScore.setMatch(this.currentMatchId);
    // Load per-match event sequence counter
    const seqKey = `match_${this.currentMatchId}_eventSeq`;
    const storedSeq = parseInt(localStorage.getItem(seqKey) || '0', 10);
    this.eventSeq = isNaN(storedSeq) ? 0 : storedSeq;
    this.updateScoringDataService();
    // Super Over initialization: when coming from Score page after a Tie
    const superOverActive = localStorage.getItem('superOverActive') === 'true';
    const superOverInitialized = localStorage.getItem('superOverInitialized') === 'true';
    if (superOverActive && !superOverInitialized) {
      // Reset both teams' stored totals to avoid interfering with super over comparison
      try { this.teamAService.reset(); } catch {}
      try { this.teamBService.reset(); } catch {}
      // Reset current innings state
      this.teamScore = 0;
      this.wickets = 0;
      this.currentOver = 0;
      this.ballsInOver = 0;
      this.runRate = 0;
      this.currentOverBalls = [];
      this.gameHistory = [];
      // Enforce 1 over configs (in case not set)
      this.totalOvers = parseInt(localStorage.getItem('totalOvers') || '1', 10) || 1;
      this.limitPerBowler = parseInt(localStorage.getItem('limitPerBowler') || '1', 10) || 1;
      // Clear any previous innings flags
      localStorage.removeItem('firstInningsComplete');
      localStorage.removeItem('secondInningsComplete');
      localStorage.removeItem('firstInningsScore');
      localStorage.removeItem('firstInningsWickets');
      localStorage.removeItem('firstInningsOvers');
      // Mark initialized so we don't re-run this block on refresh
      localStorage.setItem('superOverInitialized', 'true');
      this.commentary = 'Super Over started! 1 over per side.';
      this.updateScoringDataService();
    }
    
    // Add event listeners for app state changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveMatchState();
      }
    });
    
    window.addEventListener('beforeunload', () => {
      this.saveMatchState();
    });
  }

  ngOnDestroy() {
    // Save match state when component is destroyed
    this.saveMatchState();
    
    // Clean up event listeners
    document.removeEventListener('visibilitychange', () => {});
    window.removeEventListener('beforeunload', () => {});
    // Unsubscribe settings subscription
    if (this.settingsSub) {
      this.settingsSub.unsubscribe();
      this.settingsSub = undefined;
    }
  }

  // Debug localStorage to see all stored keys
  debugLocalStorage() {
    console.log('=== DEBUG: All localStorage keys ===');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('Player') || key.includes('team') || key.includes('Team'))) {
        console.log(`${key}: ${localStorage.getItem(key)}`);
      }
    }
    console.log('=== END DEBUG ===');
  }

  // Open TV Board (overlay) page
  openTvBoard() {
    try {
      const mid = this.currentMatchId || localStorage.getItem('currentMatchId') || '';
      if (mid) {
        localStorage.setItem('currentMatchId', mid);
      }
      this.router.navigate(['/scra']);
    } catch (e) {
      this.router.navigate(['/scra']);
    }
  }

  // Open external Netlify overlay with matchId
  openExternalOverlay() {
    try {
      let mid = this.currentMatchId || localStorage.getItem('currentMatchId') || '';
      if (!mid || mid === 'default_match') {
        mid = Date.now().toString();
      }
      localStorage.setItem('currentMatchId', mid);
      const url = `https://crickblastpro3.netlify.app/?matchId=${mid}`;
      window.open(url, '_blank');
    } catch (e) {
      const mid = localStorage.getItem('currentMatchId') || '';
      const url = `https://crickblastpro3.netlify.app/?matchId=${mid}`;
      window.open(url, '_blank');
    }
  }

  loadMatchData() {
    // Load match configuration
    this.battingTeam = localStorage.getItem('currentBattingTeam') || 'Team A';
    this.bowlingTeam = localStorage.getItem('currentBowlingTeam') || 'Team B';
    // Read overs and per-bowler limit from multiple possible keys (Venue saves numberOfOvers/bowlerOverLimit)
    // IMPORTANT: Prefer Venue keys first so the latest selection wins over any older normalized keys
    const storedOversPreferred = localStorage.getItem('numberOfOvers') || localStorage.getItem('totalOvers');
    const storedLimitPreferred = localStorage.getItem('bowlerOverLimit') || localStorage.getItem('limitPerBowler');
    this.totalOvers = parseInt(storedOversPreferred || '20', 10);
    this.limitPerBowler = parseInt(storedLimitPreferred || '4', 10);
    // Normalize back to the keys used by scoringstart for consistency
    localStorage.setItem('totalOvers', String(this.totalOvers));
    localStorage.setItem('limitPerBowler', String(this.limitPerBowler));
    this.isSecondInnings = localStorage.getItem('isSecondInnings') === 'true';
    
    if (this.isSecondInnings) {
      this.targetScore = parseInt(localStorage.getItem('firstInningsScore') || '0') + 1;
      this.runsRequired = this.targetScore;
    }

    // Preload selections from Sequard (squad) if provided
    const savedStriker = localStorage.getItem('strikerBatsman') || '';
    const savedNonStriker = localStorage.getItem('nonStrikerBatsman') || '';
    const savedOpeningBowler = localStorage.getItem('openingBowler') || '';
    if (savedStriker) this.strikerBatsman = savedStriker;
    if (savedNonStriker) this.nonStrikerBatsman = savedNonStriker;
    if (savedOpeningBowler) {
      this.currentBowler = savedOpeningBowler;
      if (!this.bowlerBallsMap[this.currentBowler]) {
        this.bowlerBallsMap[this.currentBowler] = 0;
      }
    }

    // Restore match state if exists
    this.restoreMatchState();
    
    // Load team players - try multiple possible keys
    let battingPlayersStr = null;
    let bowlingPlayersStr = null;
    
    // Try different localStorage key patterns for batting team
    const battingKeys = [
      `${this.battingTeam.toLowerCase()}Players`,
      `${this.battingTeam.toLowerCase().replace(' ', '')}Players`,
      `${this.battingTeam}Players`,
      'teamAPlayers',
      'teamBPlayers'
    ];
    
    for (const key of battingKeys) {
      battingPlayersStr = localStorage.getItem(key);
      if (battingPlayersStr) break;
    }
    
    // Try different localStorage key patterns for bowling team
    const bowlingKeys = [
      `${this.bowlingTeam.toLowerCase()}Players`,
      `${this.bowlingTeam.toLowerCase().replace(' ', '')}Players`,
      `${this.bowlingTeam}Players`,
      'teamBPlayers',
      'teamAPlayers'
    ];
    
    for (const key of bowlingKeys) {
      bowlingPlayersStr = localStorage.getItem(key);
      if (bowlingPlayersStr) break;
    }
    
    // If still no bowling players, try to get the opposite team's players
    if (!bowlingPlayersStr && battingPlayersStr) {
      // If batting team has players but bowling doesn't, create different players for bowling
      bowlingPlayersStr = null; // Force default bowling players
    }
    
    console.log('Batting Team:', this.battingTeam);
    console.log('Bowling Team:', this.bowlingTeam);
    console.log('Batting Players String:', battingPlayersStr);
    console.log('Bowling Players String:', bowlingPlayersStr);
    
    if (battingPlayersStr) {
      try {
        this.battingTeamPlayers = JSON.parse(battingPlayersStr);
        console.log('Batting Players Loaded:', this.battingTeamPlayers);
      } catch (e) {
        console.error('Error parsing batting players:', e);
        this.battingTeamPlayers = this.getDefaultBattingPlayers();
      }
    } else {
      console.log('No batting players found, using defaults');
      this.battingTeamPlayers = this.getDefaultBattingPlayers();
    }
    
    if (bowlingPlayersStr) {
      try {
        this.bowlingTeamPlayers = JSON.parse(bowlingPlayersStr);
        console.log('Bowling Players Loaded:', this.bowlingTeamPlayers);
      } catch (e) {
        console.error('Error parsing bowling players:', e);
        this.bowlingTeamPlayers = this.getDefaultBowlingPlayers();
      }
    } else {
      console.log('No bowling players found, using defaults');
      this.bowlingTeamPlayers = this.getDefaultBowlingPlayers();
    }

    // Auto-select initial players if not already selected (keeps any preloaded choices)
    this.autoSelectInitialPlayers();
  }

  // Get default batting players
  getDefaultBattingPlayers(): Player[] {
    return [
      { name: 'Player 1' }, { name: 'Player 2' }, { name: 'Player 3' },
      { name: 'Player 4' }, { name: 'Player 5' }, { name: 'Player 6' },
      { name: 'Player 7' }, { name: 'Player 8' }, { name: 'Player 9' },
      { name: 'Player 10' }, { name: 'Player 11' }
    ];
  }

  // Get default bowling players
  getDefaultBowlingPlayers(): Player[] {
    return [
      { name: 'Bowler 1' }, { name: 'Bowler 2' }, { name: 'Bowler 3' },
      { name: 'Bowler 4' }, { name: 'Bowler 5' }, { name: 'Bowler 6' },
      { name: 'Bowler 7' }, { name: 'Bowler 8' }, { name: 'Bowler 9' },
      { name: 'Bowler 10' }, { name: 'Bowler 11' }
    ];
  }

  // Auto-select initial players to avoid selection errors
  autoSelectInitialPlayers() {
    // Auto-select batsmen if not already selected
    if (!this.strikerBatsman && this.battingTeamPlayers.length > 0) {
      this.strikerBatsman = this.battingTeamPlayers[0].name;
    }
    if (!this.nonStrikerBatsman && this.battingTeamPlayers.length > 1) {
      this.nonStrikerBatsman = this.battingTeamPlayers[1].name;
    }
    
    // Auto-select bowler if not already selected
    if (!this.currentBowler && this.bowlingTeamPlayers.length > 0) {
      this.currentBowler = this.bowlingTeamPlayers[0].name;
      this.bowlerRuns = 0;
      this.bowlerWickets = 0;
      this.bowlerMaidens = 0;
      this.bowlerOvers = '0.0';
      if (!this.bowlerBallsMap[this.currentBowler]) {
        this.bowlerBallsMap[this.currentBowler] = 0;
      }
    }

    // Set initial commentary
    if (this.strikerBatsman && this.nonStrikerBatsman && this.currentBowler) {
      this.commentary = `Match ready! ${this.strikerBatsman} and ${this.nonStrikerBatsman} at the crease. ${this.currentBowler} to bowl.`;
      this.scoringDisabled = false;
    } else {
      this.commentary = 'Please select players to start scoring.';
      this.scoringDisabled = true;
    }
  }

  // Scoring methods
  addRuns(runs: number) {
    if (this.scoringDisabled) {
      alert(this.currentSelectionType === 'bowler' ? 'Please select new bowler first!' : 'Please select new batsman first!');
      return;
    }

    this.saveGameState();
    
    // Update scores
    this.teamScore += runs;
    this.bowlerRuns += runs;
    this.partnershipRuns += runs;
    
    // Update batsman stats
    if (this.onStrike === 'striker') {
      this.strikerRuns += runs;
      this.strikerBalls++;
      if (runs === 4) this.strikerFours++;
      if (runs === 6) this.strikerSixes++;
    } else {
      this.nonStrikerRuns += runs;
      this.nonStrikerBalls++;
      if (runs === 4) this.nonStrikerFours++;
      if (runs === 6) this.nonStrikerSixes++;
    }
    
    this.partnershipBalls++;
    this.ballsInOver++;  
    
    // Track bowler balls
    if (!this.bowlerBallsMap[this.currentBowler]) {
      this.bowlerBallsMap[this.currentBowler] = 0;
    }
    this.bowlerBallsMap[this.currentBowler]++;
    
    // Update bowler overs display
    this.updateBowlerOvers();
    
    // Switch strike for odd runs;
    if (runs % 2 === 1) {
      this.switchStrike();
    }
    
    this.updateRunRate();
    this.updateCommentary(runs, 'runs');
    this.addBallToCurrentOver(runs.toString(), this.getBallColor(runs), runs);
    // Ensure subscribers get ball-by-ball updates and animations
    this.updateScoringDataService(runs, true);
    
    // Now, after pushing the ball update, handle over completion
    if (this.ballsInOver === 6) {
      this.completeOver();
    }
    this.saveMatchState();
    this.checkChaseAndFinish();
  }

  wicket() {
    if (this.scoringDisabled) {
      alert(this.currentSelectionType === 'bowler' ? 'Please select new bowler first!' : 'Please select new batsman first!');
      return;
    }

    this.saveGameState();
    this.wickets++;
    this.bowlerWickets++;

    const ballOutcome: BallOutcome = {
      display: 'W',
      color: '#f44336',
      runs: 0
    };
    this.currentOverBalls.push(ballOutcome);

    this.ballsInOver++;
    if (!this.bowlerBallsMap[this.currentBowler]) {
      this.bowlerBallsMap[this.currentBowler] = 0;
    }
    this.bowlerBallsMap[this.currentBowler]++;

    // Update bowler overs display
    this.updateBowlerOvers();
    
    this.updateCommentary(0, 'wicket');
    this.updateScoringDataService();
    
    // After pushing the wicket update, handle over completion if needed
    if (this.ballsInOver === 6) {
      this.completeOver();
    }
    this.saveMatchState();

    if (this.wickets >= (this.battingTeamPlayers.length - 1)) {
      this.handleTeamAllOut();
      return;
    }

    this.showNextButton = true;
    this.currentSelectionType = 'batsman';
    this.scoringDisabled = true;
  }

  completeOver() {
    this.currentOver++;
    this.ballsInOver = 0;
    this.currentOverBalls = [];
    this.switchStrike();

    if (this.currentOver >= this.totalOvers) {
      const oversStr = `${this.currentOver}.0`;
      // If this is the second innings, finalize match immediately (could be tie or win/loss)
      if (this.isSecondInnings) {
        this.scoringDisabled = true;
        this.showNextButton = false;
        this.showInningsCloseButton = false;
        this.showNextInningsButton = false;

        // Save Team B totals and mark completed
        this.teamBService.setTotals(this.teamScore, this.wickets, oversStr);
        this.teamBService.markCompleted(true);

        // Persist second innings info into match blob
        const matchId = localStorage.getItem('currentMatchId');
        if (matchId) {
          const key = `match_${matchId}`;
          const saved = localStorage.getItem(key);
          const data = saved ? JSON.parse(saved) : {};
          data.secondInningsScore = this.teamScore;
          data.secondInningsOvers = oversStr;
          data.secondInningsComplete = true;
          localStorage.setItem(key, JSON.stringify(data));
        }

        // Decide result (Tie if equal; else higher total wins)
        let result = this.matchResultService.compareTotals();
        // Extra safety: if first innings score equals second innings, force Tie
        const fi = parseInt(localStorage.getItem('firstInningsScore') || '0', 10);
        if (!isNaN(fi) && this.teamScore === fi) {
          result = { teamARuns: fi, teamBRuns: this.teamScore, winner: 'Tie' } as any;
        }
        // Map winner label to actual team names from match data for clarity
        let winnerLabel = result.winner;
        const matchBlobStr = matchId ? localStorage.getItem(`match_${matchId}`) : null;
        if (matchBlobStr) {
          try {
            const md = JSON.parse(matchBlobStr);
            if (result.winner === 'Team A' && md.battingFirst) winnerLabel = md.battingFirst;
            if (result.winner === 'Team B' && md.battingSecond) winnerLabel = md.battingSecond;
          } catch {}
        }
        localStorage.setItem('matchWinner', winnerLabel);
        localStorage.setItem('teamARuns', result.teamARuns.toString());
        localStorage.setItem('teamBRuns', result.teamBRuns.toString());

        if (matchId) {
          const key = `match_${matchId}`;
          const saved = localStorage.getItem(key);
          const data = saved ? JSON.parse(saved) : {};
          data.winner = winnerLabel;
          data.isCompleted = true;
          localStorage.setItem(key, JSON.stringify(data));
        }

        this.commentary = `Overs completed! Match Result: ${winnerLabel}. Team A ${result.teamARuns} vs Team B ${result.teamBRuns}`;
        this.updateScoringDataService();
        this.saveMatchState();
        if (winnerLabel === 'Tie') {
          alert('Match tied!');
          this.router.navigate(['/score']);
        } else {
          this.router.navigate(['/manofmatch']);
        }
        return;
      }

      // First innings: just finish innings and allow starting second innings
      this.commentary = `Overs completed! ${this.battingTeam} scored ${this.teamScore}/${this.wickets} in ${this.totalOvers} overs`;
      this.scoringDisabled = true;
      this.showNextButton = false;
      this.showInningsCloseButton = false;
      this.showNextInningsButton = true;
      return;
    }

    this.showNextButton = true;
    this.currentSelectionType = 'bowler';
    this.scoringDisabled = true;
  }

  switchStrike() {
    this.onStrike = this.onStrike === 'striker' ? 'nonStriker' : 'striker';
  }

  // UI handler for the Switch Strike button
  switchStrikeButton() {
    if (!this.areAllPlayersSelected()) {
      alert('Please select batsman and bowler first');
      return;
    }
    // Save snapshot for undo
    this.saveGameState();
    // Toggle strike
    this.switchStrike();
    // Update commentary and sync
    this.commentary = `Strike switched. Now on strike: ${this.onStrike === 'striker' ? this.strikerBatsman : this.nonStrikerBatsman}`;
    this.updateScoringDataService();
    this.saveMatchState();
  }

  updateRunRate() {
    const totalBalls = (this.currentOver * 6) + this.ballsInOver;
    this.runRate = totalBalls > 0 ? parseFloat(((this.teamScore / totalBalls) * 6).toFixed(2)) : 0;
    this.partnershipRunRate = this.partnershipBalls > 0 ? parseFloat(((this.partnershipRuns / this.partnershipBalls) * 6).toFixed(2)) : 0;
    
    if (this.isSecondInnings) {
      this.runsRequired = Math.max(0, this.targetScore - this.teamScore);
    }
  }

  // Update bowler overs display
  updateBowlerOvers() {
    if (this.currentBowler && this.bowlerBallsMap[this.currentBowler]) {
      const totalBalls = this.bowlerBallsMap[this.currentBowler];
      const overs = Math.floor(totalBalls / 6);
      const balls = totalBalls % 6;
      this.bowlerOvers = `${overs}.${balls}`;
    }
  }

  updateCommentary(runs: number, type: string) {
    const batsman = this.onStrike === 'striker' ? this.strikerBatsman : this.nonStrikerBatsman;
    switch (type) {
      case 'runs':
        if (runs === 0) {
          this.commentary = `Dot ball! ${batsman} couldn't score`;
        } else if (runs === 4) {
          this.commentary = `FOUR! Beautiful shot by ${batsman}`;
        } else if (runs === 6) {
          this.commentary = `SIX! What a shot by ${batsman}!`;
        } else {
          this.commentary = `${runs} run(s) scored by ${batsman}`;
        }
        break;
      case 'wicket':
        this.commentary = `WICKET! ${batsman} is out! Bowled by ${this.currentBowler}`;
        break;
    }
  }

  saveGameState() {
    const state: GameState = {
      teamScore: this.teamScore,
      wickets: this.wickets,
      currentOver: this.currentOver,
      ballsInOver: this.ballsInOver,
      onStrike: this.onStrike,
      strikerBatsman: this.strikerBatsman,
      nonStrikerBatsman: this.nonStrikerBatsman,
      strikerRuns: this.strikerRuns,
      strikerBalls: this.strikerBalls,
      strikerFours: this.strikerFours,
      strikerSixes: this.strikerSixes,
      nonStrikerRuns: this.nonStrikerRuns,
      nonStrikerBalls: this.nonStrikerBalls,
      nonStrikerFours: this.nonStrikerFours,
      nonStrikerSixes: this.nonStrikerSixes,
      partnershipRuns: this.partnershipRuns,
      partnershipBalls: this.partnershipBalls,
      bowlerRuns: this.bowlerRuns,
      bowlerWickets: this.bowlerWickets,
      bowlerOvers: this.bowlerOvers,
      bowlerBallsMap: { ...this.bowlerBallsMap },
      currentBowler: this.currentBowler,
      battingTeamPlayers: [...this.battingTeamPlayers],
      commentary: this.commentary,
      currentOverBalls: [...this.currentOverBalls]
    };
    this.gameHistory.push(state);
    if (this.gameHistory.length > 10) this.gameHistory.shift();
  }

  undo() {
    if (!this.gameHistory.length) return;
    const lastState = this.gameHistory.pop()!;
    
    this.teamScore = lastState.teamScore;
    this.wickets = lastState.wickets;
    this.currentOver = lastState.currentOver;
    this.ballsInOver = lastState.ballsInOver;
    this.onStrike = lastState.onStrike;
    this.strikerBatsman = lastState.strikerBatsman;
    this.nonStrikerBatsman = lastState.nonStrikerBatsman;
    this.strikerRuns = lastState.strikerRuns;
    this.strikerBalls = lastState.strikerBalls;
    this.strikerFours = lastState.strikerFours;
    this.strikerSixes = lastState.strikerSixes;
    this.nonStrikerRuns = lastState.nonStrikerRuns;
    this.nonStrikerBalls = lastState.nonStrikerBalls;
    this.nonStrikerFours = lastState.nonStrikerFours;
    this.nonStrikerSixes = lastState.nonStrikerSixes;
    this.partnershipRuns = lastState.partnershipRuns;
    this.partnershipBalls = lastState.partnershipBalls;
    this.bowlerRuns = lastState.bowlerRuns;
    this.bowlerWickets = lastState.bowlerWickets;
    this.bowlerOvers = lastState.bowlerOvers;
    this.bowlerBallsMap = { ...lastState.bowlerBallsMap };
    this.currentBowler = lastState.currentBowler;
    this.battingTeamPlayers = [...lastState.battingTeamPlayers];
    this.commentary = lastState.commentary;
    this.currentOverBalls = lastState.currentOverBalls ? [...lastState.currentOverBalls] : [];

    // Reset any wicket/over prompts that might have been shown after last action
    this.showNextButton = false;
    this.currentSelectionType = '';
    this.scoringDisabled = false;
    this.isInningsCloseModalOpen = false;
    this.isInningsConfirmModalOpen = false;

    this.updateRunRate();
    // Keep bowler overs display consistent
    this.updateBowlerOvers();
    this.updateScoringDataService();
    this.saveMatchState();
  }

  // Ball display methods
  addBallToCurrentOver(display: string, color: string, runs: number, note?: string) {
    const ballOutcome: BallOutcome = {
      display: display,
      color: color,
      runs: runs,
      note: note
    };
    this.currentOverBalls.push(ballOutcome);
  }

  getBallColor(runs: number): string {
    switch (runs) {
      case 0: return '#607d8b';
      case 1: return '#4caf50';
      case 2: return '#2196f3';
      case 3: return '#ff9800';
      case 4: return '#e91e63';
      case 6: return '#9c27b0';
      default: return '#607d8b';
    }
  }

  getBallRows(): BallOutcome[][] {
    const rows: BallOutcome[][] = [];
    for (let i = 0; i < this.currentOverBalls.length; i += 5) {
      rows.push(this.currentOverBalls.slice(i, i + 5));
    }
    return rows;
  }

  getEmptyCirclesForRow(rowIndex: number): number[] {
    const ballsInThisRow = this.currentOverBalls.slice(rowIndex * 5, (rowIndex + 1) * 5).length;
    const emptyCount = 5 - ballsInThisRow;
    return emptyCount > 0 ? Array(emptyCount).fill(0).map((_, i) => i) : [];
  }

  getOverRuns(): number {
    return this.currentOverBalls.reduce((total, ball) => total + (ball.runs || 0), 0);
  }

  // Player selection
  showPlayerSelection() {
    if (this.currentSelectionType === 'bowler') {
      const quotaBalls = this.limitPerBowler * 6;
      this.availablePlayersForSelection = this.bowlingTeamPlayers.filter(p => {
        const b = this.bowlerBallsMap[p.name] || 0;
        return b < quotaBalls || p.name === this.currentBowler;
      });
      this.playerModalTitle = `Select New Bowler (max ${this.limitPerBowler} overs per bowler)`;
    } else if (this.currentSelectionType === 'batsman') {
      // Exclude the two currently on crease so they don't appear again in the list
      const exclude = [this.strikerBatsman, this.nonStrikerBatsman].filter(Boolean);
      this.availablePlayersForSelection = this.battingTeamPlayers.filter(p => !exclude.includes(p.name));
      this.playerModalTitle = 'Select New Batsman';
    }
    this.isPlayerModalOpen = true;
  }

  selectPlayerFromModal(player: Player) {
    // Save a snapshot so undo can revert player selections
    this.saveGameState();
    if (this.currentSelectionType === 'bowler') {
      this.currentBowler = player.name;
      this.bowlerRuns = 0;
      this.bowlerWickets = 0;
      this.bowlerMaidens = 0;
      this.bowlerOvers = '0.0';
      if (!this.bowlerBallsMap[this.currentBowler]) this.bowlerBallsMap[this.currentBowler] = 0;
      this.commentary = `New bowler: ${player.name} comes to bowl`;
      this.currentOverBalls = [];
    } else if (this.currentSelectionType === 'batsman') {
      const outPlayerName = this.onStrike === 'striker' ? this.strikerBatsman : this.nonStrikerBatsman;
      this.battingTeamPlayers = this.battingTeamPlayers.filter(p => p.name !== outPlayerName && p.name !== player.name);
      if (this.onStrike === 'striker') {
        this.strikerBatsman = player.name;
        this.strikerRuns = this.strikerBalls = this.strikerFours = this.strikerSixes = 0;
      } else {
        this.nonStrikerBatsman = player.name;
        this.nonStrikerRuns = this.nonStrikerBalls = this.nonStrikerFours = this.nonStrikerSixes = 0;
      }
      this.partnershipRuns = this.partnershipBalls = this.partnershipRunRate = 0;
      this.commentary = `${player.name} comes to bat`;
    }

    this.closePlayerModal();
    this.showNextButton = false;
    this.currentSelectionType = '';
    this.scoringDisabled = false;
    this.showInningsCloseButton = false;
    this.isInningsCloseModalOpen = false;
    this.isInningsConfirmModalOpen = false;
    
    this.updateScoringDataService();
    this.saveMatchState();
  }

  closePlayerModal() {
    this.isPlayerModalOpen = false;
    this.availablePlayersForSelection = [];
    this.playerModalTitle = '';
  }

  // Match completion
  private checkChaseAndFinish() {
    if (!this.isSecondInnings) return;
    if (this.teamScore >= this.targetScore) {
      this.scoringDisabled = true;
      this.showNextButton = false;
      this.showInningsCloseButton = false;
      this.showNextInningsButton = false;

      const oversStr = `${this.currentOver}.${this.ballsInOver}`;
      this.teamBService.setTotals(this.teamScore, this.wickets, oversStr);
      this.teamBService.markCompleted(true);

      const matchId = localStorage.getItem('currentMatchId');
      if (matchId) {
        const key = `match_${matchId}`;
        const saved = localStorage.getItem(key);
        const data = saved ? JSON.parse(saved) : {};
        data.secondInningsScore = this.teamScore;
        data.secondInningsOvers = oversStr;
        data.secondInningsComplete = true;
        localStorage.setItem(key, JSON.stringify(data));
      }

      let result = this.matchResultService.compareTotals();
      // Extra safety: if first innings score equals second innings, force Tie
      const fi = parseInt(localStorage.getItem('firstInningsScore') || '0', 10);
      if (!isNaN(fi) && this.teamScore === fi) {
        result = { teamARuns: fi, teamBRuns: this.teamScore, winner: 'Tie' } as any;
      }
      // Map winner label to actual team names from match data for clarity
      let winnerLabel = result.winner;
      const matchBlobStr = matchId ? localStorage.getItem(`match_${matchId}`) : null;
      if (matchBlobStr) {
        try {
          const md = JSON.parse(matchBlobStr);
          if (result.winner === 'Team A' && md.battingFirst) winnerLabel = md.battingFirst;
          if (result.winner === 'Team B' && md.battingSecond) winnerLabel = md.battingSecond;
        } catch {}
      }
      localStorage.setItem('matchWinner', winnerLabel);
      localStorage.setItem('teamARuns', result.teamARuns.toString());
      localStorage.setItem('teamBRuns', result.teamBRuns.toString());

      if (matchId) {
        const key = `match_${matchId}`;
        const saved = localStorage.getItem(key);
        const data = saved ? JSON.parse(saved) : {};
        data.winner = winnerLabel;
        data.isCompleted = true;
        localStorage.setItem(key, JSON.stringify(data));
      }

      this.commentary = `Match Result: ${winnerLabel}. Team A ${result.teamARuns} vs Team B ${result.teamBRuns}`;

      // Keep SCRA data active - update with final match state
      this.updateScoringDataService();
      
      this.router.navigate(['/manofmatch']);
    }
  }

  confirmInningsClose() {
    this.isInningsCloseModalOpen = false;
    this.isInningsConfirmModalOpen = true;
  }

  finalizeInningsClose() {
    const oversStr = `${this.currentOver}.${this.ballsInOver}`;
    if (!this.isSecondInnings) {
      this.teamAService.setTotals(this.teamScore, this.wickets, oversStr);
      this.teamAService.markCompleted(true);

      localStorage.setItem('firstInningsScore', this.teamScore.toString());
      localStorage.setItem('firstInningsWickets', this.wickets.toString());
      localStorage.setItem('firstInningsOvers', oversStr);
      localStorage.setItem('firstInningsTeam', this.battingTeam);
      localStorage.setItem('firstInningsComplete', 'true');

      const matchId = localStorage.getItem('currentMatchId');
      if (matchId) {
        const key = `match_${matchId}`;
        const saved = localStorage.getItem(key);
        const data = saved ? JSON.parse(saved) : {};
        data.firstInningsScore = this.teamScore;
        data.firstInningsOvers = oversStr;
        data.firstInningsComplete = true;
        data.battingFirst = this.battingTeam;
        data.battingSecond = this.bowlingTeam;
        localStorage.setItem(key, JSON.stringify(data));
      }

      const newBattingTeam = this.bowlingTeam;
      const newBowlingTeam = this.battingTeam;
      localStorage.setItem('currentBattingTeam', newBattingTeam);
      localStorage.setItem('currentBowlingTeam', newBowlingTeam);
      localStorage.setItem('isSecondInnings', 'true');

      this.commentary = `First innings completed! ${this.battingTeam} scored ${this.teamScore}/${this.wickets}. Starting second innings...`;

      // Navigate to squad selection for second innings
      this.router.navigate(['/sequard']);
    } else {
      this.teamBService.setTotals(this.teamScore, this.wickets, oversStr);
      this.teamBService.markCompleted(true);

      // Prepare match id for mapping and persistence
      const matchId = localStorage.getItem('currentMatchId');

      // Decide result (Tie if equal; else higher total wins)
      let result = this.matchResultService.compareTotals();
      // Extra safety: if first innings score equals second innings, force Tie
      const fi = parseInt(localStorage.getItem('firstInningsScore') || '0', 10);
      if (!isNaN(fi) && this.teamScore === fi) {
        result = { teamARuns: fi, teamBRuns: this.teamScore, winner: 'Tie' } as any;
      }
      // Map winner label to actual team names from match data for clarity
      let winnerLabel = result.winner;
      const matchBlobStr = matchId ? localStorage.getItem(`match_${matchId}`) : null;
      if (matchBlobStr) {
        try {
          const md = JSON.parse(matchBlobStr);
          if (result.winner === 'Team A' && md.battingFirst) winnerLabel = md.battingFirst;
          if (result.winner === 'Team B' && md.battingSecond) winnerLabel = md.battingSecond;
        } catch {}
      }
      localStorage.setItem('matchWinner', winnerLabel);
      localStorage.setItem('teamARuns', result.teamARuns.toString());
      localStorage.setItem('teamBRuns', result.teamBRuns.toString());
      this.commentary = `Match Result: ${winnerLabel}. Team A ${result.teamARuns} vs Team B ${result.teamBRuns}`;

      if (matchId) {
        const key = `match_${matchId}`;
        const saved = localStorage.getItem(key);
        const data = saved ? JSON.parse(saved) : {};
        data.secondInningsScore = this.teamScore;
        data.secondInningsOvers = oversStr;
        data.secondInningsComplete = true;
        data.winner = winnerLabel;
        data.isCompleted = true;
        localStorage.setItem(key, JSON.stringify(data));
      }

      // Keep SCRA data active - update with final match state
      this.updateScoringDataService();
      
      if (winnerLabel === 'Tie') {
        alert('Match tied!');
        this.router.navigate(['/score']);
      } else {
        this.router.navigate(['/manofmatch']);
      }
    }
  }

  handleTeamAllOut() {
    const oversStr = `${this.currentOver}.${this.ballsInOver}`;
    if (this.isSecondInnings) {
      // Second innings all out: finalize match immediately
      this.scoringDisabled = true;
      this.showNextButton = false;
      this.showInningsCloseButton = false;
      this.showNextInningsButton = false;

      // Save Team B totals and mark completed
      this.teamBService.setTotals(this.teamScore, this.wickets, oversStr);
      this.teamBService.markCompleted(true);

      // Persist second innings info into match blob
      const matchId = localStorage.getItem('currentMatchId');
      if (matchId) {
        const key = `match_${matchId}`;
        const saved = localStorage.getItem(key);
        const data = saved ? JSON.parse(saved) : {};
        data.secondInningsScore = this.teamScore;
        data.secondInningsOvers = oversStr;
        data.secondInningsComplete = true;
        localStorage.setItem(key, JSON.stringify(data));
      }

      // Decide result (Tie if equal; else higher total wins)
      let result = this.matchResultService.compareTotals();
      // Extra safety: if first innings score equals second innings, force Tie
      const fi = parseInt(localStorage.getItem('firstInningsScore') || '0', 10);
      if (!isNaN(fi) && this.teamScore === fi) {
        result = { teamARuns: fi, teamBRuns: this.teamScore, winner: 'Tie' } as any;
      }
      // Map winner label to actual team names from match data for clarity
      let winnerLabel = result.winner;
      const matchBlobStr = matchId ? localStorage.getItem(`match_${matchId}`) : null;
      if (matchBlobStr) {
        try {
          const md = JSON.parse(matchBlobStr);
          if (result.winner === 'Team A' && md.battingFirst) winnerLabel = md.battingFirst;
          if (result.winner === 'Team B' && md.battingSecond) winnerLabel = md.battingSecond;
        } catch {}
      }
      localStorage.setItem('matchWinner', winnerLabel);
      localStorage.setItem('teamARuns', result.teamARuns.toString());
      localStorage.setItem('teamBRuns', result.teamBRuns.toString());

      if (matchId) {
        const key = `match_${matchId}`;
        const saved = localStorage.getItem(key);
        const data = saved ? JSON.parse(saved) : {};
        data.winner = winnerLabel;
        data.isCompleted = true;
        localStorage.setItem(key, JSON.stringify(data));
      }

      this.commentary = `All out! Match Result: ${winnerLabel}. Team A ${result.teamARuns} vs Team B ${result.teamBRuns}`;
      this.updateScoringDataService();
      this.saveMatchState();
      if (winnerLabel === 'Tie') {
        alert('Match tied!');
        this.router.navigate(['/score']);
      } else {
        this.router.navigate(['/manofmatch']);
      }
    } else {
      // First innings all out: end innings, allow starting second innings
      this.commentary = `All out! ${this.battingTeam} is bowled out for ${this.teamScore}/${this.wickets}`;
      this.scoringDisabled = true;
      this.showNextButton = false;
      this.showInningsCloseButton = false;
      this.showNextInningsButton = true;
    }
  }

  deleteLastEntry() {
    this.undo();
    this.isInningsCloseModalOpen = false;
  }

  cancelInningsClose() {
    this.isInningsConfirmModalOpen = false;
    this.scoringDisabled = false;
  }

  startNextInnings() {
    // Save first innings data
    const oversStr = `${this.currentOver}.${this.ballsInOver}`;
    if (!this.isSecondInnings) {
      this.teamAService.setTotals(this.teamScore, this.wickets, oversStr);
      this.teamAService.markCompleted(true);

      localStorage.setItem('firstInningsScore', this.teamScore.toString());
      localStorage.setItem('firstInningsWickets', this.wickets.toString());
      localStorage.setItem('firstInningsOvers', oversStr);
      localStorage.setItem('firstInningsTeam', this.battingTeam);
      localStorage.setItem('firstInningsComplete', 'true');

      const matchId = localStorage.getItem('currentMatchId');
      if (matchId) {
        const key = `match_${matchId}`;
        const saved = localStorage.getItem(key);
        const data = saved ? JSON.parse(saved) : {};
        data.firstInningsScore = this.teamScore;
        data.firstInningsOvers = oversStr;
        data.firstInningsComplete = true;
        data.battingFirst = this.battingTeam;
        data.battingSecond = this.bowlingTeam;
        localStorage.setItem(key, JSON.stringify(data));
      }

      const newBattingTeam = this.bowlingTeam;
      const newBowlingTeam = this.battingTeam;
      localStorage.setItem('currentBattingTeam', newBattingTeam);
      localStorage.setItem('currentBowlingTeam', newBowlingTeam);
      localStorage.setItem('isSecondInnings', 'true');

      this.commentary = `First innings completed! ${this.battingTeam} scored ${this.teamScore}/${this.wickets}. Starting second innings...`;

      // Navigate to squad selection for second innings
      this.router.navigate(['/sequard']);
    }
  }

  openInningsCloseModal() {
    this.isInningsCloseModalOpen = true;
  }

  closeInningsCloseModal() {
    this.isInningsCloseModalOpen = false;
  }

  closeInningsConfirmModal() {
    this.isInningsConfirmModalOpen = false;
  }

  // Add extra runs (wides, no-balls, etc.)
  addExtra(type: string) {
    if (!this.strikerBatsman || !this.currentBowler) {
      alert('Please select batsman and bowler first');
      return;
    }

    // Save current state for undo
    this.saveGameState();

    let extraRuns = 1; // Default 1 run for wide/no-ball

    if (type === 'wd') {
      // Wide ball: adds 1 run, does NOT consume a legal ball
      this.teamScore += extraRuns;
      this.bowlerRuns += extraRuns;
      this.commentary = `${extraRuns} Wide by ${this.currentBowler}`;
      // Show 'W' in the ball circle for a wide
      this.addBallToCurrentOver('W', 'orange', 0);
      // Do NOT increment partnership balls for wides
      this.partnershipRuns += extraRuns;
    } else if (type === 'nb') {
      // No ball: adds 1 run, does NOT consume a legal ball
      this.teamScore += extraRuns;
      this.bowlerRuns += extraRuns;
      this.commentary = `${extraRuns} No Ball by ${this.currentBowler}`;
      // Show 'NB' in the ball circle for a no-ball
      this.addBallToCurrentOver('NB', 'orange', 0);
      // Do NOT increment partnership balls for no-balls
      this.partnershipRuns += extraRuns;
    } else if (type === 'lb' || type === 'by') {
      // Leg bye or Bye: legal delivery, adds runs to team but not to batsman, and consumes a ball
      this.teamScore += extraRuns;
      // Do NOT add to bowlerRuns for byes/leg byes
      this.commentary = type === 'lb' ? `${extraRuns} Leg Bye` : `${extraRuns} Bye`;
      // Consume a legal ball
      this.ballsInOver++;
      if (!this.bowlerBallsMap[this.currentBowler]) {
        this.bowlerBallsMap[this.currentBowler] = 0;
      }
      this.bowlerBallsMap[this.currentBowler]++;
      // Update bowler overs text
      this.updateBowlerOvers();
      // Add circle marker with proper label and include runs in over tally
      const label = type === 'lb' ? 'LB' : 'B';
      this.addBallToCurrentOver(label, '#ffc107', extraRuns);
      // Partnership includes extras; increment runs and balls
      this.partnershipRuns += extraRuns;
      this.partnershipBalls++;
      // Switch strike on odd extras because batsmen ran
      if (extraRuns % 2 === 1) {
        this.switchStrike();
      }
      // Check for over completion
      if (this.ballsInOver === 6) {
        this.completeOver();
      }
    }

    // Update run rate and partnership run rate (balls unchanged for wd/nb)
    this.updateRunRate();
    this.partnershipRunRate = this.partnershipBalls > 0 ? (this.partnershipRuns * 6) / this.partnershipBalls : 0;

    // Update required runs for second innings
    if (this.isSecondInnings) {
      this.runsRequired = this.targetScore - this.teamScore;
    }

    // Update SCRA data service
    this.updateScoringDataService();
    this.saveMatchState();
  }

  // Wide modal handlers
  openWideModal() {
    if (!this.areAllPlayersSelected()) {
      alert('Please select batsman and bowler first');
      return;
    }
    this.wideExtraRuns = 0;
    this.isWideModalOpen = true;
  }

  closeWideModal() {
    this.isWideModalOpen = false;
  }

  cycleWideExtra() {
    // Cycle 0 -> 5
    this.wideExtraRuns = (this.wideExtraRuns + 1) % 6;
  }

  // Open keypad modal to pick extra runs (0..7)
  openWideSelectModal() {
    this.isWideSelectModalOpen = true;
  }

  closeWideSelectModal() {
    this.isWideSelectModalOpen = false;
  }

  selectWideExtra(n: number) {
    if (typeof n === 'number' && n >= 0 && n <= 7) {
      this.wideExtraRuns = n;
    }
    this.closeWideSelectModal();
  }

  applyWide() {
    // Allow applying wides even if players not fully selected
    // Save for undo
    this.saveGameState();
    const totalWide = 1 + (this.wideExtraRuns || 0);
    // Score impact (does not consume legal ball)
    this.teamScore += totalWide;
    this.bowlerRuns += totalWide;
    this.commentary = `Wide ${this.wideExtraRuns ? '+' + this.wideExtraRuns + ' extra ' : ''}by ${this.currentBowler} (Total ${totalWide})`;
    // Show W marker (non-legal delivery). If extras > 0, show note below like +2
    const note = this.wideExtraRuns && this.wideExtraRuns > 0 ? `+${this.wideExtraRuns}` : undefined;
    this.addBallToCurrentOver('W', 'orange', 0, note);
    // Partnership includes wides but not balls
    this.partnershipRuns += totalWide;
    this.partnershipRunRate = this.partnershipBalls > 0 ? (this.partnershipRuns * 6) / this.partnershipBalls : 0;
    // Second innings chase update
    if (this.isSecondInnings) {
      this.runsRequired = Math.max(0, this.targetScore - this.teamScore);
      this.checkChaseAndFinish();
    }
    // Update aggregates and persist
    this.updateRunRate();
    this.updateScoringDataService();
    this.saveMatchState();
    this.closeWideModal();
  }

  // LB modal handlers (class methods)
  openLbModal() {
    if (!this.areAllPlayersSelected()) { alert('Please select batsman and bowler first'); return; }
    this.lbExtraRuns = 0;
    this.isLbModalOpen = true;
  }
  closeLbModal() { this.isLbModalOpen = false; }
  openLbSelectModal() { this.isLbSelectModalOpen = true; }
  closeLbSelectModal() { this.isLbSelectModalOpen = false; }
  selectLbExtra(n: number) { this.lbExtraRuns = Math.max(0, Math.min(7, n|0)); this.closeLbSelectModal(); }
  applyLb() {
    // Allow applying leg byes even if players not fully selected
    this.saveGameState();
    const runs = this.lbExtraRuns;
    this.teamScore += runs;
    this.ballsInOver++;
    if (!this.bowlerBallsMap[this.currentBowler]) this.bowlerBallsMap[this.currentBowler] = 0;
    this.bowlerBallsMap[this.currentBowler]++;
    this.updateBowlerOvers();
    this.addBallToCurrentOver('LB', '#ffc107', runs, runs > 0 ? `+${runs}` : undefined);
    this.partnershipRuns += runs;
    this.partnershipBalls++;
    if (runs % 2 === 1) this.switchStrike();
    if (this.ballsInOver === 6) this.completeOver();
    this.updateRunRate();
    if (this.isSecondInnings) this.runsRequired = Math.max(0, this.targetScore - this.teamScore);
    this.updateScoringDataService();
    this.saveMatchState();
    this.closeLbModal();
  }

  // BY modal handlers
  openByModal() {
    if (!this.areAllPlayersSelected()) { alert('Please select batsman and bowler first'); return; }
    this.byExtraRuns = 0;
    this.isByModalOpen = true;
  }
  closeByModal() { this.isByModalOpen = false; }
  openBySelectModal() { this.isBySelectModalOpen = true; }
  closeBySelectModal() { this.isBySelectModalOpen = false; }
  selectByExtra(n: number) { this.byExtraRuns = Math.max(0, Math.min(7, n|0)); this.closeBySelectModal(); }
  applyBy() {
    // Allow applying byes even if players not fully selected
    this.saveGameState();
    const runs = this.byExtraRuns;
    this.teamScore += runs;
    this.ballsInOver++;
    if (!this.bowlerBallsMap[this.currentBowler]) this.bowlerBallsMap[this.currentBowler] = 0;
    this.bowlerBallsMap[this.currentBowler]++;
    this.updateBowlerOvers();
    this.addBallToCurrentOver('B', '#ffc107', runs, runs > 0 ? `+${runs}` : undefined);
    this.partnershipRuns += runs;
    this.partnershipBalls++;
    if (runs % 2 === 1) this.switchStrike();
    if (this.ballsInOver === 6) this.completeOver();
    this.updateRunRate();
    if (this.isSecondInnings) this.runsRequired = Math.max(0, this.targetScore - this.teamScore);
    this.updateScoringDataService();
    this.saveMatchState();
    this.closeByModal();
  }

  // NB modal handlers
  openNbModal() {
    if (!this.areAllPlayersSelected()) { alert('Please select batsman and bowler first'); return; }
    this.nbExtraRuns = 0;
    this.isNbModalOpen = true;
  }
  closeNbModal() { this.isNbModalOpen = false; }
  openNbSelectModal() { this.isNbSelectModalOpen = true; }
  closeNbSelectModal() { this.isNbSelectModalOpen = false; }
  selectNbExtra(n: number) { this.nbExtraRuns = Math.max(0, Math.min(7, n|0)); this.closeNbSelectModal(); }
  applyNb() {
    // Allow applying no-balls even if players not fully selected
    this.saveGameState();
    const total = 1 + this.nbExtraRuns;
    this.teamScore += total;
    this.bowlerRuns += total;
    this.commentary = `No Ball ${this.nbExtraRuns ? '+'+this.nbExtraRuns+' extra ' : ''}by ${this.currentBowler} (Total ${total})`;
    const note = this.nbExtraRuns > 0 ? `+${this.nbExtraRuns}` : undefined;
    this.addBallToCurrentOver('NB', 'orange', 0, note);
    this.partnershipRuns += total;
    this.updateRunRate();
    if (this.isSecondInnings) this.runsRequired = Math.max(0, this.targetScore - this.teamScore);
    this.updateScoringDataService();
    this.saveMatchState();
    this.closeNbModal();
  }

  // Check if all required players are selected
  areAllPlayersSelected(): boolean {
    return !!(this.strikerBatsman && this.nonStrikerBatsman && this.currentBowler);
  }

  // Replace batsman (for wickets)
  replaceBatsman() {
    console.log('Replace batsman clicked');
    console.log('Batting team players:', this.battingTeamPlayers);
    console.log('Current striker:', this.strikerBatsman);
    console.log('Current non-striker:', this.nonStrikerBatsman);
    
    this.currentSelectionType = 'batsman';
    
    // Filter out current batsmen to show available replacements
    this.availablePlayersForSelection = this.battingTeamPlayers.filter(p => 
      p.name !== this.strikerBatsman && p.name !== this.nonStrikerBatsman
    );
    
    console.log('Available players for selection:', this.availablePlayersForSelection);
    
    // If no batting players available, show error
    if (this.availablePlayersForSelection.length === 0) {
      alert('No batting players available for replacement!');
      return;
    }
    
    this.playerModalTitle = 'Select New Batsman';
    this.isPlayerModalOpen = true;
    
    console.log('Player modal opened for batsman selection');
  }

  // Replace bowler (change bowler)
  replaceBowler() {
    this.currentSelectionType = 'bowler';
    this.availablePlayersForSelection = this.bowlingTeamPlayers.filter(p => 
      p.name !== this.currentBowler
    );
    this.playerModalTitle = 'Select New Bowler';
    this.isPlayerModalOpen = true;
  }

  // Injured bowler (replace due to injury)
  injuredBowler() {
    this.replaceBowler();
  }

  // Show pitch map (placeholder)
  showPitchMap() {
    alert('Pitch map feature coming soon!');
  }

  // Edit batsman (change striker/non-striker)
  editBatsman(type: string) {
    if (type === 'striker') {
      this.onStrike = 'striker';
    } else if (type === 'nonStriker') {
      this.onStrike = 'nonStriker';
    }
    this.replaceBatsman();
  }

  // Other methods
  editScoreCard() {
    alert('Edit scorecard feature coming soon!');
  }

  changeSquad() {
    // Navigate to Squad selection page
    this.router.navigate(['/sequard']);
  }

  changeWK() {
    // Reuse squad page to change wicket keeper
    this.router.navigate(['/sequard']);
  }

  changeScorer() {
    // Open scorer info modal
    this.isScorerModalOpen = true;
  }

  viewScoreCard() {
    // Navigate to Score page (existing page)
    this.router.navigate(['/score']);
  }

  settings() {
    // Navigate to dedicated Settings page for full-screen UI
    this.router.navigate(['/setting']);
  }

  closeSettingsModal() {
    this.isSettingsModalOpen = false;
  }

  applySettingsModal() {
    const o = parseInt(String(this.settingsOvers), 10);
    const l = parseInt(String(this.settingsLimit), 10);
    if (o > 0) {
      try { this.matchService.setOvers(o); } catch {}
      this.totalOvers = o;
      localStorage.setItem('totalOvers', String(o));
    }
    if (l > 0) {
      try { this.matchService.setBowlerLimit(l); } catch {}
      this.limitPerBowler = l;
      localStorage.setItem('limitPerBowler', String(l));
    }
    this.updateScoringDataService();
    this.saveMatchState();
    this.closeSettingsModal();
  }

  closeScorerModal() {
    this.isScorerModalOpen = false;
  }

  applyScorerModal() {
    localStorage.setItem('scorerName', this.scorerName || '');
    localStorage.setItem('scorerPhone', this.scorerPhone || '');
    this.closeScorerModal();
  }

  moreOptions() {
    // Toggle the inline More Options panel
    this.showMoreOptions = !this.showMoreOptions;
  }

  // More Options: Dropped Catch (no run change by default, just commentary marker)
  moreDroppedCatch() {
    if (!this.areAllPlayersSelected()) { alert('Please select batsman and bowler first'); return; }
    this.commentary = 'Dropped catch! A life for the batsman.';
    this.updateScoringDataService();
    this.saveMatchState();
  }

  // More Options: Penalty +5 runs to batting side, does NOT consume a ball
  morePenaltyFive() {
    if (!this.areAllPlayersSelected()) { alert('Please select batsman and bowler first'); return; }
    this.saveGameState();
    const extra = 5;
    this.teamScore += extra;
    this.bowlerRuns += extra; // penalty often against fielding side; still reflects in over runs in many apps
    this.partnershipRuns += extra;
    // Does not increment ballsInOver nor bowler ball count
    this.commentary = `Penalty ${extra} runs awarded to batting side.`;
    // Show a circle like wides: marker 'P' with note '+5', non-legal delivery (runs=0 so legal over total unchanged)
    this.addBallToCurrentOver('P', '#ff9800', 0, `+${extra}`);
    this.updateRunRate();
    if (this.isSecondInnings) {
      this.runsRequired = Math.max(0, this.targetScore - this.teamScore);
      this.checkChaseAndFinish();
    }
    this.updateScoringDataService();
    this.saveMatchState();
  }

  // More Options: Saved/Missed Runs marker (no score change; UX marker only)
  moreSavedMissedRuns() {
    if (!this.areAllPlayersSelected()) { alert('Please select batsman and bowler first'); return; }
    this.commentary = 'Brilliant save / missed runs moment!';
    this.updateScoringDataService();
    this.saveMatchState();
  }

  // More Options: Exit closes the panel
  moreOptionsExit() {
    this.showMoreOptions = false;
  }

  // SCRA data service integration
  updateScoringDataService(lastScoredRuns?: number, animationTrigger?: boolean) {
    // Advance event sequence and persist per match to guarantee monotonicity across reloads
    this.eventSeq = (this.eventSeq || 0) + 1;
    const seqKey = `match_${this.currentMatchId}_eventSeq`;
    try { localStorage.setItem(seqKey, String(this.eventSeq)); } catch {}
    const now = Date.now();
    const scoringData = {
      battingTeam: this.battingTeam,
      bowlingTeam: this.bowlingTeam,
      teamScore: this.teamScore,
      wickets: this.wickets,
      currentOver: this.currentOver,
      ballsInOver: this.ballsInOver,
      totalOvers: this.totalOvers,
      runRate: this.runRate,
      strikerBatsman: this.strikerBatsman,
      nonStrikerBatsman: this.nonStrikerBatsman,
      onStrike: this.onStrike,
      strikerRuns: this.strikerRuns,
      strikerBalls: this.strikerBalls,
      strikerFours: this.strikerFours,
      strikerSixes: this.strikerSixes,
      nonStrikerRuns: this.nonStrikerRuns,
      nonStrikerBalls: this.nonStrikerBalls,
      nonStrikerFours: this.nonStrikerFours,
      nonStrikerSixes: this.nonStrikerSixes,
      partnershipRuns: this.partnershipRuns,
      partnershipBalls: this.partnershipBalls,
      partnershipRunRate: this.partnershipRunRate,
      currentBowler: this.currentBowler,
      bowlerType: this.bowlerType,
      bowlerOvers: this.bowlerOvers,
      bowlerRuns: this.bowlerRuns,
      bowlerMaidens: this.bowlerMaidens,
      bowlerWickets: this.bowlerWickets,
      commentary: this.commentary,
      currentOverBalls: this.currentOverBalls,
      targetScore: this.targetScore,
      isSecondInnings: this.isSecondInnings,
      runsRequired: this.runsRequired,
      lastScoredRuns: lastScoredRuns ?? 0,
      animationTrigger: animationTrigger ?? false,
      updatedAt: now,
      eventSeq: this.eventSeq
    };

    this.scoringDataService.updateScoringData(scoringData);
    // Push to Firebase for realtime sync
    try {
      const p = this.liveScore.pushUpdate(scoringData);
      if (p && typeof (p as any).then === 'function') {
        (p as Promise<any>).catch(err => {
          console.error('[Scoringstart] Firebase pushUpdate failed:', err);
        });
      }
    } catch (err) {
      console.error('[Scoringstart] pushUpdate threw synchronously:', err);
    }
  }

  // Restore match state from localStorage
  restoreMatchState() {
    const savedState = localStorage.getItem('cricketMatchState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState!);
        console.log('Found saved state but skipping restore for new match:', state);
        // Skip restoration - let new match start fresh
        return;
        
        // Restore all match variables
        this.teamScore = state.teamScore || 0;
        this.wickets = state.wickets || 0;
        this.currentOver = state.currentOver || 0;
        this.ballsInOver = state.ballsInOver || 0;
        this.runRate = state.runRate || 0;
        
        // Restore batsman details
        this.strikerBatsman = state.strikerBatsman || '';
        this.nonStrikerBatsman = state.nonStrikerBatsman || '';
        this.onStrike = state.onStrike || 'striker';
        this.strikerRuns = state.strikerRuns || 0;
        this.strikerBalls = state.strikerBalls || 0;
        this.strikerFours = state.strikerFours || 0;
        this.strikerSixes = state.strikerSixes || 0;
        this.nonStrikerRuns = state.nonStrikerRuns || 0;
        this.nonStrikerBalls = state.nonStrikerBalls || 0;
        this.nonStrikerFours = state.nonStrikerFours || 0;
        this.nonStrikerSixes = state.nonStrikerSixes || 0;
        
        // Restore partnership details
        this.partnershipRuns = state.partnershipRuns || 0;
        this.partnershipBalls = state.partnershipBalls || 0;
        this.partnershipRunRate = state.partnershipRunRate || 0;
        
        // Restore bowler details
        this.currentBowler = state.currentBowler || '';
        this.bowlerType = state.bowlerType || '';
        this.bowlerOvers = state.bowlerOvers || '0.0';
        this.bowlerRuns = state.bowlerRuns || 0;
        this.bowlerMaidens = state.bowlerMaidens || 0;
        this.bowlerWickets = state.bowlerWickets || 0;
        this.bowlerBallsMap = state.bowlerBallsMap || {};
        
        // Restore commentary and over details
        this.commentary = state.commentary || [];
        this.currentOverBalls = state.currentOverBalls || [];
        this.gameHistory = state.gameHistory || [];
        
        // Restore second innings details
        if (this.isSecondInnings) {
          this.runsRequired = state.runsRequired || this.targetScore;
        }
        
        console.log('Match state restored successfully');
      } catch (e) {
        console.error('Error restoring match state:', e);
      }
    } else {
      console.log('No saved match state found');
    }
  }

  // Save current match state to localStorage
  saveMatchState() {
    const matchState = {
      teamScore: this.teamScore,
      wickets: this.wickets,
      currentOver: this.currentOver,
      ballsInOver: this.ballsInOver,
      runRate: this.runRate,
      strikerBatsman: this.strikerBatsman,
      nonStrikerBatsman: this.nonStrikerBatsman,
      onStrike: this.onStrike,
      strikerRuns: this.strikerRuns,
      strikerBalls: this.strikerBalls,
      strikerFours: this.strikerFours,
      strikerSixes: this.strikerSixes,
      nonStrikerRuns: this.nonStrikerRuns,
      nonStrikerBalls: this.nonStrikerBalls,
      nonStrikerFours: this.nonStrikerFours,
      nonStrikerSixes: this.nonStrikerSixes,
      partnershipRuns: this.partnershipRuns,
      partnershipBalls: this.partnershipBalls,
      partnershipRunRate: this.partnershipRunRate,
      currentBowler: this.currentBowler,
      bowlerType: this.bowlerType,
      bowlerOvers: this.bowlerOvers,
      bowlerRuns: this.bowlerRuns,
      bowlerMaidens: this.bowlerMaidens,
      bowlerWickets: this.bowlerWickets,
      bowlerBallsMap: this.bowlerBallsMap,
      commentary: this.commentary,
      currentOverBalls: this.currentOverBalls,
      gameHistory: this.gameHistory,
      runsRequired: this.runsRequired,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cricketMatchState', JSON.stringify(matchState));
    console.log('Match state saved:', matchState);
  }
}
