import { Service } from "@angular/core";
import { Coordinates } from "../models";
import { StorageService } from "./settings";


export type Marker = {
  coordinates: Coordinates;

  name?: string;

  color?: {
    rgb: string;
    id: string;
  }
};


@Service()
export class MarkerStorageService extends StorageService<Marker[]> {
  protected readonly _storageKey = "markers";

  protected readonly default = <Marker[]>[];

  private _markers = <Marker[]>[];


  public getMarkers(): Marker[] {
    this._markers = this._get();
    return this._markers;
  }

  public addMarker(marker: Marker) {
    this._markers.push(marker);
    this.saveMarkers(this._markers);
  }

  public removeMarker(marker: Marker) {
    this._markers.splice(this._markers.findIndex(x => x === marker), 1);
    this.saveMarkers(this._markers);
  }

  public saveMarkers(markers: Marker[]) {
    this._storage.setItem(this._storageKey, JSON.stringify(markers));
  }
}
