<template>
  <div class="binding-page">
    <button class="back-btn" @click="$router.back()">&#x2190; 返回</button>
    <h2>伴侣绑定</h2>

    <div v-if="bound" class="current-binding">
      <BaseCard>
        <template #header>当前绑定</template>
        <p>已与 <strong>{{ partner?.username }}</strong> 绑定</p>
        <p class="since">绑定时间：{{ boundAt ? new Date(boundAt).toLocaleDateString() : '' }}</p>
        <BaseButton variant="danger" @click="handleUnbind" :disabled="unbinding">解除绑定</BaseButton>
      </BaseCard>
    </div>

    <div v-else>
      <BaseCard class="section">
        <template #header>搜索伴侣</template>
        <div class="search-row">
          <input v-model="searchName" type="text" placeholder="输入对方的用户名" class="input" />
          <BaseButton @click="handleSendRequest" :disabled="sending">发送绑定申请</BaseButton>
        </div>
        <p v-if="searchError" class="error">{{ searchError }}</p>
        <p v-if="searchSuccess" class="success">{{ searchSuccess }}</p>
      </BaseCard>

      <BaseCard class="section">
        <template #header>收到的绑定申请</template>
        <div v-if="requests.length === 0">
          <BaseEmpty text="暂无申请" />
        </div>
        <div v-for="req in requests" :key="req.id" class="request-item">
          <div class="req-info">
            <span class="from-user">{{ req.from_username }}</span>
            <span class="req-time">{{ new Date(req.created_at).toLocaleDateString() }}</span>
          </div>
          <div class="req-actions">
            <BaseButton variant="primary" @click="handleAccept(req.id)">同意</BaseButton>
            <BaseButton variant="ghost" @click="handleReject(req.id)">拒绝</BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useBindingStore } from '../stores/bindingStore'
import { sendRequest, getRequests, acceptRequest, rejectRequest, unbind } from '../api/bindings'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseEmpty from '../components/BaseEmpty.vue'

const store = useBindingStore()
const { bound, partner, boundAt } = storeToRefs(store)

const searchName = ref('')
const searchError = ref('')
const searchSuccess = ref('')
const sending = ref(false)
const requests = ref([])
const unbinding = ref(false)

onMounted(async () => {
  await store.fetchStatus()
  if (!bound.value) { await loadRequests() }
})

async function loadRequests() {
  try { requests.value = await getRequests() } catch { /* ignore */ }
}

async function handleSendRequest() {
  searchError.value = ''; searchSuccess.value = ''
  if (!searchName.value.trim()) { searchError.value = '请输入用户名'; return }
  sending.value = true
  try {
    await sendRequest(searchName.value.trim())
    searchSuccess.value = `已向 ${searchName.value.trim()} 发送绑定申请`
    searchName.value = ''
  } catch (err) { searchError.value = err.response?.data?.error || '请求失败' }
  finally { sending.value = false }
}

async function handleAccept(id) {
  try { await acceptRequest(id); searchSuccess.value = '绑定成功！'; await store.fetchStatus() }
  catch (err) { searchError.value = err.response?.data?.error || '操作失败' }
}

async function handleReject(id) {
  try { await rejectRequest(id); await loadRequests() }
  catch (err) { searchError.value = err.response?.data?.error || '操作失败' }
}

async function handleUnbind() {
  if (!confirm('确定要解除绑定吗？')) return
  unbinding.value = true
  try { await unbind(); await store.fetchStatus(); searchError.value = ''; searchSuccess.value = '' }
  catch (err) { searchError.value = err.response?.data?.error || '解绑失败' }
  finally { unbinding.value = false }
}
</script>

<style scoped>
.binding-page h2 { margin: 6px 0 20px; }
.back-btn {
  background: none; border: none; color: var(--color-text-secondary);
  font-size: 13px; cursor: pointer; font-family: var(--font-body);
  padding: 0 0 6px 0; transition: color var(--transition-fast);
}
.back-btn:hover { color: var(--color-primary); }
.section { margin-bottom: 18px; }
.search-row { display: flex; gap: 12px; }
.input { flex: 1; padding: 11px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-size: 14px; outline: none; background: var(--color-surface); transition: border-color var(--transition-fast); }
.input:focus { border-color: var(--color-primary); }
.error { color: var(--color-danger); font-size: 13px; margin-top: 10px; }
.success { color: var(--color-success); font-size: 13px; margin-top: 10px; }

.request-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--color-border-light); gap: 12px; }
.request-item:last-child { border-bottom: none; }
.req-info { display: flex; flex-direction: column; gap: 2px; }
.from-user { font-weight: 600; }
.req-time { color: var(--color-text-secondary); font-size: 12px; }
.req-actions { display: flex; gap: 8px; }

.current-binding p { margin-bottom: 8px; color: var(--color-text-secondary); font-size: 14px; }
.current-binding .since { font-size: 12px; margin-bottom: 16px; }
.current-binding strong { color: var(--color-text); font-weight: 700; font-size: 16px; }
</style>
