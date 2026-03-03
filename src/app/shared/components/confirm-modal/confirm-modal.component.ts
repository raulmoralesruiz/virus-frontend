import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent {
  title = input.required<string>();
  description = input.required<string>();
  acceptText = input<string>('Confirmar');
  cancelText = input<string>('Cancelar');

  cancel = output<void>();
  confirm = output<void>();
}
