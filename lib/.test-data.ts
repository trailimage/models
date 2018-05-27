import {
   Category,
   Post,
   Photo,
   PhotoSize,
   EXIF,
   PhotoBlog,
   PostProvider
} from '../';
import { config } from '../';
import { ImageConfig } from './config';

const imageConfig: ImageConfig = {
   url: 'http://test.com/image.jpg',
   width: 100,
   height: 100
};

const someDate = new Date(Date.UTC(1973, 2, 15, 0, 0, 0));

export const postProvider: PostProvider = {
   async photoBlog(instance: PhotoBlog): Promise<PhotoBlog> {
      return instance;
   },

   async exif(_photoID: string): Promise<EXIF> {
      return mockEXIF[0];
   },

   async postIdWithPhotoId(_photoID: string): Promise<string> {
      return '';
   },

   async photosWithTags(_tags: string | string[]): Promise<Photo[]> {
      return [];
   },

   async postInfo(p: Post): Promise<Post> {
      p.infoLoaded = true;
      return p;
   },

   async postPhotos(p: Post): Promise<Photo[]> {
      p.photosLoaded = true;
      return [];
   }
};

config.site = {
   domain: 'test.com',
   title: 'Test Site',
   subtitle: 'Where Tests Run Best',
   description: 'Test Site Description',
   url: 'http://www.test.com',
   postAlias: 'Test',
   logo: imageConfig,
   companyLogo: imageConfig
};

config.owner = {
   name: 'Test Person',
   image: imageConfig,
   email: 'owner@test.com',
   urls: ['http://testsite1.com', 'http://testsite2.com']
};

config.artistsToNormalize = /^Artist (0|1)/;
config.providers.post = postProvider;

interface CategoryData {
   key: string;
   title: string;
   parentKey?: string;
}

export const mockCategories: Category[] = ([
   { key: 'key0', title: 'Title 1' },
   { key: 'key1', title: 'Title 2' },
   { key: 'key2', title: 'Title 3', parentKey: 'key0' },
   { key: 'key3', title: 'Title 4', parentKey: 'key0' }
] as CategoryData[]).reduce(
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

interface PostData {
   key: string;
   title: string;
   subTitle?: string;
   seriesKey?: string;
}

export const mockPosts = (): Post[] =>
   ([
      {
         key: 'key0',
         title: 'Series 1',
         subTitle: 'Part 1',
         seriesKey: 'series1'
      },
      {
         key: 'key1',
         title: 'Series 1',
         subTitle: 'Part 2',
         seriesKey: 'series1'
      },
      {
         key: 'key2',
         title: 'Series 1',
         subTitle: 'Part 3',
         seriesKey: 'series1'
      },
      { key: 'key3', title: 'Title 4', subTitle: null }
   ] as PostData[]).map((d, index) => {
      const p = new Post();
      p.id = p.key = d.key;
      p.seriesKey = d.seriesKey;
      p.title = d.title;
      p.subTitle = d.subTitle;
      p.photos = mockPhotos;
      p.createdOn = someDate;
      p.updatedOn = someDate;

      if (index != 3) {
         // assign no categories to key3
         p.categories = mockCategories.reduce((hash, c) => {
            hash.set(c.key, c.title);
            return hash;
         }, new Map<string, string>());
      }
      return p;
   });

interface SizeData {
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
] as SizeData[]).map(d => new PhotoSize(d.width, d.height, d.url));

interface PhotoData {
   id: string;
   title: string;
   tags: string[];
}

export const mockPhotos: Photo[] = ([
   { id: 'id1', title: 'Title 1', tags: ['tag1', 'tag2', 'tag3'] },
   { id: 'id2', title: 'Title 2', tags: ['tag1', 'tag2', 'tag4'] },
   { id: 'id3', title: 'Title 3', tags: [] },
   { id: 'id4', title: 'Title 4', tags: ['tag1', 'tag5'] }
] as PhotoData[]).map((data, index) => {
   const p = new Photo(data.id, index);
   p.title = data.title;
   p.tags = new Set<string>(data.tags);
   p.size['small'] = mockSizes[0];
   p.size['medium'] = mockSizes[1];
   p.size['large'] = mockSizes[2];
   p.preview = mockSizes[3];
   return p;
});

interface ExifData {
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

export const mockEXIF: EXIF[] = ([
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
] as ExifData[]).map(d => {
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
