import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonInput, IonButton, AlertController } from '@ionic/angular/standalone';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DataService, Team } from '../data-service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA], 
  selector: 'app-select2',
  templateUrl: './select2.page.html',
  styleUrls: ['./select2.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonInput, IonButton, CommonModule, FormsModule]
})
export class Select2Page implements OnInit, OnDestroy {

  teams: Team[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private dataService: DataService, private cdr: ChangeDetectorRef, private router: Router, private alertCtrl: AlertController, private route: ActivatedRoute) { }

  ngOnInit() {
    console.log('Select2 ngOnInit called');
    
    // Subscribe to teams changes for real-time updates
    this.subscription = this.dataService.teams$.subscribe(teams => {
      console.log('Teams subscription triggered in select2:', teams);
      this.teams = teams;
      console.log('Teams array updated in select2:', this.teams);
    });
    
    // Initialize teams immediately
    this.teams = this.dataService.getTeams();
    console.log('Initial teams in select2:', this.teams);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  // TrackBy function for better performance
  trackByTeamId(index: number, team: any): number {
    return team.id;
  }

  // Function to handle team selection
  selectTeam(team: Team) {
    console.log('Team selected:', team);
    // Get team slot from query params - use snapshot for immediate access
    const teamSlot = parseInt(this.route.snapshot.queryParams['teamSlot']) || 1;
    console.log('Team slot (parsed):', teamSlot, 'type:', typeof teamSlot);
    
    // Navigate back to select page with selected team
    this.router.navigate(['/select'], { 
      queryParams: { 
        selectedTeam: JSON.stringify(team),
        teamSlot: teamSlot.toString()
      } 
    });
  }

  // Back button functionality
  goBack() {
    this.router.navigate(['/select']);
  }

}
