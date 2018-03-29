export interface IMappable<T extends GeoJSON.GeometryObject> {
   geoJSON(): GeoJSON.Feature<T>;
}
