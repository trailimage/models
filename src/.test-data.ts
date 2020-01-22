import { is, Sort } from '@toba/tools'
import { MapConfig } from '@toba/map'
import {
   Category,
   Post,
   Photo,
   PhotoSize,
   EXIF,
   PostProvider,
   MapProvider,
   config,
   blog
} from '.'
import { ImageConfig } from './config'
import { Writable } from 'stream'
import { FeatureCollection } from 'geojson'
import { Token } from '@toba/oauth'
import { VideoProvider } from './providers'

const imageConfig: ImageConfig = {
   url: 'http://test.com/image.jpg',
   width: 100,
   height: 100
}

const someDate = new Date(Date.UTC(1973, 2, 15, 0, 0, 0))

export interface MockPostConfig {
   api: string
}

export interface MockMapConfig extends MapConfig {
   api: string
}

export interface MockVideoConfig {
   api: string
}

const mockToken: Token = {
   access: ''
}

export class MockPostProvider extends PostProvider<MockPostConfig> {
   photoBlog = (_async = true) => Promise.resolve(blog)
   exif = (_photoID: string): Promise<EXIF> => Promise.resolve(new EXIF())
   postIdWithPhotoId = (_photoID: string) => Promise.resolve('')
   photosWithTags = (..._tags: string[]): Promise<Photo[]> =>
      Promise.resolve([])

   postInfo = (_p: Post) => Promise.resolve(new Post())
   postPhotos = (_p: Post): Promise<Photo[]> => Promise.resolve([])
   authorizationURL = (): Promise<string> => Promise.resolve('')
   getAccessToken = async (_req: any) => mockToken
   clearCache = () => undefined
}

export class MockMapProvider extends MapProvider<MockMapConfig> {
   track = (_postKey: string): Promise<FeatureCollection<any>> =>
      Promise.resolve({
         type: 'FeatureCollection',
         features: []
      })
   gpx = (_postKey: string, _stream: Writable) => Promise.resolve()
   authorizationURL = () => Promise.resolve('')
   getAccessToken = async (_req: any) => mockToken
   clearCache = () => undefined
}

export class MockVideoProvider extends VideoProvider<MockVideoConfig> {
   authorizationURL = () => Promise.resolve('')
   getAccessToken = async (_req: any) => mockToken
   clearCache = () => undefined
}

export const postProvider = new MockPostProvider()
export const mapProvider = new MockMapProvider()
export const videoProvider = new MockVideoProvider()

config.site = {
   domain: 'test.com',
   title: 'Test Site',
   subtitle: 'Where Tests Run Best',
   description: 'Test Site Description',
   url: 'http://www.test.com',
   postAlias: 'Test',
   logo: imageConfig,
   companyLogo: imageConfig
}

config.owner = {
   name: 'Test Person',
   image: imageConfig,
   email: 'owner@test.com',
   urls: ['http://testsite1.com', 'http://testsite2.com']
}

config.artistsToNormalize = /^Artist (0|1)/
config.providers = {
   post: postProvider,
   map: mapProvider,
   video: videoProvider
}
config.providerPostSort = Sort.OldestFirst

interface CategoryData {
   key: string
   title: string
   parentKey?: string
}

export const mockCategories: Category[] = ([
   { key: 'key0', title: 'Title 1' },
   { key: 'key1', title: 'Title 2' },
   { key: 'key2', title: 'Title 3', parentKey: 'key0' },
   { key: 'key3', title: 'Title 4', parentKey: 'key0' }
] as CategoryData[]).reduce((out, d) => {
   const c = new Category(d.key, d.title)
   if (d.parentKey) {
      const parent = out.find(c => c.key == d.parentKey)
      if (parent) {
         parent.add(c)
      }
   } else {
      out.push(c)
   }
   return out
}, [] as Category[])

interface PostData {
   id: string
   title: string
   chronological?: boolean
}

/**
 * Mock posts sorted chronologically.
 */
export const mockPosts = (): Post[] =>
   ([
      { id: 'id0', title: 'Series 1: Part 1' },
      { id: 'id1', title: 'Series 1: Part 2' },
      { id: 'id2', title: 'Series 1: Part 3' },
      { id: 'id3', title: 'Title 4' },
      { id: 'id4', title: 'Not a Series: Subtitle' },
      { id: 'id5', title: 'Highlights', chronological: false }
   ] as PostData[]).map((d, index) => {
      const p = new Post()
      p.id = d.id
      p.inferTitleAndKey(d.title)
      p.photos = mockPhotos
      p.photosLoaded = true
      p.createdOn = someDate
      p.updatedOn = someDate

      if (is.value<boolean>(d.chronological)) {
         p.chronological = d.chronological
      }

      if (index != 3) {
         // assign no categories to key3
         p.categories = mockCategories.reduce((hash, c) => {
            hash.set(c.key, c.title)
            return hash
         }, new Map<string, string>())
      }
      return p
   })

interface SizeData {
   url: string
   width: number
   height: number
}

export const mockSizes: PhotoSize[] = ([
   { url: 'url0', width: 100, height: 200 },
   { url: 'url1', width: 110, height: 210 },
   { url: 'url2', width: 120, height: 220 },
   { url: 'url3', width: 130, height: 230 },
   { url: null, width: 0, height: 0 }
] as SizeData[]).map(d => new PhotoSize(d.width, d.height, d.url))

interface PhotoData {
   id: string
   title: string
   tags: string[]
   latitude?: number
   longitude?: number
}

export const mockPhotos: Photo[] = ([
   {
      id: 'id1',
      title: 'Title 1',
      latitude: 100,
      longitude: 10,
      tags: ['tag1', 'tag2', 'tag3']
   },
   {
      id: 'id2',
      title: 'Title 2',
      latitude: 120,
      longitude: 20,
      tags: ['tag1', 'tag2', 'tag4']
   },
   { id: 'id3', title: 'Title 3', latitude: 130, longitude: 30, tags: [] },
   {
      id: 'id4',
      title: 'Title 4',
      latitude: 140,
      longitude: 40,
      tags: ['tag1', 'tag5']
   }
] as PhotoData[]).map((data, index) => {
   const p = new Photo(data.id, index)
   p.title = data.title
   p.tags = new Set<string>(data.tags)
   p.latitude = data.latitude
   p.longitude = data.longitude
   p.size['preview'] = mockSizes[3]
   p.size['small'] = mockSizes[0]
   p.size['medium'] = mockSizes[1]
   p.size['large'] = mockSizes[2]
   p.preview = mockSizes[3]
   return p
})

interface ExifData {
   artist: string
   compensation: string
   time: string
   fNumber: number
   focalLength: number
   ISO: number
   lens: string
   model: string
   software: string
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
   const x = new EXIF()
   x.artist = d.artist
   x.compensation = d.compensation
   x.time = d.time
   x.fNumber = d.fNumber
   x.focalLength = d.focalLength
   x.ISO = d.ISO
   x.lens = d.lens
   x.model = d.model
   x.software = d.software
   return x.sanitize()
})
