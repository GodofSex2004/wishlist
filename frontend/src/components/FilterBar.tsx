"use client"

import { motion } from "framer-motion"
import { ItemCategory, categoryLabels } from "@/types"

interface FilterBarProps {
  activeCategory: ItemCategory | null
  onCategoryChange: (cat: ItemCategory | null) => void
}

const categories = [
  { value: null, label: "Все" },
  { value: ItemCategory.TECH, label: categoryLabels[ItemCategory.TECH] },
  { value: ItemCategory.BOOKS, label: categoryLabels[ItemCategory.BOOKS] },
  { value: ItemCategory.CLOTHES, label: categoryLabels[ItemCategory.CLOTHES] },
  { value: ItemCategory.TRAVEL, label: categoryLabels[ItemCategory.TRAVEL] },
  { value: ItemCategory.OTHER, label: categoryLabels[ItemCategory.OTHER] },
]

const categoryTabColors: Record<string, string> = {
  [ItemCategory.TECH]: "bg-cyber-neon",
  [ItemCategory.BOOKS]: "bg-cyber-cyan",
  [ItemCategory.CLOTHES]: "bg-cyber-purple",
  [ItemCategory.TRAVEL]: "bg-cyber-green",
  [ItemCategory.OTHER]: "bg-cyber-muted",
}

export default function FilterBar({ activeCategory, onCategoryChange }: FilterBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-cyber-light/30"
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.value
        return (
          <button
            key={cat.label}
            onClick={() => onCategoryChange(cat.value)}
            className={`relative px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors
              ${isActive ? "text-white" : "text-cyber-muted hover:text-white"}`}
          >
            {cat.label}
            {isActive && (
              <motion.div
                layoutId="activeCategoryTab"
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${cat.value ? categoryTabColors[cat.value] : "bg-white"}`}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </motion.div>
  )
}
