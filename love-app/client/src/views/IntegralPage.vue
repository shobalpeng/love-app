<template>
  <div class="page">
    <button class="back-btn" @click="$router.back()">&#x2190; 返回</button>
    <h2>积分明细</h2>

    <BaseCard class="section balance-card">
      <div class="score-grid">
        <div class="score-item"><span class="num">{{ balance.available }}</span><span class="unit">可用</span></div>
        <div class="score-item"><span class="num frozen-num">{{ balance.frozen }}</span><span class="unit">冻结中</span></div>
        <div class="score-item"><span class="num earned-num">{{ balance.earned }}</span><span class="unit">已获得</span></div>
        <div class="score-item"><span class="num spent-num">{{ balance.spent }}</span><span class="unit">已消费</span></div>
      </div>
    </BaseCard>

    <BaseCard>
      <template #header>积分流水</template>
      <div v-if="records.length === 0">
        <BaseEmpty text="暂无流水" />
      </div>
      <div v-for="rec in records" :key="rec.id" class="record-item">
        <div class="rec-left">
          <span class="rec-desc">{{ rec.description }}</span>
          <span class="rec-time">{{ new Date(rec.created_at).toLocaleString() }}</span>
        </div>
        <span class="rec-amount" :class="{ positive: rec.amount > 0, negative: rec.amount < 0 }">
          {{ rec.amount > 0 ? '+' : '' }}{{ rec.amount }}
        </span>
      </div>
      <div v-if="total > records.length" class="load-more">
        <BaseButton variant="ghost" @click="loadMore" :disabled="loading">加载更多</BaseButton>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getBalance, getRecords } from '../api/integrals'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseEmpty from '../components/BaseEmpty.vue'

const balance = reactive({ available: 0, frozen: 0, earned: 0, spent: 0 })
const records = ref([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)

onMounted(async () => {
  try { Object.assign(balance, await getBalance()) } catch { /* ignore */ }
  await loadRecords()
})

async function loadRecords() {
  loading.value = true
  try {
    const data = await getRecords(page.value)
    records.value = [...records.value, ...data.records]
    total.value = data.total
    page.value++
  } catch { /* ignore */ }
  finally { loading.value = false }
}

function loadMore() { loadRecords() }
</script>

<style scoped>
.page h2 { margin: 6px 0 18px; }
.back-btn { background: none; border: none; color: var(--color-text-secondary); font-size: 13px; cursor: pointer; font-family: var(--font-body); padding: 0 0 6px 0; transition: color var(--transition-fast); }
.back-btn:hover { color: var(--color-primary); }
.section { margin-bottom: 18px; }

.balance-card {
  background: linear-gradient(135deg, var(--color-primary-bg) 0%, var(--color-surface) 60%);
}
.score-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 8px; }
.score-item { display: flex; flex-direction: column; align-items: center; }
.num { font-size: 32px; font-weight: 800; color: var(--color-primary); font-family: var(--font-display); }
.frozen-num { color: var(--color-text-secondary); }
.earned-num { color: var(--color-success); }
.spent-num { color: var(--color-danger); }
.unit { font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; font-weight: 500; }

.record-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--color-border-light); }
.record-item:last-child { border-bottom: none; }
.rec-left { display: flex; flex-direction: column; gap: 4px; }
.rec-desc { font-size: 14px; font-weight: 500; }
.rec-time { font-size: 11px; color: var(--color-text-secondary); }
.rec-amount { font-weight: 700; font-size: 16px; }
.rec-amount.positive { color: var(--color-success); }
.rec-amount.negative { color: var(--color-danger); }
.load-more { text-align: center; margin-top: 14px; }
</style>
