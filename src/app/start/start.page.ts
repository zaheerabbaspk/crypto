import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonButton , IonLabel , IonItem , IonList , IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule , IonButton , IonLabel,IonIcon , IonItem  , IonList]
})
export class StartPage implements OnInit {

  constructor() { }

  ngOnInit() {


    
  }

}
