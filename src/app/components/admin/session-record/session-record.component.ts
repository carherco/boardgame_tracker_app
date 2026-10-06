import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Event, Game, Player } from '../../../models/interfaces';

@Component({
  selector: 'app-session-record',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './session-record.component.html',
  styleUrls: ['./session-record.component.css']
})
export class SessionRecordComponent implements OnInit {
  sessionForm: FormGroup;
  activeEvent: Event | null = null;
  selectedGame: Game | null = null;
  selectedPlayerIds: number[] = [];
  selectedShiftId: number | null = null;
  
  showBggModal = false;
  bggResults: any[] = [];
  isSearchingBgg = false;
  
  photoFiles: File[] = [];
  photoPreviews: string[] = [];

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.sessionForm = this.fb.group({
      gameSearch: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.api.getActiveEvent().subscribe({
      next: (event) => {
        this.activeEvent = event;
        // Con un único turno se asigna solo; con varios hay que elegirlo (se registra a posteriori)
        this.selectedShiftId = event.shifts?.length === 1 ? event.shifts[0].id : null;
      },
      error: (err) => console.error('Error fetching active event', err)
    });
  }

  openBggSearch() {
    this.showBggModal = true;
    this.bggResults = [];
  }

  searchBgg(query: string) {
    if (!query) return;
    this.isSearchingBgg = true;
    this.api.searchBgg(query).subscribe({
      next: (results) => {
        this.bggResults = results;
        this.isSearchingBgg = false;
      },
      error: () => this.isSearchingBgg = false
    });
  }

  importGame(bggGame: any) {
    this.api.addGame({
      name: bggGame.name,
      bggId: bggGame.bggId
    }).subscribe({
      next: (game) => {
        this.selectedGame = game;
        this.showBggModal = false;
      }
    });
  }

  toggleAttendee(playerId: number | undefined) {
    if (!playerId) return;
    const index = this.selectedPlayerIds.indexOf(playerId);
    if (index > -1) {
      this.selectedPlayerIds.splice(index, 1);
    } else {
      this.selectedPlayerIds.push(playerId);
    }
  }

  isSelected(playerId: number | undefined): boolean {
    return playerId ? this.selectedPlayerIds.includes(playerId) : false;
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.photoFiles.push(file);
        
        const reader = new FileReader();
        reader.onload = (e: any) => this.photoPreviews.push(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  }

  get missingShift(): boolean {
    return (this.activeEvent?.shifts?.length || 0) > 1 && !this.selectedShiftId;
  }

  shiftTime(isoTime: string | undefined): string {
    return isoTime ? isoTime.substring(11, 16) : '';
  }

  onSubmit() {
    if (!this.activeEvent || !this.selectedGame || this.selectedPlayerIds.length === 0 || this.missingShift) return;

    const sessionData = {
      eventId: this.activeEvent.id!,
      shiftId: this.selectedShiftId || undefined,
      gameId: this.selectedGame.id!,
      playerIds: this.selectedPlayerIds,
      notes: this.sessionForm.get('notes')?.value,
      photos: this.photoFiles
    };

    this.api.recordSession(sessionData).subscribe({
      next: () => {
        alert('¡Partida registrada con éxito!');
        this.resetForm();
      },
      error: (err) => alert('Error al registrar la partida')
    });
  }

  resetForm() {
    this.selectedGame = null;
    this.selectedPlayerIds = [];
    this.selectedShiftId = this.activeEvent?.shifts?.length === 1 ? this.activeEvent.shifts[0].id : null;
    this.photoFiles = [];
    this.photoPreviews = [];
    this.sessionForm.reset();
  }
}
