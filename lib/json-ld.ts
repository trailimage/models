import {
   JsonLD,
   breadcrumb,
   image,
   ld,
   organization,
   place,
   webPage
} from '@toba/json-ld';
import { is } from '@toba/tools';
import { Category, Post, VideoInfo, blog, config } from './index';

export { serialize } from '@toba/json-ld';

const pathUrl = (path: string) => config.site.url + '/' + path;

const postPlace = (post: Post) =>
   place(config.site.url + '/' + post.key + '/map');

/**
 * Page prefixed with configured URL.
 */
const configPage = (path: string = '') => webPage(pathUrl(path));

/**
 * Configured organization.
 */
const configOrg = (): JsonLD.Organization =>
   organization(config.site.title, config.site.companyLogo);

export function owner(): JsonLD.Person {
   return ld<JsonLD.Person>(JsonLD.Type.Person, {
      name: config.owner.name,
      url: config.site.url + '/about',
      sameAs: config.owner.urls,
      mainEntityOfPage: webPage('about'),
      image: image(config.owner.image)
   });
}

/**
 * @see http://schema.org/docs/actions.html
 * @see http://schema.org/SearchAction
 * @see https://developers.google.com/structured-data/slsb-overview
 */
export function searchAction(): JsonLD.SearchAction {
   const qi = 'query-input';
   const placeHolder = 'search_term_string';

   return ld<JsonLD.SearchAction>(JsonLD.Type.SearchAction, {
      target: config.site.url + '/search?q={' + placeHolder + '}',
      [qi]: 'required name=' + placeHolder
   });
}

export function discoverAction(post: Post): JsonLD.DiscoverAction {
   return ld<JsonLD.DiscoverAction>(JsonLD.Type.DiscoverAction, {
      target: config.site.url + '/' + post.key + '/map'
   });
}

/**
 * Link Data for a blog category.
 * @see https://developers.google.com/structured-data/breadcrumbs
 */
export function forCategory(
   category: Category,
   key: string = category.key,
   homePage = false
): JsonLD.Blog | JsonLD.WebPage {
   if (homePage) {
      return ld<JsonLD.Blog>(JsonLD.Type.Blog, {
         url: config.site.url,
         name: config.site.title,
         author: owner(),
         description: config.site.description,
         mainEntityOfPage: configPage(),
         potentialAction: searchAction(),
         publisher: configOrg()
      });
   } else {
      const schema = webPage(key);
      let position = 1;

      schema.name = category.title;
      schema.publisher = configOrg();
      schema.breadcrumb = [breadcrumb(config.site.url, 'Home', position++)];

      if (category.key.includes('/')) {
         // implies category is a subscategory
         const rootKey = category.key.split('/')[0];
         const rootCategory = blog.categoryWithKey(rootKey);
         schema.breadcrumb.push(
            breadcrumb(
               config.site.url + '/' + rootCategory.key,
               rootCategory.title,
               position++
            )
         );
      }
      schema.breadcrumb.push(
         breadcrumb(
            config.site.url + '/' + category.key,
            category.title,
            position
         )
      );
      return schema;
   }
}

/**
 * Linked Data for YouTube video
 */
export function forVideo(v: VideoInfo): JsonLD.VideoObject {
   return v === null || v.empty
      ? null
      : ld<JsonLD.VideoObject>(JsonLD.Type.VideoObject, {
           contentUrl: 'https://www.youtube.com/watch?v=' + v.id,
           videoFrameSize: v.width + 'x' + v.height,
           description: null,
           uploadDate: null,
           thumbnailUrl: null
        });
}

/**
 * Linked Data for a blog post.
 * @see https://developers.google.com/structured-data/testing-tool/
 * @see https://developers.google.com/structured-data/rich-snippets/articles
 */
export function forPost(p: Post): JsonLD.BlogPosting {
   const categoryTitle = Array.from(p.categories.keys());
   const schema: JsonLD.BlogPosting = {
      author: owner(),
      name: p.title,
      headline: p.title,
      description: p.description,
      image: is.value(p.coverPhoto)
         ? image(p.coverPhoto.size.normal)
         : undefined,
      publisher: configOrg(),
      mainEntityOfPage: configPage(p.key),
      datePublished: p.createdOn,
      dateModified: p.updatedOn,
      articleSection: categoryTitle.join(',')
   };

   if (p.chronological && p.centroid != null) {
      schema.locationCreated = postPlace(p);
      schema.potentialAction = discoverAction(p);
   }

   // implement video when full source data is ready
   // ld.video = Factory.fromVideo(post.video);

   //if (is.empty(post.photoTagList)) {
   //	content.keywords = config.keywords;
   //} else {
   //	content.keywords = config.alwaysKeywords + post.photoTagList;
   //}

   if (is.value(p.coverPhoto) && is.value(p.coverPhoto.size.thumb)) {
      (schema.image as JsonLD.ImageObject).thumbnail = image(
         p.coverPhoto.size.thumb
      );
   }

   return ld<JsonLD.BlogPosting>(JsonLD.Type.BlogPosting, schema);
}
