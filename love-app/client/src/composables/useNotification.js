import { ref, onMounted, onUnmounted } from 'vue'
import { getUnreadCount } from '../api/notifications'

// 模块级共享状态，确保所有组件使用同一份数据
const unreadCount = ref(0)
let timer = null
let pollCount = 0

async function fetchCount() {
  try {
    const data = await getUnreadCount()
    unreadCount.value = data.count
  } catch {
    // ignore
  }
}

function startPolling(interval = 30000) {
  pollCount++
  if (pollCount === 1) {
    fetchCount()
    timer = setInterval(fetchCount, interval)
  }
}

function stopPolling() {
  pollCount--
  if (pollCount <= 0) {
    pollCount = 0
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }
}

// 标记已读后立即刷新计数
function markOneRead() {
  if (unreadCount.value > 0) {
    unreadCount.value--
  }
}

function markAllRead() {
  unreadCount.value = 0
}

export function useNotification() {
  onMounted(() => startPolling())
  onUnmounted(() => stopPolling())

  return { unreadCount, fetchCount, markOneRead, markAllRead }
}
