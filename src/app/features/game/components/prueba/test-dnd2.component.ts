// import { Component, inject, OnInit } from '@angular/core';
// import {
//   DragDropModule,
//   CdkDragDrop,
//   moveItemInArray,
//   transferArrayItem,
// } from '@angular/cdk/drag-drop';
// import { DragDropService } from '@core/services/drag-drop.service';

// @Component({
//   selector: 'app-test-dnd2',
//   standalone: true,
//   imports: [DragDropModule],
//   template: `
//     <h3>Prueba SERVICE: Mano → Tablero (sin refs locales)</h3>

//     <div class="zones">
//       <!-- Mano -->
//       <div
//         class="hand-zone"
//         cdkDropList
//         id="handList"
//         [cdkDropListData]="hand"
//         [cdkDropListConnectedTo]="[dragDrop.boardListId()!]"
//         (cdkDropListExited)="onExitHand($event)"
//       >
//         <h4>Mano</h4>
//         @for (c of hand; track c; let i = $index) {
//         <div class="card" cdkDrag [cdkDragData]="c">
//           {{ c }}
//         </div>
//         }
//       </div>

//       <!-- Tablero -->
//       <div
//         class="board-zone"
//         cdkDropList
//         id="boardList"
//         [cdkDropListData]="board"
//         [cdkDropListConnectedTo]="[dragDrop.handListId()!]"
//         (cdkDropListDropped)="onDrop($event)"
//         (cdkDropListEntered)="onEnterBoard($event)"
//       >
//         <h4>Tablero</h4>
//         @for (c of board; track c; let i = $index) {
//         <div class="slot">{{ c }}</div>
//         }
//       </div>
//     </div>
//   `,
//   styles: [
//     `
//       .zones {
//         display: flex;
//         gap: 20px;
//       }
//       .hand-zone,
//       .board-zone {
//         width: 200px;
//         min-height: 200px;
//         border: 2px dashed #666;
//         padding: 8px;
//       }
//       .card {
//         background: lightblue;
//         margin: 6px 0;
//         padding: 8px;
//         cursor: grab;
//       }
//       .slot {
//         background: lightgreen;
//         margin: 6px 0;
//         padding: 8px;
//       }
//     `,
//   ],
// })
// export class TestDndComponent2 implements OnInit {
//   dragDrop = inject(DragDropService);

//   hand = ['Carta 1', 'Carta 2', 'Carta 3'];
//   board: string[] = [];

//   ngOnInit() {
//     // Registramos ambos ids en el servicio (será igual en el caso real)
//     this.dragDrop.setHandListId('handList');
//     this.dragDrop.setBoardListId('boardList');
//   }

//   onDrop(event: CdkDragDrop<string[]>) {
//     if (event.previousContainer === event.container) {
//       moveItemInArray(
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex
//       );
//     } else {
//       transferArrayItem(
//         event.previousContainer.data,
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex
//       );
//     }

//     console.log('[TestDnd] hand ->', this.hand);
//     console.log('[TestDnd] board ->', this.board);
//   }

//   onEnterBoard(event: any) {
//     console.log(`[ENTER] Carta ${event.item.data} entró en tablero`);
//   }

//   onExitHand(event: any) {
//     console.log(`[EXIT] Carta ${event.item.data} salió de mano`);
//   }
// }
