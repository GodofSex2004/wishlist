"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, Image as ImageIcon } from "lucide-react"
import { createItem } from "@/lib/api"
import { ItemCategory, categoryLabels, categoryColors } from "@/types"

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddItemModal({ isOpen, onClose, onSuccess }: AddItemModalProps) {
  const [title, setTitle] = useState("")
  const [brand, setBrand] = useState("")
  const [shopUrl, setShopUrl] = useState("")
  const [targetPrice, setTargetPrice] = useState("")
  const [category, setCategory] = useState<ItemCategory>(ItemCategory.OTHER)
  const [comment, setComment] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const resetForm = () => {
    setTitle("")
    setBrand("")
    setShopUrl("")
    setTargetPrice("")
    setCategory(ItemCategory.OTHER)
    setComment("")
    setImage(null)
    setPreview(null)
    setError("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("Title is required")
      return
    }
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("title", title.trim())
      formData.append("brand", brand.trim())
      formData.append("shop_url", shopUrl.trim())
      formData.append("target_price", targetPrice || "0")
      formData.append("category", category)
      formData.append("comment", comment.trim())
      if (image) formData.append("image", image)

      await createItem(formData)
      resetForm()
      onSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-cyber-dark/80 backdrop-blur-2xl border border-white/[0.08] rounded-2xl w-full max-w-lg overflow-hidden shadow-glass"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <h2 className="text-lg font-display tracking-wider text-white">
                ADD NEW ITEM
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <X size={16} className="text-cyber-muted" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleImageDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-32 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer
                  flex flex-col items-center justify-center gap-2 overflow-hidden
                  ${dragOver ? "border-cyber-neon/50 bg-cyber-neon/5" : "border-white/[0.08] hover:border-white/[0.15]"}`}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Upload size={22} className="text-cyber-muted" />
                    <p className="text-xs text-cyber-muted">
                      Drop image or click to upload
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {preview && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setImage(null)
                      setPreview(null)
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs hover:bg-black/80"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-cyber-muted mb-1.5 uppercase tracking-wider">
                  Title *
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. MacBook Pro"
                  className="w-full px-3.5 py-2.5 bg-black/30 backdrop-blur-sm border border-white/[0.08] rounded-xl text-sm text-white
                             placeholder:text-cyber-muted/40 focus:outline-none focus:border-cyber-neon/40 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-cyber-muted mb-1.5 uppercase tracking-wider">
                    Brand
                  </label>
                  <input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Apple"
                    className="w-full px-3.5 py-2.5 bg-black/30 backdrop-blur-sm border border-white/[0.08] rounded-xl text-sm text-white
                               placeholder:text-cyber-muted/40 focus:outline-none focus:border-cyber-neon/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-cyber-muted mb-1.5 uppercase tracking-wider">
                    Target Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 bg-black/30 backdrop-blur-sm border border-white/[0.08] rounded-xl text-sm text-white
                               placeholder:text-cyber-muted/40 focus:outline-none focus:border-cyber-neon/40 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-cyber-muted mb-1.5 uppercase tracking-wider">
                  Shop URL
                </label>
                <input
                  value={shopUrl}
                  onChange={(e) => setShopUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-black/30 backdrop-blur-sm border border-white/[0.08] rounded-xl text-sm text-white
                             placeholder:text-cyber-muted/40 focus:outline-none focus:border-cyber-neon/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-cyber-muted mb-1.5 uppercase tracking-wider">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(ItemCategory).map((cat) => {
                    const catColor = categoryColors[cat]
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border
                          ${category === cat
                            ? catColor
                            : "bg-black/30 backdrop-blur-sm text-cyber-muted border-white/[0.06] hover:border-white/[0.12]"
                          }`}
                      >
                        {categoryLabels[cat]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-cyber-muted mb-1.5 uppercase tracking-wider">
                  Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Notes, details..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-black/30 backdrop-blur-sm border border-white/[0.08] rounded-xl text-sm text-white
                             placeholder:text-cyber-muted/40 focus:outline-none focus:border-cyber-neon/40 transition-colors resize-none"
                />
              </div>

              {error && (
                <p className="text-cyber-neon text-xs bg-cyber-neon/5 rounded-xl px-3 py-2 border border-cyber-neon/20">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyber-neon text-black font-bold rounded-xl text-sm
                           hover:shadow-neon-lg transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Adding..." : "ADD TO WISHLIST"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
