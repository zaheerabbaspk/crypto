import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonButton } from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-press',
  templateUrl: './press.page.html',
  styleUrls: ['./press.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonButton, CommonModule, FormsModule]
})
export class PressPage implements OnInit {

  team1Name: string = 'Team A';
  team2Name: string = 'Team B';

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    // Get current match data from localStorage
    const matches = JSON.parse(localStorage.getItem('matches') || '[]');
    if (matches.length > 0) {
      const latestMatch = matches[matches.length - 1];
      this.team1Name = latestMatch.team1?.name || 'Team A';
      this.team2Name = latestMatch.team2?.name || 'Team B';
    }

    // Also check for selected teams from localStorage (from select page)
    const selectedTeam1 = localStorage.getItem('selectedTeam1');
    const selectedTeam2 = localStorage.getItem('selectedTeam2');
    
    if (selectedTeam1) {
      this.team1Name = selectedTeam1;
    }
    if (selectedTeam2) {
      this.team2Name = selectedTeam2;
    }
  }

  // Next button function
  onNext() {
    console.log('Next button clicked');
    this.router.navigate(['/golden']);
  }

  // Exit button function
  onExit() {
    console.log('Exit button clicked');
    // Add exit logic here
  }

}
