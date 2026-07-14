"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, Image as ImageIcon } from "lucide-react"
import { createItem } from "@/lib/api"
import { ItemCategory, categoryLabels } from "@/types"

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
  const [category, setCategory] = useState<ItemCategory>(ItemCategory.SAVE_UP)
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
    setCategory(ItemCategory.SAVE_UP)
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-cyber-dark border border-cyber-light rounded-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-cyber-light">
              <h2 className="text-lg font-display tracking-wider text-white">
                ADD NEW ITEM
              </h2>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-cyber-light transition-colors"
              >
                <X size={18} className="text-cyber-muted" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Image Upload */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleImageDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-32 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer
                  flex flex-col items-center justify-center gap-2 overflow-hidden
                  ${dragOver ? "border-cyber-neon bg-cyber-neon/5" : "border-cyber-light hover:border-cyber-neon/50"}`}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Upload size={24} className="text-cyber-muted" />
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
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white text-xs hover:bg-black/80"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs text-cyber-muted mb-1 uppercase tracking-wider">
                  Title *
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Nike SB Dunk Low"
                  className="w-full px-3 py-2 bg-cyber-black border border-cyber-light rounded-lg text-sm text-white
                             placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-neon/50 transition-colors"
                />
              </div>

              {/* Brand & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-cyber-muted mb-1 uppercase tracking-wider">
                    Brand
                  </label>
                  <input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Nike"
                    className="w-full px-3 py-2 bg-cyber-black border border-cyber-light rounded-lg text-sm text-white
                               placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-neon/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-cyber-muted mb-1 uppercase tracking-wider">
                    Target Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-cyber-black border border-cyber-light rounded-lg text-sm text-white
                               placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-neon/50 transition-colors"
                  />
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs text-cyber-muted mb-1 uppercase tracking-wider">
                  Shop URL (for price tracking)
                </label>
                <input
                  value={shopUrl}
                  onChange={(e) => setShopUrl(e.target.value)}
                  placeholder="https://stockx.com/..."
                  className="w-full px-3 py-2 bg-cyber-black border border-cyber-light rounded-lg text-sm text-white
                             placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-neon/50 transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs text-cyber-muted mb-1 uppercase tracking-wider">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(ItemCategory).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 border
                        ${category === cat
                          ? cat === ItemCategory.BUY_NOW
                            ? "bg-cyber-neon text-black border-cyber-neon"
                            : cat === ItemCategory.SAVE_UP
                              ? "bg-cyber-green text-black border-cyber-green"
                              : "bg-cyber-purple text-white border-cyber-purple"
                          : "bg-cyber-black text-cyber-muted border-cyber-light hover:border-cyber-light/50"
                        }`}
                    >
                      {categoryLabels[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs text-cyber-muted mb-1 uppercase tracking-wider">
                  Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Size, colorway, notes..."
                  rows={2}
                  className="w-full px-3 py-2 bg-cyber-black border border-cyber-light rounded-lg text-sm text-white
                             placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-neon/50 transition-colors resize-none"
                />
              </div>

              {error && (
                <p className="text-cyber-neon text-xs">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyber-neon text-black font-bold rounded-lg text-sm
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
