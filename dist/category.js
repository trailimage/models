"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const json_ld_1 = require("./json-ld");
/**
 * Post category.
 */
class Category {
    constructor(key, title) {
        this.title = null;
        /**
         * Slug style key that represents path to category.
         * @example parent/child
         */
        this.key = null;
        this.subcategories = new Set();
        this.posts = new Set();
        this.key = key;
        this.title = title;
    }
    //unload(keys:string|string[]):void;
    /**
     * Category with matching key or title.
     */
    getSubcategory(keyOrTitle) {
        return tools_1.findInSet(this.subcategories, c => c.title === keyOrTitle || c.key === keyOrTitle);
    }
    /**
     * Whether subcategory is present with given key or title.
     */
    has(keyOrTitle) {
        return this.getSubcategory(keyOrTitle) !== undefined;
    }
    /**
     * Add subcategory and update its key to include parent.
     */
    add(subcat) {
        if (tools_1.is.value(subcat)) {
            const oldKey = subcat.key;
            subcat.key = this.key + '/' + subcat.key;
            this.subcategories.add(subcat);
            // update posts that reference the category by its old key
            for (const p of subcat.posts) {
                p.categories.delete(oldKey);
                p.categories.set(subcat.key, subcat.title);
            }
        }
    }
    /**
     * Remove post from category and subcategories (primarily for testing).
     */
    removePost(post) {
        this.posts.delete(post);
        this.subcategories.forEach(s => {
            s.removePost(post);
        });
        return this;
    }
    /**
     * Ensure photos and information are loaded for all posts.
     */
    ensureLoaded() {
        return Promise.all(tools_1.mapSet(this.posts, p => p.getInfo().then(p => p.getPhotos())));
    }
    /**
     * Whether category is a child as opposed to root category.
     */
    get isChild() {
        return this.key.includes('/');
    }
    /**
     * Whether category contains subcategories.
     */
    get isParent() {
        return this.subcategories.size > 0;
    }
    jsonLD() {
        return json_ld_1.forCategory(this);
    }
}
exports.Category = Category;
