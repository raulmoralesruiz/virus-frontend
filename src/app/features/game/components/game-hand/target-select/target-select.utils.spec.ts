import { toOptionValue, organColorClass, organColorLabel } from './target-select.utils';

describe('TargetSelectUtils', () => {
    describe('toOptionValue', () => {
        it('should construct value from target', () => {
            expect(toOptionValue({ organId: 'o1', playerId: 'p1' } as any)).toBe('o1|p1');
        });
        it('should return empty string for falsy input', () => {
            expect(toOptionValue(null)).toBe('');
            expect(toOptionValue(undefined)).toBe('');
        });
    });

    describe('organColorClass', () => {
        it('should return appropriate class based on color', () => {
            expect(organColorClass('red')).toBe('color-dot--red');
            expect(organColorClass('green')).toBe('color-dot--green');
            expect(organColorClass('blue')).toBe('color-dot--blue');
            expect(organColorClass('yellow')).toBe('color-dot--yellow');
            expect(organColorClass('multi')).toBe('color-dot--multi');
            expect(organColorClass('other')).toBe('color-dot--neutral');
            expect(organColorClass()).toBe('color-dot--neutral');
        });
    });

    describe('organColorLabel', () => {
        it('should return mapped label for color', () => {
            expect(organColorLabel('red')).toBe('Corazón');
            expect(organColorLabel('blue')).toBe('Cerebro');
            expect(organColorLabel('unknown')).toBe('unknown');
            expect(organColorLabel('')).toBe('Sin órgano');
            expect(organColorLabel(undefined)).toBe('Sin órgano');
        });
    });
});
