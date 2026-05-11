<template>
  <div class="page">
    <button class="back-btn" @click="$router.back()">&#x2190; 返回</button>
    <div class="header-row">
      <h2>管理后台</h2>
      <BaseButton @click="openCreate">新增</BaseButton>
    </div>

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
            <td class="actions">
              <button class="edit-btn" @click="openEdit(row)">编辑</button>
              <button class="del-btn" @click="handleDelete(row.id)">删除</button>
            </td>
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

    <!-- 编辑弹窗 -->
    <BaseModal :visible="modalVisible" :title="modalTitle" @close="modalVisible = false">
      <form @submit.prevent="handleSave" class="edit-form">
        <div v-for="f in currentFields" :key="f.key" class="form-field">
          <label>{{ f.label }}</label>
          <input
            v-if="f.type === 'text' || f.type === 'number'"
            :type="f.type"
            v-model="formData[f.key]"
            class="field-input"
          />
          <textarea
            v-else-if="f.type === 'textarea'"
            v-model="formData[f.key]"
            class="field-input"
            rows="3"
          ></textarea>
          <select v-else-if="f.type === 'select'" v-model="formData[f.key]" class="field-input">
            <option v-for="o in f.options" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
          <label v-else-if="f.type === 'bool'" class="bool-label">
            <input type="checkbox" v-model="formData[f.key]" />
            <span>{{ f.label }}</span>
          </label>
        </div>
        <div class="form-actions">
          <BaseButton type="submit" variant="primary" :loading="saving">{{ editingId ? '保存' : '创建' }}</BaseButton>
          <BaseButton type="button" variant="ghost" @click="modalVisible = false">取消</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import request from '../api/request'
import BaseButton from '../components/BaseButton.vue'
import BaseModal from '../components/BaseModal.vue'

