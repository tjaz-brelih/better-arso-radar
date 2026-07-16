import { Component, signal } from '@angular/core';

import { MapComponent } from './map/map';


@Component({
  selector: 'app-root',
  imports: [MapComponent],
  template: '<app-map />'
})
export class App { }
