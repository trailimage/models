import { JsonLD } from '@toba/json-ld';
import { Category, Post, VideoInfo } from './index';
export { serialize } from '@toba/json-ld';
export declare function owner(): JsonLD.Person;
/**
 * @see http://schema.org/docs/actions.html
 * @see http://schema.org/SearchAction
 * @see https://developers.google.com/structured-data/slsb-overview
 */
export declare function searchAction(): JsonLD.SearchAction;
export declare function discoverAction(post: Post): JsonLD.DiscoverAction;
/**
 * Link Data for a blog category.
 * @see https://developers.google.com/structured-data/breadcrumbs
 */
export declare function forCategory(category: Category, key?: string, homePage?: boolean): JsonLD.Blog | JsonLD.WebPage;
/**
 * Linked Data for YouTube video
 */
export declare function forVideo(v: VideoInfo): JsonLD.VideoObject;
/**
 * Linked Data for a blog post.
 * @see https://developers.google.com/structured-data/testing-tool/
 * @see https://developers.google.com/structured-data/rich-snippets/articles
 */
export declare function forPost(p: Post): JsonLD.BlogPosting;
