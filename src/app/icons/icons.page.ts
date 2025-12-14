import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonAvatar, IonLabel, IonIcon, IonButton, IonGrid, IonRow, IonCol, IonBadge } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService, TeamPlayer } from '../services/player.service';

@Component({
  selector: 'app-icons',
  templateUrl: './icons.page.html',
  styleUrls: ['./icons.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonList, IonItem, IonAvatar, IonLabel, IonIcon, IonButton,
    IonGrid, IonRow, IonCol, IonBadge,
    CommonModule, FormsModule
  ]
})
export class  IconsPage implements OnInit {
  teamName = 'Team';
  teamId: string | number = '0';

  players: TeamPlayer[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private playerService: PlayerService) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('teamId') ?? '0';
      const name = params.get('teamName') ?? 'Team';
      this.teamId = id;
      this.teamName = name;
      this.playerService.loadTeamPlayers(id, name);
    });

    this.playerService.getPlayers().subscribe(list => {
      this.players = list;
    });
  }
  goBack() {
    try { window.history.back(); } catch { this.router.navigate(['/']); }
  }

  logout() {
    // implement your auth sign-out here
    this.router.navigate(['/']);
  }

}
