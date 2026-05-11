<template>
  <div class="page">
    <button class="back-btn" @click="$router.back()">&#x2190; 返回</button>
    <h2>管理后台</h2>

    <!-- 统计 -->
    <div class="stat-grid">
      <div v-for="s in statsList" :key="s.key" class="stat-card" :class="{ active: tab === s.key }" @click="switchTab(s.key)">
        <span class="stat-num">{{ stats[s.key] || 0 }}</span>
        <span class="stat-label">{{ s.label }}</span>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th v-for="col in columns" :key="col">{{ col }}</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td v-for="col in columns" :key="col" :title="formatVal(row, col)">
              {{ truncate(formatVal(row, col)) }}
            </td>
            <td><button class="del-btn" @click="handleDelete(row.id)">删除</button></td>
          </tr>
          <tr v-if="rows.length === 0">
            <td :colspan="columns.length + 1" class="empty">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="rows.length < total" class="load-more">
      <button class="more-btn" @click="loadMore" :disabled="loading">加载更多</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import request from '../api/request'

const tab = ref('users')
const rows = ref([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const stats = reactive({})

const statsList = [
  { key: 'users', label: '用户' },
  { key: 'bindings', label: '绑定' },
  { key: 'tasks', label: '任务' },
  { key: 'products', label: '商品' },
  { key: 'todos', label: '待办' },
  { key: 'recipes', label: '菜谱' },
  { key: 'purchase_records', label: '购买记录' },
  { key: 'integral_records', label: '积分流水' },
  { key: 'notifications', label: '通知' },
  { key: 'anniversaries', label: '纪念日' }
]

const colMap = {
  users: ['id','username','role','created_at'],
  bindings: ['id','user1','user2','status','bound_at','unbound_at'],
  tasks: ['id','title','publisher_id','assigned_to_id','points','status','created_at'],
  products: ['id','name','publisher_id','price','status','created_at'],
  todos: ['id','title','owner_id','visibility','is_completed','created_at'],
  recipes: ['id','name','category','author_id','created_at'],
  purchase_records: ['id','product_id','buyer_id','points_frozen','status','frozen_at','verified_at','confirmed_at'],
  integral_records: ['id','user_id','amount','type','balance_after','created_at'],
  notifications: ['id','user_id','type','title','is_read','created_at'],
  anniversaries: ['id','name','date','is_pinned','created_at']
}

const columns = computed(() => colMap[tab.value] || [])

function formatVal(row, col) {
  const v = row[col]
  if (v === null || v === undefined) return '-'
  if (typeof v === 'boolean') return v ? '是' : '否'
  return String(v)
}
function truncate(str) {
  return str.length > 30 ? str.slice(0, 28) + '…' : str
}

async function switchTab(key) {
  tab.value = key
  page.value = 1
  rows.value = []
  await fetchData()
}

async function fetchData() {
  loading.value = true
  try {
    const r = await request.get(`/admin/${tab.value}?page=${page.value}&pageSize=50`)
    rows.value = [...rows.value, ...r.data.records]
    total.value = r.data.total
    page.value++
  } catch { /* */ }
  finally { loading.value = false }
}

function loadMore() { fetchData() }

async function handleDelete(id) {
  if (!confirm('确定删除？')) return
  try {
    await request.delete(`/admin/${tab.value}/${id}`)
    rows.value = rows.value.filter(r => r.id !== id)
  } catch { alert('删除失败') }
}

onMounted(async () => {
  try {
    stats.value = (await request.get('/admin/stats/overview')).data
    const s = stats.value
    statsList.forEach(item => { stats[item.key] = s[item.key] || 0 })
  } catch { /* */ }
  await fetchData()
})
</script>

<style scoped>
.page { overflow-x: hidden; max-width: 100%; }
.page h2 { margin: 6px 0 16px; }
.back-btn { background: none; border: none; color: var(--color-text-secondary); font-size: 13px; cursor: pointer; font-family: var(--font-body); padding: 0 0 6px 0; transition: color var(--transition-fast); }
.back-btn:hover { color: var(--color-primary); }

.stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 16px; }
.stat-card { display: flex; flex-direction: column; align-items: center; padding: 12px 4px; cursor: pointer; border-radius: var(--radius-sm); border: 2px solid var(--color-border); transition: all var(--transition-fast); }
.stat-card:hover { border-color: var(--color-primary-light); }
.stat-card.active { border-color: var(--color-primary); background: var(--color-primary-bg); }
.stat-num { font-size: 22px; font-weight: 800; color: var(--color-primary); font-family: var(--font-display); }
.stat-label { font-size: 11px; color: var(--color-text-secondary); margin-top: 2px; }

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { text-align: left; padding: 10px 8px; border-bottom: 2px solid var(--color-border); font-weight: 600; color: var(--color-text-secondary); white-space: nowrap; }
td { padding: 8px; border-bottom: 1px solid var(--color-border-light); color: var(--color-text-secondary); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
tr:hover td { background: var(--color-bg-soft); }
.empty { text-align: center; padding: 32px; color: var(--color-text-secondary); }

.del-btn { background: none; border: 1px solid var(--color-border); padding: 3px 10px; border-radius: var(--radius-sm); font-size: 12px; color: var(--color-text-secondary); cursor: pointer; }
.del-btn:hover { color: var(--color-danger); border-color: var(--color-danger); }

.load-more { text-align: center; margin-top: 14px; }
.more-btn { background: none; border: 1.5px solid var(--color-border); padding: 8px 24px; border-radius: var(--radius-sm); cursor: pointer; color: var(--color-text-secondary); font-size: 13px; }
.more-btn:hover { color: var(--color-primary); border-color: var(--color-primary); }

@media (max-width: 640px) { .stat-grid { grid-template-columns: repeat(3, 1fr); } }
</style>
