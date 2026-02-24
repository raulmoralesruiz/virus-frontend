import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subject } from 'rxjs';

describe('App', () => {
  let routerEventsObj: Subject<Event>;

  beforeEach(async () => {
    routerEventsObj = new Subject<Event>();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: Router,
          useValue: {
            events: routerEventsObj.asObservable(),
            url: '/'
          }
        }
      ]
    }).compileComponents();
  });

  it('should create the app and render router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it('should update shouldShowThemeToggle on NavigationEnd', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    expect(app['shouldShowThemeToggle']()).toBe(true);
    
    // Simulate navigation to /game
    routerEventsObj.next(new NavigationEnd(1, '/game', '/game'));
    expect(app['shouldShowThemeToggle']()).toBe(false);

    // Simulate navigation to /home
    routerEventsObj.next(new NavigationEnd(2, '/home', '/home'));
    expect(app['shouldShowThemeToggle']()).toBe(true);
  });
});
