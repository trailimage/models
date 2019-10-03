import { IMappable } from '@toba/map';
import { PhotoSize, EXIF } from './index';
export declare class Photo implements IMappable<GeoJSON.Point> {
    /** Provider photo ID */
    id: string;
    /** Position of photo within post. */
    index: number;
    sourceUrl: string;
    title: string;
    description: string;
    /** Tags applied to the photo. */
    tags: Set<string>;
    dateTaken: Date;
    latitude: number;
    longitude: number;
    /** Whether this is the post's main photo. */
    primary: boolean;
    size: {
        [key: string]: PhotoSize;
    };
    /** Size at which to preview the photo such as in search results. */
    preview: PhotoSize;
    /** Normal photo size shown within post. */
    normal: PhotoSize;
    /** Size shown when post photo is clicked for enlargmenet. */
    big: PhotoSize;
    private _exif;
    /**
     * Whether taken date is an outlier compared to other photos in the same
     * post. Outliers may be removed from mini-maps so the maps aren't overly
     * zoomed-out to accomodate contextual photos taken days before or after
     * the main post.
     *
     * @see http://www.wikihow.com/Calculate-Outliers
     */
    outlierDate?: boolean;
    constructor(id: string, index: number);
    private readonly load;
    /**
     * Comma-delimited list of all tags applied to the photo.
     */
    readonly tagList: string;
    EXIF(): Promise<EXIF>;
    /**
     * Generate GeoJSON for photo feature.
     *
     * @param partKey Optional series part that photo post belongs to, used to
     * generate link from map info box back to post URL
     */
    geoJSON(partKey?: string): GeoJSON.Feature<GeoJSON.Point>;
}
/**
 * Simplistic outlier calculation identifies photos that are likely not part of
 * the main sequence.
 *
 * @see https://en.wikipedia.org/wiki/Outlier
 * @see http://www.wikihow.com/Calculate-Outliers
 */
export declare function identifyOutliers(photos: Photo[]): void;
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
