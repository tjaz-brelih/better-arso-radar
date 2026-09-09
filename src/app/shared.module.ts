import { NgModule } from "@angular/core";

import { ButtonComponent, IconButtonComponent } from "./components/button";
import { ButtonGroupDirective } from "./components/button-group";
import { IconComponent } from "./components/icon";
import { TooltipDirective } from "./components/tooltip";


const STUFF = [
  IconButtonComponent,
  ButtonComponent,
  ButtonGroupDirective,
  IconComponent,
  TooltipDirective
];


@NgModule({
  imports: STUFF,
  exports: STUFF
})
export class SharedModule { }
