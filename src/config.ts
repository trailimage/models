import { Sort } from '@toba/tools'
import { MapProvider, PostProvider, VideoProvider } from './index'

export interface ImageConfig {
   url: string
   height: number
   width: number
}

export interface OwnerConfig {
   name: string
   image: ImageConfig
   email: string
   urls: string[]
}

export interface SiteConfig {
   domain: string
   title: string
   subtitle: string
   description: string
   url: string
   /**
    * Generic name for a post (usually just "post") that can be used in a
    * category page subtitle, e.g. "27 posts" and pluralized with just an `s`.
    */
   postAlias: string
   logo: ImageConfig
   companyLogo: ImageConfig
}

/**
 * Data providers the models will use to populate themselves.
 */
export interface ProviderConfig {
   post?: PostProvider<any>
   video?: VideoProvider<any>
   map?: MapProvider<any>
}

export interface Configuration {
   /**
    * Character(s) to be placed between post titles and subtitles.
    */
   subtitleSeparator: string

   /**
    * Regular expression to match photo artists whose EXIF should be normalized.
    */
   artistsToNormalize?: RegExp

   /**
    * Maximum number of photograph markers to render on map, useful to
    * accomodate performance or API limitations.
    */
   maxPhotoMarkersOnMap: number

   /**
    * Data providers the models will use to populate themselves.
    */
   providers: ProviderConfig

   /**
    * How the provider sorts posts determines how to make them chronological.
    */
   providerPostSort: Sort

   site?: SiteConfig
   owner?: OwnerConfig
}

export interface StrictConfiguration extends Configuration {
   site: SiteConfig
   owner: OwnerConfig
}

export function ensureConfig(): StrictConfiguration {
   const { site, owner } = config

   if (site === undefined || owner === undefined) {
      throw new ReferenceError(
         'Invalid model configuration (missing site, owner or provider information)'
      )
   }
   return { ...config, site, owner }
}

/**
 * `Configuration` singleton.
 */
export const config: Configuration = {
   subtitleSeparator: ':',
   maxPhotoMarkersOnMap: 100,
   providerPostSort: Sort.NewestFirst,
   providers: {}
}
