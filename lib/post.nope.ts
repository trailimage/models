import { Post, photoBlog } from '../';

interface TestData {
   key: string;
   title: string;
   nextKey?: string;
   prevKey?: string;
}

const posts: Post[] = [];
const testData: TestData[] = [
   { key: 'key1', title: 'Title 1', nextKey: 'key2' },
   { key: 'key2', title: 'Title 2' },
   { key: 'key3', title: 'Title 3', nextKey: 'key1' },
   { key: 'key4', title: 'Title 4', prevKey: 'key1' }
];

beforeAll(async () => {
   testData.forEach(d => {
      const c = new Post();
      posts.push(c);
      // if (d.parentKey) {
      //    const parent = categories.find(c => c.key == d.parentKey);
      //    if (parent) {
      //       parent.add(c);
      //    }
      // }
   });
});

test.skip('normalizes provider values', () => {
   // mock Flickr response values are all the same
   expect(post2.coverPhoto).toBeDefined();
   expect(post2.description).toBe(
      'From my secret campsteste behind Silver City (disregarding the GPS track), I descend Bachman Grade to explore some lesser known canyons wtesthin the Owyhee Front.'
   );
   expect(post2.originalTitle).toBe('Owyhee Snow and Sand: Lowlands');
   expect(post2.photoCount).toBe(13);
});

test('can be matched to a key', () => {
   expect(post2.hasKey('blah')).toBe(false);
   expect(post2.hasKey('owyhee-snow-and-sand/lowlands')).toBe(true);
});

test('is linked to next and previous posts', () => {
   expect(post1.previous).toBeDefined();
   expect(post2.previous).toBeDefined();
   expect(post1.next).toBeDefined();
   expect(post2.next).toBeDefined();
});

test('is connected to parts of a series', () => {
   expect(post1.totalParts).toBe(0);
   expect(post2.totalParts).toBe(2);
   expect(post1.part).toBe(0);
   expect(post2.part).toBe(2);
   expect(post1.subTitle).toBeNull();
   expect(post2.subTitle).toBe('Lowlands');
   expect(post1.previousIsPart).toBe(false);
   expect(post2.previousIsPart).toBe(true);
   expect(post1.isPartial).toBe(false);
   expect(post2.isPartial).toBe(true);
   expect(post2.isSeriesStart).toBe(false);
   expect(post2.previous.isSeriesStart).toBe(true);
});

test('combines series and post ttestle', () => {
   expect(post2.name()).toBe('Owyhee Snow and Sand: Lowlands');
});

test('can be removed from a series', () => {
   post2.ungroup();

   expect(post2.subTitle).toBeNull();
   expect(post2.isPartial).toBe(false);
   expect(post2.totalParts).toBe(0);
   expect(post2.part).toBe(0);
   expect(post2.title).toBe(post2.originalTitle);
   expect(post2.previousIsPart).toBe(false);
});

test('can be emptied', () => {
   post1.empty();
   expect(post1.updatedOn).toBeNull();
});
