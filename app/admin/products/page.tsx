'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProductForm from '@/components/admin/ProductForm'
import Image from 'next/image'
import type { Product } from '@/lib/types'
import Link from 'next/link'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const supabase = createClient()

  const loadProducts = useCallback(async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data ?? [])
  }, [supabase])

  useEffect(() => { loadProducts() }, [loadProducts])

  async function handleDelete(product: Product) {
    if (!confirm(`למחוק את "${product.name}"?`)) return
    const path = product.image_url.split('/products/')[1]
    await supabase.storage.from('products').remove([path])
    await supabase.from('products').delete().eq('id', product.id)
    loadProducts()
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ניהול מוצרים</h1>
        <nav className="flex gap-3 text-sm text-amber-600">
          <Link href="/admin/users" className="hover:underline">משתמשים</Link>
          <Link href="/admin/renders" className="hover:underline">רנדורים</Link>
        </nav>
      </div>
      <div className="mb-6">
        <ProductForm onSuccess={loadProducts} />
      </div>
      <p className="text-sm text-gray-500 mb-3">{products.length} מוצרים בקטלוג</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {products.map(product => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="relative aspect-square w-full">
              <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="33vw" />
            </div>
            <div className="p-2">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-xs text-gray-400">{product.category}</p>
              <button
                onClick={() => handleDelete(product)}
                className="mt-2 text-xs text-red-500 hover:text-red-700"
              >
                🗑 מחק
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
