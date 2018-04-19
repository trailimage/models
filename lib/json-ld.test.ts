import '@toba/test';
import { mockCategories, mockPosts } from './.test-data';

test('Creates link data for posts', () => {
   const schema = mockPosts[0].linkDataJSON();

   expect(schema).toHaveAllProperties(
      'author',
      'name',
      'publisher',
      'headline',
      'articleSection'
   );
   expect(schema).toHaveProperty('@context', 'http://schema.org');
   // expect(schema.name).toBe('Spring Fish & Chips');
   // expect(schema.headline).toBe(schema.name);
   // expect(schema.author).toHaveProperty('name', 'Jason Abbott');
   // expect(schema.publisher).toHaveProperty('name', 'Trail Image');
   // expect(schema.articleSection).toContain('Family');
});

test('creates link data for categories', () => {
   expect(mockCategories[0].linkDataJSON()).toMatchSnapshot();
});

// test('serializes link data', () => {
//    const target =
//       '{"author":' +
//       '{"name":"Jason Abbott","url":"http://www.trailimage.com/about","sameAs":[' +
//       '"https://www.facebook.com/jason.e.abbott",' +
//       '"http://www.flickr.com/photos/boise",' +
//       '"https://www.youtube.com/user/trailimage",' +
//       '"https://twitter.com/trailimage"' +
//       '],"mainEntityOfPage":{"@id":"http://www.trailimage.com/about","@type":"WebPage"},' +
//       '"image":{"url":"http://www.trailimage.com/img/face4_300px.jpg","width":300,"height":300,"@type":"ImageObject"},' +
//       '"@type":"Person"},"name":"Spring Fish & Chips","headline":"Spring Fish & Chips",' +
//       '"description":"Photography’s highest form is sometimes likened to poetry, capturing experiences that defy denotation. Both are diminished to the extent they require explanation, some say, so hopefully coercing them to explain each other is a right born of two wrongs.",' +
//       '"image":{"url":"https://farm9.staticflickr.com/8109/8459503474_7fcb90b3e9_b.jpg","width":1024,"height":688,"@type":"ImageObject"},' +
//       '"publisher":{"name":"Trail Image","logo":{"url":"http://www.trailimage.com/img/logo-title.png","width":308,"height":60,"@type":"ImageObject"},' +
//       '"@type":"Organization"},' +
//       '"mainEntityOfPage":{"@id":"http://www.trailimage.com/spring-fish--chips","@type":"WebPage"},' +
//       '"datePublished":"2013-02-09T19:35:56.000Z",' +
//       '"dateModified":"2016-06-04T22:07:20.000Z",' +
//       '"articleSection":"2016,Boise River,Family,Bicycle",' +
//       '"locationCreated":{"hasMap":"http://www.trailimage.com/spring-fish--chips/map","@type":"Place"},' +
//       '"potentialAction":{"target":"http://www.trailimage.com/spring-fish--chips/map","@type":"DiscoverAction"},' +
//       '"@type":"BlogPosting","@context":"http://schema.org"}';

//    expect(post.linkDataString()).toBe(target);
// });
