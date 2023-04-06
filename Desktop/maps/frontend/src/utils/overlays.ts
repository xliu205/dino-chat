import { FeatureCollection } from "geojson";
import { FillLayer } from "react-map-gl";
import rl_data from "../mockData/fullDownload.json";
import {
  isGeoJsonSuccessResponse,
  isGeoJsonErrorResponse,
  isFeatureCollection,
} from "../components/ResponseInterface";

async function fetchData(
  url: string
): Promise<GeoJSON.FeatureCollection | string> {
  const response = await fetch(url);
  if (response.ok) {
    const json = await response.json();
    if (!isGeoJsonSuccessResponse(json) && !isGeoJsonErrorResponse(json)) {
      return "Error: server not response correctly.";
    }
    return json.data;
  } else {
    return "Error: server not response.";
  }
}

// export function overlayData(
//   setOverlay: (o: GeoJSON.FeatureCollection) => any
// ): void {
//   // ): GeoJSON.FeatureCollection | undefined {
//   const url = "http://localhost:3232/filter";
//   const result = fetchData(url);
//   result.then((r) => {
//     if (isFeatureCollection(r)) {
//       setOverlay(r);
//     } else {
//       console.log(r);
//     }
//   });
// }

export function overlayData(filter: {
  minLat: string | undefined;
  maxLat: string | undefined;
  minLon: string | undefined;
  maxLon: string | undefined;
}): Promise<GeoJSON.FeatureCollection | string> {
  // const url = `http://localhost:3232/filter?minLat=${minLat}&maxLat=${maxLat}&minLon=${minLon}&maxLon=${maxLon}`;
  const url = `http://localhost:3232/filter?filter=` + JSON.stringify(filter);
  return fetchData(url);
}

export function initialData(): GeoJSON.FeatureCollection | undefined {
  return isFeatureCollection(rl_data) ? rl_data : undefined;
}

const propertyName = "holc_grade";
export const geoLayer: FillLayer = {
  id: "geo_data",
  type: "fill",
  paint: {
    "fill-color": [
      "match",
      ["get", propertyName],
      "A",
      "#5bcc04",
      "B",
      "#04b8cc",
      "C",
      "#e9ed0e",
      "D",
      "#d11d1d",
      "#ccc",
    ],
    "fill-opacity": 0.2,
  },
};
