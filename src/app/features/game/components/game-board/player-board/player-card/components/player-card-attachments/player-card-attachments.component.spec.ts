import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerCardAttachmentsComponent } from './player-card-attachments.component';
import { Card, CardColor, CardKind } from '@core/models/card.model';
import { OrganOnBoard } from '@core/models/game.model';

describe('PlayerCardAttachmentsComponent', () => {
  let component: PlayerCardAttachmentsComponent;
  let fixture: ComponentFixture<PlayerCardAttachmentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PlayerCardAttachmentsComponent]
    });
    fixture = TestBed.createComponent(PlayerCardAttachmentsComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    fixture.componentRef.setInput('organ', { id: 'o1', color: CardColor.Red, attached: [] } as OrganOnBoard);
    fixture.componentRef.setInput('attachedCards', []);
    fixture.componentRef.setInput('contagionMode', false);
    fixture.componentRef.setInput('temporaryViruses', []);
  });

  describe('isVirus', () => {
    it('should return true if card kind is virus', () => {
      const virus = { kind: CardKind.Virus } as Card;
      expect(component.isVirus(virus)).toBe(true);
    });

    it('should return false if card kind is not virus', () => {
      const med = { kind: CardKind.Medicine } as Card;
      expect(component.isVirus(med)).toBe(false);
    });
  });

  describe('isTemporaryVirus', () => {
    it('should return true if virus is in temporaryViruses list', () => {
      fixture.componentRef.setInput('temporaryViruses', [{ id: 'v1' } as Card]);
      expect(component.isTemporaryVirus('v1')).toBe(true);
    });

    it('should return false if virus is not in temporaryViruses list', () => {
      fixture.componentRef.setInput('temporaryViruses', [{ id: 'v2' } as Card]);
      expect(component.isTemporaryVirus('v1')).toBe(false);
    });
  });

  describe('getMedicineIcon', () => {
    it('should return modifier-medicine', () => {
      expect(component.getMedicineIcon()).toBe('modifier-medicine');
    });
  });

  describe('getVirusIcon', () => {
    it('should return modifier-virus', () => {
      expect(component.getVirusIcon()).toBe('modifier-virus');
    });
  });
});
