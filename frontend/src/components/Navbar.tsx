"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { LogOut, User, Link as LinkIcon, X, Shield } from "lucide-react"
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-black/80 backdrop-blur-xl border-b border-cyber-light/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <motion.a
          href="/"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-display tracking-[0.2em] text-white"
        >
          WISH<span className="text-cyber-neon">LIST</span>
        </motion.a>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-dark border border-cyber-light 
                       hover:border-cyber-neon/50 transition-all text-sm"
          >
            <User size={16} className="text-cyber-muted" />
            <span className="text-cyber-text hidden sm:inline">{user.username}</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-4 top-16 mt-2 w-72 bg-cyber-dark border border-cyber-light rounded-xl p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white">Profile</span>
              <button onClick={() => setShowProfile(false)}>
                <X size={16} className="text-cyber-muted hover:text-white" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-cyber-muted mb-4">
              <p>@{user.username}</p>
              <p>{user.email}</p>
              {user.telegram_chat_id && (
                <p className="text-cyber-green">Telegram linked ✓</p>
              )}
            </div>

            <div className="border-t border-cyber-light pt-3 mb-3 space-y-2">
              {user.is_admin && (
                <button
                  onClick={() => { setShowProfile(false); router.push("/admin") }}
                  className="flex items-center gap-2 text-sm text-cyber-neon hover:text-white transition-colors w-full"
                >
                  <Shield size={14} />
                  Admin Panel
                </button>
              )}
              <button
                onClick={handleGetLinkCode}
                className="flex items-center gap-2 text-sm text-cyber-cyan hover:text-white transition-colors w-full"
              >
                <LinkIcon size={14} />
                Get Telegram link code
              </button>
              {linkCode && (
                <div className="mt-2 p-2 bg-cyber-black rounded-lg text-xs break-all text-cyber-green">
                  {linkCode}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-cyber-neon hover:text-white transition-colors w-full border-t border-cyber-light pt-3"
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
