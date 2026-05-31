'use client'
import { useState } from 'react'
import type { Profile } from '@/lib/types'

interface UserRowProps {
  profile: Profile
  onApprove: (id: string, renders: number) => Promise<void>
}

export default function UserRow({ profile, onApprove }: UserRowProps) {
  const [renders, setRenders] = useState(10)
  const [loading, setLoading] = useState(false)

  async function handleApprove() {
    setLoading(true)
    await onApprove(profile.id, renders)
    setLoading(false)
  }

  return (
    <tr className="border-b border-gray-100 text-sm">
      <td className="py-3 px-2 text-right">{profile.email}</td>
      <td className="py-3 px-2">
        {profile.approved ? (
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">מאושר</span>
        ) : (
          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">ממתין</span>
        )}
      </td>
      <td className="py-3 px-2">{profile.renders_remaining}</td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={renders}
            onChange={e => setRenders(Number(e.target.value))}
            className="w-16 border border-gray-300 rounded px-2 py-1 text-xs"
          />
          <button
            onClick={handleApprove}
            disabled={loading}
            className="bg-amber-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {loading ? '...' : profile.approved ? 'עדכן' : 'אשר'}
          </button>
        </div>
      </td>
    </tr>
  )
}
