import { EXIF, Photo, Post, PhotoBlog } from '../';

/**
 * Methods to load post-related data.
 */
export interface PostProvider {
   photoBlog(photoBlog: PhotoBlog): Promise<PhotoBlog>;
   exif(photoID: string): Promise<EXIF>;
   postIdWithPhotoId(photoID: string): Promise<string>;
   photosWithTags(tags: string | string[]): Promise<Photo[]>;
   postInfo(p: Post): Promise<Post>;
   postPhotos(p: Post): Promise<Photo[]>;
}

/**
 * Methods to load map-related data like GPX tracks.
 */
export interface MapProvider {}

/**
 * Methods to load videos associated with a post.
 */
export interface VideoProvider {}

export const MissingProviderError = () =>
   new ReferenceError('Provider is undefined');
