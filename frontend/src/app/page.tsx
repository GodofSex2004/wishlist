"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { getMe } from "@/lib/api"
import Navbar from "@/components/Navbar"
import FilterBar from "@/components/FilterBar"
import ItemCard from "@/components/ItemCard"
import AddItemModal from "@/components/AddItemModal"
import { WishlistItem, ItemCategory } from "@/types"
import { getItems } from "@/lib/api"
import { Plus, ShoppingBag } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [activeCategory, setActiveCategory] = useState<ItemCategory | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    getMe()
      .then(setUser)
      .catch(() => router.push("/auth/login"))
  }, [router])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getItems(activeCategory || undefined)
      .then(setItems)
      .finally(() => setLoading(false))
  }, [user, activeCategory])

  const handleAddItem = async () => {
    const updated = await getItems(activeCategory || undefined)
    setItems(updated)
    setShowAddModal(false)
  }

  const handleDeleteItem = async (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const handleUpdateItem = async (id: number, data: Partial<WishlistItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)))
  }

  if (!user) return null

  return (
    <div className="min-h-screen">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-display tracking-wider text-white">
              YOUR <span className="text-gradient-neon">WISHLIST</span>
            </h1>
            <p className="text-cyber-muted text-sm mt-1">
              {items.length} {items.length === 1 ? "item" : "items"} tracked
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-cyber-neon text-black font-bold rounded-lg 
                       hover:shadow-neon-lg transition-all duration-300"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Item</span>
          </motion.button>
        </motion.div>

        <FilterBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-cyber-dark rounded-xl animate-pulse border border-cyber-light"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center mt-20 text-cyber-muted"
          >
            <ShoppingBag size={64} className="mb-4 opacity-30" />
            <p className="text-xl font-display tracking-wider text-white/40">
              YOUR WISHLIST IS EMPTY
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-cyber-neon hover:text-white transition-colors underline underline-offset-4"
            >
              Add your first item
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8"
          >
            {items.map((item, i) => (
              <ItemCard
                key={item.id}
                item={item}
                index={i}
                onDelete={handleDeleteItem}
                onUpdate={handleUpdateItem}
              />
            ))}
          </motion.div>
        )}
      </main>

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddItem}
      />
    </div>
  )
}
