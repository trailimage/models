import '@toba/test';
import {
   postProvider,
   mapProvider,
   MockPostConfig,
   MockMapConfig,
   MockMapProvider,
   MockPostProvider
} from './.test-data';
import { PostProvider, MapProvider, VideoProvider } from './index';
import {
   ensurePostProvider,
   ensureMapProvider,
   ensureVideoProvider
} from './providers';

test('returns configured post provider', () => {
   let p: PostProvider<MockPostConfig> | undefined = undefined;
   let e: ReferenceError | undefined = undefined;
   try {
      p = ensurePostProvider();
   } catch (err) {
      e = err;
   }
   expect(p).toBe(postProvider);
   expect(e).toBeUndefined();
});

test('returns configured map provider', () => {
   let p: MapProvider<MockMapConfig> | undefined = undefined;
   let e: ReferenceError | undefined = undefined;
   try {
      p = ensureMapProvider();
   } catch (err) {
      e = err;
   }
   expect(p).toBe(mapProvider);
   expect(e).toBeUndefined();
});

test('throws error for unconfigured provider', () => {
   let p: VideoProvider<any> | undefined = undefined;
   let e: ReferenceError | undefined = undefined;
   try {
      p = ensureVideoProvider();
   } catch (err) {
      e = err;
   }
   expect(p).toBeUndefined();
   expect(e).toBeDefined();
   expect(e!.message).toBe('video provider is undefined');
});

test('can configure providers after instantiation', () => {
   const p1 = new MockMapProvider();
   p1.configure({ api: 'fake' });
   expect(p1).toBeDefined();

   const p2 = new MockPostProvider();
   p2.configure({ api: 'fake' });
   expect(p2).toBeDefined();
});
