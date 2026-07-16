"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Camera, Save, Globe, Lock, Eye } from "lucide-react"
import { getMe, updateProfile, uploadAvatar, resolveImageUrl } from "@/lib/api"
import type { User } from "@/types"
import Navbar from "@/components/Navbar"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/auth/login"); return }
    getMe().then((u) => {
      setUser(u)
      setDisplayName(u.display_name || "")
      setIsPrivate(u.is_private)
    }).catch(() => router.push("/auth/login"))
  }, [router])

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const updated = await uploadAvatar(file)
      setUser(updated)
      setAvatarPreview(null)
    } catch {}
    setUploading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateProfile({
        display_name: displayName || undefined,
        is_private: isPrivate,
      })
      setUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen">
      <Navbar user={user} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-cyber-muted hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to wishlist
          </button>

          <h1 className="text-3xl font-display tracking-wider text-white mb-8">
            PROFILE <span className="text-gradient-neon">SETTINGS</span>
          </h1>

          <div className="glass rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-cyber-dark/60 border border-white/[0.08]">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  ) : user.avatar_url ? (
                    <img src={resolveImageUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-cyber-neon">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-cyber-neon text-black flex items-center justify-center
                             hover:shadow-neon transition-all disabled:opacity-50"
                >
                  <Camera size={12} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{user.username}</h2>
                <p className="text-xs text-cyber-muted">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-cyber-muted mb-1.5 uppercase tracking-wider">
                  Display Name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  className="w-full px-3.5 py-2.5 bg-black/30 backdrop-blur-sm border border-white/[0.08] rounded-xl text-sm text-white
                             placeholder:text-cyber-muted/40 focus:outline-none focus:border-cyber-neon/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-cyber-muted mb-1.5 uppercase tracking-wider">
                  Username
                </label>
                <input
                  value={user.username}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-black/30 backdrop-blur-sm border border-white/[0.08] rounded-xl text-sm text-cyber-muted/60 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] text-cyber-muted mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <input
                  value={user.email}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-black/30 backdrop-blur-sm border border-white/[0.08] rounded-xl text-sm text-cyber-muted/60 cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <label className="block text-[10px] text-cyber-muted mb-2 uppercase tracking-wider">
                  Privacy
                </label>
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`flex items-center justify-between w-full px-3.5 py-3 rounded-xl border transition-all duration-300
                    ${isPrivate
                      ? "bg-cyber-neon/5 border-cyber-neon/30"
                      : "bg-black/30 backdrop-blur-sm border-white/[0.08] hover:border-white/[0.12]"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {isPrivate ? (
                      <Lock size={14} className="text-cyber-neon" />
                    ) : (
                      <Globe size={14} className="text-cyber-muted" />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">
                        {isPrivate ? "Private wishlist" : "Public wishlist"}
                      </p>
                      <p className="text-[10px] text-cyber-muted">
                        {isPrivate ? "Only you can see your items" : "Anyone with link can view"}
                      </p>
                    </div>
                  </div>
                  <div className={`w-9 h-5 rounded-full transition-colors ${isPrivate ? "bg-cyber-neon" : "bg-white/10"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform ${isPrivate ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-cyber-neon text-black font-bold rounded-xl text-sm
                       hover:shadow-neon-lg transition-all duration-300 flex items-center justify-center gap-2
                       disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? (
              <>
                <Save size={14} />
                Saved!
              </>
            ) : (
              <>
                <Save size={14} />
                Save Changes
              </>
            )}
          </motion.button>
        </motion.div>
      </main>
    </div>
  )
}
