import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonInput, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonMenuButton 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonInput,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonMenuButton
  ],
})
export class HomePage {
  constructor(private router: Router) {}

  onLogin() {
    this.router.navigate(['/twopage']);
  }

  onSignUp() {
    this.router.navigate(['/loginft']);
  }
}
