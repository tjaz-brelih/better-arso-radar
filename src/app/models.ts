export type EnvironmentData = {
  meteoUrl: string;
};

// This should be compatible with Leaflet LatLng.
export type Coordinates = [lat: number, lng: number];


export type Marker = {
  coordinates: Coordinates;

  name?: string;

  color?: {
    rgb?: string;
    id: MarkerColor;
  }
};


export const MARKER_COLORS = {
  dynamic: "linear-gradient(to bottom right, #fff 50%, #000 50%)",

  white: "#fff",
  black: "#000",

  red: "rgb(203, 30, 30)",
  green: "rgb(129, 223, 35)",
  blue: "rgb(41, 45, 255)",
  yellow: "rgb(220, 184, 40)",
  purple: "rgb(175, 52, 244)",
  cyan: "rgb(24, 195, 223)",
} as const;

export type MarkerColor = keyof typeof MARKER_COLORS;

export const DEFAULT_MARKER_COLOR = 'dynamic' satisfies MarkerColor;
