import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-umpire',
  templateUrl: './umpire.page.html',
  styleUrls: ['./umpire.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput, CommonModule, FormsModule]
})
export class UmpirePage implements OnInit {

  battingTeam: string = 'Zaherr';
  firstUmpireName: string = '';
  secondUmpireName: string = '';

  constructor(private router: Router) { }

  ngOnInit() {
    // Get toss winner and choice from localStorage
    const tossWinner = localStorage.getItem('tossWinner');
    const tossChoice = localStorage.getItem('tossChoice');
    
    // Determine batting team based on toss choice
    if (tossChoice === 'bat' && tossWinner) {
      this.battingTeam = tossWinner;
    } else if (tossChoice === 'ball') {
      // If toss winner chose to bowl, the other team bats
      const team1 = localStorage.getItem('selectedTeam1') || 'Zaherr';
      const team2 = localStorage.getItem('selectedTeam2') || 'Starlight';
      this.battingTeam = tossWinner === team1 ? team2 : team1;
    }
  }

  // Change inning function
  changeInning() {
    // Toggle batting team
    const team1 = localStorage.getItem('selectedTeam1') || 'Zaherr';
    const team2 = localStorage.getItem('selectedTeam2') || 'Starlight';
    this.battingTeam = this.battingTeam === team1 ? team2 : team1;
    
    console.log('Inning changed to:', this.battingTeam);
  }

  // Next button handler
  onNext() {
    if (!this.firstUmpireName.trim() || !this.secondUmpireName.trim()) {
      alert('Please enter both umpire names before proceeding!');
      return;
    }
    
    // Save umpire names to localStorage
    localStorage.setItem('firstUmpireName', this.firstUmpireName);
    localStorage.setItem('secondUmpireName', this.secondUmpireName);
    localStorage.setItem('currentBattingTeam', this.battingTeam);
    
    console.log('Umpire names saved:', this.firstUmpireName, this.secondUmpireName);
    console.log('Current batting team:', this.battingTeam);
    
    // Navigate to scoring page to begin the innings
    this.router.navigate(['/scoringstart']);
  }

}
