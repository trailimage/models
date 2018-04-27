import '@toba/test';
import { is } from '@toba/tools';
import { geoJSON, IMappable } from '@toba/map';
import { PhotoSize, EXIF, PostProvider } from '../';
import { ensurePostProvider } from './providers';

export class Photo implements IMappable<GeoJSON.Point> {
   /** Provider photo ID */
   id: string = null;
   /** Position of photo within post. */
   index: number;
   sourceUrl: string = null;
   title: string = null;
   description: string = null;
   /** Tags applied to the photo. */
   tags: Set<string> = new Set();
   dateTaken: Date;
   latitude: number;
   longitude: number;
   /** Whether this is the post's main photo. */
   primary: boolean = false;
   size: { [key: string]: PhotoSize } = {};
   /** Size at which to preview the photo such as in search results. */
   preview: PhotoSize = null;
   /** Normal photo size shown within post. */
   normal: PhotoSize = null;
   /** Size shown when post photo is clicked for enlargmenet. */
   big: PhotoSize = null;

   private _exif: EXIF = null;

   /**
    * Whether taken date is an outlier compared to other photos in the same
    * post. Outliers may be removed from mini-maps so the maps aren't overly
    * zoomed-out to accomodate contextual photos taken days before or after
    * the main post.
    *
    * @see http://www.wikihow.com/Calculate-Outliers
    */
   outlierDate?: boolean;

   constructor(id: string, index: number) {
      this.id = id;
      this.index = index;
   }

   private get load(): PostProvider {
      return ensurePostProvider();
   }

   /**
    * Comma-delimited list of all tags applied to the photo.
    */
   get tagList(): string {
      return Array.from(this.tags).join(',');
   }

   async EXIF(): Promise<EXIF> {
      if (this._exif === null) {
         this._exif = await this.load.exif(this.id);
      }
      return this._exif;
   }

   /**
    * Generate GeoJSON for photo feature.
    */
   async geoJSON(partKey?: string): Promise<GeoJSON.Feature<GeoJSON.Point>> {
      const properties: MapPhoto = { url: this.size.preview.url };

      if (partKey !== undefined) {
         // implies GeoJSON for single post
         properties.title = this.title;
         properties.partKey = partKey;
      }
      return {
         type: geoJSON.Type.Feature,
         properties,
         geometry: geoJSON.geometry(geoJSON.Type.Point, [
            this.longitude,
            this.latitude
         ])
      } as GeoJSON.Feature<GeoJSON.Point>;
   }
}

/**
 * Simplistic outlier calculation.
 *
 * @see https://en.wikipedia.org/wiki/Outlier
 * @see http://www.wikihow.com/Calculate-Outliers
 */
export function identifyOutliers(photos: Photo[]) {
   const median = (values: number[]) => {
      const half = Math.floor(values.length / 2);
      return values.length % 2 !== 0
         ? values[half]
         : (values[half - 1] + values[half]) / 2.0;
   };

   const boundary = (values: number[], distance?: number) => {
      if (!is.array(values) || values.length === 0) {
         return null;
      }
      if (distance === undefined) {
         distance = 3;
      }

      // sort lowest to highest
      values.sort((d1, d2) => d1 - d2);
      const half = Math.floor(values.length / 2);
      const q1 = median(values.slice(0, half));
      const q3 = median(values.slice(half));
      const range = q3 - q1;

      return {
         min: (q1 - range * distance) as number,
         max: (q3 + range * distance) as number
      };
   };
   const fence = boundary(photos.map(p => p.dateTaken.getTime()));

   if (fence !== null) {
      for (const p of photos) {
         const d = p.dateTaken.getTime();
         if (d > fence.max || d < fence.min) {
            p.outlierDate = true;
         }
      }
   }
}

/**
 * GeoJSON properties for photos.
 */
export interface MapPhoto {
   url?: string;
   title?: string;
   partKey?: string;
   /** Distance from clicked cluster */
   distance?: number;
}
