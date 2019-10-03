/**
 * EXIF data for a photo.
 */
export declare class EXIF {
    artist: string;
    compensation: string;
    time: string;
    fNumber: number;
    focalLength: number;
    ISO: number;
    lens: string;
    model: string;
    software: string;
    /** Whether raw values have been formatted. */
    sanitized: boolean;
    sanitize(): EXIF;
}
