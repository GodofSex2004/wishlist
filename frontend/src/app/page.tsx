"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { getMe, getItems } from "@/lib/api"
import Navbar from "@/components/Navbar"
import FilterBar from "@/components/FilterBar"
import ItemCard from "@/components/ItemCard"
import AddItemModal from "@/components/AddItemModal"
import { WishlistItem, ItemCategory, ItemStatus } from "@/types"
import { Plus, Gift, Archive, Sparkles } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [activeCategory, setActiveCategory] = useState<ItemCategory | null>(null)
  const [activeTab, setActiveTab] = useState<ItemStatus>(ItemStatus.ACTIVE)
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
    getItems(activeCategory || undefined, activeTab)
      .then(setItems)
      .finally(() => setLoading(false))
  }, [user, activeCategory, activeTab])

  const handleAddItem = async () => {
    const updated = await getItems(activeCategory || undefined, activeTab)
    setItems(updated)
    setShowAddModal(false)
  }

  const handleDeleteItem = async (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const handleUpdateItem = async (id: number, data: Partial<WishlistItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)))
  }

  const handleCompleteItem = async (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
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
              WISH<span className="text-gradient-neon">LIST</span>
            </h1>
            <p className="text-cyber-muted text-xs mt-1 tracking-wider uppercase">
              {items.length} {items.length === 1 ? "item" : "items"} · {user.username}
            </p>
          </div>
          {activeTab === ItemStatus.ACTIVE && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyber-neon text-black font-bold rounded-xl 
                         hover:shadow-neon-lg transition-all duration-300 text-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Item</span>
            </motion.button>
          )}
        </motion.div>

        <div className="glass rounded-2xl p-1.5 mb-8 inline-flex">
          <button
            onClick={() => { setActiveTab(ItemStatus.ACTIVE); setActiveCategory(null) }}
            className={`relative px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2
              ${activeTab === ItemStatus.ACTIVE
                ? "bg-cyber-neon text-black shadow-neon"
                : "text-cyber-muted hover:text-white"
              }`}
          >
            <Gift size={14} />
            Желаю
          </button>
          <button
            onClick={() => { setActiveTab(ItemStatus.COMPLETED); setActiveCategory(null) }}
            className={`relative px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2
              ${activeTab === ItemStatus.COMPLETED
                ? "bg-cyber-green text-black shadow-neon-green"
                : "text-cyber-muted hover:text-white"
              }`}
          >
            <Archive size={14} />
            Выполнено
          </button>
        </div>

        {activeTab === ItemStatus.ACTIVE && (
          <FilterBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-2xl bg-cyber-dark/40 backdrop-blur-sm animate-pulse border border-white/[0.06]"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center mt-16 text-cyber-muted"
          >
            {activeTab === ItemStatus.ACTIVE ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-cyber-neon/10 border border-cyber-neon/20 flex items-center justify-center mb-4">
                  <Sparkles size={28} className="text-cyber-neon/50" />
                </div>
                <p className="text-lg font-display tracking-wider text-white/40">
                  НИЧЕГО НЕ ЖЕЛАЮ
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 text-sm text-cyber-neon hover:text-white transition-colors"
                >
                  Добавить желание
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-cyber-green/10 border border-cyber-green/20 flex items-center justify-center mb-4">
                  <Archive size={28} className="text-cyber-green/50" />
                </div>
                <p className="text-lg font-display tracking-wider text-white/40">
                  ЕЩЁ НИЧЕГО НЕ ИСПОЛНИЛОСЬ
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {items.map((item, i) => (
              <ItemCard
                key={item.id}
                item={item}
                index={i}
                onDelete={handleDeleteItem}
                onUpdate={handleUpdateItem}
                onComplete={handleCompleteItem}
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
