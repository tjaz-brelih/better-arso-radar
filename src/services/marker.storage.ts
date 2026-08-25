import { Service } from "@angular/core";
import { Coordinates } from "../models";
import { StorageService } from "./settings";


@Service()
export class MarkerStorageService extends StorageService<Coordinates[]> {
  protected readonly _storageKey = "markers";

  protected readonly default = <Coordinates[]>[];

  private _markers = <Coordinates[]>[];


  public getMarkers(): Coordinates[] {
    this._markers = this._get();
    return this._markers;
  }

  public addMarker(marker: Coordinates) {
    this._markers.push(marker);
    this.saveMarkers(this._markers);
  }

  public removeMarker(marker: Coordinates) {
    this._markers.splice(this._markers.findIndex(x => x === marker), 1);
    this.saveMarkers(this._markers);
  }

  public saveMarkers(markers: Coordinates[]) {
    this._storage.setItem(this._storageKey, JSON.stringify(markers));
  }
}
