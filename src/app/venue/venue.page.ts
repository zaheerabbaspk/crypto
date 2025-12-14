import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonDatetime, IonModal } from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';
import { MatchService } from '../services/overs-settings.service';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, Database } from 'firebase/database';
import { environment } from '../../environments/environment';

@Component({
 schemas: [CUSTOM_ELEMENTS_SCHEMA], 
  selector: 'app-venue',
  templateUrl: './venue.page.html',
  styleUrls: ['./venue.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonDatetime, IonModal, CommonModule, FormsModule]
})
export class VenuePage implements OnInit {

  // Team data received from select page
  teamsData: any = null;
  
  // Form fields
  venue: string = '';
  ballType: string = 'leather';
  numberOfOvers: number = 50;
  bowlerOverLimit: number = 5;
  scorerEmail: string = '';
  matchDate: string = new Date().toISOString().split('T')[0];
  matchTime: string = new Date().toISOString().split('T')[1].substring(0, 5);

  // Firebase properties
  private firebaseApp: FirebaseApp | null = null;
  private firebaseDb: Database | null = null;

  constructor(private router: Router, private route: ActivatedRoute) { }

  // Use inject() to get a runtime token reference (prevents TS from eliding the import)
  private matchService: MatchService = inject(MatchService);

  // Initialize Firebase
  private initializeFirebase() {
    try {
      if (!this.firebaseApp) {
        this.firebaseApp = initializeApp(environment.firebase);
        this.firebaseDb = getDatabase(this.firebaseApp, (environment as any).firebase?.databaseURL);
        console.log('Firebase initialized successfully');
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }

  ngOnInit() {
    // Receive teams data from select page
    this.route.queryParams.subscribe(params => {
      if (params['teamsData']) {
        this.teamsData = JSON.parse(params['teamsData']);
        console.log('Received teams data:', this.teamsData);
      }
    });

    // Initialize date/time using LOCAL timezone to avoid ISO (UTC) shift by a day
    const now = new Date();
    this.matchDate = this.formatLocalDate(now); // YYYY-MM-DD
    this.matchTime = this.formatLocalTime(now); // HH:mm

    // Initialize MatchService with any prefilled values (so scoringstart sees latest)
    try {
      if (this.numberOfOvers && this.numberOfOvers > 0) {
        this.matchService.setOvers(this.numberOfOvers);
      }
      if (this.bowlerOverLimit && this.bowlerOverLimit > 0) {
        this.matchService.setBowlerLimit(this.bowlerOverLimit);
      }
    } catch {}
  }

  // Go back to select page
  goBack() {
    this.router.navigate(['/select']);
  }

  // Create match and navigate to score page
  async createMatch() {
    console.log('Create Match button clicked!');
    // Allow navigation only if Date, Time, Overs, Bowler Limit are valid (Venue optional)
    if (!this.isFormValid()) {
      this.reportValidationErrors();
      return;
    }
    
    // Clear all previous match data for fresh start
    localStorage.removeItem('cricketMatchState');
    localStorage.removeItem('firstInningsScore');
    localStorage.removeItem('isSecondInnings');
    localStorage.removeItem('matchWinner');
    localStorage.removeItem('teamARuns');
    localStorage.removeItem('teamBRuns');
    
    // Venue is optional: do not force or auto-fill

    // Normalize time to HH:mm (strip seconds if any provided by browser)
    if (this.matchTime && this.matchTime.length > 5) {
      this.matchTime = this.matchTime.slice(0, 5);
    }

    // Set teams data if missing using prior selection as fallback
    if (!this.teamsData) {
      try {
        const t1 = localStorage.getItem('selectedTeam1') || 'Team A';
        const t2 = localStorage.getItem('selectedTeam2') || 'Team B';
        this.teamsData = { team1: { name: t1, logo: 'assets/team-logo.png' }, team2: { name: t2, logo: 'assets/team-logo.png' } };
      } catch {}
    }

    console.log('Match data:', {
      venue: this.venue,
      teams: this.teamsData,
      overs: this.numberOfOvers
    });

    // Create match object
    const match = {
      id: Date.now().toString(),
      team1: this.teamsData.team1,
      team2: this.teamsData.team2,
      venue: this.venue,
      ballType: this.ballType,
      numberOfOvers: this.numberOfOvers,
      bowlerOverLimit: this.bowlerOverLimit,
      scorerEmail: this.scorerEmail,
      matchDate: this.matchDate, // YYYY-MM-DD (local)
      matchTime: this.matchTime, // HH:mm (local)
      createdAt: new Date().toISOString(),
      status: 'scheduled'
    };

    // Save match to localStorage
    const existingMatches = JSON.parse(localStorage.getItem('matches') || '[]');
    existingMatches.push(match);
    localStorage.setItem('matches', JSON.stringify(existingMatches));
    
    // Push match to Firebase
    try {
      this.initializeFirebase();
      if (this.firebaseDb) {
        const matchRef = ref(this.firebaseDb, `matches/${match.id}`);
        await set(matchRef, match);
        console.log('Match created in Firebase:', match.id);
      }
    } catch (error) {
      console.error('Error saving match to Firebase:', error);
      // Continue with navigation even if Firebase fails
    }
    
    // Push overs/limit to shared MatchService and persist so scoringstart picks it up
    try {
      this.matchService.setOvers(this.numberOfOvers);
      this.matchService.setBowlerLimit(this.bowlerOverLimit);
    } catch {}

    console.log('Match saved, navigating to score page...');
    
    // Automatically navigate to Score page with timeout to avoid outlet conflict
    setTimeout(() => {
      // Navigate without query params; downstream pages read from MatchService/localStorage
      this.router.navigate(['/score'], { 
        replaceUrl: true
      }).then(() => {
        console.log('Navigation successful');
      }).catch(error => {
        console.error('Navigation failed:', error);
        // Try alternative navigation method without query params
        window.location.href = '/score';
      });
    }, 100);
  }

  // -- Validation: Venue optional; require date, time, overs, bowler limit -----
  private isFormValid(): boolean {
    const hasDate = (this.matchDate || '').trim().length > 0;
    const hasTime = (this.matchTime || '').trim().length > 0;
    const validOvers = Number(this.numberOfOvers) > 0;
    const validBowlerLimit = Number(this.bowlerOverLimit) > 0;
    const bowlerWithinOvers = Number(this.bowlerOverLimit) <= Number(this.numberOfOvers);
    return hasDate && hasTime && validOvers && validBowlerLimit && bowlerWithinOvers;
  }

  private reportValidationErrors() {
    const errors: string[] = [];
    if (!(this.matchDate || '').trim()) errors.push('Match Date');
    if (!(this.matchTime || '').trim()) errors.push('Match Time');
    if (!(Number(this.numberOfOvers) > 0)) errors.push('Number of Overs (> 0)');
    if (!(Number(this.bowlerOverLimit) > 0)) errors.push("Bowler's Over Limit (> 0)");
    if (Number(this.bowlerOverLimit) > Number(this.numberOfOvers)) errors.push("Bowler's Over Limit must be <= Number of Overs");
    if (errors.length) {
      alert('Please complete required fields:\n- ' + errors.join('\n- '));
    }
  }

  private formatLocalDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private formatLocalTime(d: Date): string {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  // Local change only; do not broadcast to other pages
  onOversChange(val: any) {
    const n = parseInt(String(val), 10);
    if (!isNaN(n) && n > 0) {
      this.numberOfOvers = n;
      // Broadcast immediately so scoringstart header updates live
      try {
        this.matchService.setOvers(n);
      } catch {}
    }
  }

  onLimitChange(val: any) {
    const n = parseInt(String(val), 10);
    if (!isNaN(n) && n > 0) {
      this.bowlerOverLimit = n;
      // Broadcast immediately so per-bowler quota enforces correctly
      try {
        this.matchService.setBowlerLimit(n);
      } catch {}
    }
  }

}
