import { booleanAttribute, Component, computed, effect, ElementRef, input, model, viewChild } from "@angular/core";


@Component({
  selector: "app-slider",

  template: `
    <div class="py-2 touch-none"
          [class.cursor-pointer]="!this.disabled()"
          (pointerdown)="this.startDrag($event)"
          (pointermove)="this.drag($event)"
          (pointerup)="this.endDrag($event)"
          (pointercancel)="this.endDrag($event)">

      <div #parent class="relative h-1.5">

        <div [class.bg-color-disabled!]="this.disabled()" class="absolute h-full w-(--slider-position) rounded-full bg-color-primary"></div>
        <div class="absolute h-full w-(--slider-remainder) left-(--slider-position) rounded-full bg-color-disabled"></div>

        <div class="absolute h-full w-[calc(100%-14px)] mx-[7px]">
          <button [disabled]="this.disabled()" class="absolute size-4 top-1/2 left-(--slider-position) -translate-y-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-color-primary border border-color-text disabled:cursor-default disabled:bg-color-disabled"></button>
        </div>
      </div>
    </div>
  `,

  styles: `:host { --slider-remainder: calc(100% - var(--slider-position)); }`,

  host: {
    "[style.--slider-position]": "this._valuePercent() + '%'",

  }
})
export class SliderComponent {
  readonly step = input(1);
  readonly max = input(100);
  readonly value = model(100);
  readonly disabled = input(false, { transform: booleanAttribute });

  protected _valuePercent = computed(() => (this.value() / this.max()) * 100);

  protected parent = viewChild.required<ElementRef<HTMLElement>>("parent");

  private _dragging = false;


  constructor() {
    effect(() => this.value.set(this.max()));
  }


  public startDrag(event: PointerEvent) {
    if (this.disabled()) { return; }

    this._dragging = true;
    this.parent().nativeElement.setPointerCapture(event.pointerId);
    this.setPosition(event);
  }

  public drag(event: PointerEvent) {
    if (!this._dragging) { return; }

    this.setPosition(event);
  }

  public endDrag(event: PointerEvent) {
    this._dragging = false;
    this.parent().nativeElement.releasePointerCapture(event.pointerId);
  }

  public setPosition(event: PointerEvent) {
    const rect = this.parent().nativeElement.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const newValuePercent = (offsetX / rect.width) * this.max();

    const clampedValue = Math.min(Math.max(newValuePercent, 0), this.max());
    const snappedValuePercent = Math.round(clampedValue / this.step()) * this.step();

    this.value.set(snappedValuePercent);
  }
}
