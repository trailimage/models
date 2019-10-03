/**
 * URL of a specific photo size.
 */
export declare class PhotoSize {
    url: string;
    width: number;
    height: number;
    constructor(width: number, height: number, url: string);
    readonly isEmpty: boolean;
}
