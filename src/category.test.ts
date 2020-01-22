import '@toba/test'
import { mockCategories } from './.test-data'

test('Assigns subcategories', () => {
   expect(mockCategories[0]).toBeDefined()
   expect(mockCategories[0].isParent).toBe(true)
   mockCategories[0].subcategories.forEach(s => {
      expect(s.isChild).toBe(true)
   })
})

test('Finds subcategories', () => {
   expect(mockCategories[0].getSubcategory('key0/key2')).toBeDefined()
   expect(mockCategories[0].getSubcategory('key0/key8')).not.toBeDefined()

   expect(mockCategories[0].has('key0/key2')).toBe(true)
   expect(mockCategories[0].has('key0/key9')).toBe(false)
})
