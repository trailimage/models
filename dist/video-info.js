"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_ld_1 = require("./json-ld");
class VideoInfo {
    constructor(id, width, height) {
        this.id = null;
        this.width = 0;
        this.height = 0;
        this.id = id;
        this.width = width;
        this.height = height;
    }
    get empty() {
        return this.width === 0 || this.height === 0;
    }
    jsonLD() {
        return json_ld_1.forVideo(this);
    }
}
exports.VideoInfo = VideoInfo;
