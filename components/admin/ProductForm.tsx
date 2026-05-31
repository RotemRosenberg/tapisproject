'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProductCategory } from '@/lib/types'

interface ProductFormProps {
  onSuccess: () => void
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ProductCategory>('parquet')
  const [modelId, setModelId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('בחר תמונת קטלוג'); return }
    if (!modelId.trim()) { setError('הכנס Model ID'); return }
    setStatus('loading')
    setError('')

    const path = `${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('products').upload(path, file)
    if (uploadError) { setError(uploadError.message); setStatus('error'); return }

    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)

    const { error: insertError } = await supabase
      .from('products')
      .insert({ name, category, image_url: publicUrl, model_id: modelId.trim() })

    if (insertError) { setError(insertError.message); setStatus('error'); return }

    setName(''); setFile(null); setCategory('parquet'); setModelId('')
    setStatus('idle')
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold">הוסף מוצר חדש</h3>
      <input
        type="text"
        placeholder="שם המוצר (לדוג׳ HAVANA)"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <input
        type="text"
        placeholder="Model ID (לדוג׳ 2410)"
        value={modelId}
        onChange={e => setModelId(e.target.value)}
        required
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
      />
      <select
        value={category}
        onChange={e => setCategory(e.target.value as ProductCategory)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <option value="parquet">פרקט</option>
        <option value="carpet">שטיח</option>
        <option value="other">אחר</option>
      </select>
      <div>
        <p className="text-xs text-gray-500 mb-1">תמונת קטלוג (catalog.jpg — מוצגת ללקוח)</p>
        <input
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          required
          className="w-full text-sm"
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-amber-500 text-white font-semibold py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors text-sm"
      >
        {status === 'loading' ? 'מעלה...' : '+ הוסף מוצר'}
      </button>
    </form>
  )
}
