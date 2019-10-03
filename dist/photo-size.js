"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * URL of a specific photo size.
 */
class PhotoSize {
    constructor(width, height, url) {
        this.url = null;
        this.width = 0;
        this.height = 0;
        this.width = width;
        this.height = height;
        this.url = url;
    }
    get isEmpty() {
        return this.url === null && this.width === 0;
    }
}
exports.PhotoSize = PhotoSize;
