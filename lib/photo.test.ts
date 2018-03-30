import { Post, Photo, photoBlog } from '../';
import { sizes } from './photo-size.test';

interface TestData {
   id: string;
   title: string;
   tags: string[];
}

export const photos: Photo[] = ([
   { id: 'id1', title: 'Title 1', tags: ['tag1', 'tag2', 'tag3'] },
   { id: 'id2', title: 'Title 2', tags: ['tag1', 'tag2', 'tag4'] },
   { id: 'id3', title: 'Title 3', tags: [] },
   { id: 'id4', title: 'Title 4', tags: ['tag1', 'tag5'] }
] as TestData[]).map((data, index) => {
   const p = new Photo(data.id, index);
   p.title = data.title;
   p.tags = data.tags;
   p.size['small'] = sizes[0];
   p.size['medium'] = sizes[1];
   p.size['large'] = sizes[2];
   p.preview = sizes[3];
   return p;
});

test('produces list of photo tags', () => {
   expect(photos[0].tagList).toBe('tag1,tag2,tag3');
   expect(photos[3].tagList).toBe('tag1,tag5');
   expect(photos[2].tagList).toBe('');
});
