import { Category } from '../';

interface TestData {
   key: string;
   title: string;
   parentKey?: string;
}

const categories: Category[] = [];
const testData: TestData[] = [
   { key: 'key1', title: 'Title 1' },
   { key: 'key2', title: 'Title 2' },
   { key: 'key3', title: 'Title 3', parentKey: 'key1' },
   { key: 'key4', title: 'Title 4', parentKey: 'key1' }
];

beforeAll(() => {
   testData.forEach(d => {
      const c = new Category(d.key, d.title);
      categories.push(c);
      if (d.parentKey) {
         const parent = categories.find(c => c.key == d.parentKey);
         if (parent) {
            parent.add(c);
         }
      }
   });
});

test('category', () => {
   expect(categories[0]).toBeDefined();
});
