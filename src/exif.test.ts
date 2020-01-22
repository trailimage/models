import '@toba/test'
import { mockEXIF } from './.test-data'

test('Sanitizes values for configured artists', () => {
   expect(mockEXIF[0].artist).toBe('Artist 0')
   expect(mockEXIF[0].model).toBe('Sony α7ʀ II')
   expect(mockEXIF[0].software).toBe('Lightroom')
   expect(mockEXIF[0].compensation).toBe('No')
})

test('Leaves values unchanged for unconfigured artists', () => {
   expect(mockEXIF[2].model).toBe('ILCE-7RM2')
})
