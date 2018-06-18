import '@toba/test';
import {
   postProvider,
   mapProvider,
   MockPostConfig,
   MockMapConfig
} from './.test-data';
import { PostProvider, MapProvider, VideoProvider } from './index';
import {
   ensurePostProvider,
   ensureMapProvider,
   ensureVideoProvider
} from './providers';

test('returns configured post provider', () => {
   let p: PostProvider<MockPostConfig>;
   let e: ReferenceError;
   try {
      p = ensurePostProvider();
   } catch (err) {
      e = err;
   }
   expect(p).toBe(postProvider);
   expect(e).toBeUndefined();
});

test('returns configured map provider', () => {
   let p: MapProvider<MockMapConfig>;
   let e: ReferenceError;
   try {
      p = ensureMapProvider();
   } catch (err) {
      e = err;
   }
   expect(p).toBe(mapProvider);
   expect(e).toBeUndefined();
});

test('throws error for unconfigured provider', () => {
   let p: VideoProvider<any>;
   let e: ReferenceError;
   try {
      p = ensureVideoProvider();
   } catch (err) {
      e = err;
   }
   expect(p).toBeUndefined();
   expect(e).toBeDefined();
   expect(e.message).toBe('video provider is undefined');
});
