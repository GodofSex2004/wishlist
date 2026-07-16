"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { register } from "@/lib/api"
import { UserPlus } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !email || !password) {
      setError("Fill in all fields")
      return
    }
    setLoading(true)
    setError("")
    try {
      await register(username, email, password)
      router.push("/auth/login")
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed")
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
            W<span className="text-cyber-ember">I</span>SHLIST
          </h1>
          <p className="text-cyber-muted text-xs mt-2 tracking-wider uppercase">Create your account</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] text-cyber-muted mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/30 backdrop-blur-sm border border-white/[0.08] rounded-xl text-sm text-white
                           placeholder:text-cyber-muted/40 focus:outline-none focus:border-cyber-neon/40 transition-all"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-[10px] text-cyber-muted mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/30 backdrop-blur-sm border border-white/[0.08] rounded-xl text-sm text-white
                           placeholder:text-cyber-muted/40 focus:outline-none focus:border-cyber-neon/40 transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-[10px] text-cyber-muted mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/30 backdrop-blur-sm border border-white/[0.08] rounded-xl text-sm text-white
                           placeholder:text-cyber-muted/40 focus:outline-none focus:border-cyber-neon/40 transition-all"
                placeholder="Min 6 characters"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-cyber-neon text-xs bg-cyber-neon/5 rounded-xl px-3 py-2 border border-cyber-neon/20"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 btn-ghost flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Creating..." : (
                <>
                  <UserPlus size={16} />
                  CREATE ACCOUNT
                </>
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-xs text-cyber-muted mt-6">
          Already have an account?{" "}
          <a href="/auth/login" className="text-cyber-ember hover:text-white transition-colors">
            Sign in
          </a>
        </p>
      </motion.div>
    </div>
  )
}
