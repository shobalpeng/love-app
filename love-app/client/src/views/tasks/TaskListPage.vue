<template>
  <div class="task-list-page">
    <div class="header-row">
      <h2>任务中心</h2>
      <BaseButton @click="$router.push('/tasks/create')">发布任务</BaseButton>
    </div>

    <div class="search-row">
      <span class="search-icon">&#x1F50D;</span>
      <input v-model="search" class="input" type="text" placeholder="搜索任务标题..." @input="debounceSearch" />
    </div>

    <div class="filter-row">
      <select v-model="filter" class="select">
        <option value="all">全部任务</option>
        <option value="published">我发布的</option>
        <option value="assigned">指派给我的</option>
      </select>
      <select v-model="status" class="select">
        <option value="">全部状态</option>
        <option value="pending">待完成</option>
        <option value="submitted">待审核</option>
        <option value="approved">已完成</option>
      </select>
    </div>

    <BaseSkeleton v-if="initialLoad && tasks.length === 0" :count="5" />
    <div v-else-if="tasks.length === 0">
      <BaseEmpty text="暂无任务" />
    </div>

    <TransitionGroup name="list" tag="div">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="task-item"
        :class="'status-' + task.status"
        @click="$router.push(`/tasks/${task.id}`)"
      >
        <div class="task-left">
          <div class="task-top">
            <span class="task-title">{{ task.title }}</span>
          </div>
          <div class="task-meta">
            <span>{{ task.publisher_name }}</span>
            <span class="meta-arrow">&#x2192;</span>
            <span>{{ task.assigned_name }}</span>
          </div>
        </div>
        <StatusBadge :status="task.status" class="task-status" />
        <div class="task-right">
          <span class="points">+{{ task.points }}</span>
          <span class="points-unit">积分</span>
        </div>
      </div>
    </TransitionGroup>

    <div v-if="tasks.length < total" class="load-more">
      <BaseButton variant="ghost" @click="loadMore" :disabled="loading">加载更多</BaseButton>
    </div>
  </div>
</template>

<script>
export default { name: 'TaskList' }
</script>
<script setup>
import { ref, watch, onMounted, onActivated } from 'vue'
import { getTaskList } from '../../api/tasks'
import { useCache } from '../../composables/useCache'
import BaseButton from '../../components/BaseButton.vue'
import BaseEmpty from '../../components/BaseEmpty.vue'
import BaseSkeleton from '../../components/BaseSkeleton.vue'
import StatusBadge from '../../components/StatusBadge.vue'

const filter = ref('all')
const status = ref('')
const search = ref('')
const tasksCache = useCache('task_list', () => getTaskList())
const tasks = ref(tasksCache.data.value?.records ?? [])
const total = ref(tasksCache.data.value?.total ?? 0)
const page = ref(1)
const loading = ref(false)
const initialLoad = ref(true)

let searchTimer = null
function debounceSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchTasks(true), 300)
}

async function fetchTasks(reset = true) {
  if (reset) {
    page.value = 1
    tasks.value = []
  }
  loading.value = true
  const f = filter.value === 'all' ? undefined : filter.value
  const s = search.value || undefined
  const st = status.value || undefined
  try {
    const data = await getTaskList(f, s, st, page.value)
    tasks.value = [...tasks.value, ...data.records]
    total.value = data.total
    page.value++
    // 缓存默认视图（无筛选、第一页）
    if (!f && !s && !st && reset && tasksCache.cacheKey) {
      tasksCache.data.value = data
      try { localStorage.setItem(tasksCache.cacheKey, JSON.stringify(data)) } catch { /* */ }
    }
  } catch { /* ignore */ }
  finally { loading.value = false; initialLoad.value = false }
}

function loadMore() { fetchTasks(false) }

watch([filter, status], () => fetchTasks(true))
onMounted(() => { fetchTasks(true) })
// keep-alive 激活时刷新数据
onActivated(() => { fetchTasks(true) })
</script>

<style scoped>
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-row h2 { margin: 0; }

.search-row {
  position: relative;
  margin-bottom: 14px;
}
.search-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  font-size: 15px; opacity: 0.4; pointer-events: none;
}
.input {
  width: 100%;
  padding: 11px 14px 11px 40px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 14px;
  outline: none;
  background: var(--color-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-glow); }

.filter-row {
  display: flex; gap: 10px; margin-bottom: 14px;
}
.select {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  font-size: 13px;
  color: var(--color-text);
  outline: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-weight: 500;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
  transition: border-color var(--transition-fast);
}
.select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-glow);
}

/* ─── Task Item ─── */
.task-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  border-left: 5px solid var(--color-border);
  margin-bottom: 10px;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.task-item:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.task-item.status-pending { border-left-color: #f59e0b; }
.task-item.status-submitted { border-left-color: #60a5fa; }
.task-item.status-approved { border-left-color: #10b981; }
.task-item.status-rejected { border-left-color: #ef4444; }

.task-left { flex: 1; min-width: 0; }
.task-top { display: flex; align-items: center; margin-bottom: 8px; }
.task-title { font-weight: 600; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.task-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-secondary); font-weight: 500; }
.meta-arrow { color: var(--color-primary-light); }

.task-status { flex-shrink: 0; margin-left: 10px; }

.task-right { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; min-width: 52px; }
.points { color: var(--color-primary); font-weight: 800; font-size: 24px; line-height: 1; font-family: var(--font-display); }
.points-unit { font-size: 11px; color: var(--color-text-secondary); }

.load-more { text-align: center; margin-top: 18px; }

/* ─── List transition ─── */
.list-enter-active { animation: fadeInUp 0.35s ease; }
</style>
