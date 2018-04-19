import '@toba/test';
import { mockPhotos } from './.test-data';

test('produces list of photo tags', () => {
   expect(mockPhotos[0].tagList).toBe('tag1,tag2,tag3');
   expect(mockPhotos[3].tagList).toBe('tag1,tag5');
   expect(mockPhotos[2].tagList).toBe('');
});
