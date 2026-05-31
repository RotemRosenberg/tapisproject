'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import UserRow from '@/components/admin/UserRow'
import type { Profile } from '@/lib/types'
import Link from 'next/link'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const supabase = createClient()

  const loadUsers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'user')
      .order('created_at', { ascending: false })
    setUsers(data ?? [])
  }, [supabase])

  useEffect(() => { loadUsers() }, [loadUsers])

  async function handleApprove(userId: string, rendersCount: number) {
    await fetch(`/api/admin/users/${userId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ renders_count: rendersCount }),
    })
    loadUsers()
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ניהול משתמשים</h1>
        <nav className="flex gap-3 text-sm text-amber-600">
          <Link href="/admin/products" className="hover:underline">מוצרים</Link>
          <Link href="/admin/renders" className="hover:underline">רנדורים</Link>
        </nav>
      </div>
      {users.length === 0 ? (
        <p className="text-center text-gray-400 py-12">אין משתמשים רשומים עדיין</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="py-2 px-2 text-right">אימייל</th>
                <th className="py-2 px-2 text-right">סטטוס</th>
                <th className="py-2 px-2 text-right">רנדורים</th>
                <th className="py-2 px-2 text-right">פעולה</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <UserRow key={user.id} profile={user} onApprove={handleApprove} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
