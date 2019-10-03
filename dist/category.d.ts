import { JsonLD, LinkData } from '@toba/json-ld';
import { Post } from './index';
/**
 * Post category.
 */
export declare class Category implements LinkData<JsonLD.Blog | JsonLD.WebPage> {
    title: string;
    /**
     * Slug style key that represents path to category.
     * @example parent/child
     */
    key: string;
    subcategories: Set<Category>;
    posts: Set<Post>;
    constructor(key: string, title: string);
    /**
     * Category with matching key or title.
     */
    getSubcategory(keyOrTitle: string): Category;
    /**
     * Whether subcategory is present with given key or title.
     */
    has(keyOrTitle: string): boolean;
    /**
     * Add subcategory and update its key to include parent.
     */
    add(subcat: Category): void;
    /**
     * Remove post from category and subcategories (primarily for testing).
     */
    removePost(post: Post): this;
    /**
     * Ensure photos and information are loaded for all posts.
     */
    ensureLoaded(): Promise<any>;
    /**
     * Whether category is a child as opposed to root category.
     */
    readonly isChild: boolean;
    /**
     * Whether category contains subcategories.
     */
    readonly isParent: boolean;
    jsonLD(): JsonLD.Blog | JsonLD.WebPage;
}
