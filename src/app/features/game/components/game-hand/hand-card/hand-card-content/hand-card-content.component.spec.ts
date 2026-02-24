import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HandCardContentComponent } from './hand-card-content.component';
import { Card, CardColor, CardKind, TreatmentSubtype } from '@core/models/card.model';

describe('HandCardContentComponent', () => {
  let component: HandCardContentComponent;
  let fixture: ComponentFixture<HandCardContentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HandCardContentComponent],
    });
    fixture = TestBed.createComponent(HandCardContentComponent);
    component = fixture.componentInstance;
    
    // Default input to prevent initialization error
    fixture.componentRef.setInput('card', { id: '1', kind: CardKind.Organ, color: CardColor.Red } as Card);
    fixture.detectChanges();
  });

  describe('icon getter', () => {
    it('should return 🧪 for treatment since emoji prefix is not used in current constants', () => {
      fixture.componentRef.setInput('card', { kind: CardKind.Treatment, subtype: TreatmentSubtype.Transplant } as Card);
      expect(component.icon).toBe('🧪'); // No 'emoji:' prefix in currently defined constants
    });

    it('should return specific icon for organ', () => {
      fixture.componentRef.setInput('card', { kind: CardKind.Organ, color: CardColor.Red } as Card);
      expect(component.icon).toBe('organ-red');
    });

    it('should return question mark for unknown organ color', () => {
      fixture.componentRef.setInput('card', { kind: CardKind.Organ, color: 'unknown' as any } as Card);
      expect(component.icon).toBe('❔');
    });

    it('should return medicine icon for medicine', () => {
      fixture.componentRef.setInput('card', { kind: CardKind.Medicine } as Card);
      expect(component.icon).toBe('modifier-medicine');
    });

    it('should return virus icon for virus', () => {
      fixture.componentRef.setInput('card', { kind: CardKind.Virus } as Card);
      expect(component.icon).toBe('modifier-virus');
    });

    it('should return default treatment icon if no subtype mathces emoji', () => {
      fixture.componentRef.setInput('card', { kind: CardKind.Treatment, subtype: TreatmentSubtype.OrganThief } as Card);
      expect(component.icon).toBe('🧪'); 
    });

    it('should return question mark fallback for unknown kind', () => {
      fixture.componentRef.setInput('card', { kind: 'UnknownKind' } as any);
      expect(component.icon).toBe('❔');
    });

    it('should return the emoji when the subtype maps to an emoji prefix', () => {
      // Temporarily mock an emoji into the constant
      const { TREATMENT_ICONS } = require('../constants/hand-card.constants');
      TREATMENT_ICONS['testEmoji'] = 'emoji:🤡';
      
      fixture.componentRef.setInput('card', { kind: CardKind.Treatment, subtype: 'testEmoji' as any } as Card);
      expect(component.icon).toBe('🤡');
    });

    it('should safely return default treatment icon if treatment card has no subtype', () => {
      fixture.componentRef.setInput('card', { kind: CardKind.Treatment } as Card);
      expect(component.icon).toBe('🧪');
    });
  });

  describe('subtypeIconName', () => {
    it('should return null if not treatment', () => {
      fixture.componentRef.setInput('card', { kind: CardKind.Organ } as Card);
      expect(component.subtypeIconName).toBeNull();
    });

    it('should return null if treatment without subtype', () => {
      fixture.componentRef.setInput('card', { kind: CardKind.Treatment } as Card);
      expect(component.subtypeIconName).toBeNull();
    });

    it('should return the icon name if it does not start with emoji', () => {
      fixture.componentRef.setInput('card', { kind: CardKind.Treatment, subtype: TreatmentSubtype.Transplant } as Card);
      expect(component.subtypeIconName).toBe('treatment-transplant'); 
    });

    it('should return iconName if it is not emoji', () => {
      fixture.componentRef.setInput('card', { kind: CardKind.Treatment, subtype: TreatmentSubtype.OrganThief } as Card);
      expect(component.subtypeIconName).toBe('treatment-organThief');
    });

    it('should return null if the icon name starts with emoji', () => {
      const { TREATMENT_ICONS } = require('../constants/hand-card.constants');
      TREATMENT_ICONS['testEmoji'] = 'emoji:🤡';
      
      fixture.componentRef.setInput('card', { kind: CardKind.Treatment, subtype: 'testEmoji' as any } as Card);
      expect(component.subtypeIconName).toBeNull();
    });

    it('should return null if treatment subtype has no defined icon in constants', () => {
      fixture.componentRef.setInput('card', { kind: CardKind.Treatment, subtype: 'unknown-subtype' as any } as Card);
      expect(component.subtypeIconName).toBeNull();
    });
  });

  describe('displayImage', () => {
    it('should prioritize subtypeIconName', () => {
      fixture.componentRef.setInput('card', { kind: CardKind.Treatment, subtype: TreatmentSubtype.OrganThief } as Card);
      expect(component.displayImage).toBe('treatment-organThief');
    });

    it('should fall back to icon if icon starts with expected prefixes', () => {
      fixture.componentRef.setInput('card', { kind: CardKind.Organ, color: CardColor.Red } as Card);
      expect(component.displayImage).toBe('organ-red');
    });

    it('should return null if it cannot resolve a viable display image', () => {
      fixture.componentRef.setInput('card', { kind: CardKind.Organ, color: 'unknown' as any } as Card);
      expect(component.displayImage).toBeNull(); // Gets '❔' icon
    });
  });

  describe('colorThiefColor', () => {
    it('should return css var for color thief treatments', () => {
       const colors = [
         { s: TreatmentSubtype.colorThiefRed, e: 'var(--card-red)' },
         { s: TreatmentSubtype.colorThiefGreen, e: 'var(--card-green)' },
         { s: TreatmentSubtype.colorThiefBlue, e: 'var(--card-blue)' },
         { s: TreatmentSubtype.colorThiefYellow, e: 'var(--card-yellow)' },
       ];

       for (const { s, e } of colors) {
          fixture.componentRef.setInput('card', { kind: CardKind.Treatment, subtype: s } as Card);
          expect(component.colorThiefColor).toBe(e);
       }
    });

    it('should return null for other cards', () => {
        fixture.componentRef.setInput('card', { kind: CardKind.Organ, color: CardColor.Red } as Card);
        expect(component.colorThiefColor).toBeNull();
    });
  });
});
