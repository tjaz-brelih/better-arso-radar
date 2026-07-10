import { NgModule } from "@angular/core";

import { ButtonComponent } from "./components/button";


const STUFF = [
  ButtonComponent
];


@NgModule({
  imports: STUFF,
  exports: STUFF
})
export class SharedModule { }
