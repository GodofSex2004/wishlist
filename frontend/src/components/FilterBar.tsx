"use client"

import { motion } from "framer-motion"
import { ItemCategory, categoryLabels } from "@/types"

interface FilterBarProps {
  activeCategory: ItemCategory | null
  onCategoryChange: (cat: ItemCategory | null) => void
}

const categories = [
  { value: null, label: "Все", icon: "⊞" },
  { value: ItemCategory.TECH, label: categoryLabels[ItemCategory.TECH], icon: "⚡" },
  { value: ItemCategory.BOOKS, label: categoryLabels[ItemCategory.BOOKS], icon: "📖" },
  { value: ItemCategory.CLOTHES, label: categoryLabels[ItemCategory.CLOTHES], icon: "👕" },
  { value: ItemCategory.TRAVEL, label: categoryLabels[ItemCategory.TRAVEL], icon: "✈" },
  { value: ItemCategory.OTHER, label: categoryLabels[ItemCategory.OTHER], icon: "⋯" },
]

const activeColors: Record<string, string> = {
  [ItemCategory.TECH]: "border-cyber-neon/40 bg-cyber-neon/5 shadow-neon",
  [ItemCategory.BOOKS]: "border-cyber-cyan/40 bg-cyber-cyan/5 shadow-neon-cyan",
  [ItemCategory.CLOTHES]: "border-cyber-purple/40 bg-cyber-purple/5 shadow-neon-purple",
  [ItemCategory.TRAVEL]: "border-cyber-green/40 bg-cyber-green/5 shadow-neon-green",
  [ItemCategory.OTHER]: "border-white/10 bg-white/5",
}

const activeIconColors: Record<string, string> = {
  [ItemCategory.TECH]: "text-cyber-neon",
  [ItemCategory.BOOKS]: "text-cyber-cyan",
  [ItemCategory.CLOTHES]: "text-cyber-purple",
  [ItemCategory.TRAVEL]: "text-cyber-green",
  [ItemCategory.OTHER]: "text-cyber-muted",
}

export default function FilterBar({ activeCategory, onCategoryChange }: FilterBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6"
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.value
        return (
          <motion.button
            key={cat.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onCategoryChange(cat.value)}
            className={`relative flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border transition-all duration-300
              ${isActive
                ? (cat.value ? activeColors[cat.value] : "border-cyber-neon/40 bg-cyber-neon/5 shadow-neon")
                : "bg-cyber-dark/40 backdrop-blur-sm border-white/[0.06] hover:border-white/[0.12] hover:bg-cyber-dark/60"
              }`}
          >
            <span className={`text-lg ${isActive ? (cat.value ? activeIconColors[cat.value] : "text-cyber-neon") : "text-cyber-muted"}`}>
              {cat.icon}
            </span>
            <span className={`text-[10px] font-bold tracking-wider ${isActive ? "text-white" : "text-cyber-muted"}`}>
              {cat.label}
            </span>
          </motion.button>
        )
      })}
    </motion.div>
  )
}
