import '@toba/test';
import { mockPosts } from './.test-data';
import { config, blog } from '../';

const [post1, post2, post3, post4] = mockPosts();

// test.skip('normalizes provider values', () => {
//    // mock Flickr response values are all the same
//    expect(post2.coverPhoto).toBeDefined();
//    expect(post2.description).toBe(
//       'From my secret campsteste behind Silver City (disregarding the GPS track), I descend Bachman Grade to explore some lesser known canyons wtesthin the Owyhee Front.'
//    );
//    expect(post2.originalTitle).toBe('Owyhee Snow and Sand: Lowlands');
//    expect(post2.photoCount).toBe(13);
// });

beforeAll(() => {
   blog
      .empty()
      .addPost(post1)
      .addPost(post2)
      .addPost(post3)
      .addPost(post4)
      .correlatePosts();
});

test('can be matched to a key', () => {
   expect(post1.hasKey('blah')).toBe(false);
   expect(post2.hasKey('key1')).toBe(true);
});

test('identifies category membership', () => {
   expect(post1.hasCategories).toBe(true);
   expect(post4.hasCategories).toBe(false);
});

test('writes RSS data', () => {
   const entry2 = post2.rssJSON();

   expect(entry2.id).toBe(config.site.url + '/' + post2.key);
   expect(entry2.summary).toBe(post2.description);
   expect(entry2.title).toBe(post2.name());
});

test('can be emptied', () => {
   post1.empty();
   expect(post1.updatedOn).toBeNull();
});

test('can be reset', () => {
   expect(post2.next).not.toBeNull();
   post2.reset();
   expect(post2.next).toBeNull();
});
