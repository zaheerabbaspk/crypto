import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-select',
  templateUrl: './select.page.html',
  styleUrls: ['./select.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, RouterLink]
})
export class SelectPage implements OnInit {

  selectedTeam1: string = 'Tap/Click to select Team';
  selectedTeam2: string = 'Tap/Click to select Team';
  selectedTeam1Logo: string = 'assets/team-logo.png'; // Default logo
  selectedTeam2Logo: string = 'assets/team-logo.png'; // Default logo
  currentTeamSlot: number = 1; // Track which team slot is being selected

  constructor(private router: Router, private route: ActivatedRoute, private nav: NavController) {}

  // Load saved team selections from localStorage
  loadSavedSelections() {
    const savedTeam1 = localStorage.getItem('selectedTeam1');
    const savedTeam2 = localStorage.getItem('selectedTeam2');
    const savedTeam1Logo = localStorage.getItem('selectedTeam1Logo');
    const savedTeam2Logo = localStorage.getItem('selectedTeam2Logo');
    
    if (savedTeam1) {
      this.selectedTeam1 = savedTeam1;
    }
    if (savedTeam2) {
      this.selectedTeam2 = savedTeam2;
    }
    if (savedTeam1Logo) {
      this.selectedTeam1Logo = savedTeam1Logo;
    }
    if (savedTeam2Logo) {
      this.selectedTeam2Logo = savedTeam2Logo;
    }
  }

  // Save team selection to localStorage
  saveTeamSelection(teamSlot: number, teamName: string, teamLogo?: string) {
    if (teamSlot === 1) {
      localStorage.setItem('selectedTeam1', teamName);
      if (teamLogo) {
        localStorage.setItem('selectedTeam1Logo', teamLogo);
      }
    } else if (teamSlot === 2) {
      localStorage.setItem('selectedTeam2', teamName);
      if (teamLogo) {
        localStorage.setItem('selectedTeam2Logo', teamLogo);
      }
    }
  }

  ngOnInit() {
    // Load saved team selections from localStorage first
    this.loadSavedSelections();
    
    // Listen for selected team data from select2 page
    this.route.queryParams.subscribe(params => {
      console.log('Select page received params:', params);
      if (params['selectedTeam']) {
        const team = JSON.parse(params['selectedTeam']);
        const teamSlot = parseInt(params['teamSlot']) || this.currentTeamSlot;
        
        console.log('Team selected:', team, 'for slot:', teamSlot);
        
        if (teamSlot === 1) {
          this.selectedTeam1 = team.name;
          this.selectedTeam1Logo = team.logo || 'assets/team-logo.png';
          this.saveTeamSelection(1, team.name, team.logo);
          console.log('Updated selectedTeam1:', this.selectedTeam1);
        } else if (teamSlot === 2) {
          this.selectedTeam2 = team.name;
          this.selectedTeam2Logo = team.logo || 'assets/team-logo.png';
          this.saveTeamSelection(2, team.name, team.logo);
          console.log('Updated selectedTeam2:', this.selectedTeam2);
        }
        
        // Clear query params after processing to avoid interference
        this.router.navigate(['/select'], { 
          replaceUrl: true,
          queryParams: {} 
        });
      }
    });
  }

  // Clear localStorage when navigating away, load on page refresh
  ionViewWillLeave() {
    // Clear the navigation flag when leaving the page
    sessionStorage.removeItem('selectPageFromNavigation');
  }

  ionViewWillEnter() {
    // Check if we came from navigation or page refresh
    const fromNavigation = sessionStorage.getItem('selectPageFromNavigation');
    
    if (fromNavigation) {
      // Coming from navigation - reset to default
      console.log('Navigation detected, resetting to default');
      this.selectedTeam1 = 'Tap/Click to select Team';
      this.selectedTeam2 = 'Tap/Click to select Team';
      this.selectedTeam1Logo = 'assets/team-logo.png';
      this.selectedTeam2Logo = 'assets/team-logo.png';
      sessionStorage.removeItem('selectPageFromNavigation');
    } else {
      // Page refresh or direct access - load saved data
      console.log('Page refresh detected, loading saved selections');
      this.loadSavedSelections();
    }
  }

  // ✅ Navigate to select2 page for team selection
  goto(teamSlot: number = 1) {
    this.currentTeamSlot = teamSlot;
    console.log('Navigating to select2 with teamSlot:', teamSlot);
    this.router.navigate(['/select2'], { 
      queryParams: { teamSlot: teamSlot.toString() } 
    });
  }

  // ✅ Navigate to venue page with selected teams
  goToVenue() {
    // Check if both teams are selected
    if (this.selectedTeam1 === 'Tap/Click to select Team' || this.selectedTeam2 === 'Tap/Click to select Team') {
      // Show alert or toast that both teams must be selected
      console.log('Please select both teams first');
      return;
    }

    // Pass selected teams data to venue page
    const teamsData = {
      team1: {
        name: this.selectedTeam1,
        logo: this.selectedTeam1Logo
      },
      team2: {
        name: this.selectedTeam2,
        logo: this.selectedTeam2Logo
      }
    };

    this.router.navigate(['/venue'], {
      queryParams: {
        teamsData: JSON.stringify(teamsData)
      }
    });
  }

  // ✅ Back button function
  goBack() {
    // Set flag to indicate navigation when returning to select page
    sessionStorage.setItem('selectPageFromNavigation', 'true');
    console.log('Back clicked -> navigating to /twopage');
    this.router.navigateByUrl('/twopage', { replaceUrl: true });
  }

}
