import type { Metadata } from "next"
import "./globals.css"
import TgWebApp from "@/components/TgWebApp"

export const metadata: Metadata = {
  title: "WISHLIST — Wishlist Tracker",
  description: "Personal wishlist & price tracker",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body className="min-h-screen">
        <TgWebApp />
        {children}
      </body>
    </html>
  )
}
