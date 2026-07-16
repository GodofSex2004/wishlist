"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  Trash2,
  Tag,
  ExternalLink,
  BarChart3,
  X,
  Check,
} from "lucide-react"
import { WishlistItem, ItemStatus, categoryLabels, categoryColors } from "@/types"
import { deleteItem, updateItem, completeItem, resolveImageUrl } from "@/lib/api"
import PriceChart from "./PriceChart"

interface ItemCardProps {
  item: WishlistItem
  index: number
  onDelete: (id: number) => void
  onUpdate: (id: number, data: Partial<WishlistItem>) => void
  onComplete?: (id: number) => void
}

const categoryBorder: Record<string, string> = {
  TECH: "hover:shadow-neon hover:border-cyber-neon",
  BOOKS: "hover:border-cyber-cyan",
  CLOTHES: "hover:shadow-purple hover:border-cyber-purple",
  TRAVEL: "hover:shadow-green hover:border-cyber-green",
  OTHER: "hover:border-cyber-muted",
}

export default function ItemCard({ item, index, onDelete, onUpdate, onComplete }: ItemCardProps) {
  const [showComment, setShowComment] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [completing, setCompleting] = useState(false)

  const isCompleted = item.status === ItemStatus.COMPLETED

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return "—"
    return `$${price.toFixed(2)}`
  }

  const priceDiff =
    item.current_price && item.target_price
      ? ((item.current_price - item.target_price) / item.target_price) * 100
      : null

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteItem(item.id)
      onDelete(item.id)
    } catch {
      setDeleting(false)
    }
  }

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await completeItem(item.id)
      onComplete?.(item.id)
    } catch {
      setCompleting(false)
    }
  }


  const handleCategoryCycle = async () => {
    const order = ["TECH", "BOOKS", "CLOTHES", "TRAVEL", "OTHER"] as const
    const idx = order.indexOf(item.category as any)
    const nextCat = order[(idx + 1) % order.length]
    try {
      const updated = await updateItem(item.id, { category: nextCat as any })
      onUpdate(item.id, updated)
    } catch {}
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        layout
        className={`group relative bg-cyber-dark rounded-xl border overflow-hidden 
                    transition-all duration-500 
                    ${isCompleted ? "border-cyber-green/30 opacity-70 hover:opacity-90" : "border-cyber-light"}
                    ${!isCompleted ? (categoryBorder[item.category] || "hover:border-cyber-light") : ""}`}
      >
        <div className="aspect-[4/5] overflow-hidden bg-cyber-black relative">
          {item.image_url && !imgError ? (
            <img
              src={resolveImageUrl(item.image_url)}
              alt={item.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${isCompleted ? "grayscale" : "group-hover:scale-110"}`}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-cyber-muted text-sm">
              <div className="text-center">
                <Tag size={32} className="mx-auto mb-2 opacity-30" />
                No image
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="absolute inset-0 bg-cyber-green/10 flex items-center justify-center">
              <div className="bg-cyber-green text-black text-xs font-bold px-3 py-1 rounded-full rotate-[-15deg] shadow-lg">
                Выполнено ✓
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {!isCompleted && (
            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleComplete}
                disabled={completing}
                className="p-1.5 rounded-lg bg-cyber-green/90 border border-cyber-green text-black 
                           hover:bg-cyber-green transition-all text-xs disabled:opacity-50"
                title="Mark as completed"
              >
                <Check size={12} />
              </button>
              <button
                onClick={handleCategoryCycle}
                className="p-1.5 rounded-lg bg-cyber-black/80 border border-cyber-light text-cyber-muted 
                           hover:text-white hover:border-cyber-neon transition-all text-xs"
                title="Change category"
              >
                <Tag size={12} />
              </button>
              <button
                onClick={() => setShowChart(!showChart)}
                className="p-1.5 rounded-lg bg-cyber-black/80 border border-cyber-light text-cyber-muted 
                           hover:text-white hover:border-cyber-cyan transition-all text-xs"
                title="Price history"
              >
                <BarChart3 size={12} />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1.5 rounded-lg bg-cyber-black/80 border border-cyber-light text-cyber-muted 
                           hover:text-cyber-neon hover:border-cyber-neon transition-all text-xs disabled:opacity-50"
                title="Delete item"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}

          <div className="absolute bottom-2 left-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase bg-cyber-black/80 text-cyber-muted border border-cyber-light">
              {categoryLabels[item.category]}
            </span>
          </div>
        </div>

        <div className="p-3 space-y-2">
          <div>
            {item.brand && (
              <p className="text-[10px] uppercase tracking-widest text-cyber-muted font-bold">
                {item.brand}
              </p>
            )}
            <h3 className={`font-bold text-sm truncate ${isCompleted ? "text-cyber-muted line-through" : "text-white"}`}>
              {item.title}
            </h3>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="text-cyber-muted text-[10px]">Target</p>
              <p className={`font-bold ${isCompleted ? "text-cyber-muted" : "text-white"}`}>{formatPrice(item.target_price)}</p>
            </div>
            {!isCompleted && (
              <div className="text-right space-y-0.5">
                <p className="text-cyber-muted text-[10px]">Current</p>
                <p className={`font-bold ${item.current_price && item.target_price && item.current_price <= item.target_price ? "text-cyber-green" : "text-cyber-text"}`}>
                  {formatPrice(item.current_price)}
                </p>
              </div>
            )}
          </div>

          {!isCompleted && priceDiff !== null && (
            <div className="flex items-center gap-1 text-[10px]">
              <div className="flex-1 h-1 bg-cyber-black rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    priceDiff <= 0 ? "bg-cyber-green" : "bg-cyber-neon"
                  }`}
                  style={{ width: `${Math.min(Math.abs(priceDiff), 100)}%` }}
                />
              </div>
              <span className={priceDiff <= 0 ? "text-cyber-green" : "text-cyber-muted"}>
                {priceDiff > 0 ? `+${priceDiff.toFixed(0)}%` : `${priceDiff.toFixed(0)}%`}
              </span>
            </div>
          )}

          {isCompleted && item.completed_at && (
            <p className="text-[10px] text-cyber-green">
              Исполнено {new Date(item.completed_at).toLocaleDateString()}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            {item.comment && (
              <button
                onClick={() => setShowComment(!showComment)}
                className="flex items-center gap-1 text-[10px] text-cyber-muted hover:text-cyber-cyan transition-colors"
              >
                <MessageSquare size={10} />
                Note
              </button>
            )}
            {item.shop_url && (
              <a
                href={item.shop_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-cyber-muted hover:text-cyber-neon transition-colors ml-auto"
              >
                <ExternalLink size={10} />
                Shop
              </a>
            )}
          </div>

          <AnimatePresence>
            {showComment && item.comment && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-[11px] text-cyber-muted bg-cyber-black rounded-lg p-2 border border-cyber-light">
                  {item.comment}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {showChart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowChart(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-cyber-dark border border-cyber-light rounded-2xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">{item.title} — Price History</h3>
                <button
                  onClick={() => setShowChart(false)}
                  className="p-1 rounded-lg hover:bg-cyber-light transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <PriceChart itemId={item.id} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
