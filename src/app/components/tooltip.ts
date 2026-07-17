import { Component, Directive, ElementRef, inject, Injector, input, ViewContainerRef } from "@angular/core";

import { createFlexibleConnectedPositionStrategy, createOverlayRef, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";


@Directive({
  selector: "[appTooltip]",
  host: {
    "(mouseenter)": "this.showTooltip()",
    "(mouseleave)": "this.hideTooltip()"
  }
})
export class TooltipDirective {
  text = input.required<string>({ alias: "appTooltip" });

  private _injector = inject(Injector);
  private _viewContainerRef = inject(ViewContainerRef);
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private _overlayRef: OverlayRef | null = null;
  private _portal: ComponentPortal<TooltipComponent> | null = null;
  private _tooltipInstance: TooltipComponent | null = null;


  public showTooltip() {
    this._overlayRef = this._createOverlay();
    this._portal = this._portal || new ComponentPortal(TooltipComponent, this._viewContainerRef);

    this._tooltipInstance = this._overlayRef.attach(this._portal).instance;
    this._tooltipInstance.text = this.text;
  }

  public hideTooltip() {
    this._overlayRef?.detach();
    this._tooltipInstance = null;
  }


  private _createOverlay(): OverlayRef {
    if (this._overlayRef) { return this._overlayRef; }

    const strategy = createFlexibleConnectedPositionStrategy(
      this._injector,
      this._elementRef.nativeElement
    );

    strategy.withPositions([
      { originX: "end", originY: "center", overlayX: "start", overlayY: "center", offsetX: 8 }
    ]);


    return (this._overlayRef = createOverlayRef(this._injector, { positionStrategy: strategy }));
  }
}


@Component({
  template: `
    <div class="py-0.5 px-2 text-xs rounded-lg bg-color-background border border-color-border">
      {{ this.text() }}
    </div>
  `
})
class TooltipComponent {
  text = input.required<string>();
}
