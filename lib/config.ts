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

export interface Configuration {
   subtitleSeparator: string;
   site: SiteConfig;
   owner: OwnerConfig;
}

export const config: Configuration = {
   subtitleSeparator: ':',
   site: null,
   owner: null
};
