import '@toba/test';
import { PhotoBlog, blog } from '.';
import { mockPosts } from './.test-data';
import { Post } from './post';

const [post1, post2, post3, post4, post5, post6] = mockPosts();

beforeEach(() => {
   //blog.empty().addAll(post6, post5, post4, post3, post2, post1);
   blog.empty().addAll(post1, post2, post3, post4, post5, post6);
});

test('ensures only one instance exists', () => {
   let e: Error | undefined = undefined;
   let b: PhotoBlog | undefined = undefined;
   try {
      b = new PhotoBlog();
   } catch (err) {
      e = err;
   }
   expect(b).toBeUndefined();
   expect(e).toBeDefined();
   expect(e!.message).toBe('PhotoBlog instance already exists');
});

test('links sequential posts', () => {
   expect(post1.previous).toBeUndefined();
   expect(post2.previous!.key).toEqual(post1.key);
   expect(post1.next).toBe(post2);
   expect(post2.next).toBe(post3);
   expect(post2.previous).toBe(post1);
   expect(post3.next).toBe(post4);
   expect(post3.previous).toBe(post2);
   expect(post4.next).toBe(post5);
   expect(post4.previous).toBe(post3);
   expect(post5.next).toBeUndefined();
   expect(post5.previous).toBe(post4);
});

test('connects posts in a series', () => {
   expect(post1.totalParts).toBe(3);
   expect(post4.totalParts).toBe(0);
   expect(post2.part).toBe(2);
   expect(post4.part).toBe(0);
   expect(post4.subTitle).toBeUndefined();
   expect(post2.subTitle).toBe('Part 2');
   expect(post1.previousIsPart).toBe(false);
   expect(post2.previousIsPart).toBe(true);
   expect(post4.isPartial).toBe(false);
   expect(post2.isPartial).toBe(true);
   expect(post2.isSeriesStart).toBe(false);
   expect(post2.previous!.isSeriesStart).toBe(true);
});

test('recognizes posts that have series-like title but no other members', () => {
   expect(post5.isPartial).toBe(false);
   expect(post5.key).toBe('not-a-series-subtitle');
});

test('creates composite post key for posts in series', () => {
   expect(post1.key).toBe('series-1'); // first post in series has only the series key
   expect(post2.key).toBe('series-1/part-2');
   expect(post3.key).toBe('series-1/part-3');
   expect(post4.key).toBe('title-4');
});

test('combines series and post title', () => {
   expect(post2.name()).toBe('Series 1: Part 2');
});

test('generates GeoJSON point feature collection for photos', async () => {
   const geo = await blog.geoJSON();
   expect(geo).toBeDefined();
   expect(geo).toHaveProperty('features');
   expect(geo.features).toHaveLength(4);
});

test('removes a post', () => {
   expect(post3.next!.key).toBe(post4.key);

   blog.remove(post4.key!);

   expect(blog.postWithKey(post4.key!)).toBeUndefined();
   expect(post4.previous!.key).toBe(post3.key);
   expect(post3.next).toBeUndefined();
});

test('ungroups posts from a series', () => {
   post2.ungroup();

   expect(post2.subTitle).toBeUndefined();
   expect(post2.isPartial).toBe(false);
   expect(post2.totalParts).toBe(0);
   expect(post2.part).toBe(0);
   expect(post2.title).toBe('Series 1: Part 2');
   expect(post2.previousIsPart).toBe(false);
});

test('identifies changed keys when loading blog', () => {
   expect(blog.posts).toHaveLength(6);
   blog.remove(post4.key!);
   expect(blog.posts).toHaveLength(5);

   blog.beginLoad();
   expect(blog.posts).toHaveLength(0);
   expect(blog.changedKeys).toHaveLength(0);

   const post6 = new Post();
   post6.id = post6.key = 'some-id';

   blog
      .addPost(post1)
      .addPost(post2)
      .addPost(post3)
      .addPost(post4)
      .addPost(post5)
      .addPost(post6)
      .finishLoad();

   expect(blog.changedKeys).toContain(post4.key);
   expect(blog.changedKeys).toContain(post6.key);
});

test('does not count re-adding post as changed key', () => {
   blog.beginLoad();
   expect(blog.posts).toHaveLength(0);

   blog.addPost(post4).finishLoad();

   expect(blog.changedKeys).toHaveLength(0);
});

test('finds cached posts while in loading state', () => {
   blog.beginLoad();
   const p1 = blog.postWithID(post1.id);
   expect(p1).toBeDefined();

   const p2 = blog.postWithKey(post2.key!);
   expect(p2).toBeDefined();

   blog.finishLoad();

   expect(blog.postWithID(post1.id)).toBeUndefined();
});

test('adds posts to cache while loading', () => {
   blog.beginLoad();

   const p = new Post();
   p.id = 'new-id';

   blog.addPost(p);
   // post should be found in cache
   expect(blog.postWithID(p.id)).toBeDefined();

   blog.finishLoad();
   // should still work but now getting post from main posts list
   expect(blog.postWithID(p.id)).toBeDefined();
});
