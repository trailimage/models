import '@toba/test';
import { PhotoSize } from '../';

interface TestData {
   url: string;
   width: number;
   height: number;
}

export const mockSizes: PhotoSize[] = ([
   { url: 'url0', width: 100, height: 200 },
   { url: 'url1', width: 110, height: 210 },
   { url: 'url2', width: 120, height: 220 },
   { url: 'url3', width: 130, height: 230 },
   { url: null, width: 0, height: 0 }
] as TestData[]).map(d => new PhotoSize(d.width, d.height, d.url));

test('identifies invalid images', () => {
   expect(mockSizes[0].isEmpty).toBe(false);
   expect(mockSizes[4].isEmpty).toBe(true);
});
