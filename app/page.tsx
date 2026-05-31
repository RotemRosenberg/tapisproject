import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/ProductGrid'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tapis</h1>
        <p className="text-gray-500 mb-4">ראה את הרצפה החדשה שלך לפני שאתה קונה</p>
        <Link
          href="/visualizer"
          className="inline-block bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors"
        >
          נסה על תמונה שלך ✨
        </Link>
      </div>
      <h2 className="text-xl font-semibold mb-4">הקטלוג שלנו</h2>
      <ProductGrid products={products ?? []} />
    </main>
  )
}
