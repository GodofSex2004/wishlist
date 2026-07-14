"use client"

import { motion } from "framer-motion"
import { ItemCategory, categoryLabels } from "@/types"

interface FilterBarProps {
  activeCategory: ItemCategory | null
  onCategoryChange: (cat: ItemCategory | null) => void
}

const categories = [
  { value: null, label: "All", color: "border-cyber-text" },
  { value: ItemCategory.BUY_NOW, label: categoryLabels[ItemCategory.BUY_NOW], color: "border-cyber-neon" },
  { value: ItemCategory.SAVE_UP, label: categoryLabels[ItemCategory.SAVE_UP], color: "border-cyber-green" },
  { value: ItemCategory.FUTURE_DROP, label: categoryLabels[ItemCategory.FUTURE_DROP], color: "border-cyber-purple" },
]

export default function FilterBar({ activeCategory, onCategoryChange }: FilterBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
    >
      {categories.map((cat) => (
        <motion.button
          key={cat.label}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onCategoryChange(cat.value)}
          className={`relative px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-300
            ${
              activeCategory === cat.value
                ? `bg-cyber-gray border ${cat.color} text-white`
                : "bg-cyber-dark border border-cyber-light text-cyber-muted hover:text-white hover:border-cyber-light"
            }`}
        >
          {activeCategory === cat.value && (
            <motion.div
              layoutId="activeFilter"
              className="absolute inset-0 rounded-lg border-2"
              style={{ borderColor: "inherit" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{cat.label}</span>
        </motion.button>
      ))}
    </motion.div>
  )
}
