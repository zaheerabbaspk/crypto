import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ScoringDataService, ScoringData } from '../services/scoring-data.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LiveScoreService } from '../services/live-score.service';

interface Player {
  name: string;
  runs: number;
  balls: number;
  bowling?: string;
  overs?: number;
}

@Component({
  selector: 'app-scra',
  templateUrl: './scra.page.html',
  styleUrls: ['./scra.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
  animations: [
    trigger('fadeInOut', [
      state('in', style({opacity: 1, transform: 'scale(1)'})),
      transition('void => *', [
        style({opacity: 0, transform: 'scale(0.9)'}),
        animate('500ms ease-in-out')
      ]),
      transition('* => void', [
        animate('500ms ease-in-out', style({opacity: 0, transform: 'scale(0.9)'}))
      ])
    ])
  ]
})
export class ScraPage implements OnInit, OnDestroy {
  scoringData: ScoringData | null = null;
  private subscription: Subscription = new Subscription();
  private previousBallsInOver = 0;
  private previousCurrentOver = 0;
  private storageListener = (e: StorageEvent) => {
    if (e.key === 'currentMatchId' && e.newValue) {
      try {
        // Reattach live listener to the new match id
        this.liveScore.setMatch(e.newValue);
        this.liveScore.listen((cloudData: ScoringData | null) => {
          if (cloudData) {
            this.scoringDataService.updateScoringData(cloudData);
          }
        });
        console.log('[SCRA] Switched live listener to match', e.newValue);
      } catch (err) {
        console.error('[SCRA] Error switching live listener:', err);
      }
    }
  };
  
  // Match summary overlay properties
  showSummaryOverlay = false;
  summaryData: any = null;

  // Default/fallback data when no scoring data is available
  team = {
    short: 'WARRIORS',
    name: 'Warriors',
  };

  innings = {
    runs: 48,
    wickets: 0,
    overs: '5.1',
    phaseTag: 'P',
  };

  comparisonText = 'AT THIS STAGE KNIGHT RIDERS WERE 47-2';

  striker = {
    name: 'AYUB',
    runs: 36,
    balls: 20,
    onStrike: true,
  };

  nonStriker = {
    name: 'SMITH',
    runs: 5,
    balls: 11,
    onStrike: false,
  };

  bowler = {
    name: 'DEYAL',
    wickets: 0,
    runs: 1,
    overs: '0.1',
  };

  constructor(
    private scoringDataService: ScoringDataService,
    private liveScore: LiveScoreService,
    private router: Router
  ) { }

  ngOnInit() {
    // 1) Local cross-tab updates (existing)
    this.subscription = this.scoringDataService.scoringData$.subscribe(data => {
      console.log('SCRA page received data:', data);
      if (data) {
        const previousScore = this.scoringData?.teamScore || 0;
        
        // Check if match is completed
        const isMatchCompleted = localStorage.getItem('matchCompleted') === 'true' || 
                                localStorage.getItem('matchWinner') !== null;
        
        if (isMatchCompleted) {
          console.log('🏏 Match completed detected in SCRA! Showing final summary...');
          this.displayMatchSummaryOverlay();
        }
        
        // Check if over is completed by detecting transition from 5 balls to 0 balls with over increment
        else if (this.previousBallsInOver === 5 && data.ballsInOver === 0 && data.currentOver > this.previousCurrentOver) {
          console.log('🏏 Over completed detected in SCRA! Previous balls:', this.previousBallsInOver, 'Current balls:', data.ballsInOver, 'Current over:', data.currentOver);
          this.displayMatchSummaryOverlay();
        }
        
        // Update tracking variables
        this.previousBallsInOver = data.ballsInOver;
        this.previousCurrentOver = data.currentOver;
        
        this.scoringData = data;
        this.updateDisplayData();
        
        // Trigger animation if runs were scored
        console.log('🔍 Animation check:', {
          animationTrigger: data.animationTrigger,
          lastScoredRuns: data.lastScoredRuns,
          teamScore: data.teamScore,
          previousScore: previousScore
        });
        
        if (data.animationTrigger && data.lastScoredRuns) {
          console.log('✅ Animation conditions met, triggering animation');
          this.triggerRunsAnimation(Number(data.lastScoredRuns));
        }
        
        console.log('SCRA page updated with live data');
      } else {
        console.log('No scoring data available, using fallback data');
      }
    });

    // 2) Firebase realtime updates
    const mid = localStorage.getItem('currentMatchId') || 'default_match';
    this.liveScore.setMatch(mid);
    this.liveScore.listen((cloudData: ScoringData | null) => {
      if (cloudData) {
        // Feed into local ScoringDataService so UI updates uniformly
        this.scoringDataService.updateScoringData(cloudData);
      }
    });

    // React to currentMatchId changes from scorer tab/device
    window.addEventListener('storage', this.storageListener);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    window.removeEventListener('storage', this.storageListener);
  }

  // Animation properties
  showRunsAnimation = false;
  animatedRuns = 0;

  triggerRunsAnimation(runs: number) {
    console.log('🎬 Triggering runs animation for:', runs);
    this.animatedRuns = runs;
    this.showRunsAnimation = true;
    
    // Hide animation after 2 seconds
    setTimeout(() => {
      console.log('🎬 Hiding runs animation');
      this.showRunsAnimation = false;
    }, 2000);
  }

  testAnimation() {
    console.log('🧪 Testing animation manually');
    this.triggerRunsAnimation(4);
  }

  displayMatchSummaryOverlay() {
    console.log('🏏 Match completed! Showing full match summary overlay...');
    
    // Debug: Show all localStorage keys
    console.log('🔍 All localStorage keys:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key!);
      console.log(`  ${key}: ${value}`);
    }
    
    // Get match data from localStorage
    const teamAData = this.getTeamMatchData('Team A');
    const teamBData = this.getTeamMatchData('Team B');
    const isSecondInnings = localStorage.getItem('isSecondInnings') === 'true';
    const matchWinner = localStorage.getItem('matchWinner') || 'TIE';
    const isMatchCompleted = localStorage.getItem('matchCompleted') === 'true' || 
                            localStorage.getItem('firstInningsComplete') === 'true';
    
    // Get team names from localStorage - try multiple keys
    let teamAName = 'TEAM A';
    let teamBName = 'TEAM B';
    
    const teamNameKeys = ['teamAName', 'teamBName', 'Team A', 'Team B', 'battingTeam', 'bowlingTeam'];
    for (const key of teamNameKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        console.log(`🏷️ Found team name in '${key}': ${value}`);
        if (key.includes('A') || key.includes('batting')) teamAName = value;
        if (key.includes('B') || key.includes('bowling')) teamBName = value;
      }
    }
    
    // Get man of the match
    const manOfTheMatch = this.getManOfTheMatch(teamAData, teamBData);
    
    // Prepare summary data with complete match information
    this.summaryData = {
      teamAScore: teamAData.score,
      teamAWickets: teamAData.wickets,
      teamAPlayers: teamAData.players,
      teamAName: teamAName.toUpperCase(),
      teamBScore: teamBData.score,
      teamBWickets: teamBData.wickets,
      teamBPlayers: teamBData.players,
      teamBName: teamBName.toUpperCase(),
      battingTeam: this.scoringData?.battingTeam || 'Team A',
      isSecondInnings: isSecondInnings,
      isMatchCompleted: isMatchCompleted,
      matchWinner: matchWinner,
      manOfTheMatch: manOfTheMatch,
      matchResult: this.getMatchResultText(matchWinner, teamAName, teamBName, teamAData.score, teamBData.score, teamAData.wickets, teamBData.wickets),
      currentOver: this.scoringData?.currentOver || 0,
      ballsInOver: this.scoringData?.ballsInOver || 0,
      totalOvers: this.scoringData?.totalOvers || 20
    };
    
    console.log('📊 Complete match summary data prepared:', this.summaryData);
    
    // Show overlay with animation
    this.showSummaryOverlay = true;
    
    // Auto-hide after 15 seconds for match completion (longer than over completion)
    setTimeout(() => {
      console.log('🎭 Starting fade out animation...');
      this.showSummaryOverlay = false;
    }, 15000);
  }

  getManOfTheMatch(teamAData: any, teamBData: any) {
    let manOfTheMatch = { name: 'TBD', team: 'TBD', stats: 'Outstanding Performance' };
    
    // Get man of the match from localStorage if already selected
    const savedMOM = localStorage.getItem('manOfTheMatch');
    if (savedMOM) {
      try {
        manOfTheMatch = JSON.parse(savedMOM);
        return manOfTheMatch;
      } catch (e) {
        console.error('Error parsing saved man of the match:', e);
      }
    }
    
    // Auto-select based on performance if not manually selected
    let bestPlayer = { name: 'TBD', team: 'TBD', score: 0, stats: '' };
    
    // Check Team A players
    teamAData.players.forEach((player: any) => {
      const score = (player.runs * 2) + (parseInt(player.bowlingFigures.split('-')[0]) * 20);
      if (score > bestPlayer.score) {
        bestPlayer = {
          name: player.name,
          team: teamAData.teamAName || 'TEAM A',
          score: score,
          stats: `${player.runs} runs, ${player.bowlingFigures} bowling`
        };
      }
    });
    
    // Check Team B players
    teamBData.players.forEach((player: any) => {
      const score = (player.runs * 2) + (parseInt(player.bowlingFigures.split('-')[0]) * 20);
      if (score > bestPlayer.score) {
        bestPlayer = {
          name: player.name,
          team: teamBData.teamBName || 'TEAM B',
          score: score,
          stats: `${player.runs} runs, ${player.bowlingFigures} bowling`
        };
      }
    });
    
    return {
      name: bestPlayer.name,
      team: bestPlayer.team,
      stats: bestPlayer.stats
    };
  }

  getMatchResultText(
    winner: string,
    teamAName: string,
    teamBName: string,
    teamAScore: number,
    teamBScore: number,
    teamAWickets: number,
    teamBWickets: number
  ) {
    if (winner === 'TIE') {
      return `MATCH TIED - ${teamAName} ${teamAScore} vs ${teamBName} ${teamBScore}`;
    }

    // If Team A scored more, Team A defended a total -> margin by runs
    if (teamAScore > teamBScore && (winner.includes('Team A') || winner === teamAName)) {
      const margin = teamAScore - teamBScore;
      return `${teamAName.toUpperCase()} WON BY ${margin} RUNS`;
    }

    // If Team B scored more, Team B likely chased -> margin by wickets
    if (teamBScore > teamAScore && (winner.includes('Team B') || winner === teamBName)) {
      const wicketsRemaining = Math.max(0, 10 - (teamBWickets ?? 0));
      return `${teamBName.toUpperCase()} WON BY ${wicketsRemaining} WICKETS`;
    }

    // Fallback if naming differs
    return `${winner.toUpperCase()} WON THE MATCH`;
  }

  getTeamMatchData(teamName: string) {
    console.log('🔍 Getting team match data for:', teamName);
    
    // Try multiple possible localStorage keys for team data
    let teamScore = 0;
    let teamWickets = 0;
    
    // Check different possible keys for scores
    const scoreKeys = [
      `${teamName.toLowerCase().replace(' ', '')}Score`,
      `team${teamName.charAt(teamName.length - 1)}Score`, // teamAScore, teamBScore
      `${teamName}Score`,
      'teamARuns',
      'teamBRuns'
    ];
    
    const wicketKeys = [
      `${teamName.toLowerCase().replace(' ', '')}Wickets`,
      `team${teamName.charAt(teamName.length - 1)}Wickets`,
      `${teamName}Wickets`
    ];
    
    // Try to find team score
    for (const key of scoreKeys) {
      const value = localStorage.getItem(key);
      if (value && value !== '0') {
        teamScore = parseInt(value);
        console.log(`📊 Found team score in key '${key}':`, teamScore);
        break;
      }
    }
    
    // Try to find team wickets
    for (const key of wicketKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        teamWickets = parseInt(value);
        console.log(`📊 Found team wickets in key '${key}':`, teamWickets);
        break;
      }
    }
    
    // If still no data, check if this is current batting team
    if (teamScore === 0 && this.scoringData) {
      if (this.scoringData.battingTeam === teamName) {
        teamScore = this.scoringData.teamScore;
        teamWickets = this.scoringData.wickets;
        console.log('📊 Using live scoring data for current batting team:', { teamScore, teamWickets });
      }
    }
    
    // Get team players with their stats
    const playerKeys = [
      `${teamName.toLowerCase().replace(' ', '')}Players`,
      `team${teamName.charAt(teamName.length - 1)}Players`,
      `${teamName}Players`
    ];
    
    let playersData = null;
    for (const key of playerKeys) {
      playersData = localStorage.getItem(key);
      if (playersData) {
        console.log(`👥 Found players data in key '${key}'`);
        break;
      }
    }
    
    let players = [];
    
    if (playersData) {
      try {
        const allPlayers = JSON.parse(playersData);
        console.log('👥 All players for', teamName, ':', allPlayers);
        
        // Get batting stats for each player
        players = allPlayers.slice(0, 4).map((player: any) => {
          const playerStats = this.getPlayerStats(player.name, teamName);
          return {
            name: player.name.toUpperCase(),
            runs: playerStats.runs,
            balls: playerStats.balls,
            bowlingFigures: playerStats.bowlingFigures,
            bowlingOvers: playerStats.bowlingOvers
          };
        });
      } catch (e) {
        console.error('Error parsing players data:', e);
      }
    }
    
    // Fill with default data if not enough players
    while (players.length < 4) {
      players.push({
        name: `PLAYER ${players.length + 1}`,
        runs: Math.floor(Math.random() * 50), // Random data for demo
        balls: Math.floor(Math.random() * 30),
        bowlingFigures: `${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 25)}`,
        bowlingOvers: `${Math.floor(Math.random() * 4)}.${Math.floor(Math.random() * 6)}`
      });
    }
    
    console.log('📊 Final team data for', teamName, ':', { score: teamScore, wickets: teamWickets, players });
    
    return {
      score: teamScore,
      wickets: teamWickets,
      players: players
    };
  }

  getPlayerStats(playerName: string, teamName: string) {
    // Try to get player batting stats from localStorage
    const playerKey = `${teamName.toLowerCase().replace(' ', '')}_${playerName.replace(' ', '_')}_stats`;
    const statsData = localStorage.getItem(playerKey);
    
    let runs = 0, balls = 0, bowlingFigures = '0-0', bowlingOvers = '0';
    
    if (statsData) {
      try {
        const stats = JSON.parse(statsData);
        runs = stats.runs || 0;
        balls = stats.balls || 0;
        bowlingFigures = `${stats.bowlingWickets || 0}-${stats.bowlingRuns || 0}`;
        bowlingOvers = stats.bowlingOvers || '0';
      } catch (e) {
        console.error('Error parsing player stats:', e);
      }
    }
    
    // If current batsman, get live stats
    if (this.scoringData) {
      if (this.scoringData.strikerBatsman === playerName) {
        runs = this.scoringData.strikerRuns;
        balls = this.scoringData.strikerBalls;
      } else if (this.scoringData.nonStrikerBatsman === playerName) {
        runs = this.scoringData.nonStrikerRuns;
        balls = this.scoringData.nonStrikerBalls;
      }
      
      // If current bowler, get live bowling stats
      if (this.scoringData.currentBowler === playerName) {
        bowlingFigures = `${this.scoringData.bowlerWickets}-${this.scoringData.bowlerRuns}`;
        bowlingOvers = this.scoringData.bowlerOvers;
      }
    }
    
    return { runs, balls, bowlingFigures, bowlingOvers };
  }

  updateDisplayData() {
    if (!this.scoringData) return;

    // Update team info
    this.team = {
      short: this.getShortTeamName(this.scoringData.battingTeam),
      name: this.scoringData.battingTeam,
    };

    // Update innings info
    this.innings = {
      runs: this.scoringData.teamScore,
      wickets: this.scoringData.wickets,
      overs: `${this.scoringData.currentOver}.${this.scoringData.ballsInOver}`,
      phaseTag: this.scoringData.currentOver < 6 ? 'P' : 'M',
    };

    // Update comparison text
    if (this.scoringData.isSecondInnings) {
      this.comparisonText = `NEED ${this.scoringData.runsRequired} RUNS FROM ${this.getRemainingBalls()} BALLS`;
    } else {
      this.comparisonText = `RUN RATE: ${this.scoringData.runRate} | OVERS: ${this.scoringData.currentOver}/${this.scoringData.totalOvers}`;
    }

    // Update striker info
    this.striker = {
      name: this.scoringData.strikerBatsman.toUpperCase(),
      runs: this.scoringData.strikerRuns,
      balls: this.scoringData.strikerBalls,
      onStrike: this.scoringData.onStrike === 'striker',
    };

    // Update non-striker info
    this.nonStriker = {
      name: this.scoringData.nonStrikerBatsman.toUpperCase(),
      runs: this.scoringData.nonStrikerRuns,
      balls: this.scoringData.nonStrikerBalls,
      onStrike: this.scoringData.onStrike === 'nonStriker',
    };

    // Update bowler info
    this.bowler = {
      name: this.scoringData.currentBowler.toUpperCase(),
      wickets: this.scoringData.bowlerWickets,
      runs: this.scoringData.bowlerRuns,
      overs: this.scoringData.bowlerOvers,
    };
  }

  getRemainingBalls(): number {
    if (!this.scoringData) return 0;
    const totalBalls = this.scoringData.totalOvers * 6;
    const playedBalls = (this.scoringData.currentOver * 6) + this.scoringData.ballsInOver;
    return totalBalls - playedBalls;
  }

  get strikerLabel(): string {
    const s = this.striker;
    return `${s.name} ${s.runs}${s.onStrike ? '*' : ''} ${s.balls}`;
  }

  get nonStrikerLabel(): string {
    const ns = this.nonStriker;
    return `${ns.name} ${ns.runs} ${ns.balls}`;
  }

  get bowlerLabel(): string {
    const b = this.bowler;
    return `${b.name}  ${b.wickets}-${b.runs}  ${b.overs}`;
  }

  // Helper: return first word of team name in uppercase (e.g., "BABA" from "BABA FREED")
  private getShortTeamName(name: string): string {
    if (!name) return 'TEAM';
    const firstWord = name.trim().split(/\s+/)[0];
    return (firstWord || name).toUpperCase().slice(0, 12);
  }
}
