<template>
  <div class="page">
    <button class="back-btn" @click="$router.back()">&#x2190; 返回</button>
    <h2>纪念日</h2>

    <!-- 添加表单 -->
    <BaseCard class="section">
      <template #header>添加纪念日</template>
      <form @submit.prevent="handleAdd" class="form">
        <input v-model="newName" type="text" class="input" placeholder="纪念日名称" required />
        <div class="add-row">
          <input v-model="newDate" type="date" class="input date-input" required />
          <BaseButton type="submit" variant="primary">添加</BaseButton>
        </div>
      </form>
    </BaseCard>

    <!-- 事件列表 -->
    <BaseCard v-if="events.length > 0" class="section">
      <template #header>我的纪念日</template>
      <div class="event-list">
        <div v-for="event in events" :key="event.id" class="event-item">
          <div class="event-info">
            <span class="event-name">
              <span v-if="event.is_pinned" class="pin-badge">&#x1F4CC;</span>
              {{ event.name }}
            </span>
            <span class="event-date">&#x1F4C5; {{ formatDate(event.date) }}</span>
          </div>
          <div class="event-right">
            <span class="event-days">{{ calcDays(event.date) }}<span class="days-unit"> 天</span></span>
            <button
              class="pin-btn"
              :key="'pin-' + event.id + '-' + event.is_pinned"
              :style="pinBtnStyle(event.is_pinned)"
              @click="handlePin(event.id)"
              :title="event.is_pinned ? '取消置顶' : '置顶'"
            >
              <span :style="pinIconStyle(event.is_pinned)">&#x1F4CC;</span>
            </button>
            <button class="del-btn" @click="handleDelete(event.id)">&#x2715;</button>
          </div>
        </div>
      </div>
    </BaseCard>

    <BaseCard v-else>
      <BaseEmpty text="还没有纪念日" icon="&#x1F48C;" />
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import { getAnniversaries, createAnniversary, deleteAnniversary, togglePin } from '../api/anniversaries'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseEmpty from '../components/BaseEmpty.vue'

const { user } = storeToRefs(useAuthStore())
const events = ref([])
const newName = ref('')
const newDate = ref('')

async function loadEvents() {
  try {
    const data = await getAnniversaries()
    // 确保 is_pinned 是真正的布尔值
    events.value = (data || []).map(e => ({ ...e, is_pinned: !!e.is_pinned }))
    if (user.value?.username) {
      localStorage.setItem(`cache_anni_${user.value.username}`, JSON.stringify(events.value))
    }
  } catch { events.value = [] }
}

async function handleAdd() {
  if (!newName.value.trim() || !newDate.value) return
  try {
    await createAnniversary({ name: newName.value.trim(), date: newDate.value })
    newName.value = ''
    newDate.value = ''
    await loadEvents()
  } catch { alert('添加失败') }
}

async function handleDelete(id) {
  try {
    await deleteAnniversary(id)
    await loadEvents()
  } catch { alert('删除失败') }
}

async function handlePin(id) {
  const idx = events.value.findIndex(e => e.id === id)
  if (idx === -1) return
  const newVal = !events.value[idx].is_pinned
  const updated = { ...events.value[idx], is_pinned: newVal }
  // 用 splice 替换确保 Vue 检测到变化
  events.value.splice(idx, 1, updated)
  try { await togglePin(id) } catch {
    events.value.splice(idx, 1, { ...updated, is_pinned: !newVal })
  }
}

function calcDays(dateStr) {
  const start = new Date(dateStr)
  const today = new Date()
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function pinBtnStyle(pinned) {
  return pinned
    ? { border: '1.5px solid #e8546b', background: '#fff0f0' }
    : { border: '1.5px solid #ddd', background: 'transparent' }
}
function pinIconStyle(pinned) {
  return pinned
    ? { filter: 'none', opacity: 1 }
    : { filter: 'grayscale(1)', opacity: 0.25 }
}

onMounted(loadEvents)
</script>

<style scoped>
.page { overflow-x: hidden; max-width: 100%; }
.page h2 { margin: 6px 0 20px; }
.back-btn {
  background: none; border: none; color: var(--color-text-secondary);
  font-size: 13px; cursor: pointer; font-family: var(--font-body);
  padding: 0 0 6px 0; transition: color var(--transition-fast);
}
.back-btn:hover { color: var(--color-primary); }
.section { margin-bottom: 16px; }

.form { display: flex; flex-direction: column; gap: 10px; }
.input {
  padding: 11px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
  background: var(--color-surface);
  font-family: var(--font-body);
  transition: border-color var(--transition-fast);
}
.input:focus { border-color: var(--color-primary); }
.add-row { display: flex; gap: 10px; }
.date-input { flex: 1; }

/* ─── Event List ─── */
.event-list { display: flex; flex-direction: column; }
.event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border-light);
  gap: 12px;
}
.event-item:last-child { border-bottom: none; }
.event-info { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.event-name { font-weight: 600; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
.pin-badge { font-size: 14px; flex-shrink: 0; }
.event-date { font-size: 12px; color: var(--color-text-secondary); }
.event-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.event-days { font-weight: 800; font-size: 18px; color: var(--color-primary); font-family: var(--font-display); white-space: nowrap; }
.days-unit { font-size: 11px; font-weight: 500; color: var(--color-text-secondary); }

.pin-btn {
  width: 30px; height: 30px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border);
  background: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition-fast);
}
.pin-btn:hover { border-color: var(--color-primary) !important; }

.del-btn {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border);
  background: none;
  color: var(--color-text-secondary);
  font-size: 12px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition-fast);
}
.del-btn:hover { color: var(--color-danger); border-color: var(--color-danger); background: var(--color-danger-bg); }
</style>
