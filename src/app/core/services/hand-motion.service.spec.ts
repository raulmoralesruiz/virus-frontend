import { HandMotionService } from './hand-motion.service';
import { Card } from '../models/card.model';

describe('HandMotionService', () => {
  let service: HandMotionService;

  const card = (id: string): Card => ({ id } as Card);

  beforeEach(() => {
    service = new HandMotionService();
    service.reset();
  });

  it('debe arrancar sin foto de layout ni cartas salientes', () => {
    expect(service.layout()).toBeNull();
    expect(service.leavingIds().size).toBe(0);
  });

  describe('markLeaving', () => {
    it('debe guardar la foto de layout y marcar las salientes', () => {
      const hand = [card('a'), card('b'), card('c')];
      service.markLeaving(hand, ['b']);

      expect(service.layout()).toEqual(hand);
      // La foto no debe ser el mismo array (la mano viva muta después)
      expect(service.layout()).not.toBe(hand);
      expect(Array.from(service.leavingIds())).toEqual(['b']);
    });

    it('debe ser no-op si no hay mano', () => {
      service.markLeaving([], ['b']);
      expect(service.layout()).toBeNull();
      expect(service.leavingIds().size).toBe(0);
    });

    it('debe ser no-op si no hay ids válidos', () => {
      service.markLeaving([card('a')], ['', null as unknown as string]);
      expect(service.layout()).toBeNull();
      expect(service.leavingIds().size).toBe(0);
    });

    it('debe limpiar todo pasados los LEAVE_MS (auto-cleanup)', () => {
      jest.useFakeTimers();
      service.markLeaving([card('a')], ['a']);
      expect(service.layout()).not.toBeNull();

      jest.advanceTimersByTime(HandMotionService.LEAVE_MS);

      expect(service.layout()).toBeNull();
      expect(service.leavingIds().size).toBe(0);
      jest.useRealTimers();
    });

    it('debe reiniciar el temporal si hay otra salida en cadena', () => {
      jest.useFakeTimers();
      service.markLeaving([card('a')], ['a']);
      jest.advanceTimersByTime(HandMotionService.LEAVE_MS - 10);

      // Nueva salida: el temporal de la primera no debe dispararse aún
      service.markLeaving([card('b')], ['b']);
      jest.advanceTimersByTime(HandMotionService.LEAVE_MS - 10);
      expect(service.layout()).not.toBeNull();

      jest.advanceTimersByTime(10);
      expect(service.layout()).toBeNull();
      jest.useRealTimers();
    });
  });

  describe('reset', () => {
    it('debe liberar foto de layout, marcas y temporales', () => {
      jest.useFakeTimers();
      service.markLeaving([card('a')], ['a']);
      service.reset();

      expect(service.layout()).toBeNull();
      expect(service.leavingIds().size).toBe(0);

      // El temporal pendiente no debe hacer nada al dispararse
      jest.advanceTimersByTime(HandMotionService.LEAVE_MS * 2);
      expect(service.layout()).toBeNull();
      jest.useRealTimers();
    });
  });
});
