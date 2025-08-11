import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SocketPing } from './components/socket-ping/socket-ping.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SocketPing],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');
}
