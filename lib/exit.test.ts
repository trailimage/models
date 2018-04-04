import { EXIF, config } from '../';
import './config.test';

config.artistNamePattern = /^Artist (0|1)/;

interface TestData {
   artist: string;
   compensation: string;
   time: string;
   fNumber: number;
   focalLength: number;
   ISO: number;
   lens: string;
   model: string;
   software: string;
}

export const exif: EXIF[] = ([
   {
      artist: 'Artist 0',
      compensation: '0',
      time: '',
      fNumber: 0,
      focalLength: 0,
      ISO: 0,
      lens: '',
      model: 'ILCE-7RM2',
      software: 'Photoshop Lightroom (Windows)'
   },
   {
      artist: 'Artist 1',
      compensation: 'Yes',
      time: '',
      fNumber: 0,
      focalLength: 0,
      ISO: 0,
      lens: '100.0 mm f/2.0',
      model: 'XT1060',
      software: 'Software 1'
   },
   {
      artist: 'Artist 2',
      compensation: 'No',
      time: '',
      fNumber: 0,
      focalLength: 0,
      ISO: 0,
      lens: 'Lens 2',
      model: 'ILCE-7RM2',
      software: 'Software 2'
   },
   {
      artist: 'Artist 3',
      compensation: 'No',
      time: '',
      fNumber: 0,
      focalLength: 0,
      ISO: 0,
      lens: 'Lens 3',
      model: 'Model 3',
      software: 'Software 3'
   }
] as TestData[]).map(d => {
   const x = new EXIF();
   x.artist = d.artist;
   x.compensation = d.compensation;
   x.time = d.time;
   x.fNumber = d.fNumber;
   x.focalLength = d.focalLength;
   x.ISO = d.ISO;
   x.lens = d.lens;
   x.model = d.model;
   x.software = d.software;
   return x.sanitize();
});

test('does somethin', () => {
   expect(exif[0].artist).toBe('Artist 0');
   expect(exif[0].model).toBe('Sony α7ʀ II');
   expect(exif[0].software).toBe('Lightroom');
   expect(exif[0].compensation).toBe('No');

   expect(exif[2].model).toBe('ILCE-7RM2');
});
