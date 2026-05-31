'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProductGrid from '@/components/ProductGrid'
import RoomUpload from '@/components/RoomUpload'
import RenderResult from '@/components/RenderResult'
import type { Product, Profile } from '@/lib/types'

export default function VisualizerPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [profile, setProfile] = useState<Pick<Profile, 'renders_remaining' | 'role'> | null>(null)
  const [roomFile, setRoomFile] = useState<File | null>(null)
  const [roomPreview, setRoomPreview] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const supabase = createClient()

  useEffect(() => {
    supabase.from('products').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setProducts(data ?? []))

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('renders_remaining, role').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
    })
  }, [])

  function handleFileSelect(file: File) {
    setRoomFile(file)
    setRoomPreview(URL.createObjectURL(file))
    setResultUrl(null)
  }

  const isAdmin = profile?.role === 'admin'
  const canRender = !!roomFile && !!selectedProduct && (isAdmin || (profile?.renders_remaining ?? 0) > 0)

  async function handleRender() {
    if (!roomFile || !selectedProduct) return
    setStatus('loading')
    setErrorMsg('')

    const fd = new FormData()
    fd.append('room_image', roomFile)
    fd.append('product_id', selectedProduct)

    const res = await fetch('/api/render', { method: 'POST', body: fd })
    const json = await res.json()

    if (!res.ok) {
      setErrorMsg(json.error ?? 'שגיאה ביצירת התמונה')
      setStatus('error')
    } else {
      setResultUrl(json.result_url)
      setStatus('done')
      if (!isAdmin) {
        setProfile(p => p ? { ...p, renders_remaining: (p.renders_remaining ?? 1) - 1 } : p)
      }
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ויזואלייזר רצפה ✨</h1>
        {profile && (
          <span className="text-sm text-gray-500">
            {isAdmin ? 'אדמין — ללא הגבלה' : `${profile.renders_remaining} רנדורים נותרו`}
          </span>
        )}
      </div>

      <RoomUpload onFileSelect={handleFileSelect} preview={roomPreview} />

      <div>
        <label className="block text-sm font-medium mb-2">שלב 2 — בחר פרקט</label>
        <ProductGrid products={products} selected={selectedProduct ?? undefined} onSelect={setSelectedProduct} />
      </div>

      {!isAdmin && (profile?.renders_remaining ?? 1) <= 0 && (
        <p className="text-center text-red-500 text-sm">נגמרו הרנדורים שלך. פנה לחנות לקבלת עוד.</p>
      )}

      <button
        onClick={handleRender}
        disabled={!canRender || status === 'loading'}
        className="w-full bg-amber-500 text-white font-bold py-4 rounded-xl text-lg hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? '⏳ מעבד...' : '✨ צור תמונה'}
      </button>

      {status === 'error' && (
        <p className="text-center text-red-500 text-sm">{errorMsg}</p>
      )}

      {resultUrl && <RenderResult resultUrl={resultUrl} />}
    </main>
  )
}
