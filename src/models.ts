export type EnvironmentData = {
  meteoUrl: string;
};

// This should be compatible with Leaflet LatLng.
export type Coordinates = [lat: number, lng: number];


export type Marker = {
  coordinates: Coordinates;

  name?: string;

  color?: {
    rgb: string;
    id: string;
  }
};

type MarkerColor = { rgb: string, id: string };

export const MARKER_COLORS: MarkerColor[] = [
    { rgb: "rgb(203, 30, 30)", id: "red" },
    { rgb: "rgb(129, 223, 35)", id: "green" },
    { rgb: "rgb(41, 45, 255)", id: "blue" },
    { rgb: "rgb(220, 184, 40)", id: "yellow" },
    { rgb: "rgb(175, 52, 244)", id: "purple" },
    { rgb: "rgb(24, 195, 223)", id: "cyan" },

    { rgb: "#fff", id: "white" },
    { rgb: "#000", id: "black" }
];

export const DEFAULT_MARKER_COLOR = MARKER_COLORS[0];
