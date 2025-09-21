import { Component } from '@angular/core';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-test-dnd',
  standalone: true,
  imports: [DragDropModule],
  template: `
    <h3>Prueba: Mano → Tablero</h3>

    <div class="zones">
      <!-- Mano -->
      <div
        class="hand-zone"
        cdkDropList
        #handList="cdkDropList"
        [cdkDropListData]="hand"
        [cdkDropListConnectedTo]="[boardList]"
      >
        <h4>Mano</h4>
        @for (c of hand; track c; let i = $index) {
        <div class="card" cdkDrag [cdkDragData]="c">
          {{ c }}
        </div>
        }
      </div>

      <!-- Tablero -->
      <div
        class="board-zone"
        cdkDropList
        #boardList="cdkDropList"
        [cdkDropListData]="board"
        [cdkDropListConnectedTo]="[handList]"
        (cdkDropListDropped)="onDrop($event)"
      >
        <h4>Tablero</h4>
        @for (c of board; track c; let i = $index) {
        <div class="slot">{{ c }}</div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .zones {
        display: flex;
        gap: 20px;
      }
      .hand-zone,
      .board-zone {
        width: 200px;
        min-height: 200px;
        border: 2px dashed #666;
        padding: 8px;
      }
      .card {
        background: lightblue;
        margin: 4px 0;
        padding: 8px;
        cursor: grab;
      }
      .slot {
        background: lightgreen;
        margin: 4px 0;
        padding: 8px;
      }
    `,
  ],
})
export class TestDndComponent {
  hand = ['Carta 1', 'Carta 2', 'Carta 3'];
  board: string[] = [];

  onDrop(event: CdkDragDrop<string[]>) {
    const card = event.item.data;
    console.log('Drop recibido en tablero:', card);

    // quitar de la mano
    this.hand = this.hand.filter((c) => c !== card);

    // añadir al tablero
    this.board = [...this.board, card];
  }
}
