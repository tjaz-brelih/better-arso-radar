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

export const MARKER_COLORS = {
  White: { rgb: "#fff", id: "white" },
  Black: { rgb: "#000", id: "black" },

  Red: { rgb: "rgb(203, 30, 30)", id: "red" },
  Green: { rgb: "rgb(129, 223, 35)", id: "green" },
  Blue: { rgb: "rgb(41, 45, 255)", id: "blue" },
  Yellow: { rgb: "rgb(220, 184, 40)", id: "yellow" },
  Purple: { rgb: "rgb(175, 52, 244)", id: "purple" },
  Cyan: { rgb: "rgb(24, 195, 223)", id: "cyan" },
} as const;


export const DEFAULT_MARKER_COLOR = MARKER_COLORS.White;
