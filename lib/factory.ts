import { PhotoBlog } from './photo-blog';
import { EXIF, Photo, Post } from '../';

/**
 * Main load method and lazy-load methos for particular data.
 */
export interface ModelFactory {
   load(): PhotoBlog;
   getEXIF(photoID: string): Promise<EXIF>;
   getPostWithPhoto(this: PhotoBlog, photo: Photo | string): Promise<Post>;
   getPhotosWithTags(tags: string | string[]): Promise<Photo[]>;
   getPostInfo(this: Post): Promise<Post>;
   getPostPhotos(this: Post): Promise<Post>;
}
