import { Category } from '../';

interface TestData {
   key: string;
   title: string;
   parentKey?: string;
}

export const categories: Category[] = ([
   { key: 'key0', title: 'Title 1' },
   { key: 'key1', title: 'Title 2' },
   { key: 'key2', title: 'Title 3', parentKey: 'key0' },
   { key: 'key3', title: 'Title 4', parentKey: 'key0' }
] as TestData[]).map(d => {
   const c = new Category(d.key, d.title);
   if (d.parentKey) {
      // const parent = categories.find(c => c.key == d.parentKey);
      // if (parent) {
      //    parent.add(c);
      // }
   }
   return c;
});

test('category', () => {
   expect(categories[0]).toBeDefined();
});
