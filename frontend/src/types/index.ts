export enum ItemCategory {
  BUY_NOW = "BUY_NOW",
  SAVE_UP = "SAVE_UP",
  FUTURE_DROP = "FUTURE_DROP",
}

export interface WishlistItem {
  id: number
  user_id: number
  title: string
  brand: string
  image_url: string | null
  shop_url: string | null
  target_price: number
  current_price: number | null
  category: ItemCategory
  comment: string | null
  created_at: string
}

export interface User {
  id: number
  username: string
  email: string
  is_admin?: boolean
  telegram_chat_id: string | null
}

export interface PriceHistory {
  id: number
  item_id: number
  price: number
  checked_at: string
}

export const categoryLabels: Record<ItemCategory, string> = {
  [ItemCategory.BUY_NOW]: "Buy Now",
  [ItemCategory.SAVE_UP]: "Save Up",
  [ItemCategory.FUTURE_DROP]: "Future Drop",
}

export const categoryColors: Record<ItemCategory, string> = {
  [ItemCategory.BUY_NOW]: "bg-cyber-neon text-white border-cyber-neon",
  [ItemCategory.SAVE_UP]: "bg-cyber-green text-black border-cyber-green",
  [ItemCategory.FUTURE_DROP]: "bg-cyber-purple text-white border-cyber-purple",
}
