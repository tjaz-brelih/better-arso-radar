import { NgModule } from "@angular/core";

import { ButtonDirective } from "./components/button";


const STUFF = [
  ButtonDirective
];


@NgModule({
  imports: STUFF,
  exports: STUFF
})
export class SharedModule { }
