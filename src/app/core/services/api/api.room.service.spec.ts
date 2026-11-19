import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiRoomService } from './api.room.service';
import { environment } from '@env/environment';

describe('ApiRoomService', () => {
  let service: ApiRoomService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiRoomService]
    });
    service = TestBed.inject(ApiRoomService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('localStorage', () => {
      it('should start with null currentRoom if empty', () => {
          expect(service.currentRoom()).toBeNull();
      });

      it('should load currentRoom if present', () => {
          localStorage.setItem('currentRoom', JSON.stringify({ id: 'r1', config: null }));
          let newService!: ApiRoomService;
          TestBed.runInInjectionContext(() => {
             newService = new ApiRoomService();
          });
          expect(newService.currentRoom()?.id).toBe('r1');
          expect(newService.currentRoom()?.config).toBeDefined(); // normalized
      });

      it('should remove currentRoom if parsing fails', () => {
          localStorage.setItem('currentRoom', '{invalid');
          let newService!: ApiRoomService;
          TestBed.runInInjectionContext(() => {
             newService = new ApiRoomService();
          });
          expect(newService.currentRoom()).toBeNull();
          expect(localStorage.getItem('currentRoom')).toBeNull();
      });
  });

  describe('API endpoints', () => {
      it('should getRoomList', () => {
          service.getRoomList().subscribe(rooms => {
              expect(rooms.length).toBe(1);
              expect(rooms[0].config).toBeDefined(); // normalized
          });

          const req = httpMock.expectOne(`${environment.baseUrl}/room`);
          expect(req.request.method).toBe('GET');
          req.flush([{ id: 'r1' }]);

          expect(service.roomList().length).toBe(1);
      });

      it('should getRoomById', () => {
          service.getRoomById('r1').subscribe(room => {
              expect(room.id).toBe('r1');
          });

          const req = httpMock.expectOne(`${environment.baseUrl}/room/r1`);
          expect(req.request.method).toBe('GET');
          req.flush({ id: 'r1' });

          expect(service.currentRoom()?.id).toBe('r1');
      });

  });

  describe('utility methods', () => {
      it('should clearCurrentRoom', () => {
          service.setCurrentRoom({ id: 'r4', name: 'R4', hostId: 'h1', players: [], visibility: 'public', createdAt: Date.now() });
          expect(service.currentRoom()?.id).toBe('r4');
          expect(localStorage.getItem('currentRoom')).toContain('r4');

          service.clearCurrentRoom();
          expect(service.currentRoom()).toBeNull();
          expect(localStorage.getItem('currentRoom')).toBeNull();
      });
  });
});
