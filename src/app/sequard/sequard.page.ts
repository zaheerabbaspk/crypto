import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonModal, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sequard',
  templateUrl: './sequard.page.html',
  styleUrls: ['./sequard.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonModal, IonList, IonItem, IonLabel, CommonModule, FormsModule]
})
export class SequardPage implements OnInit {

  battingTeam: string = 'Zaherr';
  bowlingTeam: string = 'Starlight';
  
  strikerBatsman: string = '';
  nonStrikerBatsman: string = '';
  openingBowler: string = '';
  
  battingTeamPlayers: any[] = [];
  bowlingTeamPlayers: any[] = [];
  availablePlayers: any[] = [];
  
  isModalOpen: boolean = false;
  modalTitle: string = '';
  currentSelection: string = '';

  constructor(private router: Router) { }

  ngOnInit() {
    // Determine batting/bowling teams robustly
    const currentBattingTeam = localStorage.getItem('currentBattingTeam');
    const currentBowlingTeam = localStorage.getItem('currentBowlingTeam');
    const isSecond = localStorage.getItem('isSecondInnings') === 'true';
    const superOverActive = localStorage.getItem('superOverActive') === 'true';

    const matchId = localStorage.getItem('currentMatchId');
    let blobBatFirst = '';
    let blobBatSecond = '';
    if (matchId) {
      try {
        const key = `match_${matchId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const data = JSON.parse(saved);
          blobBatFirst = data.battingFirst || '';
          blobBatSecond = data.battingSecond || '';
        }
      } catch {}
    }

    // Fallbacks from team selection
    const team1 = localStorage.getItem('selectedTeam1') || blobBatFirst || 'Zaherr';
    const team2 = localStorage.getItem('selectedTeam2') || blobBatSecond || 'Starlight';

    // Prefer explicit current teams if provided (from previous step), else derive from blob/selection
    if (currentBattingTeam) {
      this.battingTeam = currentBattingTeam;
      this.bowlingTeam = currentBowlingTeam || (this.battingTeam === team1 ? team2 : team1);
    } else {
      if (superOverActive) {
        // In super over, score page sets currentBattingTeam/currentBowlingTeam; fallback to first vs second
        this.battingTeam = blobBatFirst || team1;
        this.bowlingTeam = blobBatSecond || team2;
      } else if (isSecond) {
        // Second innings: batting second
        this.battingTeam = blobBatSecond || (team1 && team2 ? (blobBatFirst === team1 ? team2 : team1) : team2);
        this.bowlingTeam = blobBatFirst || (this.battingTeam === team1 ? team2 : team1);
      } else {
        // First innings: batting first
        this.battingTeam = blobBatFirst || team1;
        this.bowlingTeam = blobBatSecond || team2;
      }
    }

    // Load team players
    this.loadTeamPlayers();
  }

  // Load players from both teams
  loadTeamPlayers() {
    // Load batting team players (Team 1 or Team 2)
    const team1Players = JSON.parse(localStorage.getItem('selectedPlayers') || '[]');
    const team2Players = JSON.parse(localStorage.getItem('selectedPlayersTeam2') || '[]');
    
    const team1Name = localStorage.getItem('selectedTeam1') || 'Zaherr';
    const team2Name = localStorage.getItem('selectedTeam2') || 'Starlight';
    
    if (this.battingTeam === team1Name) {
      this.battingTeamPlayers = team1Players;
      this.bowlingTeamPlayers = team2Players;
    } else {
      this.battingTeamPlayers = team2Players;
      this.bowlingTeamPlayers = team1Players;
    }
  }

  // Change inning function
  changeInning() {
    // Toggle batting team
    const team1 = localStorage.getItem('selectedTeam1') || 'Zaherr';
    const team2 = localStorage.getItem('selectedTeam2') || 'Starlight';
    this.battingTeam = this.battingTeam === team1 ? team2 : team1;
    this.bowlingTeam = this.bowlingTeam === team1 ? team2 : team1;
    
    // Reload players for new teams
    this.loadTeamPlayers();
    
    // Clear current selections
    this.strikerBatsman = '';
    this.nonStrikerBatsman = '';
    this.openingBowler = '';
    
    console.log('Inning changed to:', this.battingTeam);
  }

  // Select batsman (striker or non-striker)
  selectBatsman(type: string) {
    this.currentSelection = type;
    this.availablePlayers = this.battingTeamPlayers;
    this.modalTitle = type === 'striker' ? 'Select Striker End Batsman' : 'Select Non-Striker End Batsman';
    this.isModalOpen = true;
  }

  // Select bowler
  selectBowler() {
    this.currentSelection = 'bowler';
    this.availablePlayers = this.bowlingTeamPlayers;
    this.modalTitle = 'Select Opening Bowler';
    this.isModalOpen = true;
  }

  // Select player from modal
  selectPlayer(player: any) {
    switch (this.currentSelection) {
      case 'striker':
        this.strikerBatsman = player.name;
        break;
      case 'nonStriker':
        this.nonStrikerBatsman = player.name;
        break;
      case 'bowler':
        this.openingBowler = player.name;
        break;
    }
    
    this.closeModal();
    console.log('Player selected:', player.name, 'for', this.currentSelection);
  }

  // Close modal
  closeModal() {
    this.isModalOpen = false;
    this.currentSelection = '';
    this.availablePlayers = [];
  }

  // Start scoring
  startScoring() {
    if (!this.strikerBatsman || !this.nonStrikerBatsman || !this.openingBowler) {
      alert('Please select both batsmen and opening bowler before starting!');
      return;
    }
    
    // Save selections to localStorage
    localStorage.setItem('strikerBatsman', this.strikerBatsman);
    localStorage.setItem('nonStrikerBatsman', this.nonStrikerBatsman);
    localStorage.setItem('openingBowler', this.openingBowler);
    localStorage.setItem('currentBattingTeam', this.battingTeam);
    localStorage.setItem('currentBowlingTeam', this.bowlingTeam);
    
    console.log('Starting scoring with:');
    console.log('Striker:', this.strikerBatsman);
    console.log('Non-Striker:', this.nonStrikerBatsman);
    console.log('Bowler:', this.openingBowler);
    
    // For second innings, skip umpire page and go straight to scoring
    const isSecond = localStorage.getItem('isSecondInnings') === 'true';
    if (isSecond) {
      this.router.navigate(['/scoringstart']);
    } else {
      // First innings: collect umpire names first
      this.router.navigate(['/umpire']);
    }
  }

}
