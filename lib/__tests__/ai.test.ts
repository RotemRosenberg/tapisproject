import { describe, it, expect } from 'vitest'
import { renderFlooring } from '../ai'

describe('renderFlooring', () => {
  it('throws NotImplementedError until AI provider is wired in', async () => {
    await expect(
      renderFlooring({
        roomImageUrl: 'https://example.com/room.jpg',
        flooringImageUrl: 'https://example.com/floor.jpg',
      })
    ).rejects.toThrow('AI service not yet configured')
  })
})
