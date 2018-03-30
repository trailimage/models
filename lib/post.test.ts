import { Post, photoBlog } from '../';
import { photos } from './photo.test';
import { categories } from './category.test';

interface TestData {
   key: string;
   title: string;
   nextKey?: string;
   prevKey?: string;
   seriesKey?: string;
}

const posts: Post[] = ([
   { key: 'key0', title: 'Title 1', nextKey: 'key1', seriesKey: 'series1' },
   { key: 'key1', title: 'Title 2', nextKey: 'key2', seriesKey: 'series1' },
   { key: 'key2', title: 'Title 3', nextKey: 'key3', seriesKey: 'series1' },
   { key: 'key3', title: 'Title 4' }
] as TestData[]).map(d => {
   const p = new Post();
   p.key = d.key;
   p.title = d.title;
   p.photos = photos;
   p.categories = categories.reduce(
      (hash, c) => {
         hash[c.key] = c.title;
         return hash;
      },
      {} as { [key: string]: string }
   );
   return p;
});

// test.skip('normalizes provider values', () => {
//    // mock Flickr response values are all the same
//    expect(post2.coverPhoto).toBeDefined();
//    expect(post2.description).toBe(
//       'From my secret campsteste behind Silver City (disregarding the GPS track), I descend Bachman Grade to explore some lesser known canyons wtesthin the Owyhee Front.'
//    );
//    expect(post2.originalTitle).toBe('Owyhee Snow and Sand: Lowlands');
//    expect(post2.photoCount).toBe(13);
// });

test('can be matched to a key', () => {
   expect(posts[0].hasKey('blah')).toBe(false);
   expect(posts[1].hasKey('key1')).toBe(true);
});

// test('is linked to next and previous posts', () => {
//    expect(post1.previous).toBeDefined();
//    expect(post2.previous).toBeDefined();
//    expect(post1.next).toBeDefined();
//    expect(post2.next).toBeDefined();
// });

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

// test('can be removed from a series', () => {
//    post2.ungroup();

//    expect(post2.subTitle).toBeNull();
//    expect(post2.isPartial).toBe(false);
//    expect(post2.totalParts).toBe(0);
//    expect(post2.part).toBe(0);
//    expect(post2.title).toBe(post2.originalTitle);
//    expect(post2.previousIsPart).toBe(false);
// });

test('can be emptied', () => {
   posts[0].empty();
   expect(posts[0].updatedOn).toBeNull();
});
