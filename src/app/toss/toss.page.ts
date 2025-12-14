import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonModal } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toss',
  templateUrl: './toss.page.html',
  styleUrls: ['./toss.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonModal, CommonModule, FormsModule]
})
export class TossPage implements OnInit {

  team1Name: string = 'Zaherr';
  team2Name: string = 'Starlight';
  selectedTeam: string = '';
  isModalOpen: boolean = false;
  tossWinnerName: string = '';
  selectedChoice: string = '';

  constructor(private router: Router) { }

  ngOnInit() {
    // Clear all previous match data for fresh start
    localStorage.removeItem('cricketMatchState');
    localStorage.removeItem('firstInningsScore');
    localStorage.removeItem('isSecondInnings');
    localStorage.removeItem('matchWinner');
    localStorage.removeItem('teamARuns');
    localStorage.removeItem('teamBRuns');
    
    // Get team names from localStorage
    const selectedTeam1 = localStorage.getItem('selectedTeam1');
    const selectedTeam2 = localStorage.getItem('selectedTeam2');
    
    if (selectedTeam1) {
      this.team1Name = selectedTeam1;
    }
    if (selectedTeam2) {
      this.team2Name = selectedTeam2;
    }
  }

  // Select team for toss winner
  selectTeam(team: string) {
    this.selectedTeam = team;
    
    // Set toss winner name and open modal
    if (team === 'team1') {
      this.tossWinnerName = this.team1Name;
      localStorage.setItem('tossWinner', this.team1Name);
    } else {
      this.tossWinnerName = this.team2Name;
      localStorage.setItem('tossWinner', this.team2Name);
    }
    
    // Open modal for bat/ball selection
    this.isModalOpen = true;
    
    console.log('Toss winner selected:', this.tossWinnerName);
  }

  // Close modal
  closeModal() {
    this.isModalOpen = false;
    this.selectedChoice = '';
  }

  // Select bat or ball
  selectChoice(choice: string) {
    this.selectedChoice = choice;
    localStorage.setItem('tossChoice', choice);
    
    // Close modal and navigate to umpire page
    this.closeModal();
    console.log('Toss choice selected:', choice);
    
    // Add delay to ensure modal closes before navigation
    setTimeout(() => {
      this.router.navigate(['/sequard']).then(
        (success) => console.log('Navigation to squad successful:', success),
        (error) => console.error('Navigation to squad failed:', error)
      );
    }, 300);
  }

  // Next/Exit button function
  onNext() {
    if (!this.selectedTeam) {
      alert('Please select the team that won the toss!');
      return;
    }
    
    console.log('Toss completed, proceeding...');
    // Navigate to next page or show completion
  }

}
