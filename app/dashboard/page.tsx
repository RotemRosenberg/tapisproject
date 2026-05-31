import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('approved, renders_remaining, role')
    .eq('id', user.id)
    .single()

  const { data: renders } = await supabase
    .from('renders')
    .select('*, products(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const isAdmin = profile?.role === 'admin'
  const isApproved = profile?.approved || isAdmin

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">האזור האישי שלי</h1>

      {!isApproved && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-amber-800 font-medium">⏳ בקשתך ממתינה לאישור האדמין</p>
          <p className="text-amber-600 text-sm mt-1">לאחר האישור תוכל להשתמש בוויזואלייזר</p>
        </div>
      )}

      {isApproved && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">רנדורים שנותרו</p>
            <p className="text-3xl font-bold text-amber-600">
              {isAdmin ? '∞' : profile?.renders_remaining ?? 0}
            </p>
          </div>
          <Link
            href="/visualizer"
            className="bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors"
          >
            צור תמונה ✨
          </Link>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4">היסטוריית תמונות</h2>
      {!renders || renders.length === 0 ? (
        <p className="text-gray-400 text-center py-8">עדיין לא יצרת תמונות</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {renders.map((render) => (
            <div key={render.id} className="rounded-xl overflow-hidden border border-gray-200 bg-white">
              <div className="relative aspect-video w-full">
                <Image src={render.result_url} alt="תוצאת רנדור" fill className="object-cover" sizes="50vw" />
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-500 truncate">{(render.products as any)?.name}</p>
                <p className="text-xs text-gray-400">{new Date(render.created_at).toLocaleDateString('he-IL')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
