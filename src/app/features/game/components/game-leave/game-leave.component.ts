import { Component, output } from '@angular/core';

@Component({
  selector: 'game-leave',
  standalone: true,
  templateUrl: './game-leave.component.html',
  styleUrls: ['./game-leave.component.css']
})
export class GameLeaveComponent {
  confirm = output<void>();
  cancel = output<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
