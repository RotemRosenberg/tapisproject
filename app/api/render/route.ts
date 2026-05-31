import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { renderFlooring } from '@/lib/ai'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('approved, role, renders_remaining')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  if (!profile?.approved && !isAdmin) {
    return NextResponse.json({ error: 'Account not approved' }, { status: 403 })
  }

  if (!isAdmin && (profile?.renders_remaining ?? 0) <= 0) {
    return NextResponse.json({ error: 'No renders remaining' }, { status: 403 })
  }

  const formData = await request.formData()
  const roomImage = formData.get('room_image') as File | null
  const productId = formData.get('product_id') as string | null

  if (!roomImage || !productId) {
    return NextResponse.json({ error: 'Missing room_image or product_id' }, { status: 400 })
  }

  if (roomImage.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Image too large (max 10MB)' }, { status: 422 })
  }

  const adminClient = createAdminClient()
  const roomPath = `${user.id}/${Date.now()}-room.${roomImage.name.split('.').pop()}`
  const { error: uploadError } = await adminClient.storage
    .from('room-images')
    .upload(roomPath, roomImage)

  if (uploadError) {
    return NextResponse.json({ error: 'Failed to upload room image' }, { status: 500 })
  }

  const { data: roomUrlData } = adminClient.storage.from('room-images').getPublicUrl(roomPath)

  const { data: product } = await supabase
    .from('products')
    .select('image_url')
    .eq('id', productId)
    .single()

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  let resultUrl: string
  try {
    resultUrl = await renderFlooring({
      roomImageUrl: roomUrlData.publicUrl,
      flooringImageUrl: product.image_url,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI rendering failed' },
      { status: 500 }
    )
  }

  await adminClient.from('renders').insert({
    user_id: user.id,
    product_id: productId,
    room_image_url: roomUrlData.publicUrl,
    result_url: resultUrl,
  })

  if (!isAdmin) {
    await adminClient
      .from('profiles')
      .update({ renders_remaining: (profile?.renders_remaining ?? 1) - 1 })
      .eq('id', user.id)
  }

  return NextResponse.json({ result_url: resultUrl })
}
