import { CardKind, TreatmentSubtype, CardColor } from '@core/models/card.model';
import { getInstruction } from './target-select.instructions';

describe('TargetSelectInstructions', () => {
    describe('getInstruction', () => {
        it('should return transplant instructions', () => {
            const result1 = getInstruction({ subtype: TreatmentSubtype.Transplant } as any, true, false, true, '');
            expect(result1).toContain('Elige dos órganos distintos');
            const result2 = getInstruction({ subtype: TreatmentSubtype.AlienTransplant } as any, true, false, true, '');
            expect(result2).toContain('incluso órganos inmunes');
        });

        it('should return contagion instructions', () => {
            const result = getInstruction({} as any, false, true, true, '');
            expect(result).toContain('Asigna cada virus');
        });

        describe('requires target selection', () => {
            it('should return medicine instruction', () => {
                 expect(getInstruction({ kind: CardKind.Medicine } as any, false, false, true, '')).toContain('Selecciona el órgano que quieres curar');
            });
            it('should return virus instruction', () => {
                 expect(getInstruction({ kind: CardKind.Virus } as any, false, false, true, '')).toContain('Selecciona el órgano que quieres infectar');
            });
            it('should return organ thief instruction', () => {
                 expect(getInstruction({ subtype: TreatmentSubtype.OrganThief } as any, false, false, true, '')).toContain('Elige el órgano que vas a robar');
            });
            it('should return color thief instruction', () => {
                 expect(getInstruction({ subtype: TreatmentSubtype.colorThiefRed } as any, false, false, true, '')).toContain('Elige el órgano de ese color');
                 expect(getInstruction({ subtype: TreatmentSubtype.colorThiefGreen } as any, false, false, true, '')).toContain('Elige el órgano de ese color');
                 expect(getInstruction({ subtype: TreatmentSubtype.colorThiefBlue } as any, false, false, true, '')).toContain('Elige el órgano de ese color');
                 expect(getInstruction({ subtype: TreatmentSubtype.colorThiefYellow } as any, false, false, true, '')).toContain('Elige el órgano de ese color');
            });
            it('should return medical error instruction', () => {
                 expect(getInstruction({ subtype: TreatmentSubtype.MedicalError } as any, false, false, true, '')).toContain('Selecciona al jugador');
            });
            it('should return trick or treat instruction', () => {
                 expect(getInstruction({ subtype: TreatmentSubtype.trickOrTreat } as any, false, false, true, '')).toContain('Elige al jugador cuyo cuerpo');
            });
            it('should return failed experiment instruction', () => {
                 expect(getInstruction({ subtype: TreatmentSubtype.failedExperiment } as any, false, false, true, '')).toContain('Elige un órgano infectado');
            });
            it('should return body swap instruction', () => {
                 expect(getInstruction({ subtype: TreatmentSubtype.BodySwap } as any, false, false, true, '')).toContain('Elige el sentido');
            });
            it('should return orange organ instruction', () => {
                 expect(getInstruction({ color: CardColor.Orange } as any, false, false, true, '')).toContain('reemplazado por el Órgano');
                 expect(getInstruction({ color: 'orange' } as any, false, false, true, '')).toContain('reemplazado por el Órgano');
            });
            it('should fallback to description', () => {
                 expect(getInstruction({} as any, false, false, true, 'Custom desc')).toBe('Selecciona el objetivo para esta carta. Custom desc');
            });
        });

        describe('no target selection', () => {
            it('should wrap description with confimation', () => {
                 expect(getInstruction({} as any, false, false, false, 'Custom desc')).toBe('Custom desc Confirma para jugarla.');
            });
        });
    });
});
