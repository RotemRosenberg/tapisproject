export interface AIRenderInput {
  roomImageUrl: string
  flooringImageUrl: string
}

export async function renderFlooring(input: AIRenderInput): Promise<string> {
  // Replace this function body when the AI provider is chosen.
  // Must return a public URL pointing to the result image.
  throw new Error('AI service not yet configured. Implement renderFlooring() in lib/ai.ts')
}
