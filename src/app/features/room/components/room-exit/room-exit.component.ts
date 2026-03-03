import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-room-exit',
  standalone: true,
  imports: [],
  templateUrl: './room-exit.component.html',
  styleUrl: './room-exit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomExitComponent {
  title = input<string>('¿Salir de la sala?');
  description = input<string>('Si abandonas esta sala, se liberará tu plaza y volverás al listado de salas.');
  acceptText = input<string>('Salir');

  cancelLeave = output<void>();
  confirmLeave = output<void>();
}