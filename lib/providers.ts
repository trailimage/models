import { EXIF, Photo, Post, PhotoBlog } from '../';

/**
 * Main load method and lazy-load methos for particular data.
 */
export interface PostProvider {
   loadPhotoBlog(photoBlog: PhotoBlog): Promise<PhotoBlog>;
   loadEXIF(photoID: string): Promise<EXIF>;
   loadPostIdWithPhotoId(photoID: string): Promise<string>;
   loadPhotosWithTags(tags: string | string[]): Promise<Photo[]>;
   loadPostInfo(p: Post): Promise<Post>;
   loadPostPhotos(p: Post): Promise<Photo[]>;
}

export interface MapProvider {}

export interface VideoProvider {}
