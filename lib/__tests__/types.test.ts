import { describe, it, expect } from 'vitest'
import type { Profile, Product, Render } from '../types'

describe('types', () => {
  it('Profile has required fields', () => {
    const profile: Profile = {
      id: 'uuid',
      email: 'test@test.com',
      role: 'user',
      approved: false,
      renders_remaining: 0,
      created_at: new Date().toISOString(),
    }
    expect(profile.role).toBe('user')
  })

  it('Product has required fields', () => {
    const product: Product = {
      id: 'uuid',
      name: 'Oak Natural',
      category: 'parquet',
      image_url: 'https://example.com/img.jpg',
      created_at: new Date().toISOString(),
    }
    expect(product.category).toBe('parquet')
  })
})
