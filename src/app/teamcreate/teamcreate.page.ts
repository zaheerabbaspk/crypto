import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonIcon, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, personOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { DataService, Team } from '../data-service';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA], 
  selector: 'app-teamcreate',
  templateUrl: './teamcreate.page.html',
  styleUrls: ['./teamcreate.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule
  ]
})
export class TeamcreatePage implements OnInit {

  teams: Team[] = [];

  constructor(private alertCtrl: AlertController, private router: Router, private dataSer: DataService) {
    addIcons({ personOutline, trash }); // Register trash icon
  }

  ngOnInit() {
    // Subscribe to teams changes
    this.dataSer.teams$.subscribe(teams => {
      this.teams = teams;
      console.log('TeamCreate: Teams updated:', teams);
    });
  }

  async createTeam() {
    const alert = await this.alertCtrl.create({
      header: 'Create New Team',
      inputs: [
        {
          name: 'teamName',
          type: 'text',
          placeholder: 'Enter team name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Create',
          handler: (data) => {
            if (data.teamName && data.teamName.trim()) {
              const newId = Math.floor(Math.random() * 1000) + 600;
              const newTeam: Team = { id: newId, name: data.teamName.trim() };
              console.log('Adding new team:', newTeam);
              this.dataSer.addTeam(newTeam);
              console.log('Teams after adding:', this.dataSer.getTeams());
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteTeam(index: number) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Team',
      message: 'Are you sure you want to delete this team?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { 
          text: 'Delete',
          handler: () => {
            this.dataSer.deleteTeam(index);
          }
        }
      ]
    });

    await alert.present();
  }

  goBack() {
    console.log('TeamcreatePage: Back clicked -> navigating to /twopage');
    this.router.navigateByUrl('/twopage', { replaceUrl: true });
  }

  // New method to navigate to edit page
   goto() {
    this.router.navigate(['/editteam']);
  }

}

