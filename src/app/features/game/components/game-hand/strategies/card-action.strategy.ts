import { Card } from '@core/models/card.model';
import { PublicGameState, PlayCardTarget } from '@core/models/game.model';
import { TargetSelectOption } from "../target-select/target-select.models";

export interface CardActionStrategy {
  getTargets(gameState: PublicGameState, card: Card, currentPlayerId?: string): TargetSelectOption[];
  
  /**
   * Valida si el estado actual de la selección es suficiente para jugar la carta.
   * @param currentSelection Objeto con toda la info que el componente pueda tener (target, targets A/B, direction, etc)
   */
  canPlay(currentSelection: any): boolean;

  /**
   * Describe QUÉ falta para poder jugar (mensaje de error diagnóstico).
   * Devuelve null si la selección ya es válida.
   */
  whyBlocked?(currentSelection: any): string | null;

  /**
   * Construye el payload que el store espera enviar al backend.
   */
  getPlayPayload(currentSelection: any): any;
}
