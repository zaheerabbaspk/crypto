import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';  // ✅ AlertController صحیح import
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService, TeamPlayer } from '../services/player.service';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],   
  selector: 'app-addplayer',
  templateUrl: './addplayer.page.html',
  styleUrls: ['./addplayer.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, 
    CommonModule, FormsModule, IonList, IonItem, IonLabel, IonButton
  ]
})
export class AddplayerPage implements OnInit {
  teamId: string | number = '0';
  teamName = 'Team';
  players: TeamPlayer[] = [];   // منتخب ٹیم کے players

  constructor(
    private alertCtrl: AlertController,
    private router: Router,
    private route: ActivatedRoute,
    private playerService: PlayerService
  ) { }

  ngOnInit() {
    // ٹیم کی context حاصل کریں (query params)
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('teamId') ?? '0';
      const name = params.get('teamName') ?? 'Team';
      this.teamId = id; this.teamName = name;
      this.playerService.loadTeamPlayers(id, name);
    });

    this.playerService.getPlayers().subscribe(list => {
      this.players = list;
    });
  }

  // 🔹 Alert کھولنے والا function
  async openAddPlayerAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Add New Player',
      inputs: [
        {
          name: 'playerName',
          type: 'text',
          placeholder: 'Player Name'
        },
        {
          name: 'fullName',
          type: 'text',
          placeholder: 'Full Name'
        },
        {
          name: 'phone',
          type: 'tel',
          placeholder: 'Phone Number'
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email Address'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: (data) => {
            // ✅ اگر سب fields بھری ہوں
            if (data.playerName && data.fullName && data.phone && data.email) {
              const newPlayer: TeamPlayer = {
                // سادہ unique id (timestamp)
                id: Date.now(),
                name: data.playerName,
                active: true,
                // avatar optional: آپ چاہیں تو بعد میں اپلوڈ/سیٹ کر سکتے ہیں
              };
              const updated = [...this.players, newPlayer];
              this.playerService.savePlayers(this.teamId, updated);
              return true;   // alert close ہو جائے گا
            } else {
              return false;  // alert بند نہیں ہوگا
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // ✅ Continue button: go to Player Squad selection
  continueToSquad() {
    this.router.navigate(['/sequard']);
  }

}
