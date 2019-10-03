"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
/**
 * `Configuration` singleton.
 */
exports.config = {
    subtitleSeparator: ':',
    maxPhotoMarkersOnMap: 100,
    providerPostSort: tools_1.Sort.NewestFirst,
    site: null,
    owner: null,
    providers: { post: null, video: null, map: null }
};
