import '@toba/test';
import { boundary } from '@toba/tools';
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
    *
    * @param partKey Optional series part that photo post belongs to, used to
    * generate link from map info box back to post URL
    */
   geoJSON(partKey?: string): GeoJSON.Feature<GeoJSON.Point> {
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
 * Simplistic outlier calculation identifies photos that are likely not part of
 * the main sequence.
 *
 * @see https://en.wikipedia.org/wiki/Outlier
 * @see http://www.wikihow.com/Calculate-Outliers
 */
export function identifyOutliers(photos: Photo[]) {
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
