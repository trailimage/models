"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const map_1 = require("@toba/map");
const providers_1 = require("./providers");
class Photo {
    constructor(id, index) {
        /** Provider photo ID */
        this.id = null;
        this.sourceUrl = null;
        this.title = null;
        this.description = null;
        /** Tags applied to the photo. */
        this.tags = new Set();
        /** Whether this is the post's main photo. */
        this.primary = false;
        this.size = {};
        /** Size at which to preview the photo such as in search results. */
        this.preview = null;
        /** Normal photo size shown within post. */
        this.normal = null;
        /** Size shown when post photo is clicked for enlargmenet. */
        this.big = null;
        this._exif = null;
        this.id = id;
        this.index = index;
    }
    get load() {
        return providers_1.ensurePostProvider();
    }
    /**
     * Comma-delimited list of all tags applied to the photo.
     */
    get tagList() {
        return Array.from(this.tags).join(',');
    }
    async EXIF() {
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
    geoJSON(partKey) {
        const properties = { url: this.size.preview.url };
        if (partKey !== undefined) {
            // implies GeoJSON for single post
            properties.title = this.title;
            properties.partKey = partKey;
        }
        return {
            type: map_1.geoJSON.Type.Feature,
            properties,
            geometry: map_1.geoJSON.geometry(map_1.geoJSON.Type.Point, [
                this.longitude,
                this.latitude
            ])
        };
    }
}
exports.Photo = Photo;
/**
 * Simplistic outlier calculation identifies photos that are likely not part of
 * the main sequence.
 *
 * @see https://en.wikipedia.org/wiki/Outlier
 * @see http://www.wikihow.com/Calculate-Outliers
 */
function identifyOutliers(photos) {
    const fence = tools_1.boundary(photos.map(p => p.dateTaken.getTime()));
    if (fence !== null) {
        for (const p of photos) {
            const d = p.dateTaken.getTime();
            if (d > fence.max || d < fence.min) {
                p.outlierDate = true;
            }
        }
    }
}
exports.identifyOutliers = identifyOutliers;
