interface RenderResultProps {
  resultUrl: string
}

export default function RenderResult({ resultUrl }: RenderResultProps) {
  return (
    <div className="mt-6">
      <label className="block text-sm font-medium mb-2">התוצאה</label>
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <img src={resultUrl} alt="תוצאת הרנדור" className="w-full object-contain" />
      </div>
      <a
        href={resultUrl}
        download="floor-render.jpg"
        className="mt-3 block w-full text-center bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors"
      >
        ⬇ הורד תמונה
      </a>
    </div>
  )
}
