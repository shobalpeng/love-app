import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'

const CACHE_VERSION = 2

// 通用数据缓存：先读缓存即时显示，后台刷新
export function useCache(key, fetcher) {
  const authStore = useAuthStore()
  const cacheKey = authStore.user ? `v${CACHE_VERSION}_cache_${authStore.user.username}_${key}` : null

  const data = ref(readCache())

  function readCache() {
    if (!cacheKey) return null
    try {
      const raw = localStorage.getItem(cacheKey)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  function writeCache(val) {
    if (!cacheKey) return
    try { localStorage.setItem(cacheKey, JSON.stringify(val)) } catch { /* ignore */ }
  }

  async function refresh() {
    try {
      const fresh = await fetcher()
      data.value = fresh
      writeCache(fresh)
    } catch { /* ignore */ }
  }

  // 清除缓存
  function clearCache() {
    if (!cacheKey) return
    try { localStorage.removeItem(cacheKey) } catch { /* ignore */ }
  }

  return { data, cacheKey, refresh, clearCache }
}
