import '@toba/test';
import {
   PostProvider,
   MapProvider,
   PhotoBlog,
   EXIF,
   Post,
   Photo,
   config
} from '../';
import { mockEXIF } from './exif.test';
//import { mockPosts } from './post.test';
import { ensurePostProvider, ensureMapProvider } from './providers';

const postProvider: PostProvider = {
   async photoBlog(instance: PhotoBlog): Promise<PhotoBlog> {
      return instance;
   },
   async exif(_photoID: string): Promise<EXIF> {
      return mockEXIF[0];
   },
   async postIdWithPhotoId(_photoID: string): Promise<string> {
      return '';
   },
   async photosWithTags(_tags: string | string[]): Promise<Photo[]> {
      return [];
   },

   async postInfo(p: Post): Promise<Post> {
      p.infoLoaded = true;
      return p;
   },

   async postPhotos(p: Post): Promise<Photo[]> {
      p.photosLoaded = true;
      return [];
   }
};

config.providers.post = postProvider;

test('Returns configured provider', () => {
   let p: PostProvider;
   let e: ReferenceError;
   try {
      p = ensurePostProvider();
   } catch (err) {
      e = err;
   }
   expect(p).toBe(postProvider);
   expect(e).toBeUndefined();
});

test('Throws error for unconfigured provider', () => {
   let p: MapProvider;
   let e: ReferenceError;
   try {
      p = ensureMapProvider();
   } catch (err) {
      e = err;
   }
   expect(p).toBeUndefined();
   expect(e).toBeDefined();
   expect(e.message).toBe('map provider is undefined');
});
