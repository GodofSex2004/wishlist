"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Trash2, Shield, Package, ArrowLeft,
  ChevronDown, Search, X
} from "lucide-react"
import { getMe, adminGetUsers, adminDeleteUser, adminMakeAdmin, adminGetItems, adminDeleteItem, resolveImageUrl } from "@/lib/api"
import type { User, WishlistItem } from "@/types"
import { categoryLabels } from "@/types"
import Navbar from "@/components/Navbar"

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [items, setItems] = useState<WishlistItem[]>([])
  const [activeTab, setActiveTab] = useState<"users" | "items">("users")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/auth/login"); return }
    getMe().then((u) => {
      if (!u.is_admin) { router.push("/"); return }
      setUser(u)
      loadData()
    }).catch(() => router.push("/auth/login"))
  }, [router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [u, i] = await Promise.all([adminGetUsers(), adminGetItems()])
      setUsers(u)
      setItems(i)
    } catch {}
    setLoading(false)
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Delete this user and all their items?")) return
    await adminDeleteUser(id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  const handleMakeAdmin = async (id: number) => {
    await adminMakeAdmin(id)
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_admin: true } : u))
  }

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Delete this item?")) return
    await adminDeleteItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const filteredUsers = users.filter(
    (u) => u.username.toLowerCase().includes(search.toLowerCase()) ||
           u.email.toLowerCase().includes(search.toLowerCase())
  )

  const filteredItems = items.filter(
    (i) => i.title.toLowerCase().includes(search.toLowerCase()) ||
           categoryLabels[i.category]?.toLowerCase().includes(search.toLowerCase())
  )

  const getUserName = (userId: number) => users.find((u) => u.id === userId)?.username || `#${userId}`

  if (!user) return null

  return (
    <div className="min-h-screen">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="p-2 rounded-lg hover:bg-cyber-light transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-3xl font-display tracking-wider text-white">
                ADMIN <span className="text-cyber-neon">PANEL</span>
              </h1>
              <p className="text-cyber-muted text-xs">
                {users.length} users · {items.length} items
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
              ${activeTab === "users"
                ? "bg-cyber-neon text-black"
                : "bg-cyber-dark text-cyber-muted border border-cyber-light hover:text-white"}`}
          >
            <Users size={14} /> Users
          </button>
          <button
            onClick={() => setActiveTab("items")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
              ${activeTab === "items"
                ? "bg-cyber-neon text-black"
                : "bg-cyber-dark text-cyber-muted border border-cyber-light hover:text-white"}`}
          >
            <Package size={14} /> Items
          </button>
        </div>

        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-9 pr-4 py-2 bg-cyber-dark border border-cyber-light rounded-lg text-sm text-white
                       placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-neon/50"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => (
              <div key={i} className="h-14 bg-cyber-dark rounded-lg animate-pulse border border-cyber-light" />
            ))}
          </div>
        ) : activeTab === "users" ? (
          <div className="space-y-2">
            {filteredUsers.map((u) => (
              <motion.div
                key={u.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-cyber-dark border border-cyber-light rounded-lg
                           hover:border-cyber-neon/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${u.is_admin ? "bg-cyber-neon/20 text-cyber-neon" : "bg-cyber-light text-cyber-muted"}`}>
                    {u.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {u.username}
                      {u.is_admin && <span className="text-cyber-neon text-[10px] ml-2">ADMIN</span>}
                    </p>
                    <p className="text-[10px] text-cyber-muted">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!u.is_admin && (
                    <button onClick={() => handleMakeAdmin(u.id)}
                      className="p-1.5 rounded-lg bg-cyber-black border border-cyber-light text-cyber-muted
                                 hover:text-cyber-green hover:border-cyber-green transition-all"
                      title="Make admin">
                      <Shield size={12} />
                    </button>
                  )}
                  {!u.is_admin && (
                    <button onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 rounded-lg bg-cyber-black border border-cyber-light text-cyber-muted
                                 hover:text-cyber-neon hover:border-cyber-neon transition-all"
                      title="Delete user">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {filteredUsers.length === 0 && (
              <p className="text-center text-cyber-muted text-sm py-8">No users found</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-cyber-dark border border-cyber-light rounded-lg
                           hover:border-cyber-neon/30 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.image_url ? (
                    <img
                      src={resolveImageUrl(item.image_url)}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-cyber-black flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-cyber-black flex items-center justify-center flex-shrink-0">
                      <Package size={14} className="text-cyber-muted" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.title}</p>
                    <p className="text-[10px] text-cyber-muted">
                      {categoryLabels[item.category]} · by {getUserName(item.user_id)} · ${item.target_price}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 rounded-lg bg-cyber-black border border-cyber-light text-cyber-muted
                             hover:text-cyber-neon hover:border-cyber-neon transition-all opacity-0 group-hover:opacity-100 flex-shrink-0">
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}
            {filteredItems.length === 0 && (
              <p className="text-center text-cyber-muted text-sm py-8">No items found</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
