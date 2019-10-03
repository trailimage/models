"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const map_1 = require("@toba/map");
const index_1 = require("./index");
/**
 * Methods that provide model data.
 */
class DataProvider {
    constructor(baseConfig) {
        this.requiresAuthentication = true;
        this.isAuthenticated = false;
        if (baseConfig !== undefined) {
            this.config = baseConfig;
        }
    }
    /**
     * Apply configuration.
     */
    configure(newConfig) {
        if (tools_1.is.value(this.config)) {
            Object.assign(this.config, newConfig);
        }
        else {
            this.config = newConfig;
        }
    }
}
exports.DataProvider = DataProvider;
/**
 * Methods to load post-related data.
 */
class PostProvider extends DataProvider {
}
exports.PostProvider = PostProvider;
/**
 * Methods to load map-related data like GPX tracks.
 */
class MapProvider extends DataProvider {
    /**
     * @param baseConfig Configuration for provider API as well as the map module
     */
    constructor(baseConfig) {
        super(baseConfig);
        if (baseConfig !== undefined) {
            Object.assign(map_1.config, baseConfig);
        }
    }
    /**
     * Apply new configuration values to the provider API as well as the map
     * module. Technically, the values will be duplicated to both targets but
     * unused values will simply be ignored.
     */
    configure(newConfig) {
        super.configure(newConfig);
        Object.assign(map_1.config, newConfig);
    }
    /**
     * @param sourceKey configured `MapSource` key
     */
    source(sourceKey) {
        return map_1.loadSource(sourceKey);
    }
}
exports.MapProvider = MapProvider;
/**
 * Methods to load videos associated with a post.
 */
class VideoProvider extends DataProvider {
}
exports.VideoProvider = VideoProvider;
/**
 * Return configured post provider or throw a reference error.
 */
exports.ensurePostProvider = () => ensureProvider('post');
/**
 * Return configured map provider or throw a reference error.
 */
exports.ensureMapProvider = () => ensureProvider('map');
/**
 * Return configured video provider or throw a reference error.
 */
exports.ensureVideoProvider = () => ensureProvider('video');
/**
 * Return provider or throw a reference error.
 */
function ensureProvider(key) {
    if (tools_1.is.value(index_1.config.providers[key])) {
        return index_1.config.providers[key];
    }
    else {
        throw new ReferenceError(key + ' provider is undefined');
    }
}
