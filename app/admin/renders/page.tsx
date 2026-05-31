import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'

export default async function AdminRendersPage() {
  const supabase = await createClient()

  const { data: renders } = await supabase
    .from('renders')
    .select('*, profiles(email), products(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">כל הרנדורים</h1>
        <nav className="flex gap-3 text-sm text-amber-600">
          <Link href="/admin/products" className="hover:underline">מוצרים</Link>
          <Link href="/admin/users" className="hover:underline">משתמשים</Link>
        </nav>
      </div>
      <p className="text-sm text-gray-500 mb-4">{renders?.length ?? 0} רנדורים סה"כ</p>
      <div className="space-y-3">
        {renders?.map(render => (
          <div key={render.id} className="bg-white border border-gray-200 rounded-xl p-3 flex gap-3 items-center">
            <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={render.result_url} alt="רנדור" fill className="object-cover" sizes="80px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{(render.profiles as any)?.email}</p>
              <p className="text-xs text-gray-400">{(render.products as any)?.name}</p>
              <p className="text-xs text-gray-300">{new Date(render.created_at).toLocaleString('he-IL')}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
