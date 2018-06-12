import '@toba/test';
import { postProvider } from './.test-data';
import { PostProvider, MapProvider } from './index';
import { ensurePostProvider, ensureMapProvider } from './providers';

test('Returns configured provider', () => {
   let p: PostProvider;
   let e: ReferenceError;
   try {
      p = ensurePostProvider();
   } catch (err) {
      e = err;
   }
   expect(p).toBe(postProvider);
   expect(e).toBeUndefined();
});

test('Throws error for unconfigured provider', () => {
   let p: MapProvider;
   let e: ReferenceError;
   try {
      p = ensureMapProvider();
   } catch (err) {
      e = err;
   }
   expect(p).toBeUndefined();
   expect(e).toBeDefined();
   expect(e.message).toBe('map provider is undefined');
});
