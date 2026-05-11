<template>
  <div class="page">
    <div class="header-row">
      <button class="back-btn" @click="$router.back()">&#x2190; 返回</button>
      <h2>通知中心</h2>
      <BaseButton variant="ghost" @click="handleMarkAll">全部已读</BaseButton>
    </div>

    <div v-if="notifications.length === 0">
      <BaseEmpty text="暂无通知" icon="🔔" />
    </div>

    <div
      v-for="n in notifications"
      :key="n.id"
      class="notif-item"
      :class="{ unread: !n.is_read }"
      @click="handleClick(n)"
    >
      <div class="notif-top">
        <div class="notif-title-row">
          <span v-if="!n.is_read" class="dot"></span>
          <span class="notif-title">{{ n.title }}</span>
        </div>
        <span class="notif-time">{{ new Date(n.created_at).toLocaleString() }}</span>
      </div>
      <p v-if="n.content" class="notif-content">{{ n.content }}</p>
    </div>

    <div v-if="total > notifications.length" class="load-more">
      <BaseButton variant="ghost" @click="loadMore" :disabled="loading">加载更多</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNotificationList, markRead, markAllRead } from '../api/notifications'
import { useNotification } from '../composables/useNotification'
import BaseButton from '../components/BaseButton.vue'
import BaseEmpty from '../components/BaseEmpty.vue'

const router = useRouter()
const { markOneRead, markAllRead: clearBadge } = useNotification()
const notifications = ref([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)

const LINK_MAP = {
  task: (id) => `/tasks/${id}`,
  product: (id) => `/products/${id}`,
  bind_request: () => '/binding',
  bind_accepted: () => '/binding',
  bind_rejected: () => '/binding',
  bind_unbound: () => '/binding',
  binding: () => '/binding',
  task_submitted: (id) => `/tasks/${id}`,
  task_updated: (id) => `/tasks/${id}`,
  task_deleted: () => '/tasks',
  product_confirmed: (id) => `/products/${id}`
}

onMounted(() => loadRecords())

async function loadRecords() {
  loading.value = true
  try {
    const data = await getNotificationList(page.value)
    notifications.value = [...notifications.value, ...data.records]
    total.value = data.total
    page.value++
  } catch { /* ignore */ }
  finally { loading.value = false }
}

function loadMore() { loadRecords() }

async function handleClick(n) {
  if (!n.is_read) {
    try { await markRead(n.id); n.is_read = true; markOneRead() } catch { /* ignore */ }
  }
  const fn = LINK_MAP[n.reference_type]
  if (fn && n.reference_id) { router.push(fn(n.reference_id)) }
  else if (fn) { router.push(fn()) }
}

async function handleMarkAll() {
  try {
    await markAllRead()
    notifications.value.forEach(n => { n.is_read = true })
    clearBadge()
  } catch { /* ignore */ }
}
</script>

<style scoped>
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.back-btn { background: none; border: none; color: var(--color-text-secondary); font-size: 13px; cursor: pointer; font-family: var(--font-body); padding: 0 0 4px 0; transition: color var(--transition-fast); }
.back-btn:hover { color: var(--color-primary); }
.header-row h2 { margin: 0; }

.notif-item {
  padding: 16px;
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  margin-bottom: 10px;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.notif-item:hover { transform: translateY(-1px); box-shadow: var(--shadow); }
.notif-item.unread {
  border-left: 4px solid var(--color-primary);
  background: linear-gradient(90deg, var(--color-primary-bg) 0%, var(--color-surface) 40px);
}
.notif-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
.notif-title-row { display: flex; align-items: center; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); flex-shrink: 0; }
.notif-title { font-weight: 600; font-size: 14px; }
.notif-content { font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; }
.notif-time { font-size: 11px; color: var(--color-text-secondary); white-space: nowrap; margin-left: 12px; }
.load-more { text-align: center; margin-top: 14px; }
</style>
