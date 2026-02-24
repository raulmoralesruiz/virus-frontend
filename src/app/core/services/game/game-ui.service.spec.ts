import { TestBed } from '@angular/core/testing';
import { GameUiService } from './game-ui.service';

describe('GameUiService', () => {
  let service: GameUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameUiService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should start with modals closed', () => {
    expect(service.historyOpen()).toBe(false);
    expect(service.leavingOpen()).toBe(false);
  });

  it('should open and close history modal', () => {
    service.openHistoryModal();
    expect(service.historyOpen()).toBe(true);
    service.closeHistoryModal();
    expect(service.historyOpen()).toBe(false);
  });

  it('should open and close leave modal', () => {
    service.openLeaveModal();
    expect(service.leavingOpen()).toBe(true);
    service.closeLeaveModal();
    expect(service.leavingOpen()).toBe(false);
  });

  it('should reset all modals', () => {
    service.openHistoryModal();
    service.openLeaveModal();
    expect(service.historyOpen()).toBe(true);
    expect(service.leavingOpen()).toBe(true);

    service.reset();
    expect(service.historyOpen()).toBe(false);
    expect(service.leavingOpen()).toBe(false);
  });
});
