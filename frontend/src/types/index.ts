export enum ItemCategory {
  TECH = "TECH",
  BOOKS = "BOOKS",
  CLOTHES = "CLOTHES",
  TRAVEL = "TRAVEL",
  OTHER = "OTHER",
}

export enum ItemStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
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
  status: ItemStatus
  completed_at: string | null
  comment: string | null
  created_at: string
}

export interface User {
  id: number
  username: string
  email: string
  is_admin?: boolean
  telegram_chat_id: string | null
  avatar_url: string | null
  display_name: string | null
  is_private: boolean
}

export interface PriceHistory {
  id: number
  item_id: number
  price: number
  checked_at: string
}

export const categoryLabels: Record<ItemCategory, string> = {
  [ItemCategory.TECH]: "Техника",
  [ItemCategory.BOOKS]: "Книги",
  [ItemCategory.CLOTHES]: "Одежда",
  [ItemCategory.TRAVEL]: "Поездки",
  [ItemCategory.OTHER]: "Прочее",
}

export const categoryColors: Record<ItemCategory, string> = {
  [ItemCategory.TECH]: "bg-cyber-neon text-black border-cyber-neon",
  [ItemCategory.BOOKS]: "bg-cyber-cyan text-black border-cyber-cyan",
  [ItemCategory.CLOTHES]: "bg-cyber-purple text-white border-cyber-purple",
  [ItemCategory.TRAVEL]: "bg-cyber-green text-black border-cyber-green",
  [ItemCategory.OTHER]: "bg-cyber-muted text-white border-cyber-muted",
}
