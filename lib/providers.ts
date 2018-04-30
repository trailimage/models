import { is } from '@toba/tools';
import { TrackFeatures } from '@toba/map';
import { ProviderConfig } from './config';
import { EXIF, Photo, Post, PhotoBlog, config } from '../';

/**
 * Methods to load post-related data.
 */
export interface PostProvider {
   /** Populate categories and post summaries in current blog instance. */
   photoBlog(photoBlog: PhotoBlog): Promise<PhotoBlog>;
   /** Retrieve EXIF for single photo. */
   exif(photoID: string): Promise<EXIF>;
   /** Find ID of Post that contains photo with given ID. */
   postIdWithPhotoId(photoID: string): Promise<string>;
   photosWithTags(tags: string | string[]): Promise<Photo[]>;
   postInfo(p: Post): Promise<Post>;
   postPhotos(p: Post): Promise<Photo[]>;
}

/**
 * Methods to load map-related data like GPX tracks.
 */
export interface MapProvider {
   track(postKey: string): Promise<TrackFeatures>;
}

/**
 * Methods to load videos associated with a post.
 */
export interface VideoProvider {}

/**
 * Return configured post provider or throw a reference error.
 */
export const ensurePostProvider = (): PostProvider => ensureProvider('post');

/**
 * Return configured map provider or throw a reference error.
 */
export const ensureMapProvider = (): MapProvider => ensureProvider('map');

/**
 * Return configured video provider or throw a reference error.
 */
export const ensureVideoProvider = (): VideoProvider => ensureProvider('video');

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
