import '@toba/test';
import { Category } from '../';

interface TestData {
   key: string;
   title: string;
   parentKey?: string;
}

export const mockCategories: Category[] = ([
   { key: 'key0', title: 'Title 1' },
   { key: 'key1', title: 'Title 2' },
   { key: 'key2', title: 'Title 3', parentKey: 'key0' },
   { key: 'key3', title: 'Title 4', parentKey: 'key0' }
] as TestData[]).reduce(
   (out, d) => {
      const c = new Category(d.key, d.title);
      if (d.parentKey) {
         const parent = out.find(c => c.key == d.parentKey);
         if (parent) {
            parent.add(c);
         }
      } else {
         out.push(c);
      }
      return out;
   },
   [] as Category[]
);

test('assigns subcategories', () => {
   expect(mockCategories[0]).toBeDefined();
   expect(mockCategories[0].isParent).toBe(true);
   expect(mockCategories[0].subcategories[0].isChild).toBe(true);
});

test('finds subcategories', () => {
   expect(mockCategories[0].getSubcategory('key0/key2')).toBeDefined();
   expect(mockCategories[0].getSubcategory('key0/key8')).not.toBeDefined();

   expect(mockCategories[0].has('key0/key2')).toBe(true);
   expect(mockCategories[0].has('key0/key9')).toBe(false);
});
