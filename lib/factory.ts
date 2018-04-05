import { PhotoBlog } from './photo-blog';
import { EXIF, Photo, Post, photoBlog } from '../';

/**
 * Main load method and lazy-load methos for particular data.
 */
export interface ModelFactory {
   load(emptyIfLoaded?: boolean): Promise<PhotoBlog>;
   getEXIF(photoID: string): Promise<EXIF>;
   getPostWithPhoto(this: PhotoBlog, photo: Photo | string): Promise<Post>;
   getPhotosWithTags(tags: string | string[]): Promise<Photo[]>;
   getPostInfo(this: Post): Promise<Post>;
   getPostPhotos(this: Post): Promise<Post>;
}

export function assignPostFactoryMethods(
   factory: ModelFactory,
   post: Post
): Post {
   post.getInfo = factory.getPostInfo.bind(post);
   post.getPhotos = factory.getPostPhotos.bind(post);
   return post;
}

export function assignFactoryMethods(factory: ModelFactory): void {
   photoBlog.getEXIF = factory.getEXIF.bind(photoBlog);
   photoBlog.getPostWithPhoto = factory.getPostWithPhoto.bind(photoBlog);
   photoBlog.getPhotosWithTags = factory.getPhotosWithTags.bind(photoBlog);
}
