"use client"

import { useEffect, useState } from "react"
import { getApiBaseUrl } from "@/lib/api"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface PricePoint {
  price: number
  date: string
}

interface PriceChartProps {
  itemId: number
}

export default function PriceChart({ itemId }: PriceChartProps) {
  const [data, setData] = useState<PricePoint[]>([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    fetch(
      `${getApiBaseUrl()}/api/items/${itemId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((r) => r.json())
      .then((item) => {
        if (item.price_history) {
          setData(
            item.price_history.map((ph: any) => ({
              price: ph.price,
              date: new Date(ph.checked_at).toLocaleDateString(),
            }))
          )
        }
      })
      .catch(() => {})
  }, [itemId])

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-cyber-muted text-sm">
        No price history yet
      </div>
    )
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff0044" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ff0044" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#888", fontSize: 10 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#888", fontSize: 10 }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e1e1e",
              border: "1px solid #2a2a2a",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#e0e0e0" }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#ff0044"
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
