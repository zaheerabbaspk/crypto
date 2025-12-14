import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { ScoringDataService, ScoringData } from '../services/scoring-data.service';

@Component({
  selector: 'app-scoreboard1',
  templateUrl: './scoreboard1.page.html',
  styleUrls: ['./scoreboard1.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule]
})
export class Scoreboard1Page implements OnInit, OnDestroy {
  scoringData: ScoringData | null = null;
  private subscription: Subscription = new Subscription();

  // Default scoreboard data matching the IPL broadcast design
  teamData = {
    batting: {
      name: 'RCB',
      fullName: 'Royal Challengers Bangalore',
      score: 118,
      wickets: 1,
      overs: 14.2,
      logo: 'assets/logos/rcb.png'
    },
    bowling: {
      name: 'LSG',
      fullName: 'Lucknow Super Giants',
      logo: 'assets/logos/lsg.png'
    }
  };

  players = {
    striker: {
      name: 'MAXWELL',
      runs: 15,
      balls: 11
    },
    nonStriker: {
      name: 'du PLESSIS',
      runs: 33,
      balls: 31
    },
    bowler: {
      name: 'BISHNOI',
      figures: '0-20',
      overs: '3.2'
    }
  };

  matchInfo = {
    venue: 'v LSG',
    hashtag: '#RCBLSG',
    toss: 'TOSS',
    tossResult: 'LSG'
  };

  constructor(private scoringDataService: ScoringDataService) { }

  ngOnInit() {
    this.subscription = this.scoringDataService.scoringData$.subscribe(data => {
      if (data) {
        this.scoringData = data;
        this.updateScoreboardData();
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  updateScoreboardData() {
    if (!this.scoringData) return;

    // Update team data with live scoring data
    this.teamData.batting = {
      name: this.scoringData.battingTeam.substring(0, 3).toUpperCase(),
      fullName: this.scoringData.battingTeam,
      score: this.scoringData.teamScore,
      wickets: this.scoringData.wickets,
      overs: parseFloat(`${this.scoringData.currentOver}.${this.scoringData.ballsInOver}`),
      logo: `assets/logos/${this.scoringData.battingTeam.toLowerCase().replace(' ', '')}.png`
    };

    // Update player data
    this.players = {
      striker: {
        name: this.scoringData.strikerBatsman.toUpperCase(),
        runs: this.scoringData.strikerRuns,
        balls: this.scoringData.strikerBalls
      },
      nonStriker: {
        name: this.scoringData.nonStrikerBatsman.toUpperCase(),
        runs: this.scoringData.nonStrikerRuns,
        balls: this.scoringData.nonStrikerBalls
      },
      bowler: {
        name: this.scoringData.currentBowler.toUpperCase(),
        figures: `${this.scoringData.bowlerWickets}-${this.scoringData.bowlerRuns}`,
        overs: this.scoringData.bowlerOvers
      }
    };
  }
}
