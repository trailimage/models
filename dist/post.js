"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const map_1 = require("@toba/map");
const map_2 = require("@toba/map");
const index_1 = require("./index");
const providers_1 = require("./providers");
const json_ld_1 = require("./json-ld");
class Post {
    constructor() {
        /** Provider ID */
        this.id = null;
        /**
         * Unique identifer used as the URL slug. If post is part of a series then
         * the key is compound.
         *
         * @example brother-ride/day-10
         */
        this.key = null;
        this.title = null;
        this.subTitle = null;
        this.description = null;
        /** Description that includes computed photo and video count. */
        this.longDescription = null;
        /**
         * Whether post pictures occurred sequentially in a specific time range as
         * opposed to, for example, a themed set of images from various times.
         */
        this.chronological = true;
        this.originalTitle = null;
        this.photosLoaded = false;
        this.bigThumbURL = null;
        this.smallThumbURL = null;
        this.photos = [];
        this.photoCount = 0;
        this.photoTagList = null;
        /** Center of photo */
        this.centroid = null;
        this.coverPhoto = null;
        /** Whether post is featured in main navigation */
        this.feature = false;
        /** Category titles mapped to category keys */
        this.categories = new Map();
        /**
         * Whether post information has been loaded. If not then post only contains
         * summary data supplied by its category.
         */
        this.infoLoaded = false;
        /**
         * Whether attempt was made to load GPX track. This can be used to prevent
         * unecessarily retrying track retrieval.
         */
        this.triedTrack = false;
        /** Whether GPX track was found for the post. */
        this.hasTrack = false;
        /** Next chronological post (newer). */
        this.next = null;
        /** Previous chronological post (older). */
        this.previous = null;
        /** Position of this post in a series or 0 if it's not in a series. */
        this.part = 0;
        /** Whether post is part of a series. */
        this.isPartial = false;
        /** Whether next post is part of the same series. */
        this.nextIsPart = false;
        /** Whether previous post is part of the same series. */
        this.previousIsPart = false;
        /** Total number of posts in the series. */
        this.totalParts = 0;
        /** Whether this post is the first in a series. */
        this.isSeriesStart = false;
        /**
         * Portion of key that is common among series members. For example, with
         * `brother-ride/day-10` the `seriesKey` is `brother-ride`.
         */
        this.seriesKey = null;
        /**
         * Portion of key that is unique among series members. For example, with
         * `brother-ride/day-10` the `partKey` is `day-10`.
         */
        this.partKey = null;
        this.video = null;
    }
    get load() {
        return providers_1.ensurePostProvider();
    }
    /**
     * Retrieve post photos.
     */
    async getPhotos() {
        return this.photosLoaded ? this.photos : this.load.postPhotos(this);
    }
    /**
     * Retrieve post details like title and description.
     */
    async getInfo() {
        return this.infoLoaded ? this : this.load.postInfo(this);
    }
    /**
     * Whether post is in any categories.
     */
    get hasCategories() {
        return this.categories.size > 0;
    }
    /**
     * Reset post to initial load state without correlation to other posts,
     * meaning no groups (series) or previous/next links.
     */
    reset() {
        this.inferTitleAndKey(this.originalTitle);
        this.previous = null;
        this.next = null;
        return this.removeFromSeries();
    }
    /**
     * Remove post from a series but leave next/previous, title and keys as is.
     */
    removeFromSeries() {
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
    ungroup() {
        this.title = this.originalTitle;
        this.subTitle = null;
        this.key = tools_1.slug(this.originalTitle);
        this.seriesKey = null;
        this.partKey = null;
        return this.removeFromSeries();
    }
    /**
     * Flag post as the start of a series. Unlike other parts in the series, the
     * first part key is simply the series key.
     */
    makeSeriesStart() {
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
    hasKey(key) {
        return (this.key == key ||
            (tools_1.is.value(this.partKey) &&
                key == this.seriesKey + index_1.seriesKeySeparator + this.partKey));
    }
    /**
     * Set original provider title and infer series and subtitles based on
     * presence of configured subtitle separator (default is `:`). Then generate
     * key slug(s) from title(s).
     */
    inferTitleAndKey(title) {
        this.originalTitle = title;
        const re = new RegExp(index_1.config.subtitleSeparator + '\\s*', 'g');
        const parts = title.split(re);
        this.title = parts[0];
        if (parts.length > 1) {
            this.subTitle = parts[1];
            this.seriesKey = tools_1.slug(this.title);
            this.partKey = tools_1.slug(this.subTitle);
            this.key = this.seriesKey + index_1.seriesKeySeparator + this.partKey;
        }
        else {
            this.key = tools_1.slug(title);
        }
        return this;
    }
    /**
     * Ensure post details and photos are loaded.
     */
    ensureLoaded() {
        return Promise.all([this.getInfo(), this.getPhotos()]);
    }
    /**
     * Remove post details to force reload from data provider.
     */
    empty() {
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
    name() {
        return (this.title +
            (this.isPartial ? index_1.config.subtitleSeparator + ' ' + this.subTitle : ''));
    }
    /**
     * Update cached photo coordinates and overall bounds from photo objets.
     *
     * @see https://www.mapbox.com/api-documentation/#static
     */
    updatePhotoLocations() {
        let start = 1; // always skip first photo
        let total = this.photos.length;
        const locations = [];
        const bounds = { sw: [0, 0], ne: [0, 0] };
        if (total > index_1.config.maxPhotoMarkersOnMap) {
            start = 5; // skip the first few which are often just prep shots
            total = index_1.config.maxPhotoMarkersOnMap + 5;
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
        this.centroid = map_2.measure.centroid(locations);
    }
    /**
     * Map information for post.
     */
    async geoJSON() {
        let collection;
        if (!this.triedTrack) {
            collection = await providers_1.ensureMapProvider().track(this.key);
            this.triedTrack = true;
        }
        this.hasTrack = tools_1.is.value(collection);
        if (!this.hasTrack) {
            collection = map_1.geoJSON.features();
        }
        collection.features.push(...this.photos.map(p => p.geoJSON(this.partKey)));
        return collection;
    }
    /**
     * Stream GPX track for post. If the post doesn't have a track then the
     * stream will be returned unchanged.
     */
    gpx(stream) {
        return providers_1.ensureMapProvider()
            .gpx(this.key, stream)
            .catch(err => {
            const msg = tools_1.is.text(err) ? err : err.message;
            if (msg.includes('not found')) {
                this.triedTrack = true;
                this.hasTrack = false;
            }
            // re-throw the error so controller can respond
            return Promise.reject(err);
        });
    }
    /**
     * Link Data for post.
     */
    jsonLD() {
        return json_ld_1.forPost(this);
    }
    /**
     * Details for RSS/Atom feed. Rights default to full copyright.
     */
    rssJSON() {
        const author = {
            name: index_1.config.owner.name
        };
        if (tools_1.is.array(index_1.config.owner.urls, 1)) {
            author.uri = index_1.config.owner.urls[0];
        }
        return {
            id: index_1.config.site.url + '/' + this.key,
            title: this.name(),
            link: 'http://' + index_1.config.site.domain,
            published: this.createdOn,
            updated: this.updatedOn,
            rights: `Copyright © ${new Date().getFullYear()} ${index_1.config.owner.name}. All rights reserved.`,
            summary: this.description,
            author: author,
            content: index_1.config.site.url + '/' + this.key
        };
    }
}
exports.Post = Post;
