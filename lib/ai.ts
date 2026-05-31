import OpenAI from 'openai'
import { toFile } from 'openai/uploads'
import { createAdminClient } from './supabase/admin'

interface ModelJson {
  model_id: string
  model_name: string
  collection: string
  required_prompt_line: string
  source_of_truth_policy?: { primary_file?: string }
  product: {
    plank_width_mm: number
    plank_length_mm: number
    finish: string
  }
}

function buildPrompt(model: ModelJson, promptText: string): string {
  return `${promptText}

---

MODEL IDENTITY:
ID: ${model.model_id}
NAME: ${model.model_name}
COLLECTION: ${model.collection}
REQUIRED SIGNAL: ${model.required_prompt_line}

PLANK DIMENSIONS: ${model.product.plank_width_mm}mm x ${model.product.plank_length_mm}mm
FINISH: ${model.product.finish}

---

Image 1 = room photo. Source of the room. Replace ONLY the floor.
Image 2 = approved master reference. LOCKED material source of truth. Match this exactly.
`
}

export async function renderFlooring(input: {
  roomImageUrl: string
  modelId: string
}): Promise<string> {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const supabase = createAdminClient()

  // 1. Load model.json and prompt first
  const [modelJsonRes, promptRes] = await Promise.all([
    supabase.storage.from('models').download(`${input.modelId}/model.json`),
    supabase.storage.from('models').download(`${input.modelId}/prompt.txt`),
  ])

  if (modelJsonRes.error) throw new Error(`Model not found: ${input.modelId}`)
  if (promptRes.error) throw new Error(`Prompt not found for model: ${input.modelId}`)

  const modelJson: ModelJson = JSON.parse(await modelJsonRes.data.text())
  const promptText = await promptRes.data.text()

  // 2. Load master image — filename from model.json or fallback
  const masterFilename = modelJson.source_of_truth_policy?.primary_file ?? 'approved_master.jpg'
  let masterRes = await supabase.storage.from('models').download(`${input.modelId}/${masterFilename}`)

  // Try .jpeg extension if .jpg not found (and vice versa)
  if (masterRes.error) {
    const alt = masterFilename.endsWith('.jpg')
      ? masterFilename.replace('.jpg', '.jpeg')
      : masterFilename.replace('.jpeg', '.jpg')
    masterRes = await supabase.storage.from('models').download(`${input.modelId}/${alt}`)
  }

  if (masterRes.error) throw new Error(`Master image not found for model: ${input.modelId}`)

  const masterBuffer = Buffer.from(await masterRes.data.arrayBuffer())

  // 2. Download room image
  const roomResponse = await fetch(input.roomImageUrl)
  if (!roomResponse.ok) throw new Error('Failed to download room image')
  const roomBuffer = Buffer.from(await roomResponse.arrayBuffer())

  // 3. Build final prompt
  const finalPrompt = buildPrompt(modelJson, promptText)

  // 4. Call OpenAI Images API
  const roomFile = await toFile(roomBuffer, 'room.jpg', { type: 'image/jpeg' })
  const masterFile = await toFile(masterBuffer, 'master.jpg', { type: 'image/jpeg' })

  const response = await openai.images.edit({
    model: 'gpt-image-1',
    image: [roomFile, masterFile],
    prompt: finalPrompt,
    n: 1,
    size: '1024x1024',
  })

  const imageBase64 = response.data?.[0]?.b64_json
  if (!imageBase64) throw new Error('No image returned from OpenAI')

  // 5. Upload result to Supabase Storage
  const imageBuffer = Buffer.from(imageBase64, 'base64')
  const resultPath = `${crypto.randomUUID()}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('renders')
    .upload(resultPath, imageBuffer, { contentType: 'image/jpeg' })

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

  // 6. Return signed URL (valid 1 year — renders bucket is private)
  const { data: signedData, error: signedError } = await supabase.storage
    .from('renders')
    .createSignedUrl(resultPath, 60 * 60 * 24 * 365)

  if (signedError || !signedData) throw new Error('Failed to create signed URL for result')

  return signedData.signedUrl
}
