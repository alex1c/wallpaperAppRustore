import { appConfig } from '@/config/app-config'

describe('project smoke', () => {
  it('loads app configuration', () => {
    expect(appConfig.productId).toBe('wallpaper-calculator')
    expect(appConfig.defaultLocale).toBe('ru')
  })
})
