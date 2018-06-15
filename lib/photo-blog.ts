import { removeItem, is, mapSet } from '@toba/tools';
import { log } from '@toba/logger';
import { ISyndicate, AtomFeed, AtomPerson } from '@toba/feed';
import { geoJSON, IMappable } from '@toba/map';
import { Post, Category, Photo, EXIF, PostProvider, config } from './index';
import { ensurePostProvider } from './providers';

/**
 * Slug and cache key which probably differs from the seperator used to display
 * the title : subtitle.
 */
export const seriesKeySeparator = '/';

/**
 * Singleton collection of photos grouped into "posts" (called a "set" or
 * "album" in most providers) that are in turn assigned categories. Additional
 * blog methods are added by the factory.
 */
export class PhotoBlog
   implements ISyndicate<AtomFeed>, IMappable<GeoJSON.GeometryObject> {
   /** All categories mapped to their (slug-style) key. */
   categories: Map<string, Category> = new Map();
   /**
    * All posts in the blog. These must be stored as an indexed list (`Array`)
    * rather than `Set` so they can be managed as a linked list.
    */
   posts: Post[] = [];

   /**
    * Store previous posts in cache while loading so potential new post sequence
    * can be correctly correlated without having to rebuild each post.
    */
   private postCache: Post[] = [];

   /** Photo tags mapped to their slug-style abbreviations. */
   tags: Map<string, string> = new Map();

   /** Whether categories and post summaries have been loaded. */
   loaded: boolean = false;

   /**
    * Whether blog is currently being loaded by a provider. This determines
    * whether posts should be found in the temporary cache.
    */
   private isLoading: boolean = false;

   /**
    * Whether all post details have been loaded. Depending on the data provider,
    * the basic blog load may only include post metadata.
    */
   postInfoLoaded: boolean = false;

   /** Post keys present prior to current data load. */
   private hadPostKeys: string[];

   /**
    * Keys of posts and categories that changed when data were reloaded from the
    * provider (can be used for cache invalidation).
    */
   changedKeys: string[] = [];

   constructor() {
      if (is.value(blog)) {
         throw new Error('PhotoBlog instance already exists');
      }
   }

   private get provide(): PostProvider<any> {
      return ensurePostProvider();
   }

   /**
    * Load blog data using currently configured provider.
    * @param emptyIfLoaded Whether to empty all blog data before loading.
    */
   load(emptyIfLoaded = false): Promise<PhotoBlog> {
      if (this.loaded && emptyIfLoaded) {
         this.empty();
      }
      return this.provide.photoBlog();
   }

   /**
    * Prepare blog for loading by setting aside existing post data and comparing
    * those post keys to identify changes — expected to be used by data
    * provider.
    */
   beginLoad(): this {
      this.isLoading = true;
      // record post keys before resetting them
      this.hadPostKeys = this.posts.map(p => p.key);
      this.postCache = this.posts.map(p => p.reset());
      this.posts = [];
      return this;
   }

   /**
    * Correlate posts and identify changes compared to any previously loaded
    * posts and categories.
    *
    * This method is not safe for concurrent usage. The data provider should
    * ensure synchronicity.
    */
   finishLoad(): this {
      this.correlatePosts();

      if (this.hadPostKeys.length > 0) {
         let changedKeys: string[] = [];
         this.posts
            .filter(p => this.hadPostKeys.indexOf(p.key) == -1)
            .forEach(p => {
               log.info(`Found new post "${p.title}"`, { key: p.key });
               changedKeys.push(p.key);

               // all post categories will need to be refreshed
               changedKeys = changedKeys.concat(
                  Array.from(p.categories.keys())
               );
               // update adjecent posts to correct next/previous links
               if (is.value(p.next)) {
                  changedKeys.push(p.next.key);
               }
               if (is.value(p.previous)) {
                  changedKeys.push(p.previous.key);
               }
            });
         this.changedKeys = changedKeys;
         this.hadPostKeys = [];
      }
      this.isLoading = false;
      this.loaded = true;
      this.postCache = [];

      return this;
   }

   /**
    * All photos in all posts. Photos are loaded from data provider as needed.
    */
   async photos(): Promise<Photo[]> {
      /** Array of post photo arrays */
      const blogPhotos: Photo[][] = await Promise.all(
         this.posts.map(p => p.getPhotos())
      );

      const unique: Photo[] = [];

      blogPhotos.forEach(postPhotos => {
         postPhotos.forEach(p => {
            if (unique.findIndex(photo => photo.id == p.id) == -1) {
               unique.push(p);
            }
         });
      });

      return unique;
   }

   /**
    * Append blog photo `GeoFeature` `Points` to existing GeoJSON or to a new
    * feature collection.
    */
   async geoJSON(
      geo: GeoJSON.FeatureCollection<GeoJSON.GeometryObject> = geoJSON.features<
         GeoJSON.Point
      >()
   ): Promise<GeoJSON.FeatureCollection<any>> {
      const photos = await this.photos();
      geo.features = geo.features.concat(
         photos.filter(p => p.latitude > 0).map(p => p.geoJSON())
      );
      return geo;
   }

   /**
    * EXIF data for single photo. This method is also present on a photo
    * instance but is useful here when the instance isn't available.
    */
   getEXIF(photoID: string): Promise<EXIF> {
      return this.provide.exif(photoID);
   }

   /**
    * Add all posts, first resetting existing data, and identify changes in
    * `changedKeys`.
    */
   addAll(...posts: Post[]): this {
      this.beginLoad();
      posts.forEach(p => this.addPost(p));
      return this.finishLoad();
   }

   /**
    * Add post to blog and link with adjacent posts. If a post with the same
    * `ID` is already present then no change will be made.
    */
   addPost(p: Post): this {
      if (this.posts.findIndex(e => e.id === p.id) >= 0) {
         // post with same ID has already been added
         return this;
      }
      this.posts.push(p);

      if (
         this.isLoading &&
         this.postCache.findIndex(e => e.id === p.id) == -1
      ) {
         // during load the cache is used to look-up posts so ensure it too
         // references the post
         this.postCache.push(p);
      }

      if (p.chronological && this.posts.length > 1) {
         const prev = this.posts[this.posts.length - 2];
         if (prev.chronological) {
            p.previous = prev;
            prev.next = p;
         }
      }
      return this;
   }

   /**
    * Find category with given key.
    */
   categoryWithKey(key: string): Category {
      const rootKey = key.includes('/') ? key.split('/')[0] : key;

      for (const cat of this.categories.values()) {
         if (cat.key == rootKey) {
            return key != rootKey ? cat.getSubcategory(key) : cat;
         }
      }
      return null;
   }

   /**
    * Array of all category keys.
    * @param withNames Only get keys for named categories
    */
   categoryKeys(...withNames: string[]): string[] {
      const keys: string[] = [];

      if (withNames.length > 0) {
         // get keys only for named categories
         for (const name of withNames) {
            for (const c of this.categories.values()) {
               const s = c.getSubcategory(name);

               if (c.title == name) {
                  keys.push(c.key);
               } else if (is.value(s)) {
                  keys.push(s.key);
               }
            }
         }
      } else {
         // get keys for all categories
         for (const c of this.categories.values()) {
            keys.push(c.key, ...mapSet(c.subcategories, s => s.key));
         }
      }
      return keys;
   }

   /**
    * Find post with given ID. Return `undefined` if not found.
    */
   postWithID(id: string): Post {
      if (is.value(id)) {
         const searchIn = this.isLoading ? this.postCache : this.posts;
         return searchIn.find(p => p.id == id);
      }
      return undefined;
   }

   /**
    * Find post with given slug. Return `undefined` if not found.
    */
   postWithKey(key: string, partKey: string = null): Post {
      if (is.value(partKey)) {
         key += seriesKeySeparator + partKey;
      }
      const searchIn = this.isLoading ? this.postCache : this.posts;
      return searchIn.find(p => p.hasKey(key));
   }

   /**
    * Array of all post keys.
    */
   postKeys(): string[] {
      return this.posts.map(p => p.key);
   }

   /**
    * Remove all blog data.
    */
   empty(): this {
      this.categories.clear();
      this.posts = [];
      this.tags.clear();
      this.loaded = false;
      this.postInfoLoaded = false;
      return this;
   }

   /**
    * Get first post that includes the given photo.
    */
   async postWithPhoto(photo: Photo | string): Promise<Post> {
      const id: string = is.text(photo)
         ? (photo as string)
         : (photo as Photo).id;
      const postID = await this.provide.postIdWithPhotoId(id);

      return this.postWithID(postID);
   }

   /**
    * All photos with given tags.
    */
   getPhotosWithTags(tags: string | string[]): Promise<Photo[]> {
      return this.provide.photosWithTags(tags);
   }

   /**
    * Get tag abbreviations applied to photos and replace them with their full
    * names.
    */
   photoTagList(photos: Photo[]): string {
      // all photo tags in the blog
      const postTags: Set<string> = new Set();

      for (const p of photos) {
         for (const tagSlug of p.tags) {
            // lookup full tag name from its slug
            const tagName = this.tags.get(tagSlug);
            p.tags.delete(tagSlug);
            if (is.value(tagName)) {
               p.tags.add(tagName);
               postTags.add(tagName);
            }
         }
      }
      return postTags.size > 0 ? Array.from(postTags).join(', ') : null;
   }

   /**
    * Unload particular posts to force refresh from source.
    * @param keys Post keys
    */
   unload(...keys: string[]): this {
      for (const k of keys) {
         const p = this.postWithKey(k);
         // removing post details will force it to reload on next access
         if (is.value(p)) {
            p.empty();
         }
      }
      return this;
   }

   /**
    * Remove posts (primarily for testing).
    * @param keys Post keys
    */
   remove(...keys: string[]): this {
      for (const k of keys) {
         const p = this.postWithKey(k);
         if (removeItem(this.posts, p)) {
            if (is.value(p.next)) {
               p.next.previous = null;
            }
            if (is.value(p.previous)) {
               p.previous.next = null;
            }

            this.categories.forEach(cat => {
               cat.removePost(p);
            });
         }
      }
      return this;
   }

   /**
    * Match posts that are part of a series based on them having the same title,
    * only differing by subtitle. This assumes that `this.posts` is already in
    * the correct sequence and titles have been parsed.
    *
    * This method is called internally by `finishLoad()`.
    */
   correlatePosts(): this {
      let parts: Post[] = [];

      for (let i = this.posts.length - 1; i >= 0; i--) {
         let p = this.posts[i];

         if (p.previous != null && is.value(p.subTitle)) {
            parts.push(p);

            while (p.previous != null && p.previous.title == p.title) {
               p = p.previous;
               parts.unshift(p);
               i--;
            }

            if (parts.length > 1) {
               parts[0].makeSeriesStart();

               for (let j = 0; j < parts.length; j++) {
                  parts[j].part = j + 1;
                  parts[j].totalParts = parts.length;
                  parts[j].isPartial = true;

                  if (j > 0) {
                     parts[j].previousIsPart = true;
                  }
                  if (j < parts.length - 1) {
                     parts[j].nextIsPart = true;
                  }
               }
            } else {
               p.ungroup();
            }
            parts = [];
         }
      }
      return this;
   }

   rssJSON(): AtomFeed {
      const author: AtomPerson = {
         name: config.owner.name
      };

      return {
         id: config.site.url,
         title: config.site.title,
         subtitle: config.site.subtitle,
         link: {
            href: config.site.url
         },
         author: author,
         contributor: author,
         generator: {
            name: 'Toba',
            uri: 'https://github.com/toba'
         },
         updated: new Date(),
         entry: this.posts.map(p => p.rssJSON())
      };
   }
}

/**
 * `PhotoBlog` singleton
 */
export const blog = new PhotoBlog();
