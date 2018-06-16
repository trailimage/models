import { is } from '@toba/tools';
import { TrackFeatures, loadSource } from '@toba/map';
import { ProviderConfig } from './config';
import { EXIF, Photo, Post, PhotoBlog, config } from './index';
import { FeatureCollection, GeometryObject } from 'geojson';

/**
 * Methods that provide model data.
 */
export abstract class DataProvider<T> {
   config: T;
   requiresAuthentication: boolean = true;
   isAuthenticated: boolean = false;

   constructor(baseConfig?: T) {
      if (baseConfig !== undefined) {
         this.config = baseConfig;
      }
   }

   abstract getAccessToken(codeOrToken: string, verifier?: string): string;

   /**
    * Apply configuration
    */
   configure(newConfig: Partial<T>) {
      Object.assign(this.config, newConfig);
   }
}

/**
 * Methods to load post-related data.
 */
export abstract class PostProvider<T> extends DataProvider<T> {
   /** Populate categories and post summaries in current blog instance. */
   abstract photoBlog(async?: boolean): Promise<PhotoBlog>;
   /** Retrieve EXIF for single photo. */
   abstract exif(photoID: string): Promise<EXIF>;
   /** Find ID of Post that contains photo with given ID. */
   abstract postIdWithPhotoId(photoID: string): Promise<string>;
   abstract photosWithTags(tags: string | string[]): Promise<Photo[]>;
   abstract postInfo(p: Post): Promise<Post>;
   abstract postPhotos(p: Post): Promise<Photo[]>;
}

/**
 * Methods to load map-related data like GPX tracks.
 */
export abstract class MapProvider<T> extends DataProvider<T> {
   abstract track(postKey: string): Promise<TrackFeatures>;

   /**
    * @param sourceKey configured `MapSource` key
    */
   source = (sourceKey: string): Promise<FeatureCollection<GeometryObject>> =>
      loadSource(sourceKey);
}

/**
 * Methods to load videos associated with a post.
 */
export abstract class VideoProvider<T> extends DataProvider<T> {}

/**
 * Return configured post provider or throw a reference error.
 */
export const ensurePostProvider = (): PostProvider<any> =>
   ensureProvider('post');

/**
 * Return configured map provider or throw a reference error.
 */
export const ensureMapProvider = (): MapProvider<any> => ensureProvider('map');

/**
 * Return configured video provider or throw a reference error.
 */
export const ensureVideoProvider = (): VideoProvider<any> =>
   ensureProvider('video');

/**
 * Return provider or throw a reference error.
 */
function ensureProvider<K extends keyof ProviderConfig>(key: K) {
   if (is.value(config.providers[key])) {
      return config.providers[key];
   } else {
      throw new ReferenceError(key + ' provider is undefined');
   }
}
