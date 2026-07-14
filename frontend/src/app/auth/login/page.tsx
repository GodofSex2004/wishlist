"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { login } from "@/lib/api"
import { Eye, EyeOff, LogIn } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError("Fill in all fields")
      return
    }
    setLoading(true)
    setError("")
    try {
      await login(username, password)
      router.push("/")
    } catch {
      setError("Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-5xl font-display tracking-[0.15em] text-white">
            DROP<span className="text-cyber-neon">WATCH</span>
          </h1>
          <p className="text-cyber-muted text-sm mt-2">Streetwear wishlist tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-cyber-muted mb-1 uppercase tracking-wider">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-cyber-dark border border-cyber-light rounded-xl text-sm text-white
                         placeholder:text-cyber-muted/30 focus:outline-none focus:border-cyber-neon/50 transition-all"
              placeholder="Enter username"
            />
          </div>

          <div className="relative">
            <label className="block text-xs text-cyber-muted mb-1 uppercase tracking-wider">
              Password
            </label>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-cyber-dark border border-cyber-light rounded-xl text-sm text-white
                         placeholder:text-cyber-muted/30 focus:outline-none focus:border-cyber-neon/50 transition-all pr-10"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 bottom-3 text-cyber-muted hover:text-white"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-cyber-neon text-xs text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyber-neon text-black font-bold rounded-xl text-sm
                       hover:shadow-neon-lg transition-all duration-300 flex items-center justify-center gap-2
                       disabled:opacity-50"
          >
            {loading ? "Signing in..." : (
              <>
                <LogIn size={16} />
                SIGN IN
              </>
            )}
          </motion.button>
        </form>

        <p className="text-center text-xs text-cyber-muted mt-6">
          No account?{" "}
          <a href="/auth/register" className="text-cyber-neon hover:text-white transition-colors underline underline-offset-4">
            Register
          </a>
        </p>
      </motion.div>
    </div>
  )
}
