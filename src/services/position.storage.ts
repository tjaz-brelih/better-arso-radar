import { Service } from "@angular/core";
import { StorageService } from "./settings";


type Position = {
  center: [number, number],
  zoom: number
};


@Service()
export class PositionStorageService extends StorageService<Position> {
  protected readonly _storageKey = "position";

  protected readonly default: Position = {
    center: [46.120, 14.815],
    zoom: 8
  };
}
