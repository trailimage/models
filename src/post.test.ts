import '@toba/test';
import { config, blog, seriesKeySeparator } from '.';
import { mockPosts } from './.test-data';
import { Post } from './post';

const [post1, post2, post3, post4, post5] = mockPosts();

// test.skip('normalizes provider values', () => {
//    // mock Flickr response values are all the same
//    expect(post2.coverPhoto).toBeDefined();
//    expect(post2.description).toBe(
//       'From my secret campsteste behind Silver City (disregarding the GPS track), I descend Bachman Grade to explore some lesser known canyons wtesthin the Owyhee Front.'
//    );
//    expect(post2.originalTitle).toBe('Owyhee Snow and Sand: Lowlands');
//    expect(post2.photoCount).toBe(13);
// });

beforeEach(() => {
   blog.empty().addAll(post1, post2, post3, post4, post5);
});

test('infers titles, subtitles and keys', () => {
   const p = new Post();
   p.inferTitleAndKey('Simple Title');
   expect(p.title).toBe('Simple Title');
   expect(p.key).toBe('simple-title');
   expect(p.subTitle).toBeNull();

   p.inferTitleAndKey('Series Name: Part Name');
   expect(p.title).toBe('Series Name');
   expect(p.subTitle).toBe('Part Name');
   expect(p.key).toBe(`series-name${seriesKeySeparator}part-name`);
});

test('can be matched to series or part key', () => {
   expect(post1.hasKey('blah')).toBe(false);
   expect(post1.hasKey('series-1')).toBe(true);
   expect(post1.hasKey('series-1/part-1')).toBe(true);
   expect(post1.hasKey('part-1')).toBe(false);
   expect(post2.hasKey('series-1/part-2')).toBe(true);
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
