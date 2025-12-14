import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton,
  IonIcon,
  IonFooter
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-twopage',
  templateUrl: './twopage.page.html',
  styleUrls: ['./twopage.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonIcon, RouterLink, IonFooter, FooterComponent]
})
export class TwopagePage implements OnInit {

  constructor(
    private router: Router,
    private toastController: ToastController
  ) {
    // Initialize Google Auth
    GoogleAuth.initialize({
      clientId: 'YOUR_WEB_CLIENT_ID', // Replace with your actual client ID
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
  }

  async ngOnInit() {}

  async logout() {
    try {
      // Clear any stored user data first
      localStorage.removeItem('googleUser');
      
      // Try to sign out from Google if possible
      try {
        await GoogleAuth.signOut();
      } catch (signOutError) {
        console.log('Google sign out error (can be ignored):', signOutError);
      }
      
      // Clear any auth tokens from Google
      if (window.gapi && window.gapi.auth2) {
        const auth2 = window.gapi.auth2.getAuthInstance();
        if (auth2) {
          try {
            await auth2.signOut();
            await auth2.disconnect();
          } catch (gapiError) {
            console.log('GAPI sign out error (can be ignored):', gapiError);
          }
        }
      }
      
      // Clear all localStorage items that might be related to auth
      Object.keys(localStorage).forEach(key => {
        if (key.includes('google') || key.includes('auth') || key.includes('gapi')) {
          localStorage.removeItem(key);
        }
      });
      
      // Show success message
      const toast = await this.toastController.create({
        message: 'Successfully logged out',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
      
      // Redirect to home page after a short delay to show the success message
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 500);
      
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Still navigate to login even if there was an error
      window.location.href = '/loginft';
    }
  }

  // ✅ Start Scoring button par click
  startScoring() {
    // Check if there's a saved match state to resume from
    const savedMatchState = localStorage.getItem('cricketMatchState');
    if (savedMatchState) {
      try {
        const state = JSON.parse(savedMatchState);
        // If there's meaningful match progress, go directly to scoring
        if (state.teamScore > 0 || state.wickets > 0 || state.currentOver > 0) {
          console.log('Resuming match from saved state:', state);
          this.router.navigate(['/scoringstart']);
          return;
        }
      } catch (e) {
        console.error('Error parsing saved match state:', e);
      }
    }
    
    // No saved state, go to score page to start new match
    this.router.navigate(['/score']);
  }

  // ✅ Friendly Matches button par click
  goto() {
    this.router.navigate(['/shoudile']);
  }


  // ✅ Teams button par click -> Team Create page
  gotoTeams() {
    this.router.navigateByUrl('/teamcreate').then(
      ok => console.log('Navigated to /teamcreate:', ok),
      err => console.error('Failed to navigate to /teamcreate:', err)
    );
  }

  // ✅ Back button par click
  goBack() {
    this.router.navigate(['/homepage']);   // yahan apni back page ka route likho
  }

  // Check if there's a saved match state that can be resumed
  hasSavedMatchState(): boolean {
    const savedMatchState = localStorage.getItem('cricketMatchState');
    if (savedMatchState) {
      try {
        const state = JSON.parse(savedMatchState);
        return state.teamScore > 0 || state.wickets > 0 || state.currentOver > 0;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  // Resume saved match directly
  resumeSavedMatch() {
    this.router.navigate(['/scoringstart']);
  }

  // Clear saved match state
  clearSavedMatch() {
    const confirm = window.confirm('Are you sure you want to clear the saved match? This action cannot be undone.');
    if (confirm) {
      localStorage.removeItem('cricketMatchState');
      alert('Saved match cleared successfully.');
    }
  }

}
