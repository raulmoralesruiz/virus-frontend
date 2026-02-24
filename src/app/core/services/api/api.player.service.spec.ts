import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiPlayerService } from './api.player.service';
import { environment } from '@env/environment';

describe('ApiPlayerService', () => {
  let service: ApiPlayerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ApiPlayerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create and load empty from localstorage', () => {
    expect(service.player()).toBeNull();
  });

  it('should load player from localstorage on init', () => {
    localStorage.setItem('player', JSON.stringify({ id: 'p1', name: 'Test' }));
    let newService!: ApiPlayerService;
    TestBed.runInInjectionContext(() => {
        newService = new ApiPlayerService();
    });
    expect(newService.player()?.id).toBe('p1');
  });

  it('should remove player from localstorage if parsing fails on init', () => {
    localStorage.setItem('player', 'invalid-json');
    let newService!: ApiPlayerService;
    TestBed.runInInjectionContext(() => {
        newService = new ApiPlayerService();
    });
    expect(newService.player()).toBeNull();
    expect(localStorage.getItem('player')).toBeNull();
  });

  it('createPlayer should post and set player', () => {
    service.createPlayer('New Player').subscribe(p => {
        expect(p.name).toBe('New Player');
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/player`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'New Player' });
    
    req.flush({ id: 'p2', name: 'New Player' });

    expect(service.player()?.id).toBe('p2');
    expect(localStorage.getItem('player')).toContain('p2');
  });

  it('getPlayer should get and set player', () => {
      service.getPlayer('p3').subscribe(p => {
          expect(p.id).toBe('p3');
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/player/p3`);
      expect(req.request.method).toBe('GET');

      req.flush({ id: 'p3', name: 'P3' });

      expect(service.player()?.id).toBe('p3');
      expect(localStorage.getItem('player')).toContain('p3');
  });

  it('updatePlayerName should put and set player', () => {
      service.updatePlayerName('p4', 'Updated').subscribe(p => {
          expect(p.name).toBe('Updated');
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/player/p4`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ name: 'Updated' });

      req.flush({ id: 'p4', name: 'Updated' });

      expect(service.player()?.name).toBe('Updated');
      expect(localStorage.getItem('player')).toContain('Updated');
  });

  it('updatePlayerName should fallback to createPlayer on 404', () => {
      service.updatePlayerName('p5', 'Fallback').subscribe(p => {
          expect(p.name).toBe('Fallback');
      });

      const putReq = httpMock.expectOne(`${environment.baseUrl}/player/p5`);
      expect(putReq.request.method).toBe('PUT');
      
      putReq.flush('Not found', { status: 404, statusText: 'Not Found' });

      const postReq = httpMock.expectOne(`${environment.baseUrl}/player`);
      expect(postReq.request.method).toBe('POST');
      expect(postReq.request.body).toEqual({ name: 'Fallback' });

      postReq.flush({ id: 'p6', name: 'Fallback' });

      expect(service.player()?.id).toBe('p6');
  });

  it('updatePlayerName should rethrow non-404 errors', () => {
      let errorResponse: any;
      service.updatePlayerName('p5', 'Fail').subscribe({
          error: (err) => errorResponse = err
      });

      const putReq = httpMock.expectOne(`${environment.baseUrl}/player/p5`);
      putReq.flush('Server error', { status: 500, statusText: 'Server Error' });

      expect(errorResponse.status).toBe(500);
  });
});
