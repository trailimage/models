"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const logger_1 = require("@toba/logger");
const map_1 = require("@toba/map");
const index_1 = require("./index");
const providers_1 = require("./providers");
/**
 * Slug and cache key which probably differs from the seperator used to display
 * the title : subtitle.
 */
exports.seriesKeySeparator = '/';
/**
 * Singleton collection of photos grouped into "posts" (called a "set" or
 * "album" in most providers) that are in turn assigned categories. Additional
 * blog methods are added by the factory.
 */
class PhotoBlog {
    constructor() {
        /** All categories mapped to their (slug-style) key. */
        this.categories = new Map();
        /**
         * All posts in the blog. These must be stored as an indexed list (`Array`)
         * rather than `Set` so they can be managed as a linked list.
         */
        this.posts = [];
        /**
         * Store previous posts in cache while loading so potential new post sequence
         * can be correctly correlated without having to rebuild each post.
         */
        this.postCache = [];
        /** Photo tags mapped to their slug-style abbreviations. */
        this.tags = new Map();
        /** Whether categories and post summaries have been loaded. */
        this.loaded = false;
        /**
         * Whether blog is currently being loaded by a provider. This determines
         * whether posts should be found in the temporary cache.
         */
        this.isLoading = false;
        /**
         * Whether all post details have been loaded. Depending on the data provider,
         * the basic blog load may only include post metadata.
         */
        this.postInfoLoaded = false;
        /**
         * Keys of posts and categories that changed when data were reloaded from the
         * provider (can be used for cache invalidation).
         */
        this.changedKeys = [];
        /**
         * Whether the provider's post order should be reversed.
         */
        this.reversePostOrder = false;
        if (tools_1.is.value(exports.blog)) {
            throw new Error('PhotoBlog instance already exists');
        }
    }
    get provide() {
        return providers_1.ensurePostProvider();
    }
    /**
     * Load blog data using currently configured provider.
     * @param emptyIfLoaded Whether to empty all blog data before loading.
     */
    load(emptyIfLoaded = false) {
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
    beginLoad() {
        this.isLoading = true;
        // record post keys before resetting them
        this.hadPostKeys = this.posts.map(p => p.key);
        this.postCache = this.posts.map(p => p.reset());
        this.posts = [];
        this.reversePostOrder = index_1.config.providerPostSort == tools_1.Sort.OldestFirst;
        return this;
    }
    /**
     * Correlate posts and identify changes compared to any previously loaded
     * posts and categories.
     *
     * This method is not safe for concurrent usage. The data provider should
     * ensure synchronicity.
     */
    finishLoad() {
        this.correlatePosts();
        if (this.hadPostKeys.length > 0) {
            let changedKeys = [];
            this.posts
                .filter(p => this.hadPostKeys.indexOf(p.key) == -1)
                .forEach(p => {
                logger_1.log.info(`Found new post "${p.title}"`, { key: p.key });
                changedKeys.push(p.key);
                // all post categories will need to be refreshed
                changedKeys = changedKeys.concat(Array.from(p.categories.keys()));
                // update adjecent posts to correct next/previous links
                if (tools_1.is.value(p.next)) {
                    changedKeys.push(p.next.key);
                }
                if (tools_1.is.value(p.previous)) {
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
    async photos() {
        /** Array of post photo arrays */
        const blogPhotos = await Promise.all(this.posts.map(p => p.getPhotos()));
        const unique = [];
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
    async geoJSON(geo = map_1.geoJSON.features()) {
        const photos = await this.photos();
        geo.features = geo.features.concat(photos.filter(p => p.latitude > 0).map(p => p.geoJSON()));
        return geo;
    }
    /**
     * EXIF data for single photo. This method is also present on a photo
     * instance but is useful here when the instance isn't available.
     */
    getEXIF(photoID) {
        return this.provide.exif(photoID);
    }
    /**
     * Add all posts, first resetting existing data, and identify changes in
     * `changedKeys`.
     */
    addAll(...posts) {
        this.beginLoad();
        posts.forEach(p => this.addPost(p));
        return this.finishLoad();
    }
    /**
     * Add post to blog and link with adjacent posts. If a post with the same
     * `ID` is already present then no change will be made.
     *
     * Post order should be changed to newest-first so new posts are most
     * visible.
     */
    addPost(p) {
        if (this.posts.findIndex(e => e.id === p.id) >= 0) {
            // post with same ID has already been added
            return this;
        }
        /**
         * During load the cache is used to look-up posts so ensure it too
         * references the new post.
         */
        const alsoCache = this.isLoading && this.postCache.findIndex(e => e.id === p.id) == -1;
        /**
         * Whether this post should be linked to adjacent posts.
         */
        const linkAdjacent = p.chronological && this.posts.length > 0;
        if (this.reversePostOrder) {
            // implies posts are ordered oldest-first and need to be switched to
            // newest-first
            this.posts.unshift(p);
            if (alsoCache) {
                this.postCache.unshift(p);
            }
            if (linkAdjacent) {
                const prev = this.posts[1];
                if (prev.chronological) {
                    p.previous = prev;
                    prev.next = p;
                }
            }
        }
        else {
            // added post should be older than those previously added, e.g.
            // [newest, older1, older2, oldest]
            this.posts.push(p);
            if (alsoCache) {
                this.postCache.push(p);
            }
            if (linkAdjacent) {
                const next = this.posts[this.posts.length - 2];
                if (next.chronological) {
                    p.next = next;
                    next.previous = p;
                }
            }
        }
        return this;
    }
    /**
     * Find category with given key.
     */
    categoryWithKey(key) {
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
    categoryKeys(...withNames) {
        const keys = [];
        if (withNames.length > 0) {
            // get keys only for named categories
            for (const name of withNames) {
                for (const c of this.categories.values()) {
                    const s = c.getSubcategory(name);
                    if (c.title == name) {
                        keys.push(c.key);
                    }
                    else if (tools_1.is.value(s)) {
                        keys.push(s.key);
                    }
                }
            }
        }
        else {
            // get keys for all categories
            for (const c of this.categories.values()) {
                keys.push(c.key, ...tools_1.mapSet(c.subcategories, s => s.key));
            }
        }
        return keys;
    }
    /**
     * Find post with given ID. Return `undefined` if not found.
     */
    postWithID(id) {
        if (tools_1.is.value(id)) {
            const searchIn = this.isLoading ? this.postCache : this.posts;
            return searchIn.find(p => p.id == id);
        }
        return undefined;
    }
    /**
     * Find post with given slug. Return `undefined` if not found.
     */
    postWithKey(key, partKey = null) {
        if (tools_1.is.value(partKey)) {
            key += exports.seriesKeySeparator + partKey;
        }
        const searchIn = this.isLoading ? this.postCache : this.posts;
        return searchIn.find(p => p.hasKey(key));
    }
    /**
     * Array of all post keys.
     */
    postKeys() {
        return this.posts.map(p => p.key);
    }
    /**
     * Remove all blog data.
     */
    empty() {
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
    async postWithPhoto(photo) {
        const id = tools_1.is.text(photo)
            ? photo
            : photo.id;
        const postID = await this.provide.postIdWithPhotoId(id);
        return this.postWithID(postID);
    }
    /**
     * All photos with given tags.
     */
    getPhotosWithTags(tags) {
        return this.provide.photosWithTags(tags);
    }
    /**
     * Get tag abbreviations applied to photos and replace them with their full
     * names.
     */
    photoTagList(photos) {
        // all photo tags in the blog
        const postTags = new Set();
        for (const p of photos) {
            const photoTags = new Set();
            for (const tagSlug of p.tags) {
                // lookup full tag name from its slug
                const tagName = this.tags.get(tagSlug);
                if (!tools_1.is.empty(tagName)) {
                    photoTags.add(tagName);
                    postTags.add(tagName);
                }
            }
            p.tags = photoTags;
        }
        return postTags.size > 0 ? Array.from(postTags).join(', ') : null;
    }
    /**
     * Unload particular posts to force refresh from source.
     * @param keys Post keys
     */
    unload(...keys) {
        for (const k of keys) {
            const p = this.postWithKey(k);
            // removing post details will force it to reload on next access
            if (tools_1.is.value(p)) {
                p.empty();
            }
        }
        return this;
    }
    /**
     * Remove posts (primarily for testing).
     * @param keys Post keys
     */
    remove(...keys) {
        for (const k of keys) {
            const p = this.postWithKey(k);
            if (tools_1.removeItem(this.posts, p)) {
                if (tools_1.is.value(p.next)) {
                    p.next.previous = null;
                }
                if (tools_1.is.value(p.previous)) {
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
     * the correct sequence (newest-first) and titles have been parsed.
     *
     * Iterate posts in reverse order so older posts are evaluated first. Unlike
     * the overall post list, which shows newest first, series are sorted with
     * oldest posts first.
     *
     * This method is called internally by `finishLoad()`.
     */
    correlatePosts() {
        let parts = [];
        for (let i = this.posts.length - 1; i >= 0; i--) {
            // start with oldest post
            let p = this.posts[i];
            if (tools_1.is.empty(p.subTitle)) {
                // no grouping to be done
                continue;
            }
            if (p.next != null) {
                parts.push(p);
                while (p.next != null && p.next.title == p.title) {
                    p = p.next;
                    parts.push(p);
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
                }
                else {
                    p.ungroup();
                }
                parts = [];
            }
            else {
                p.ungroup();
            }
        }
        return this;
    }
    rssJSON() {
        const author = {
            name: index_1.config.owner.name
        };
        return {
            id: index_1.config.site.url,
            title: index_1.config.site.title,
            subtitle: index_1.config.site.subtitle,
            link: {
                href: index_1.config.site.url
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
exports.PhotoBlog = PhotoBlog;
/**
 * `PhotoBlog` singleton
 */
exports.blog = new PhotoBlog();
