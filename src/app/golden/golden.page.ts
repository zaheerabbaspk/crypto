import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonButton, IonInput, IonSearchbar, IonModal, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonDatetime } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-golden',
  templateUrl: './golden.page.html',
  styleUrls: ['./golden.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonButton, IonInput, IonSearchbar, IonModal, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonDatetime, CommonModule, FormsModule]
})
export class GoldenPage implements OnInit {

  teamName: string = 'Zaherr';
  searchQuery: string = '';
  selectedPlayers: any[] = [];
  registeredPlayers: any[] = [];
  
  // Modal controls
  isModalOpen = false;
  
  // New player form data
  newPlayer = {
    firstName: '',
    displayName: '',
    address: '',
    phone: '',
    dateOfBirth: ''
  };

  constructor(private router: Router) { }

  ngOnInit() {
    // Get team name from localStorage or match data
    const selectedTeam1 = localStorage.getItem('selectedTeam1');
    const selectedTeam2 = localStorage.getItem('selectedTeam2');
    
    if (selectedTeam1) {
      this.teamName = selectedTeam1;
    } else if (selectedTeam2) {
      this.teamName = selectedTeam2;
    }

    // Load saved players from localStorage
    this.loadSelectedPlayers();
  }

  // Next button function
  onNext() {
    if (this.selectedPlayers.length === 0) {
      alert('Please select at least one player before proceeding!');
      return;
    }
    
    // Ensure players are saved before navigation
    this.saveSelectedPlayers();
    
    console.log('Next button clicked - players saved');
    this.router.navigate(['/golden1']);
  }

  // Add new player function - opens modal
  addNewPlayer() {
    this.isModalOpen = true;
  }

  // Close modal
  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  // Reset form data
  resetForm() {
    this.newPlayer = {
      firstName: '',
      displayName: '',
      address: '',
      phone: '',
      dateOfBirth: ''
    };
  }

  // Save player and add more
  saveAndAddMore() {
    if (this.newPlayer.firstName.trim()) {
      // Add player to selected players list
      this.selectedPlayers.push({
        name: this.newPlayer.firstName,
        displayName: this.newPlayer.displayName,
        address: this.newPlayer.address,
        phone: this.newPlayer.phone,
        dateOfBirth: this.newPlayer.dateOfBirth
      });
      
      // Save to localStorage
      this.saveSelectedPlayers();
      
      // Reset form but keep modal open
      this.resetForm();
      console.log('Player saved, form reset for next player');
    }
  }

  // Save player and finish
  saveAndFinish() {
    if (this.newPlayer.firstName.trim()) {
      // Add player to selected players list
      this.selectedPlayers.push({
        name: this.newPlayer.firstName,
        displayName: this.newPlayer.displayName,
        address: this.newPlayer.address,
        phone: this.newPlayer.phone,
        dateOfBirth: this.newPlayer.dateOfBirth
      });
      
      // Save to localStorage
      this.saveSelectedPlayers();
      
      // Close modal
      this.closeModal();
      console.log('Player saved and modal closed');
    }
  }

  // Search players function
  searchPlayers() {
    console.log('Searching for:', this.searchQuery);
  }

  // Save selected players to localStorage
  private saveSelectedPlayers() {
    localStorage.setItem('selectedPlayers', JSON.stringify(this.selectedPlayers));
    
    // Also save in format expected by scoringstart page
    const teamName = this.teamName.toLowerCase().replace(' ', '');
    localStorage.setItem(`${teamName}Players`, JSON.stringify(this.selectedPlayers));
    localStorage.setItem('teamAPlayers', JSON.stringify(this.selectedPlayers));
    
    console.log(`Saved ${this.selectedPlayers.length} players for ${this.teamName}`);
    console.log('Players saved to keys:', `${teamName}Players`, 'teamAPlayers');
  }

  // Load selected players from localStorage
  private loadSelectedPlayers() {
    const savedPlayers = localStorage.getItem('selectedPlayers');
    if (savedPlayers) {
      this.selectedPlayers = JSON.parse(savedPlayers);
    }
  }

  // Clear all selected players (for manual removal)
  clearAllPlayers() {
    this.selectedPlayers = [];
    localStorage.removeItem('selectedPlayers');
  }

  // Toggle player selection
  togglePlayerSelection(player: any) {
    const index = this.selectedPlayers.findIndex(p => p.name === player.name);
    
    if (index > -1) {
      // Player is already selected, remove them
      this.selectedPlayers.splice(index, 1);
    } else {
      // Player is not selected, add them
      this.selectedPlayers.push({
        name: player.name,
        displayName: player.displayName,
        address: player.address,
        phone: player.phone,
        dateOfBirth: player.dateOfBirth
      });
    }
    
    // Save to localStorage
    this.saveSelectedPlayers();
  }

  // Check if player is selected
  isPlayerSelected(player: any): boolean {
    return this.selectedPlayers.some(p => p.name === player.name);
  }


}
