"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        close: () => void
        setHeaderColor: (color: string) => void
        setBackgroundColor: (color: string) => void
        MainButton: {
          setText: (text: string) => void
          show: () => void
          hide: () => void
          onClick: (cb: () => void) => void
        }
        initDataUnsafe?: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
          }
        }
        colorScheme: string
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          button_color?: string
          button_text_color?: string
        }
        platform: string
      }
    }
  }
}

export default function TgWebApp() {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()
        tg.setHeaderColor("#0a0a0a")
        tg.setBackgroundColor("#0a0a0a")
      }
    } catch {
      // not in Telegram
    }
  }, [])

  return null
}
