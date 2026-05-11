<template>
  <div class="page">
    <h2>待办事项</h2>

    <div class="create-row">
      <textarea ref="titleInput" v-model="newTitle" class="input textarea" placeholder="新增待办..." rows="1" @input="autoResize"></textarea>
      <div class="create-actions">
        <select v-model="newVisibility" class="select">
          <option value="private">私人</option>
          <option value="shared">共享</option>
        </select>
        <BaseButton @click="handleCreate" :disabled="creating">添加</BaseButton>
      </div>
    </div>

    <div class="filter-row">
      <button :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</button>
      <button :class="{ active: filter === 'private' }" @click="filter = 'private'">私人</button>
      <button :class="{ active: filter === 'shared' }" @click="filter = 'shared'">共享</button>
    </div>

    <div v-if="todos.length === 0">
      <BaseEmpty text="暂无待办" />
    </div>

    <div v-for="todo in todos" :key="todo.id" class="todo-item">
      <div class="todo-left">
        <label class="check-wrap">
          <input type="checkbox" :checked="todo.is_completed" @change="toggleTodo(todo)" class="checkbox" />
          <span class="check-mark"></span>
        </label>
        <span class="todo-title" :class="{ done: todo.is_completed }">{{ todo.title }}</span>
        <StatusBadge :status="todo.visibility" />
      </div>
      <button class="del-btn" @click="handleDelete(todo.id)">删除</button>
    </div>
  </div>
</template>

<script>
export default { name: 'Todos' }
</script>
<script setup>
import { ref, watch, nextTick, onMounted, onActivated } from 'vue'
import { createTodo, getTodoList, updateTodo, deleteTodo } from '../api/todos'
import { useCache } from '../composables/useCache'
import BaseButton from '../components/BaseButton.vue'
import BaseEmpty from '../components/BaseEmpty.vue'
import StatusBadge from '../components/StatusBadge.vue'

const filter = ref('all')
const todosCache = useCache('todo_list', getTodoList)
const todos = ref(todosCache.data.value ?? [])
const newTitle = ref('')
const newVisibility = ref('private')
const creating = ref(false)
const titleInput = ref(null)

function autoResize() {
  const el = titleInput.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

watch(newTitle, () => nextTick(autoResize))

async function fetchTodos() {
  const f = filter.value === 'all' ? undefined : filter.value
  try {
    todos.value = await getTodoList(f)
    if (!f && todosCache.cacheKey) {
      todosCache.data.value = todos.value
      try { localStorage.setItem(todosCache.cacheKey, JSON.stringify(todos.value)) } catch { /* */ }
    }
  } catch { todos.value = [] }
}

watch(filter, fetchTodos)
onMounted(() => { fetchTodos() })
onActivated(() => { fetchTodos() })

async function handleCreate() {
  if (!newTitle.value.trim()) return
  creating.value = true
  try {
    await createTodo({ title: newTitle.value.trim(), visibility: newVisibility.value })
    newTitle.value = ''
    await fetchTodos()
  } finally { creating.value = false }
}

async function toggleTodo(todo) {
  try {
    await updateTodo(todo.id, { is_completed: !todo.is_completed })
    await fetchTodos()
  } catch { /* ignore */ }
}

async function handleDelete(id) {
  try {
    await deleteTodo(id)
    await fetchTodos()
  } catch { /* ignore */ }
}
</script>

<style scoped>
.page { overflow-x: hidden; max-width: 100%; }
.page h2 { margin-bottom: 18px; }
.create-row { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.create-actions { display: flex; gap: 10px; justify-content: space-between; }
.input { width: 100%; padding: 11px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-size: 14px; outline: none; background: var(--color-surface); transition: border-color var(--transition-fast); }
.input:focus { border-color: var(--color-primary); }
.select { padding: 10px 12px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-size: 14px; outline: none; background: var(--color-surface); font-family: var(--font-body); }
.textarea { resize: none; overflow: hidden; min-height: 42px; }

.filter-row { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
.filter-row button { padding: 7px 18px; border: 1.5px solid var(--color-border); border-radius: 20px; background: var(--color-surface); font-size: 13px; color: var(--color-text-secondary); cursor: pointer; font-weight: 500; transition: all var(--transition-fast); font-family: var(--font-body); white-space: nowrap; }
.filter-row button.active { background: var(--color-primary-gradient); color: #fff; border-color: transparent; box-shadow: 0 2px 10px var(--color-primary-shadow); }

/* ─── Todo Item ─── */
.todo-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--color-border-light); gap: 8px; }
.todo-item:last-child { border-bottom: none; }
.todo-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }

/* Custom checkbox */
.check-wrap { position: relative; cursor: pointer; flex-shrink: 0; }
.checkbox { position: absolute; opacity: 0; width: 0; height: 0; }
.check-mark {
  display: block; position: relative;
  width: 22px; height: 22px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  transition: all var(--transition-fast);
}
.checkbox:checked + .check-mark {
  background: var(--color-primary-gradient);
  border-color: transparent;
}
.checkbox:checked + .check-mark::after {
  content: '';
  position: absolute;
  left: 7px; top: 3px;
  width: 5px; height: 10px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  animation: checkPop 0.3s ease;
}

.todo-title { font-size: 14px; flex: 1; min-width: 0; word-break: break-word; transition: color var(--transition-fast); }
.todo-title.done { text-decoration: line-through; color: var(--color-text-secondary); opacity: 0.6; }

.del-btn { flex-shrink: 0; background: none; border: 1.5px solid var(--color-border); padding: 5px 12px; border-radius: var(--radius-sm); font-size: 12px; color: var(--color-text-secondary); cursor: pointer; font-weight: 500; transition: all var(--transition-fast); font-family: var(--font-body); }
.del-btn:hover { color: var(--color-danger); border-color: var(--color-danger); background: var(--color-danger-bg); }
</style>
