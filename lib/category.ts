import { is, mapSet, findInSet } from '@toba/tools';
import { JsonLD, LinkData } from '@toba/json-ld';
import { forCategory } from './json-ld';
import { Post } from '../index';

/**
 * Post category.
 */
export class Category extends LinkData<JsonLD.Blog | JsonLD.WebPage> {
   title: string = null;
   /**
    * Slug style key that represents path to category.
    * @example parent/child
    */
   key: string = null;
   subcategories: Set<Category> = new Set();
   posts: Set<Post> = new Set();

   constructor(key: string, title: string) {
      super();
      this.key = key;
      this.title = title;
   }

   //unload(keys:string|string[]):void;

   getSubcategory(key: string): Category {
      return findInSet(
         this.subcategories,
         c => c.title === key || c.key === key
      );
   }

   /**
    * Whether subcategory is present with given key.
    */
   has(key: string): boolean {
      return this.getSubcategory(key) !== undefined;
   }

   /**
    * Add subcategory and update its key to include parent.
    */
   add(subcat: Category) {
      if (is.value(subcat)) {
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
   removePost(post: Post): this {
      this.posts.delete(post);
      this.subcategories.forEach(s => {
         s.removePost(post);
      });
      return this;
   }

   /**
    * Ensure photos and information are loaded for all posts.
    */
   ensureLoaded(): Promise<any> {
      return Promise.all(
         mapSet(this.posts, p => p.getInfo().then(p => p.getPhotos()))
      );
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

   linkDataJSON(): JsonLD.Blog | JsonLD.WebPage {
      return forCategory(this);
   }
}
