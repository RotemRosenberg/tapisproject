export type UserRole = 'admin' | 'user'
export type ProductCategory = 'parquet' | 'carpet' | 'other'

export interface Profile {
  id: string
  email: string
  role: UserRole
  approved: boolean
  renders_remaining: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  category: ProductCategory
  image_url: string
  created_at: string
}

export interface Render {
  id: string
  user_id: string
  product_id: string
  room_image_url: string
  result_url: string
  created_at: string
}
