import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'twopage',
    loadComponent: () => import('./twopage/twopage.page').then( m => m.TwopagePage)
  },
  {
    path: 'teamcreate',
    loadComponent: () => import('./teamcreate/teamcreate.page').then( m => m.TeamcreatePage)
  },
  {
    path: 'editteam',
    loadComponent: () => import('./editteam/editteam.page').then( m => m.EditteamPage)
  },
  {
    path: 'addplayer',
    loadComponent: () => import('./addplayer/addplayer.page').then( m => m.AddplayerPage)
  },
  {
    path: 'shoudile',
    loadComponent: () => import('./shoudile/shoudile.page').then( m => m.ShoudilePage)
  },
  {
    path: 'select',
    loadComponent: () => import('./select/select.page').then( m => m.SelectPage)
  },
  {
    path: 'select2',
    loadComponent: () => import('./select2/select2.page').then( m => m.Select2Page)
  },
  {
    path: 'start',
    loadComponent: () => import('./start/start.page').then( m => m.StartPage)
  },
  {
    path: 'venue',
    loadComponent: () => import('./venue/venue.page').then( m => m.VenuePage)
  },
  {
    path: 'score',
    loadComponent: () => import('./score/score.page').then( m => m.ScorePage)
  },
  {
    path: 'press',
    loadComponent: () => import('./press/press.page').then( m => m.PressPage)
  },
  {
    path: 'golden',
    loadComponent: () => import('./golden/golden.page').then( m => m.GoldenPage)
  },
  {
    path: 'golden1',
    loadComponent: () => import('./golden1/golden1.page').then( m => m.Golden1Page)
  },
  {
    path: 'toss',
    loadComponent: () => import('./toss/toss.page').then( m => m.TossPage)
  },
  {
    path: 'umpire',
    loadComponent: () => import('./umpire/umpire.page').then( m => m.UmpirePage)
  },
  {
    path: 'sequard',
    loadComponent: () => import('./sequard/sequard.page').then( m => m.SequardPage)
  },
  {
    path: 'scoringstart',
    loadComponent: () => import('./scoringstart/scoringstart.page').then( m => m.ScoringstartPage)
  },
  {
    path: 'scoreoverlay',
    loadComponent: () => import('./scoreoverlay/scoreoverlay.component').then( m => m.ScoreoverlayComponent)
  },

  {
    path: 'manofmatch',
    loadComponent: () => import('./manofmatch/manofmatch.page').then( m => m.ManofmatchPage)
  },
  {
    path: 'finalscore',
    loadComponent: () => import('./finalscore/finalscore.page').then( m => m.FinalscorePage)
  },
  {
    path: 'scra',
    loadComponent: () => import('./scra/scra.page').then( m => m.ScraPage)
  },
  {
    path: 'srca2',
    loadComponent: () => import('./srca2/srca2.page').then( m => m.Srca2Page)
  },
  {
    path: 'scoreboard1',
    loadComponent: () => import('./scoreboard1/scoreboard1.page').then( m => m.Scoreboard1Page)
  },
  {
    path: 'overlay',
    loadComponent: () => import('./overlay/overlay.page').then( m => m.OverlayPage)
  },
  {
    path: 'setting',
    loadComponent: () => import('./setting/setting.page').then( m => m.SettingPage)
  },
  {
    path: 'icons',
    loadComponent: () => import('./icons/icons.page').then( m => m.IconsPage)
  },
  {
    path: 'loginft',
    loadComponent: () => import('./loginft/loginft.page').then( m => m.LoginftPage)
  },
  

];
