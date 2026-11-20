import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Focus trap para modales (accesibilidad WAI-ARIA dialog pattern):
 * - Al montarse mueve el foco al primer elemento enfocable.
 * - Tab / Shift+Tab ciclan dentro del elemento (no escapan a la página de fondo).
 * - Al pulsar Escape emite `escape` (el host decide cómo cerrar el modal).
 * - Al desmontarse devuelve el foco al elemento previamente enfocado.
 */
@Directive({ selector: '[appFocusTrap]', standalone: true })
export class FocusTrapDirective implements OnInit, OnDestroy {
  /** Se emite cuando el usuario pulsa Escape dentro de la zona atrapada. */
  @Output() readonly escape = new EventEmitter<void>();

  private previouslyFocused: HTMLElement | null = null;

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.previouslyFocused =
      (document.activeElement as HTMLElement | null) ?? null;

    const focusable = this.focusable();
    (focusable[0] ?? this.el.nativeElement).focus();
  }

  ngOnDestroy(): void {
    const prev = this.previouslyFocused;
    if (prev && prev.isConnected && document.activeElement !== prev) {
      prev.focus();
    }
    this.previouslyFocused = null;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.escape.emit();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusable = this.focusable();
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;
    const outside = !active || !this.el.nativeElement.contains(active);

    if (event.shiftKey && (active === first || outside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || outside)) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusable(): HTMLElement[] {
    return Array.from(
      this.el.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
  }
}
