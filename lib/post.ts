import { JsonLD, LinkData } from '@toba/json-ld';
import { slug, is } from '@toba/tools';
import { geoJSON, IMappable } from '@toba/map';
import { measure, MapBounds, Location } from '@toba/map';
import { Photo, VideoInfo, config, PostProvider, MapProvider } from '../';
import { ensureMapProvider, ensurePostProvider } from './providers';

import { forPost } from './json-ld';

export class Post extends LinkData<JsonLD.BlogPosting>
   implements IMappable<GeoJSON.GeometryObject> {
   /** Provider ID */
   id: string = null;
   /**
    * Unique identifer used as the URL slug. If post is part of a series then
    * the key is compound.
    *
    * @example brother-ride/day-10
    */
   key: string = null;
   title: string = null;
   subTitle?: string = null;
   description: string = null;
   longDescription: string = null;
   happenedOn: Date;
   createdOn: Date;
   updatedOn: Date;
   /**
    * Whether post pictures occurred sequentially in a specific time range as
    * opposed to, for example, a themed set of images from various times.
    */
   chronological: boolean = true;
   originalTitle: string = null;
   photosLoaded: boolean = false;
   bigThumbURL: string = null;
   smallThumbURL: string = null;
   photos: Photo[] = [];
   photoCount: number = 0;
   photoTagList: string = null;
   /**
    * Photo coordinates stored as longitude and latitude used to invoke map
    * APIs.
    */
   photoLocations: number[][];
   /** Top left and bottom right coordinates of photos. */
   bounds: MapBounds;
   /** Center of photo */
   centroid: Location = null;
   coverPhoto: Photo = null;
   /** Whether post is featured in main navigation */
   feature: boolean = false;
   /** Category titles mapped to category keys */
   categories: Map<string, string> = new Map();
   /**
    * Whether post information has been loaded. If not then post only contains
    * summary data supplied by its category.
    */
   infoLoaded: boolean = false;
   /**
    * Whether attempt was made to load GPX track. This can be used to prevent
    * unecessarily retrying track retrieval.
    */
   triedTrack: boolean = false;
   /** Whether GPX track was found for the post. */
   hasTrack: boolean = false;
   /** Next chronological post. */
   next: Post = null;
   /** Previous chronological post. */
   previous: Post = null;
   /** Position of this post in a series or 0 if it's not in a series. */
   part: number = 0;
   /** Whether post is part of a series. */
   isPartial: boolean = false;
   /** Whether next post is part of the same series. */
   nextIsPart: boolean = false;
   /** Whether previous post is part of the same series. */
   previousIsPart: boolean = false;
   /** Total number of posts in the series. */
   totalParts: number = 0;
   /** Whether this post is the first in a series. */
   isSeriesStart: boolean = false;
   /**
    * Portion of key that is common among series members. For example, with
    * `brother-ride/day-10` the `seriesKey` is `brother-ride`.
    */
   seriesKey: string = null;
   /**
    * Portion of key that is unique among series members. For example, with
    * `brother-ride/day-10` the `partKey` is `day-10`.
    */
   partKey: string = null;
   video: VideoInfo = null;

   private get load(): PostProvider {
      return ensurePostProvider();
   }

   private get geo(): MapProvider {
      return ensureMapProvider();
   }

   /**
    * Retrieve post photos.
    */
   async getPhotos(): Promise<Photo[]> {
      return this.photosLoaded ? this.photos : this.load.postPhotos(this);
   }

   /**
    * Retrieve post details like title and description.
    */
   async getInfo(): Promise<Post> {
      return this.infoLoaded ? this : this.load.postInfo(this);
   }

   async geoJSON() {
      let collection: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>;

      if (!this.triedTrack) {
         collection = await this.geo.track(this.key);
         this.triedTrack = true;
         if (is.value(collection)) {
            this.hasTrack = true;
         }
      }
      this.photos.forEach(async p => {
         const point = await p.geoJSON(this.partKey);
         collection.features.push(point);
      });

      return collection;
   }

   /**
    * Whether post is in any categories.
    */
   get hasCategories() {
      return this.categories.size > 0;
   }

   /**
    * Ungroup posts that were incorrectly identified as part of a series because
    * of a title that coincidentally matched a series pattern. This does not
    * correctly handle ungrouping posts that are a legitimate series member
    * since other series members are not also updated.
    */
   ungroup() {
      this.title = this.originalTitle;
      this.subTitle = null;
      this.key = slug(this.originalTitle);
      this.part = 0;
      this.totalParts = 0;
      this.isSeriesStart = false;
      this.isPartial = false;
      this.nextIsPart = false;
      this.previousIsPart = false;
      this.seriesKey = null;
      this.partKey = null;
   }

   /**
    * Flag post as the start of a series.
    */
   makeSeriesStart() {
      this.isSeriesStart = true;
      this.key = this.seriesKey;
   }

   /**
    * Whether key matches series or non-series post.
    */
   hasKey(key: string): boolean {
      return (
         this.key == key ||
         (is.value(this.partKey) && key == this.seriesKey + '-' + this.partKey)
      );
   }

   /**
    * Ensure post details and photos are loaded.
    */
   ensureLoaded(): Promise<[Post, Photo[]]> {
      return Promise.all([this.getInfo(), this.getPhotos()]);
   }

   /**
    * Remove post details to force reload from data provider.
    */
   empty(): this {
      // from updateInfo()
      this.video = null;
      this.createdOn = null;
      this.updatedOn = null;
      this.photoCount = 0;
      this.description = null;
      this.coverPhoto = null;
      this.bigThumbURL = null;
      this.smallThumbURL = null;
      this.infoLoaded = false;
      this.triedTrack = false;

      // from updatePhotos()
      this.photos = null;
      this.bounds = null;
      this.happenedOn = null;
      this.photoTagList = null;
      this.photoLocations = null;
      this.longDescription = null;
      this.photosLoaded = false;

      return this;
   }

   /**
    * Title and optional subtitle.
    */
   name(): string {
      return (
         this.title +
         (this.isPartial ? config.subtitleSeparator + ' ' + this.subTitle : '')
      );
   }

   /**
    * Update cached photo coordinates and overall bounds from photo objets.
    *
    * https://www.mapbox.com/api-documentation/#static
    */
   updatePhotoLocations() {
      let start = 1; // always skip first photo
      let total = this.photos.length;
      const locations: number[][] = [];
      const bounds: MapBounds = { sw: [0, 0], ne: [0, 0] };

      if (total > config.maxPhotoMarkersOnMap) {
         start = 5; // skip the first few which are often just prep shots
         total = config.maxPhotoMarkersOnMap + 5;
         if (total > this.photos.length) {
            total = this.photos.length;
         }
      }

      for (let i = start; i < total; i++) {
         const img = this.photos[i];
         if (img.latitude > 0) {
            locations.push([
               parseFloat(img.longitude.toFixed(5)),
               parseFloat(img.latitude.toFixed(5))
            ]);
            if (bounds.sw[0] == 0 || bounds.sw[0] > img.longitude) {
               bounds.sw[0] = img.longitude;
            }
            if (bounds.sw[1] == 0 || bounds.sw[1] > img.latitude) {
               bounds.sw[1] = img.latitude;
            }
            if (bounds.ne[0] == 0 || bounds.ne[0] < img.longitude) {
               bounds.ne[0] = img.longitude;
            }
            if (bounds.ne[1] == 0 || bounds.ne[1] < img.latitude) {
               bounds.ne[1] = img.latitude;
            }
         }
      }
      this.photoLocations = locations.length > 0 ? locations : null;
      this.bounds = bounds;
      this.centroid = measure.centroid(locations);
   }

   linkDataJSON(): JsonLD.BlogPosting {
      return forPost(this);
   }
}
