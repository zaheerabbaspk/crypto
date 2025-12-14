import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem } from '@ionic/angular/standalone';

@Component({
  selector: 'app-srca2',
  templateUrl: './srca2.page.html',
  styleUrls: ['./srca2.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, CommonModule]
})
export class Srca2Page {
  // Mock data aligned with template bindings
  match = {
    leftTeam: { short: 'IND', flag: 'assets/logos/warriors.svg' },
    rightTeam: { short: 'UAE', flag: 'assets/logos/kr.svg' },
    batters: [
      { name: 'ABHISHEK', runs: 19, balls: 12 },
      { name: 'GILL', runs: 13, balls: 5 }
    ],
    scoreLeft: '34-0',
    over: '2.5',
    target: 58,
    bowler: { name: 'PARASHAR', figures: '0-9 • 0.5', flag: 'assets/logos/kr.svg' }
  };
}