import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { IonFooter, IonButton, ToastController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonFooter, IonButton, CommonModule]
})
export class FooterComponent {
  constructor(
    private router: Router,
    private toastController: ToastController
  ) {}

  goHome() {
    this.router.navigate(['/twopage']);
  }

  goScore() {
    this.router.navigate(['/score']);
  }

  goTeams() {
    this.router.navigate(['/teamcreate']);
  }

  goSchedule() {
    this.router.navigate(['/shoudile']);
  }

  goSettings() {
    this.router.navigate(['/setting']);
  }

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
}