const tab = ref('users')
const rows = ref([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const saving = ref(false)
const stats = reactive({})

// 编辑弹窗状态
const modalVisible = ref(false)
const editingId = ref(null)
const formData = reactive({})

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

// 各表可编辑字段配置
const fieldConfig = {
  users: [
    { key: 'username', label: '用户名', type: 'text' },
    { key: 'password', label: '密码（留空不修改）', type: 'text' },
    { key: 'role', label: '角色', type: 'select', options: [{ value: 'user', label: 'user' }, { value: 'admin', label: 'admin' }] }
  ],
  tasks: [
    { key: 'title', label: '标题', type: 'text' },
    { key: 'description', label: '描述', type: 'textarea' },
    { key: 'publisher_id', label: '发布者ID', type: 'number' },
    { key: 'assigned_to_id', label: '执行者ID', type: 'number' },
    { key: 'points', label: '积分', type: 'number' },
    { key: 'status', label: '状态', type: 'select', options: [{ value: 'pending', label: '待完成' }, { value: 'submitted', label: '待审核' }, { value: 'approved', label: '已完成' }] }
  ],
  products: [
    { key: 'name', label: '名称', type: 'text' },
    { key: 'description', label: '描述', type: 'textarea' },
    { key: 'publisher_id', label: '发布者ID', type: 'number' },
    { key: 'price', label: '价格', type: 'number' },
    { key: 'status', label: '状态', type: 'select', options: [{ value: 'available', label: '可兑换' }, { value: 'purchased', label: '已购买' }, { value: 'verified', label: '已核销' }, { value: 'used', label: '已使用' }] }
  ],
  todos: [
    { key: 'title', label: '标题', type: 'text' },
    { key: 'owner_id', label: '所属者ID', type: 'number' },
    { key: 'creator_id', label: '创建者ID', type: 'number' },
    { key: 'visibility', label: '可见性', type: 'select', options: [{ value: 'private', label: '私人' }, { value: 'shared', label: '共享' }] },
    { key: 'is_completed', label: '已完成', type: 'bool' }
  ],
  recipes: [
    { key: 'name', label: '名称', type: 'text' },
    { key: 'category', label: '分类', type: 'text' },
    { key: 'author_id', label: '作者ID', type: 'number' },
    { key: 'method', label: '做法', type: 'textarea' }
  ],
  bindings: [
    { key: 'user_id_1', label: '用户1 ID', type: 'number' },
    { key: 'user_id_2', label: '用户2 ID', type: 'number' },
    { key: 'status', label: '状态', type: 'select', options: [{ value: 'active', label: '活跃' }, { value: 'inactive', label: '已解绑' }] }
  ],
  purchase_records: [
    { key: 'product_id', label: '商品ID', type: 'number' },
    { key: 'buyer_id', label: '购买者ID', type: 'number' },
    { key: 'points_frozen', label: '冻结积分', type: 'number' },
    { key: 'status', label: '状态', type: 'select', options: [{ value: 'frozen', label: '冻结' }, { value: 'verified', label: '已核销' }, { value: 'confirmed', label: '已确认' }, { value: 'expired', label: '已过期' }] }
  ],
  integral_records: [
    { key: 'user_id', label: '用户ID', type: 'number' },
    { key: 'amount', label: '金额', type: 'number' },
    { key: 'type', label: '类型', type: 'text' },
    { key: 'description', label: '描述', type: 'text' }
  ],
  notifications: [
    { key: 'user_id', label: '用户ID', type: 'number' },
    { key: 'type', label: '类型', type: 'text' },
    { key: 'title', label: '标题', type: 'text' },
    { key: 'content', label: '内容', type: 'textarea' },
    { key: 'is_read', label: '已读', type: 'bool' },
    { key: 'reference_type', label: '关联类型', type: 'text' },
    { key: 'reference_id', label: '关联ID', type: 'number' }
  ],
  anniversaries: [
    { key: 'name', label: '名称', type: 'text' },
    { key: 'bound_pair_id', label: '绑定对ID', type: 'number' },
    { key: 'date', label: '日期', type: 'text' },
    { key: 'is_pinned', label: '置顶', type: 'bool' }
  ]
}

const columns = computed(() => colMap[tab.value] || [])
const currentFields = computed(() => fieldConfig[tab.value] || [])
const modalTitle = computed(() => editingId.value ? '编辑记录' : '新增记录')

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

function resetForm() {
  Object.keys(formData).forEach(k => delete formData[k])
  editingId.value = null
}

function openCreate() {
  resetForm()
  modalVisible.value = true
}

function openEdit(row) {
  resetForm()
  editingId.value = row.id
  for (const f of currentFields.value) {
    if (row[f.key] !== undefined) {
      formData[f.key] = f.type === 'bool' ? Boolean(row[f.key]) : row[f.key]
    }
  }
  modalVisible.value = true
}

async function handleSave() {
  saving.value = true
  try {
    const payload = { ...formData }
    // 编辑时密码为空则不传
    if (editingId.value && tab.value === 'users' && !payload.password) {
      delete payload.password
    }
    if (editingId.value) {
      await request.put(`/admin/${tab.value}/${editingId.value}`, payload)
    } else {
      await request.post(`/admin/${tab.value}`, payload)
    }
    modalVisible.value = false
    // 刷新列表
    page.value = 1
    rows.value = []
    await fetchData()
  } catch (err) {
    alert(err.response?.data?.error || '操作失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const r = await request.get('/admin/stats/overview')
    const s = r.data
    statsList.forEach(item => { stats[item.key] = s[item.key] || 0 })
  } catch { /* */ }
  await fetchData()
})
</script>

<style scoped>
.page { overflow-x: hidden; max-width: 100%; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.header-row h2 { margin: 6px 0 0 0; }
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
.actions { white-space: nowrap; }

.edit-btn { background: none; border: 1px solid var(--color-border); padding: 3px 10px; border-radius: var(--radius-sm); font-size: 12px; color: var(--color-primary); cursor: pointer; margin-right: 6px; }
.edit-btn:hover { background: var(--color-primary-bg); }
.del-btn { background: none; border: 1px solid var(--color-border); padding: 3px 10px; border-radius: var(--radius-sm); font-size: 12px; color: var(--color-text-secondary); cursor: pointer; }
.del-btn:hover { color: var(--color-danger); border-color: var(--color-danger); }

.load-more { text-align: center; margin-top: 14px; }
.more-btn { background: none; border: 1.5px solid var(--color-border); padding: 8px 24px; border-radius: var(--radius-sm); cursor: pointer; color: var(--color-text-secondary); font-size: 13px; }
.more-btn:hover { color: var(--color-primary); border-color: var(--color-primary); }

/* 编辑表单 */
.edit-form { display: flex; flex-direction: column; gap: 14px; }
.form-field { display: flex; flex-direction: column; gap: 4px; }
.form-field label { font-size: 12px; font-weight: 600; color: var(--color-text-secondary); }
.field-input {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
  background: var(--color-surface);
  font-family: var(--font-body);
}
.field-input:focus { border-color: var(--color-primary); }
.bool-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 6px; }

@media (max-width: 640px) { .stat-grid { grid-template-columns: repeat(3, 1fr); } }
</style>
