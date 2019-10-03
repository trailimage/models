"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_ld_1 = require("@toba/json-ld");
const tools_1 = require("@toba/tools");
const index_1 = require("./index");
var json_ld_2 = require("@toba/json-ld");
exports.serialize = json_ld_2.serialize;
const pathUrl = (path) => index_1.config.site.url + '/' + path;
const postPlace = (post) => json_ld_1.place(index_1.config.site.url + '/' + post.key + '/map');
/**
 * Page prefixed with configured URL.
 */
const configPage = (path = '') => json_ld_1.webPage(pathUrl(path));
/**
 * Configured organization.
 */
const configOrg = () => json_ld_1.organization(index_1.config.site.title, index_1.config.site.companyLogo);
function owner() {
    return json_ld_1.ld(json_ld_1.JsonLD.Type.Person, {
        name: index_1.config.owner.name,
        url: index_1.config.site.url + '/about',
        sameAs: index_1.config.owner.urls,
        mainEntityOfPage: json_ld_1.webPage('about'),
        image: json_ld_1.image(index_1.config.owner.image)
    });
}
exports.owner = owner;
/**
 * @see http://schema.org/docs/actions.html
 * @see http://schema.org/SearchAction
 * @see https://developers.google.com/structured-data/slsb-overview
 */
function searchAction() {
    const qi = 'query-input';
    const placeHolder = 'search_term_string';
    return json_ld_1.ld(json_ld_1.JsonLD.Type.SearchAction, {
        target: index_1.config.site.url + '/search?q={' + placeHolder + '}',
        [qi]: 'required name=' + placeHolder
    });
}
exports.searchAction = searchAction;
function discoverAction(post) {
    return json_ld_1.ld(json_ld_1.JsonLD.Type.DiscoverAction, {
        target: index_1.config.site.url + '/' + post.key + '/map'
    });
}
exports.discoverAction = discoverAction;
/**
 * Link Data for a blog category.
 * @see https://developers.google.com/structured-data/breadcrumbs
 */
function forCategory(category, key = category.key, homePage = false) {
    if (homePage) {
        return json_ld_1.ld(json_ld_1.JsonLD.Type.Blog, {
            url: index_1.config.site.url,
            name: index_1.config.site.title,
            author: owner(),
            description: index_1.config.site.description,
            mainEntityOfPage: configPage(),
            potentialAction: searchAction(),
            publisher: configOrg()
        });
    }
    else {
        const schema = json_ld_1.webPage(key);
        let position = 1;
        schema.name = category.title;
        schema.publisher = configOrg();
        schema.breadcrumb = [json_ld_1.breadcrumb(index_1.config.site.url, 'Home', position++)];
        if (category.key.includes('/')) {
            // implies category is a subscategory
            const rootKey = category.key.split('/')[0];
            const rootCategory = index_1.blog.categoryWithKey(rootKey);
            schema.breadcrumb.push(json_ld_1.breadcrumb(index_1.config.site.url + '/' + rootCategory.key, rootCategory.title, position++));
        }
        schema.breadcrumb.push(json_ld_1.breadcrumb(index_1.config.site.url + '/' + category.key, category.title, position));
        return schema;
    }
}
exports.forCategory = forCategory;
/**
 * Linked Data for YouTube video
 */
function forVideo(v) {
    return v === null || v.empty
        ? null
        : json_ld_1.ld(json_ld_1.JsonLD.Type.VideoObject, {
            contentUrl: 'https://www.youtube.com/watch?v=' + v.id,
            videoFrameSize: v.width + 'x' + v.height,
            description: null,
            uploadDate: null,
            thumbnailUrl: null
        });
}
exports.forVideo = forVideo;
/**
 * Linked Data for a blog post.
 * @see https://developers.google.com/structured-data/testing-tool/
 * @see https://developers.google.com/structured-data/rich-snippets/articles
 */
function forPost(p) {
    const categoryTitle = Array.from(p.categories.keys());
    const schema = {
        author: owner(),
        name: p.title,
        headline: p.title,
        description: p.description,
        image: tools_1.is.value(p.coverPhoto)
            ? json_ld_1.image(p.coverPhoto.size.normal)
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
    if (tools_1.is.value(p.coverPhoto) && tools_1.is.value(p.coverPhoto.size.thumb)) {
        schema.image.thumbnail = json_ld_1.image(p.coverPhoto.size.thumb);
    }
    return json_ld_1.ld(json_ld_1.JsonLD.Type.BlogPosting, schema);
}
exports.forPost = forPost;
