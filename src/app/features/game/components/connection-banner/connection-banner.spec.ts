import { Signal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionBannerComponent } from './connection-banner.component';
import { SocketService, ConnectionStatus } from '@core/services/socket/socket.service';

describe('ConnectionBanner', () => {
  let component: ConnectionBannerComponent;
  let fixture: ComponentFixture<ConnectionBannerComponent>;
  let socketStub: { connectionStatus: Signal<ConnectionStatus> };

  beforeEach(async () => {
    socketStub = { connectionStatus: signal<ConnectionStatus>('online') };

    await TestBed.configureTestingModule({
      imports: [ConnectionBannerComponent],
      providers: [{ provide: SocketService, useValue: socketStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectionBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe exponer una región aria-live siempre presente en el DOM', () => {
    const banner = fixture.nativeElement.querySelector('.connection-banner');
    expect(banner.getAttribute('role')).toBe('status');
    expect(banner.getAttribute('aria-live')).toBe('assertive');
  });

  it('debe estar oculto y con contenido oculto mientras está conectado', () => {
    expect(component.connected()).toBe(true);
    const banner = fixture.nativeElement.querySelector('.connection-banner') as HTMLElement;
    expect(banner.classList.contains('is-visible')).toBe(false);
    const content = fixture.nativeElement.querySelector('.connection-banner__content') as HTMLElement;
    expect(content.hasAttribute('hidden')).toBe(true);
  });

  it('debe mostrarse con mensaje de "sin conexión" cuando está offline', () => {
    socketStub.connectionStatus.set('offline');
    fixture.detectChanges();

    expect(component.connected()).toBe(false);
    const banner = fixture.nativeElement.querySelector('.connection-banner') as HTMLElement;
    expect(banner.classList.contains('is-visible')).toBe(true);
    const content = fixture.nativeElement.querySelector('.connection-banner__content') as HTMLElement;
    expect(content.hasAttribute('hidden')).toBe(false);
    expect(content.textContent).toContain('Sin conexión');
    expect(content.textContent).toContain('desactivadas');
  });

  it('debe mostrarse con mensaje de "reconectando" en ese estado', () => {
    socketStub.connectionStatus.set('reconnecting');
    fixture.detectChanges();

    expect(component.connected()).toBe(false);
    const content = fixture.nativeElement.querySelector('.connection-banner__content') as HTMLElement;
    expect(content.hasAttribute('hidden')).toBe(false);
    expect(content.textContent).toContain('Reconectando');
  });

  it('debe volver a ocultarse al recuperar la conexión', () => {
    socketStub.connectionStatus.set('offline');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.connection-banner').classList.contains('is-visible')).toBe(true);

    socketStub.connectionStatus.set('online');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.connection-banner').classList.contains('is-visible')).toBe(false);
  });
});
