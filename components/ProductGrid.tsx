import Image from 'next/image'
import type { Product } from '@/lib/types'

interface ProductGridProps {
  products: Product[]
  selected?: string
  onSelect?: (id: string) => void
}

export default function ProductGrid({ products, selected, onSelect }: ProductGridProps) {
  if (products.length === 0) {
    return <p className="text-center text-gray-500 py-8">אין מוצרים זמינים כרגע</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onSelect?.(product.id)}
          className={`rounded-xl overflow-hidden border-2 transition-all text-right ${
            selected === product.id
              ? 'border-amber-500 shadow-lg scale-105'
              : 'border-transparent hover:border-gray-300'
          }`}
        >
          <div className="relative aspect-square w-full">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          </div>
          <div className="p-2 bg-white">
            <p className="text-sm font-medium truncate">{product.name}</p>
            <p className="text-xs text-gray-400">{product.category}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
