import { inject, Service } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";

import { environment } from "../environments/environment";


type RadarImageInfoInternal = {
  valid: string;
  path: string
  bbox: string;
};

export type RadarImageInfo = {
  path: string;
  boundingBox: [
    northEast: [number, number],
    southWest: [number, number]
  ];

  date: Date;
};


@Service()
export class MeteoSiService {
  private readonly BASE_URL = environment.meteoUrl;

  private readonly _client = inject(HttpClient);


  public getRadarImageInfo(): Observable<RadarImageInfo[]> {
    const url = `${this.BASE_URL}/uploads/probase/www/nowcast/inca/inca_si0zm_data.json`;

    return this._client.get<RadarImageInfoInternal[]>(url).pipe(
      map(arr => arr.map(x => {
        const split = x.bbox.split(",").map(Number);

        return {
          path: x.path,
          boundingBox: [ [split[2], split[3]], [split[0], split[1]] ],
          date: new Date(x.valid),
        };
      }))
    );
  }


  public getRadarImageUrl(path: string): string {
    return `${this.BASE_URL}${path}`;
  }
}
