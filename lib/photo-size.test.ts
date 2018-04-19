import '@toba/test';
import { mockSizes } from './.test-data';

test('identifies invalid images', () => {
   expect(mockSizes[0].isEmpty).toBe(false);
   expect(mockSizes[4].isEmpty).toBe(true);
});
