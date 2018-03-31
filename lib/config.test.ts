import { config, ImageConfig } from './config';

const imageConfig: ImageConfig = {
   url: 'http://test.com/image.jpg',
   width: 100,
   height: 100
};

config.site = {
   domain: 'test.com',
   title: 'Test Site',
   subtitle: 'Where Tests Run Best',
   description: 'Test Site Description',
   url: 'http://www.test.com',
   postAlias: 'Test',
   logo: imageConfig,
   companyLogo: imageConfig
};

config.owner = {
   name: 'Test Person',
   image: imageConfig,
   email: 'owner@test.com',
   urls: ['http://testsite1.com', 'http://testsite2.com']
};

test('set singleton configuration', () => {
   expect(config.owner).toHaveProperty('name', 'Test Person');
});
