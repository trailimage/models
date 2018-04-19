import '@toba/test';
import './.test-data';
import { config } from './config';

test('Creates singleton configuration', () => {
   expect(config.owner).toHaveProperty('name', 'Test Person');
});
