import { NgModule } from "@angular/core";

import { ButtonComponent, ButtonGroupDirective, IconButtonComponent, IconComponent, MenuDirective, SliderComponent, TooltipDirective } from "components";


const STUFF = [
  IconButtonComponent,
  ButtonComponent,
  ButtonGroupDirective,
  IconComponent,
  TooltipDirective,
  MenuDirective,
  SliderComponent
];


@NgModule({
  imports: STUFF,
  exports: STUFF
})
export class SharedModule { }
