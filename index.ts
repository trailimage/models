import { JsonLD, serialize } from '@toba/json-ld';

export { Post } from './lib/post';
export { Photo } from './lib/photo';
export { Category } from './lib/category';
export { PhotoSize } from './lib/photo-size';
export { photoBlog } from './lib/photo-blog';
export { VideoInfo } from './lib/video-info';
export { EXIF } from './lib/exif';

export abstract class LinkDataModel<T extends JsonLD.Thing> {
   abstract linkDataJSON(): T;
   linkDataString(): string {
      return serialize(this.linkDataJSON());
   }
}

export interface IMappable<T extends GeoJSON.GeometryObject> {
   geoJSON(): GeoJSON.Feature<T>;
}
