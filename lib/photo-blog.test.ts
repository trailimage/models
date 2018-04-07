import '@toba/test';
import { PhotoBlog } from '../';

test('Ensures only one instance exists', () => {
   let e: Error;
   let b: PhotoBlog;
   try {
      b = new PhotoBlog();
   } catch (err) {
      e = err;
   }
   expect(b).toBeUndefined();
   expect(e).toBeDefined();
   expect(e.message).toBe('PhotoBlog instance already exists');
});
