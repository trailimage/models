import '@toba/test';
import { PhotoBlog, blog } from '../';
import { mockPosts } from './.test-data';

const [post1, post2, post3, post4] = mockPosts();

beforeAll(() => {
   blog
      .empty()
      .addPost(post1)
      .addPost(post2)
      .addPost(post3)
      .addPost(post4)
      .correlatePosts();
});

test('ensures only one instance exists', () => {
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

test('links sequential posts', () => {
   expect(post1.previous).toBeNull();
   expect(post2.previous.key).toEqual(post1.key);
   expect(post1.next).toBe(post2);
   expect(post2.next).toBeDefined();
});

test('connects posts in a series', () => {
   expect(post1.totalParts).toBe(3);
   expect(post4.totalParts).toBe(0);
   expect(post2.part).toBe(2);
   expect(post4.part).toBe(0);
   expect(post4.subTitle).toBeNull();
   expect(post2.subTitle).toBe('Part 2');
   expect(post1.previousIsPart).toBe(false);
   expect(post2.previousIsPart).toBe(true);
   expect(post4.isPartial).toBe(false);
   expect(post2.isPartial).toBe(true);
   expect(post2.isSeriesStart).toBe(false);
   expect(post2.previous.isSeriesStart).toBe(true);
});

test('combines series and post title', () => {
   expect(post2.name()).toBe('Series 1: Part 2');
});
test('removes a post', () => {
   expect(post3.next.key).toBe(post4.key);

   blog.remove(post4.key);

   expect(blog.postWithKey(post4.key)).toBeUndefined();
   expect(post4.previous.key).toBe(post3.key);
   expect(post3.next).toBeNull();
});

test('ungroups posts from a series', () => {
   post2.ungroup();

   expect(post2.subTitle).toBeNull();
   expect(post2.isPartial).toBe(false);
   expect(post2.totalParts).toBe(0);
   expect(post2.part).toBe(0);
   expect(post2.title).toBe(post2.originalTitle);
   expect(post2.previousIsPart).toBe(false);
});
