import axios from "axios"
import type { WishlistItem, User } from "@/types"

export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL
  if (url && url.length > 0) return url
  return typeof window !== "undefined" ? "" : "http://localhost:8000"
}

export function resolveImageUrl(path: string | null): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const base = getApiBaseUrl()
  return `${base}${path}`
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token")
      window.location.href = "/auth/login"
    }
    return Promise.reject(err)
  }
)

export async function login(username: string, password: string): Promise<string> {
  const { data } = await api.post("/api/auth/login", { username, password })
  localStorage.setItem("token", data.access_token)
  return data.access_token
}

export async function register(username: string, email: string, password: string): Promise<User> {
  const { data } = await api.post("/api/auth/register", { username, email, password })
  return data
}

export async function getMe(): Promise<User> {
  const { data } = await api.get("/api/auth/me")
  return data
}

export async function getItems(category?: string): Promise<WishlistItem[]> {
  const params = category ? { category } : {}
  const { data } = await api.get("/api/items", { params })
  return data
}

export async function createItem(formData: FormData): Promise<WishlistItem> {
  const { data } = await api.post("/api/items", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function updateItem(id: number, payload: Partial<WishlistItem>): Promise<WishlistItem> {
  const { data } = await api.put(`/api/items/${id}`, payload)
  return data
}

export async function deleteItem(id: number): Promise<void> {
  await api.delete(`/api/items/${id}`)
}

export async function getLinkCode(): Promise<string> {
  const { data } = await api.get("/api/users/link-code")
  return data.message
}

export async function adminGetUsers(): Promise<User[]> {
  const { data } = await api.get("/api/admin/users")
  return data
}

export async function adminDeleteUser(id: number): Promise<void> {
  await api.delete(`/api/admin/users/${id}`)
}

export async function adminMakeAdmin(id: number): Promise<User> {
  const { data } = await api.post(`/api/admin/users/${id}/make-admin`)
  return data
}

export async function adminGetItems(): Promise<WishlistItem[]> {
  const { data } = await api.get("/api/admin/items")
  return data
}

export async function adminDeleteItem(id: number): Promise<void> {
  await api.delete(`/api/admin/items/${id}`)
}
