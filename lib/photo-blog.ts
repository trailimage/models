import { removeItem, is, mapSet } from '@toba/tools';
import { ISyndicate, AtomFeed } from '@toba/feed';
import { geoJSON } from '@toba/map';
import { Post, Category, Photo, EXIF, PostProvider, config } from '../';
import { ensurePostProvider } from './providers';

/**
 * Singleton collection of photos grouped into "posts" (called a "set" or
 * "album" in most providers) that are in turn assigned categories. Additional
 * blog methods are added by the factory.
 */
export class PhotoBlog implements ISyndicate<AtomFeed> {
   /** All categories mapped to their (slug-style) key. */
   categories: Map<string, Category> = new Map();
   /**
    * All posts in the blog. These must be stored as an indexed list (`Array`)
    * rather than `Set` so they can be managed as a linked list.
    */
   posts: Post[] = [];
   /** Photo tags mapped to their slug-style abbreviations. */
   tags: Map<string, string> = new Map();
   /** Whether categories and post summaries have been loaded. */
   loaded: boolean = false;
   /** Whether all post details have been loaded. */
   postInfoLoaded: boolean = false;
   /**
    * Keys of posts and categories that changed when data were reloaded from the
    * provider (can be used for cache invalidation).
    */
   changedKeys: string[];

   constructor() {
      if (is.value(blog)) {
         throw new Error('PhotoBlog instance already exists');
      }
   }

   private get load(): PostProvider {
      return ensurePostProvider();
   }

   /**
    * @param emptyIfLoaded Whether to empty all blog data before loading.
    */
   build(emptyIfLoaded = false): Promise<PhotoBlog> {
      if (this.loaded && emptyIfLoaded) {
         this.empty();
      }
      return this.load.photoBlog(this);
   }

   /**
    * All photos in all posts without de-duplication. Photos are loaded from
    * data provider as needed.
    */
   async photos(): Promise<Photo[]> {
      /** Array of post photo arrays */
      const photos: Photo[][] = await Promise.all(
         this.posts.map(p => p.getPhotos())
      );
      // combine post arrays into single array
      return photos.reduce((all, p) => all.concat(p), [] as Photo[]);
   }

   /**
    * Append blog photo GeoFeatures to GeoJSON.
    */
   async makePhotoFeatures(
      geo: GeoJSON.FeatureCollection<
         GeoJSON.GeometryObject
      > = geoJSON.features()
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
      return this.load.exif(photoID);
   }

   /**
    * Add post to library and link with adjacent posts.
    */
   addPost(p: Post): this {
      // exit if post with same ID is already present
      if (this.posts.filter(e => e.id === p.id).length > 0) {
         return this;
      }
      this.posts.push(p);

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
    * Find post with given ID.
    */
   postWithID(id: string): Post {
      return is.value(id) ? this.posts.find(p => p.id == id) : null;
   }

   /**
    * Find post with given slug.
    */
   postWithKey(key: string, partKey: string = null): Post {
      if (is.value(partKey)) {
         key += '/' + partKey;
      }
      return this.posts.find(p => p.hasKey(key));
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
      const postID = await this.load.postIdWithPhotoId(id);

      return this.postWithID(postID);
   }

   /**
    * All photos with given tags.
    */
   getPhotosWithTags(tags: string | string[]): Promise<Photo[]> {
      return this.load.photosWithTags(tags);
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
            this.categories.forEach(cat => {
               cat.removePost(p);
            });
         }
      }
      return this;
   }

   /**
    * Match posts that are part of a series.
    */
   correlatePosts() {
      let p = this.posts[this.posts.length - 1];
      let parts = [];

      while (p != null && p.previous != null) {
         if (is.value(p.subTitle)) {
            parts.push(p);

            while (p.previous != null && p.previous.title == p.title) {
               p = p.previous;
               parts.unshift(p);
            }

            if (parts.length > 1) {
               parts[0].makeSeriesStart();

               for (let i = 0; i < parts.length; i++) {
                  parts[i].part = i + 1;
                  parts[i].totalParts = parts.length;
                  parts[i].isPartial = true;

                  if (i > 0) {
                     parts[i].previousIsPart = true;
                  }
                  if (i < parts.length - 1) {
                     parts[i].nextIsPart = true;
                  }
               }
            } else {
               p.ungroup();
            }
            parts = [];
         }
         p = p.previous;
      }
   }

   rssJSON(): AtomFeed {
      return {
         id: '',
         title: config.site.title,
         subtitle: '',
         link: {
            href: ''
         },
         author: {
            name: 'Who'
         },
         entry: this.posts.map(p => p.rssJSON())
      };
   }
}

/**
 * `PhotoBlog` singleton
 */
export const blog = new PhotoBlog();
