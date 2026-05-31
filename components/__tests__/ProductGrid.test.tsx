import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProductGrid from '../ProductGrid'
import type { Product } from '@/lib/types'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

const mockProducts: Product[] = [
  { id: '1', name: 'אלון טבעי', category: 'parquet', image_url: '/oak.jpg', created_at: '' },
  { id: '2', name: "ווינג' כהה", category: 'parquet', image_url: '/wenge.jpg', created_at: '' },
]

describe('ProductGrid', () => {
  it('renders all product names', () => {
    render(<ProductGrid products={mockProducts} />)
    expect(screen.getByText('אלון טבעי')).toBeInTheDocument()
    expect(screen.getByText("ווינג' כהה")).toBeInTheDocument()
  })

  it('shows empty state when no products', () => {
    render(<ProductGrid products={[]} />)
    expect(screen.getByText(/אין מוצרים/i)).toBeInTheDocument()
  })
})
