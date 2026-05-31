'use client'
import { useRef, useState } from 'react'

interface RoomUploadProps {
  onFileSelect: (file: File) => void
  preview: string | null
}

export default function RoomUpload({ onFileSelect, preview }: RoomUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      alert('התמונה גדולה מדי — מקסימום 10MB')
      return
    }
    onFileSelect(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">שלב 1 — העלה תמונת חדר</label>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors min-h-[160px] flex items-center justify-center ${
          dragOver ? 'border-amber-400 bg-amber-50' : 'border-gray-300 hover:border-amber-300'
        }`}
      >
        {preview ? (
          <img src={preview} alt="תמונת חדר" className="max-h-48 rounded-lg object-contain" />
        ) : (
          <div className="text-gray-400">
            <p className="text-3xl mb-2">📷</p>
            <p className="text-sm">לחץ או גרור תמונה לכאן</p>
            <p className="text-xs mt-1">JPG, PNG — עד 10MB</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
