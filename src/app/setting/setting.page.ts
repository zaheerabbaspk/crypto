import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonToggle, IonModal, IonButton, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { MatchService } from '../services/overs-settings.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonToggle, IonModal, IonButton, IonIcon, CommonModule, FormsModule]
})
export class SettingPage implements OnInit {
  overlayManual = false;
  // Inning Settings modal state and fields
  isInningSettingsOpen = false;
  newOvers: number = 0;
  newLimit: number = 0;
  ballsPerOver: number = 6; // read-only per design

  constructor(private router: Router, private matchService: MatchService) { }

  ngOnInit() {
  }

  changeFlipInning() {
    // TODO: implement flip logic
    console.log('Change/Flip Inning clicked');
  }

  openInningSettings() {
    // Open modal prefilled with current settings
    try {
      const curr = this.matchService.current;
      this.newOvers = curr?.numberOfOvers || parseInt(localStorage.getItem('totalOvers') || '20', 10) || 20;
      this.newLimit = curr?.bowlerOverLimit || parseInt(localStorage.getItem('limitPerBowler') || '4', 10) || 4;
    } catch {
      this.newOvers = parseInt(localStorage.getItem('totalOvers') || '20', 10) || 20;
      this.newLimit = parseInt(localStorage.getItem('limitPerBowler') || '4', 10) || 4;
    }
    this.isInningSettingsOpen = true;
  }

  closeInnings() {
    // TODO: trigger innings close flow
    console.log('Close Innings clicked');
  }

  closeWithDLS() {
    // TODO: trigger DLS close flow
    console.log('Close Innings with DLS clicked');
  }

  openInsightCollector() {
    // TODO: open insight collector
    console.log('Insight Collector clicked');
  }

  // Inning Settings modal handlers
  closeInningSettings() {
    this.isInningSettingsOpen = false;
  }

  applyInningSettings() {
    const ov = parseInt(String(this.newOvers), 10);
    const lim = parseInt(String(this.newLimit), 10);
    if (ov > 0) {
      try { this.matchService.setOvers(ov); } catch {}
      localStorage.setItem('totalOvers', String(ov));
    }
    if (lim > 0) {
      try { this.matchService.setBowlerLimit(lim); } catch {}
      localStorage.setItem('limitPerBowler', String(lim));
    }
    this.closeInningSettings();
  }

  goBack() {
    try {
      window.history.back();
    } catch {
      this.router.navigate(['/score']);
    }
  }

}
