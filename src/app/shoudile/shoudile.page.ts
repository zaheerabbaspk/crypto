import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shoudile',
  templateUrl: './shoudile.page.html',
  styleUrls: ['./shoudile.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton]
})
export class ShoudilePage implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {}

  // ✅ Next button par click
  goto() {
    this.router.navigate(['/select']);  // yahan apni next page ka route likho
  }

  // ✅ Back button par click
  gotoBack() {
    this.router.navigateByUrl('/twopage', { replaceUrl: true });
  }

}
