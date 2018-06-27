import { JsonLD, LinkData } from '@toba/json-ld';
import { slug, is } from '@toba/tools';
import { geoJSON, IMappable } from '@toba/map';
import { ISyndicate, AtomEntry, AtomPerson } from '@toba/feed';
import { measure, MapBounds, Location } from '@toba/map';
import {
   Photo,
   VideoInfo,
   config,
   PostProvider,
   seriesKeySeparator
} from './index';
import { ensureMapProvider, ensurePostProvider } from './providers';
import { forPost } from './json-ld';

export class Post
   implements
      LinkData<JsonLD.BlogPosting>,
      IMappable<GeoJSON.GeometryObject>,
      ISyndicate<AtomEntry> {
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
   /** Description that includes computed photo and video count. */
   longDescription: string = null;
   happenedOn: Date;
   createdOn: Date;
   updatedOn: Date;
   /**
    * Whether post pictures occurred sequentially in a specific time range as
    * opposed to, for example, a themed set of images from various times.
    */
   chronological: boolean = true;
   private originalTitle: string = null;
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

   private get load(): PostProvider<any> {
      return ensurePostProvider();
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

   /**
    * Whether post is in any categories.
    */
   get hasCategories(): boolean {
      return this.categories.size > 0;
   }

   /**
    * Reset post to initial load state without correlation to other posts,
    * meaning no groups (series) or previous/next links.
    */
   reset(): this {
      this.inferTitleAndKey(this.originalTitle);
      this.previous = null;
      this.next = null;
      return this.removeFromSeries();
   }

   /**
    * Remove post from a series but leave next/previous, title and keys as is.
    */
   private removeFromSeries(): this {
      this.part = 0;
      this.totalParts = 0;
      this.isSeriesStart = false;
      this.isPartial = false;
      this.nextIsPart = false;
      this.previousIsPart = false;
      return this;
   }

   /**
    * Ungroup posts that were incorrectly identified as part of a series because
    * of a title that coincidentally matched a series pattern. This does not
    * correctly handle ungrouping posts that are a legitimate series member
    * since other series members are not also updated.
    */
   ungroup(): this {
      this.title = this.originalTitle;
      this.subTitle = null;
      this.key = slug(this.originalTitle);
      this.seriesKey = null;
      this.partKey = null;
      return this.removeFromSeries();
   }

   /**
    * Flag post as the start of a series. Unlike other parts in the series, the
    * first part key is simply the series key.
    */
   makeSeriesStart(): this {
      this.isSeriesStart = true;
      this.key = this.seriesKey;
      return this;
   }

   /**
    * Whether key matches series or non-series post.
    *
    * Match should still succeed if searching for a compound key even though
    * first post in a series doesn't include the subtitle slug. For example,
    * searching `series-1/title-1` should match the first post in "Series 1"
    * even though it's key is simply `series-1`.
    */
   hasKey(key: string): boolean {
      return (
         this.key == key ||
         (is.value(this.partKey) &&
            key == this.seriesKey + seriesKeySeparator + this.partKey)
      );
   }

   /**
    * Set original provider title and infer series and subtitles based on
    * presence of configured subtitle separator (default is `:`). Then generate
    * key slug(s) from title(s).
    */
   inferTitleAndKey(title: string): this {
      this.originalTitle = title;
      const re = new RegExp(config.subtitleSeparator + '\\s*', 'g');
      const parts = title.split(re);

      this.title = parts[0];

      if (parts.length > 1) {
         this.subTitle = parts[1];
         this.seriesKey = slug(this.title);
         this.partKey = slug(this.subTitle);
         this.key = this.seriesKey + seriesKeySeparator + this.partKey;
      } else {
         this.key = slug(title);
      }
      return this;
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
    * @see https://www.mapbox.com/api-documentation/#static
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

   /**
    * Map information for post.
    */
   async geoJSON() {
      let collection: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>;

      if (!this.triedTrack) {
         collection = await ensureMapProvider().track(this.key);
         this.triedTrack = true;
      }

      this.hasTrack = is.value(collection);

      if (!this.hasTrack) {
         collection = geoJSON.features();
      }

      collection.features.push(
         ...this.photos.map(p => p.geoJSON(this.partKey))
      );
      return collection;
   }

   /**
    * Link Data for post.
    */
   jsonLD(): JsonLD.BlogPosting {
      return forPost(this);
   }

   /**
    * Details for RSS/Atom feed. Rights default to full copyright.
    */
   rssJSON(): AtomEntry {
      const author: AtomPerson = {
         name: config.owner.name
      };

      if (is.array(config.owner.urls, 1)) {
         author.uri = config.owner.urls[0];
      }

      return {
         id: config.site.url + '/' + this.key,
         title: this.name(),
         link: 'http://' + config.site.domain,
         published: this.createdOn,
         updated: this.updatedOn,
         rights: `Copyright © ${new Date().getFullYear()} ${
            config.owner.name
         }. All rights reserved.`,
         summary: this.description,
         author: author,
         content: config.site.url + '/' + this.key
      };
   }
}
