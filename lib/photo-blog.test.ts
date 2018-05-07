import '@toba/test';
import { PhotoBlog } from '../';
import { mockPosts } from './.test-data';

const [post1, post2, post3, post4] = mockPosts;

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

test('is linked to next and previous posts', () => {
   expect(post1.previous).toBeNull();
   expect(post2.previous).toBe(post1);
   expect(post1.next).toBe(post2);
   expect(post2.next).toBeDefined();
});

// test('is connected to parts of a series', () => {
//    expect(post1.totalParts).toBe(0);
//    expect(post2.totalParts).toBe(2);
//    expect(post1.part).toBe(0);
//    expect(post2.part).toBe(2);
//    expect(post1.subTitle).toBeNull();
//    expect(post2.subTitle).toBe('Lowlands');
//    expect(post1.previousIsPart).toBe(false);
//    expect(post2.previousIsPart).toBe(true);
//    expect(post1.isPartial).toBe(false);
//    expect(post2.isPartial).toBe(true);
//    expect(post2.isSeriesStart).toBe(false);
//    expect(post2.previous.isSeriesStart).toBe(true);
// });

// test('combines series and post ttestle', () => {
//    expect(post2.name()).toBe('Owyhee Snow and Sand: Lowlands');
// });

test('can be removed from a series', () => {
   post2.ungroup();

   expect(post2.subTitle).toBeNull();
   expect(post2.isPartial).toBe(false);
   expect(post2.totalParts).toBe(0);
   expect(post2.part).toBe(0);
   expect(post2.title).toBe(post2.originalTitle);
   expect(post2.previousIsPart).toBe(false);
});
