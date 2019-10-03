import { ISyndicate, AtomFeed } from '@toba/feed';
import { IMappable } from '@toba/map';
import { Post, Category, Photo, EXIF } from './index';
/**
 * Slug and cache key which probably differs from the seperator used to display
 * the title : subtitle.
 */
export declare const seriesKeySeparator = "/";
/**
 * Singleton collection of photos grouped into "posts" (called a "set" or
 * "album" in most providers) that are in turn assigned categories. Additional
 * blog methods are added by the factory.
 */
export declare class PhotoBlog implements ISyndicate<AtomFeed>, IMappable<GeoJSON.GeometryObject> {
    /** All categories mapped to their (slug-style) key. */
    categories: Map<string, Category>;
    /**
     * All posts in the blog. These must be stored as an indexed list (`Array`)
     * rather than `Set` so they can be managed as a linked list.
     */
    posts: Post[];
    /**
     * Store previous posts in cache while loading so potential new post sequence
     * can be correctly correlated without having to rebuild each post.
     */
    private postCache;
    /** Photo tags mapped to their slug-style abbreviations. */
    tags: Map<string, string>;
    /** Whether categories and post summaries have been loaded. */
    loaded: boolean;
    /**
     * Whether blog is currently being loaded by a provider. This determines
     * whether posts should be found in the temporary cache.
     */
    private isLoading;
    /**
     * Whether all post details have been loaded. Depending on the data provider,
     * the basic blog load may only include post metadata.
     */
    postInfoLoaded: boolean;
    /** Post keys present prior to current data load. */
    private hadPostKeys;
    /**
     * Keys of posts and categories that changed when data were reloaded from the
     * provider (can be used for cache invalidation).
     */
    changedKeys: string[];
    /**
     * Whether the provider's post order should be reversed.
     */
    private reversePostOrder;
    constructor();
    private readonly provide;
    /**
     * Load blog data using currently configured provider.
     * @param emptyIfLoaded Whether to empty all blog data before loading.
     */
    load(emptyIfLoaded?: boolean): Promise<PhotoBlog>;
    /**
     * Prepare blog for loading by setting aside existing post data and comparing
     * those post keys to identify changes — expected to be used by data
     * provider.
     */
    beginLoad(): this;
    /**
     * Correlate posts and identify changes compared to any previously loaded
     * posts and categories.
     *
     * This method is not safe for concurrent usage. The data provider should
     * ensure synchronicity.
     */
    finishLoad(): this;
    /**
     * All photos in all posts. Photos are loaded from data provider as needed.
     */
    photos(): Promise<Photo[]>;
    /**
     * Append blog photo `GeoFeature` `Points` to existing GeoJSON or to a new
     * feature collection.
     */
    geoJSON(geo?: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>): Promise<GeoJSON.FeatureCollection<any>>;
    /**
     * EXIF data for single photo. This method is also present on a photo
     * instance but is useful here when the instance isn't available.
     */
    getEXIF(photoID: string): Promise<EXIF>;
    /**
     * Add all posts, first resetting existing data, and identify changes in
     * `changedKeys`.
     */
    addAll(...posts: Post[]): this;
    /**
     * Add post to blog and link with adjacent posts. If a post with the same
     * `ID` is already present then no change will be made.
     *
     * Post order should be changed to newest-first so new posts are most
     * visible.
     */
    addPost(p: Post): this;
    /**
     * Find category with given key.
     */
    categoryWithKey(key: string): Category;
    /**
     * Array of all category keys.
     * @param withNames Only get keys for named categories
     */
    categoryKeys(...withNames: string[]): string[];
    /**
     * Find post with given ID. Return `undefined` if not found.
     */
    postWithID(id: string): Post;
    /**
     * Find post with given slug. Return `undefined` if not found.
     */
    postWithKey(key: string, partKey?: string): Post;
    /**
     * Array of all post keys.
     */
    postKeys(): string[];
    /**
     * Remove all blog data.
     */
    empty(): this;
    /**
     * Get first post that includes the given photo.
     */
    postWithPhoto(photo: Photo | string): Promise<Post>;
    /**
     * All photos with given tags.
     */
    getPhotosWithTags(tags: string | string[]): Promise<Photo[]>;
    /**
     * Get tag abbreviations applied to photos and replace them with their full
     * names.
     */
    photoTagList(photos: Photo[]): string;
    /**
     * Unload particular posts to force refresh from source.
     * @param keys Post keys
     */
    unload(...keys: string[]): this;
    /**
     * Remove posts (primarily for testing).
     * @param keys Post keys
     */
    remove(...keys: string[]): this;
    /**
     * Match posts that are part of a series based on them having the same title,
     * only differing by subtitle. This assumes that `this.posts` is already in
     * the correct sequence (newest-first) and titles have been parsed.
     *
     * Iterate posts in reverse order so older posts are evaluated first. Unlike
     * the overall post list, which shows newest first, series are sorted with
     * oldest posts first.
     *
     * This method is called internally by `finishLoad()`.
     */
    correlatePosts(): this;
    rssJSON(): AtomFeed;
}
/**
 * `PhotoBlog` singleton
 */
export declare const blog: PhotoBlog;
