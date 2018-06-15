import { MapProvider, PostProvider, VideoProvider } from './index';

export interface ImageConfig {
   url: string;
   height: number;
   width: number;
}

export interface OwnerConfig {
   name: string;
   image: ImageConfig;
   email: string;
   urls: string[];
}

export interface SiteConfig {
   domain: string;
   title: string;
   subtitle: string;
   description: string;
   url: string;
   postAlias: string;
   logo: ImageConfig;
   companyLogo: ImageConfig;
}

/**
 * Data providers the models will use to populate themselves.
 */
export interface ProviderConfig {
   post: PostProvider<any>;
   video: VideoProvider<any>;
   map: MapProvider<any>;
}

export interface Configuration {
   /**
    * Character(s) to be placed between post titles and subtitles.
    */
   subtitleSeparator: string;

   /**
    * Regular expression to match photo artists whose EXIF should be normalized.
    */
   artistsToNormalize?: RegExp;

   /**
    * Maximum number of photograph markers to render on map, useful to
    * accomodate performance or API limitations.
    */
   maxPhotoMarkersOnMap: number;

   /**
    * Data providers the models will use to populate themselves.
    */
   providers: ProviderConfig;

   site: SiteConfig;
   owner: OwnerConfig;
}

/**
 * `Configuration` singleton.
 */
export const config: Configuration = {
   subtitleSeparator: ':',
   maxPhotoMarkersOnMap: 100,
   site: null,
   owner: null,
   providers: { post: null, video: null, map: null }
};
