/// <reference types="node" />
import { JsonLD, LinkData } from '@toba/json-ld';
import { IMappable } from '@toba/map';
import { ISyndicate, AtomEntry } from '@toba/feed';
import { MapBounds, Location } from '@toba/map';
import { Photo, VideoInfo } from './index';
import { Writable } from 'stream';
export declare class Post implements LinkData<JsonLD.BlogPosting>, IMappable<GeoJSON.GeometryObject>, ISyndicate<AtomEntry> {
    /** Provider ID */
    id: string;
    /**
     * Unique identifer used as the URL slug. If post is part of a series then
     * the key is compound.
     *
     * @example brother-ride/day-10
     */
    key: string;
    title: string;
    subTitle?: string;
    description: string;
    /** Description that includes computed photo and video count. */
    longDescription: string;
    happenedOn: Date;
    createdOn: Date;
    updatedOn: Date;
    /**
     * Whether post pictures occurred sequentially in a specific time range as
     * opposed to, for example, a themed set of images from various times.
     */
    chronological: boolean;
    private originalTitle;
    photosLoaded: boolean;
    bigThumbURL: string;
    smallThumbURL: string;
    photos: Photo[];
    photoCount: number;
    photoTagList: string;
    /**
     * Photo coordinates stored as longitude and latitude used to invoke map
     * APIs.
     */
    photoLocations: number[][];
    /** Top left and bottom right coordinates of photos. */
    bounds: MapBounds;
    /** Center of photo */
    centroid: Location;
    coverPhoto: Photo;
    /** Whether post is featured in main navigation */
    feature: boolean;
    /** Category titles mapped to category keys */
    categories: Map<string, string>;
    /**
     * Whether post information has been loaded. If not then post only contains
     * summary data supplied by its category.
     */
    infoLoaded: boolean;
    /**
     * Whether attempt was made to load GPX track. This can be used to prevent
     * unecessarily retrying track retrieval.
     */
    triedTrack: boolean;
    /** Whether GPX track was found for the post. */
    hasTrack: boolean;
    /** Next chronological post (newer). */
    next: Post;
    /** Previous chronological post (older). */
    previous: Post;
    /** Position of this post in a series or 0 if it's not in a series. */
    part: number;
    /** Whether post is part of a series. */
    isPartial: boolean;
    /** Whether next post is part of the same series. */
    nextIsPart: boolean;
    /** Whether previous post is part of the same series. */
    previousIsPart: boolean;
    /** Total number of posts in the series. */
    totalParts: number;
    /** Whether this post is the first in a series. */
    isSeriesStart: boolean;
    /**
     * Portion of key that is common among series members. For example, with
     * `brother-ride/day-10` the `seriesKey` is `brother-ride`.
     */
    seriesKey: string;
    /**
     * Portion of key that is unique among series members. For example, with
     * `brother-ride/day-10` the `partKey` is `day-10`.
     */
    partKey: string;
    video: VideoInfo;
    private readonly load;
    /**
     * Retrieve post photos.
     */
    getPhotos(): Promise<Photo[]>;
    /**
     * Retrieve post details like title and description.
     */
    getInfo(): Promise<Post>;
    /**
     * Whether post is in any categories.
     */
    readonly hasCategories: boolean;
    /**
     * Reset post to initial load state without correlation to other posts,
     * meaning no groups (series) or previous/next links.
     */
    reset(): this;
    /**
     * Remove post from a series but leave next/previous, title and keys as is.
     */
    private removeFromSeries;
    /**
     * Ungroup posts that were incorrectly identified as part of a series because
     * of a title that coincidentally matched a series pattern. This does not
     * correctly handle ungrouping posts that are a legitimate series member
     * since other series members are not also updated.
     */
    ungroup(): this;
    /**
     * Flag post as the start of a series. Unlike other parts in the series, the
     * first part key is simply the series key.
     */
    makeSeriesStart(): this;
    /**
     * Whether key matches series or non-series post.
     *
     * Match should still succeed if searching for a compound key even though
     * first post in a series doesn't include the subtitle slug. For example,
     * searching `series-1/title-1` should match the first post in "Series 1"
     * even though it's key is simply `series-1`.
     */
    hasKey(key: string): boolean;
    /**
     * Set original provider title and infer series and subtitles based on
     * presence of configured subtitle separator (default is `:`). Then generate
     * key slug(s) from title(s).
     */
    inferTitleAndKey(title: string): this;
    /**
     * Ensure post details and photos are loaded.
     */
    ensureLoaded(): Promise<[Post, Photo[]]>;
    /**
     * Remove post details to force reload from data provider.
     */
    empty(): this;
    /**
     * Title and optional subtitle.
     */
    name(): string;
    /**
     * Update cached photo coordinates and overall bounds from photo objets.
     *
     * @see https://www.mapbox.com/api-documentation/#static
     */
    updatePhotoLocations(): void;
    /**
     * Map information for post.
     */
    geoJSON(): Promise<import("geojson").FeatureCollection<import("geojson").GeometryObject, {
        [name: string]: any;
    }>>;
    /**
     * Stream GPX track for post. If the post doesn't have a track then the
     * stream will be returned unchanged.
     */
    gpx(stream: Writable): Promise<void>;
    /**
     * Link Data for post.
     */
    jsonLD(): JsonLD.BlogPosting;
    /**
     * Details for RSS/Atom feed. Rights default to full copyright.
     */
    rssJSON(): AtomEntry;
}
