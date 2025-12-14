import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import {  CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
    schemas: [CUSTOM_ELEMENTS_SCHEMA] , 
  selector: 'app-editteam',
  templateUrl: './editteam.page.html',
  styleUrls: ['./editteam.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink]
})
export class EditteamPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
