"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { getMe, getItems } from "@/lib/api"
import { WishlistItem, ItemCategory, ItemStatus } from "@/types"
import FilterBar from "@/components/FilterBar"
import ItemCard from "@/components/ItemCard"
import { ShoppingBag } from "lucide-react"

export default function TgAppPage() {
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [activeCategory, setActiveCategory] = useState<ItemCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    try {
      window.Telegram?.WebApp?.ready()
      window.Telegram?.WebApp?.expand()
    } catch {}
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    getMe().then(setUser).catch(() => router.push("/auth/login"))
  }, [router])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getItems(activeCategory || undefined, ItemStatus.ACTIVE).then(setItems).finally(() => setLoading(false))
  }, [user, activeCategory])

  if (!user) return null

  return (
    <div className="min-h-screen bg-cyber-black">
      <div className="sticky top-0 z-50 bg-cyber-black/70 backdrop-blur-2xl border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-display tracking-wider text-white">
            W<span className="text-cyber-ember">I</span>SHLIST
          </h1>
          <span className="text-[10px] text-cyber-muted">@{user.username}</span>
        </div>
      </div>

      <main className="px-3 pt-4 pb-20">
        <FilterBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

        {loading ? (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-cyber-dark/40 backdrop-blur-sm animate-pulse border border-white/[0.06]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-cyber-muted">
            <ShoppingBag size={48} className="mb-3 opacity-30" />
            <p className="text-sm font-display tracking-wider text-white/40">YOUR WISHLIST IS EMPTY</p>
            <button
              onClick={() => { try { window.Telegram?.WebApp?.close() } catch {} }}
              className="mt-4 text-cyber-neon text-xs underline underline-offset-4"
            >
              Close
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-3 mt-4">
            {items.map((item, i) => (
              <ItemCard key={item.id} item={item} index={i}
                onDelete={(id) => setItems((p) => p.filter((x) => x.id !== id))}
                onUpdate={(id, data) => setItems((p) => p.map((x) => x.id === id ? { ...x, ...data } : x))}
                onComplete={(id) => setItems((p) => p.filter((x) => x.id !== id))} />
            ))}
          </motion.div>
        )}
      </main>
    </div>
  )
}
