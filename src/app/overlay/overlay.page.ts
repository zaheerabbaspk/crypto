import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.page.html',
  styleUrls: ['./overlay.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, CommonModule, FormsModule]
})
export class OverlayPage implements OnInit {
  currentMatchId: string = '';

  constructor() { }

  ngOnInit() {
    // Load active matchId from storage or generate fallback for safety
    let mid = localStorage.getItem('currentMatchId');
    if (!mid || mid === 'default_match') {
      mid = Date.now().toString();
      localStorage.setItem('currentMatchId', mid);
    }
    this.currentMatchId = mid;
  }

  getOverlayUrl(): string {
    const mid = this.currentMatchId || localStorage.getItem('currentMatchId') || '';
    return `https://crickblastpro3.netlify.app/?matchId=${mid}`;
  }

  async copyOverlayUrl() {
    const url = this.getOverlayUrl();
    // Preferred: async Clipboard API on secure contexts
    try {
      if ((window as any).isSecureContext && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        alert('Overlay URL copied to clipboard');
        return;
      }
    } catch {}

    // Fallback: textarea + execCommand
    try {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) {
        alert('Overlay URL copied to clipboard');
        return;
      }
    } catch {}

    // Last resort: show a prompt to manually copy
    const manual = prompt('Copy this Overlay URL:', url);
    if (manual !== null) {
      // user saw it; no further action
    }
  }

  openOverlay() {
    window.open(this.getOverlayUrl(), '_blank');
  }
}
