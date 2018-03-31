import { EXIF } from './exif';

interface TestData {
   artist: string;
}

export const exif: EXIF[] = ([
   { artist: 'Artist 0' },
   { artist: 'Artist 1' },
   { artist: 'Artist 2' },
   { artist: 'Artist 3' }
] as TestData[]).map(d => {
   const x = new EXIF();
   x.artist = d.artist;
   return x;
});

test('does somethin', () => {
   expect(exif[0].artist).toBe('Artist 0');
});
