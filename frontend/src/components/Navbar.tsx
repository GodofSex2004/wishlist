"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { LogOut, User, Link as LinkIcon, X, Shield, Settings } from "lucide-react"
import { getLinkCode } from "@/lib/api"
import type { User as UserType } from "@/types"

interface NavbarProps {
  user: UserType
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const [showProfile, setShowProfile] = useState(false)
  const [linkCode, setLinkCode] = useState<string | null>(null)

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/auth/login")
  }

  const handleGetLinkCode = async () => {
    try {
      const code = await getLinkCode()
      setLinkCode(code)
    } catch {
      setLinkCode("Error generating code")
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-black/70 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <motion.a
          href="/"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-display tracking-[0.2em] text-white"
        >
          WISH<span className="text-cyber-neon">LIST</span>
        </motion.a>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyber-dark/60 backdrop-blur-xl border border-white/[0.06] 
                       hover:border-white/[0.12] hover:bg-cyber-dark/80 transition-all duration-300 text-sm"
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-cyber-neon/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-cyber-neon">
                  {user.username[0].toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-cyber-text hidden sm:inline">{user.username}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowProfile(!showProfile)}
            className="p-2 rounded-xl bg-cyber-dark/60 backdrop-blur-xl border border-white/[0.06] 
                       hover:border-white/[0.12] transition-all duration-300"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyber-muted" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-4 top-16 mt-2 w-72 bg-cyber-dark/80 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-glass"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyber-neon/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-cyber-neon">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user.username}</p>
                  <p className="text-[10px] text-cyber-muted">{user.email}</p>
                </div>
              </div>
              <button onClick={() => setShowProfile(false)} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
                <X size={14} className="text-cyber-muted" />
              </button>
            </div>

            <div className="space-y-1 mb-4">
              <button
                onClick={() => { setShowProfile(false); router.push("/profile") }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-cyber-text hover:bg-white/5 transition-colors"
              >
                <Settings size={14} className="text-cyber-muted" />
                Profile Settings
              </button>
              {user.is_admin && (
                <button
                  onClick={() => { setShowProfile(false); router.push("/admin") }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-cyber-neon hover:bg-white/5 transition-colors"
                >
                  <Shield size={14} />
                  Admin Panel
                </button>
              )}
              <button
                onClick={handleGetLinkCode}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-cyber-cyan hover:bg-white/5 transition-colors"
              >
                <LinkIcon size={14} />
                Telegram link code
              </button>
            </div>

            {linkCode && (
              <div className="mb-4 px-3 py-2 bg-cyber-black/60 rounded-xl border border-white/[0.06]">
                <p className="text-[10px] text-cyber-muted mb-1">Your link code:</p>
                <p className="text-sm font-bold text-cyber-green break-all">{linkCode}</p>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-cyber-neon hover:bg-white/5 transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
