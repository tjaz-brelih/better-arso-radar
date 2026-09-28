import { booleanAttribute, Component, computed, effect, ElementRef, input, model, numberAttribute, viewChild } from "@angular/core";


@Component({
  selector: "app-slider",

  template: `
    <div #parent class="relative rounded-full bg-color-disabled" [class]="this._verticalClass().parent">
      <div class="absolute rounded-full bg-color-primary" [class.bg-color-disabled!]="this.disabled()" [class]="this._verticalClass().track"></div>
      <div class="absolute" [class]="this._verticalClass().thumbDiv">
        <button [disabled]="this.disabled()" [class]="this._verticalClass().thumb" class="absolute size-4 -translate-x-1/2 cursor-pointer rounded-full bg-color-primary border border-color-text disabled:cursor-default disabled:bg-color-disabled"></button>
      </div>
    </div>
  `,

  host: {
    class: "block touch-none",
    "[class]": "this._verticalClass().host",
    "[class.cursor-pointer]": "!this.disabled()",

    "style": "--thumb-div-length: calc(100% - 14px); --thumb-div-margin: 7px;",
    "[style.--slider-position]": "this._valuePercent() + '%'",

    "(pointerdown)": "this.startDrag($event)",
    "(pointermove)": "this.drag($event)",
    "(pointerup)": "this.endDrag($event)",
    "(pointercancel)": "this.endDrag($event)"
  }
})
export class SliderComponent {
  readonly step = input(1, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly value = model(100);
  readonly vertical = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected _valuePercent = computed(() => (this.value() / this.max()) * 100);

  protected _verticalClass = computed(() => {
    const vertical = this.vertical();

    return {
      host: vertical ? "px-2 h-full" : "py-2",
      parent: vertical ? "h-full w-1.5 mx-auto" : "h-1.5",
      track: vertical ? "w-full h-(--slider-position) bottom-0" : "h-full w-(--slider-position)",
      thumbDiv: vertical ? "w-full h-(--thumb-div-length) my-(--thumb-div-margin)" : "h-full w-(--thumb-div-length) mx-(--thumb-div-margin)",
      thumb: vertical ? "left-1/2 bottom-(--slider-position) translate-y-1/2" : "top-1/2 left-(--slider-position) -translate-y-1/2"
    };
  });

  protected parent = viewChild.required<ElementRef<HTMLElement>>("parent");

  private _dragging = false;


  constructor() {
    effect(() => this.value.update(x => Math.min(x, this.max())));
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

    const newValuePercent = this.vertical()
      ? this._calculateValueVertical(event, rect)
      : this._calculateValueHorizontal(event, rect);

    const clampedValue = Math.min(Math.max(newValuePercent * this.max(), 0), this.max());
    const snappedValuePercent = Math.round(clampedValue / this.step()) * this.step();

    this.value.set(snappedValuePercent);
  }


  private _calculateValueHorizontal(event: PointerEvent, rect: DOMRect) {
    return ((event.clientX - rect.left) / rect.width);
  }

  private _calculateValueVertical(event: PointerEvent, rect: DOMRect) {
    return ((rect.bottom - event.clientY) / rect.height);
  }
}
