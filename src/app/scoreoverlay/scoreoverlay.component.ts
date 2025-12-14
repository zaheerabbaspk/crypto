import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol,
  IonBadge, IonLabel, IonItem, IonList, IonButton, IonIcon
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { ScoringDataService, ScoringData, BallOutcome } from '../services/scoring-data.service';

@Component({
  selector: 'app-scoreoverlay',
  templateUrl: './scoreoverlay.component.html',
  styleUrls: ['./scoreoverlay.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol,
    IonBadge, IonLabel, IonItem, IonList, IonButton, IonIcon
  ]
})
export class ScoreoverlayComponent implements OnInit, OnDestroy {
  scoringData: ScoringData | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private scoringDataService: ScoringDataService) { }

  ngOnInit() {
    this.subscription = this.scoringDataService.scoringData$.subscribe(data => {
      this.scoringData = data;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getStrikeRate(runs: number, balls: number): string {
    return balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0';
  }

  getBallRows(): BallOutcome[][] {
    if (!this.scoringData?.currentOverBalls) return [];
    const rows: BallOutcome[][] = [];
    for (let i = 0; i < this.scoringData.currentOverBalls.length; i += 5) {
      rows.push(this.scoringData.currentOverBalls.slice(i, i + 5));
    }
    return rows;
  }

  getEmptyCirclesForRow(rowIndex: number): number[] {
    const rows = this.getBallRows();
    if (rowIndex < rows.length) {
      const currentRowBalls = rows[rowIndex].length;
      const emptyCount = 5 - currentRowBalls;
      return emptyCount > 0 ? Array(emptyCount).fill(0).map((_, i) => i) : [];
    }
    return [];
  }

  getOverRuns(): number {
    if (!this.scoringData?.currentOverBalls) return 0;
    return this.scoringData.currentOverBalls.reduce((total, ball) => total + (ball.runs || 0), 0);
  }
}
