import { describe, it, expect } from 'vitest'
import { renderFlooring } from '../ai'

describe('renderFlooring', () => {
  it('throws NotImplementedError until AI provider is wired in', async () => {
    await expect(
      renderFlooring({
        roomImageUrl: 'https://example.com/room.jpg',
        modelId: '2410',
      })
    ).rejects.toThrow('OPENAI_API_KEY is not configured')
  })
})
