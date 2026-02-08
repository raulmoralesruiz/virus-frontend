import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GameUiService {
  private historyVisible = signal(false);
  historyOpen = this.historyVisible.asReadonly();
  
  private leavingVisible = signal(false);
  leavingOpen = this.leavingVisible.asReadonly();

  openHistoryModal() {
    this.historyVisible.set(true);
  }

  closeHistoryModal() {
    this.historyVisible.set(false);
  }

  openLeaveModal() {
    this.leavingVisible.set(true);
  }

  closeLeaveModal() {
    this.leavingVisible.set(false);
  }

  reset() {
    this.historyVisible.set(false);
    this.leavingVisible.set(false);
  }
}
