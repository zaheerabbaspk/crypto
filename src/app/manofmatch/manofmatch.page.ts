import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { MatchResultService } from '../services/match-result.service';

@Component({
  selector: 'app-manofmatch',
  templateUrl: './manofmatch.page.html',
  styleUrls: ['./manofmatch.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, CommonModule, FormsModule]
})
export class ManofmatchPage implements OnInit {

  manOfMatchPlayer: string = '';
  manOfMatchPoints: string = '0.00';
  
  showPlayersList: boolean = false;
  selectedTeamName: string = '';
  selectedTeamPlayers: any[] = [];
  
  winningTeam: string = '';
  losingTeam: string = '';
  winningTeamPlayers: any[] = [];
  losingTeamPlayers: any[] = [];
  
  matchResult: any = {};

  constructor(
    private router: Router,
    private matchResultService: MatchResultService,
  ) { }

  ngOnInit() {
    this.loadMatchData();
    this.calculateMVPPoints();
    this.selectAutoManOfMatch();
  }

  loadMatchData() {
    // Map internal labels to selected team names
    const teamAName = localStorage.getItem('selectedTeam1') || 'Team A';
    const teamBName = localStorage.getItem('selectedTeam2') || 'Team B';

    // Use the new services to compare totals
    const result = this.matchResultService.compareTotals();

    if (result.winner === 'Team A') {
      this.winningTeam = teamAName;
      this.losingTeam = teamBName;
    } else if (result.winner === 'Team B') {
      this.winningTeam = teamBName;
      this.losingTeam = teamAName;
    } else {
      this.winningTeam = 'Match Tied';
      this.losingTeam = 'Match Tied';
    }

    // Load team players based on winner/loser
    this.loadTeamPlayers();
  }

  loadTeamPlayers() {
    const team1Players = JSON.parse(localStorage.getItem('selectedPlayers') || '[]');
    const team2Players = JSON.parse(localStorage.getItem('selectedPlayersTeam2') || '[]');
    const team1Name = localStorage.getItem('selectedTeam1') || '';
    const team2Name = localStorage.getItem('selectedTeam2') || '';
    
    // Assign players to winning/losing teams
    if (this.winningTeam === team1Name) {
      this.winningTeamPlayers = team1Players;
      this.losingTeamPlayers = team2Players;
    } else {
      this.winningTeamPlayers = team2Players;
      this.losingTeamPlayers = team1Players;
    }
  }

  calculateMVPPoints() {
    // Calculate MVP points for all players based on their performance
    const allPlayers = [...this.winningTeamPlayers, ...this.losingTeamPlayers];
    
    allPlayers.forEach(player => {
      let mvpPoints = 0;
      
      // Get player stats from localStorage or default values
      const playerRuns = this.getPlayerRuns(player.name);
      const playerWickets = this.getPlayerWickets(player.name);
      const playerCatches = this.getPlayerCatches(player.name);
      
      // Calculate MVP points
      mvpPoints += playerRuns * 0.1; // 0.1 points per run
      mvpPoints += playerWickets * 2.0; // 2 points per wicket
      mvpPoints += playerCatches * 1.5; // 1.5 points per catch
      
      player.mvpPoints = mvpPoints.toFixed(2);
    });
  }

  getPlayerRuns(playerName: string): number {
    // Get runs from localStorage or return random value for demo
    return Math.floor(Math.random() * 50) + 10; // Random runs between 10-60
  }

  getPlayerWickets(playerName: string): number {
    // Get wickets from localStorage or return random value for demo
    return Math.floor(Math.random() * 3); // Random wickets 0-2
  }

  getPlayerCatches(playerName: string): number {
    // Get catches from localStorage or return random value for demo
    return Math.floor(Math.random() * 2); // Random catches 0-1
  }

  selectAutoManOfMatch() {
    // Auto-select player with highest MVP points
    const allPlayers = [...this.winningTeamPlayers, ...this.losingTeamPlayers];
    
    if (allPlayers.length > 0) {
      const topPlayer = allPlayers.reduce((prev, current) => 
        (parseFloat(current.mvpPoints) > parseFloat(prev.mvpPoints)) ? current : prev
      );
      
      this.manOfMatchPlayer = topPlayer.name;
      this.manOfMatchPoints = topPlayer.mvpPoints;
    }
  }

  showWinningTeam() {
    this.selectedTeamName = `${this.winningTeam}`;
    this.selectedTeamPlayers = this.winningTeamPlayers;
    this.showPlayersList = true;
  }

  showLosingTeam() {
    this.selectedTeamName = `${this.losingTeam}`;
    this.selectedTeamPlayers = this.losingTeamPlayers;
    this.showPlayersList = true;
  }

  selectManOfMatch(player: any) {
    this.manOfMatchPlayer = player.name;
    this.manOfMatchPoints = player.mvpPoints;
    
    // Save to localStorage
    localStorage.setItem('manOfTheMatch', player.name);
    localStorage.setItem('manOfTheMatchPoints', player.mvpPoints);
    
    // Hide players list
    this.showPlayersList = false;
    
    alert(`${player.name} selected as Man of the Match with ${player.mvpPoints} MVP points!`);
  }

  updateAndExit() {
    // Save final man of match data
    localStorage.setItem('manOfTheMatch', this.manOfMatchPlayer);
    localStorage.setItem('manOfTheMatchPoints', this.manOfMatchPoints);

    // Remove the completed match and all associated context
    const matchId = localStorage.getItem('currentMatchId');
    if (matchId) {
      // Remove match blob
      localStorage.removeItem(`match_${matchId}`);

      // Remove from matches list
      const savedMatches = localStorage.getItem('matches');
      if (savedMatches) {
        const matches = JSON.parse(savedMatches).filter((m: any) => m.id !== matchId);
        localStorage.setItem('matches', JSON.stringify(matches));
      }

      // Clear global context keys
      const keysToClear = [
        'firstInningsScore', 'firstInningsWickets', 'firstInningsOvers', 'firstInningsTeam', 'firstInningsComplete',
        'isSecondInnings', 'currentBattingTeam', 'currentBowlingTeam',
        'selectedBatsman1', 'selectedBatsman2', 'selectedBowler',
        'strikerBatsman', 'nonStrikerBatsman', 'openingBowler',
        'matchWinner', 'teamARuns', 'teamBRuns',
      ];
      keysToClear.forEach(k => localStorage.removeItem(k));
      localStorage.removeItem('currentMatchId');
    }

    // Navigate to score page
    this.router.navigate(['/score']);
  }

}
