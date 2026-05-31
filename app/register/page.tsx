'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setError('')

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setStatus('error')
    } else {
      setStatus('success')
    }
  }

  if (status === 'success') {
    return (
      <main className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-xl font-semibold mb-2">ההרשמה הצליחה!</h2>
        <p className="text-gray-500">בקשתך נשלחה לאדמין. תקבל גישה לאחר אישור.</p>
      </main>
    )
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6 text-center">הרשמה</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">אימייל</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">סיסמה</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-amber-500 text-white font-semibold py-3 rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          {status === 'loading' ? 'נרשם...' : 'הירשם'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        יש לך חשבון?{' '}
        <Link href="/login" className="text-amber-600 hover:underline">התחבר</Link>
      </p>
    </main>
  )
}
