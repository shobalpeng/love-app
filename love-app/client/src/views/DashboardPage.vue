<template>
  <div class="dashboard">
    <div class="greeting">
      <span class="greeting-emoji">&#x1F44B;</span>
      <div>
        <p class="greeting-hi">Hi, <strong>{{ user?.username }}</strong></p>
        <p v-if="bound" class="greeting-sub">
          &#x2665; 与 <strong>{{ partner?.username }}</strong> 在一起
        </p>
        <p v-else class="greeting-sub">今天也是美好的一天</p>
      </div>
    </div>

    <BaseCard v-if="!bound" class="section bind-card">
      <div class="bind-hint">
        <span class="hint-icon">&#x1F48C;</span>
        <p>你还没有绑定伴侣</p>
        <BaseButton variant="primary" @click="$router.push('/binding')">去绑定</BaseButton>
      </div>
    </BaseCard>

    <template v-if="bound">
      <!-- 纪念日 -->
      <BaseCard v-if="displayAnniversaries.length > 0" class="section anni-card">
        <template #header>
          <div class="anni-header">
            <span>纪念日</span>
            <span class="anni-link" @click="$router.push('/anniversaries')">管理 &#x203A;</span>
          </div>
        </template>
        <div v-for="event in displayAnniversaries" :key="event.id" class="anni-event">
          <div class="event-left">
            <span class="event-name">{{ event.name }}</span>
            <span class="event-date">&#x1F4C5; {{ formatDate(event.date) }}</span>
          </div>
          <div class="event-right">
            <span class="event-days">{{ calcDays(event.date) }}</span>
            <span class="event-unit">天</span>
          </div>
        </div>
      </BaseCard>
      <BaseCard v-else class="section anni-card empty-anni">
        <div class="anni-placeholder">
          <span class="anni-hint-icon">&#x1F48C;</span>
          <p>还没有设置纪念日</p>
          <BaseButton variant="ghost" @click="$router.push('/anniversaries')">去设置</BaseButton>
        </div>
      </BaseCard>

      <!-- 即将到来提醒 -->
      <div v-if="upcomingCount > 0" class="upcoming-banner" @click="$router.push('/notifications')">
        &#x1F514; 您有 <strong>{{ upcomingCount }}</strong> 个纪念日快到啦！
      </div>

      <!-- 积分 -->
      <BaseCard class="section integral-card">
        <div class="integral-header">
          <span class="integral-label">我的积分</span>
          <span class="integral-link" @click="$router.push('/integrals')">查看明细 &#x203A;</span>
        </div>
        <div class="integral-row">
          <div class="integral-item main">
            <span class="num">{{ balance }}</span>
            <span class="unit">可用</span>
          </div>
          <div class="integral-divider"></div>
          <div class="integral-item">
            <span class="num frozen">{{ frozen }}</span>
            <span class="unit">冻结中</span>
          </div>
        </div>
      </BaseCard>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import { useBindingStore } from '../stores/bindingStore'
import { getBalance } from '../api/integrals'
import { getAnniversaries } from '../api/anniversaries'
import { useCache } from '../composables/useCache'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'

const { user } = storeToRefs(useAuthStore())
const { bound, partner } = storeToRefs(useBindingStore())
const bindingStore = useBindingStore()

const balanceCache = useCache('balance', getBalance)
const anniCache = useCache('anniversaries', getAnniversaries)

const balance = ref(balanceCache.data.value?.available ?? 0)
const frozen = ref(balanceCache.data.value?.frozen ?? 0)
const anniversaries = ref((anniCache.data.value ?? []).map(e => ({ ...e, is_pinned: !!e.is_pinned })))

// 置顶筛选逻辑
const displayAnniversaries = computed(() => {
  const list = anniversaries.value
  if (list.length === 0) return []
  if (list.length === 1) return list
  const pinned = list.filter(e => e.is_pinned)
  if (pinned.length > 0) return pinned
  // 都没置顶时显示最早添加的（id最小）
  return [list.reduce((a, b) => (a.id < b.id ? a : b))]
})

// 即将到来的纪念日（未来5天内）
const upcomingCount = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return anniversaries.value.filter(e => {
    const d = new Date(e.date)
    const thisYear = new Date(today.getFullYear(), d.getMonth(), d.getDate())
    thisYear.setHours(0, 0, 0, 0)
    if (thisYear < today) return false
    const diff = Math.floor((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff >= 1 && diff <= 5
  }).length
})

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

onMounted(async () => {
  await bindingStore.fetchStatus()
  if (bound.value) {
    balanceCache.refresh().then(() => {
      const d = balanceCache.data.value
      if (d) { balance.value = d.available ?? 0; frozen.value = d.frozen ?? 0 }
    })
    anniCache.refresh().then(() => {
      anniversaries.value = (anniCache.data.value ?? []).map(e => ({ ...e, is_pinned: !!e.is_pinned }))
    })
  }
})
</script>

<style scoped>
.greeting {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  animation: fadeInUp 0.5s ease;
}
.greeting-emoji { font-size: 36px; }
.greeting-hi { font-size: 20px; color: var(--color-text); }
.greeting-hi strong { font-family: var(--font-display); font-weight: 700; }
.greeting-sub { font-size: 13px; color: var(--color-text-secondary); }

.section { margin-bottom: 18px; }

/* ─── Bind Hint ─── */
.bind-card { background: linear-gradient(135deg, var(--color-primary-bg) 0%, #fff 100%); }
.bind-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
}
.bind-hint p { color: var(--color-text-secondary); font-size: 14px; }
.hint-icon { font-size: 44px; }

/* ─── Anniversary Card ─── */
.anni-card {
  background: linear-gradient(145deg, #fef0f3 0%, var(--color-surface) 40%, #fff5f0 100%);
  animation: fadeInUp 0.5s ease;
}
.anni-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.anni-link { font-size: 13px; color: var(--color-primary); cursor: pointer; font-weight: 500; }
.anni-event {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);
  gap: 12px;
}
.anni-event:last-child { border-bottom: none; }
.event-left { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.event-name { font-weight: 600; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.event-date { font-size: 12px; color: var(--color-text-secondary); }
.event-right { display: flex; align-items: baseline; gap: 3px; flex-shrink: 0; }
.event-days { font-size: 28px; font-weight: 800; color: var(--color-primary); font-family: var(--font-display); line-height: 1; }
.event-unit { font-size: 12px; color: var(--color-text-secondary); font-weight: 500; }

/* Empty anniversary */
.empty-anni { background: linear-gradient(145deg, var(--color-bg-soft) 0%, var(--color-surface) 60%); }
.anni-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
}
.anni-hint-icon { font-size: 36px; opacity: 0.5; }
.anni-placeholder p { font-size: 14px; color: var(--color-text-secondary); }

/* ─── Upcoming Banner ─── */
.upcoming-banner {
  margin-bottom: 16px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #fef3c7 0%, #fff9e6 100%);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: #92400e;
  cursor: pointer;
  text-align: center;
  font-weight: 500;
  border: 1px solid #fde68a;
  transition: transform var(--transition-fast);
  animation: fadeInUp 0.4s ease;
}
.upcoming-banner:hover { transform: translateY(-1px); }
.upcoming-banner strong { color: #d97706; font-family: var(--font-display); }

/* ─── Integral Card ─── */
.integral-card {
  background: linear-gradient(135deg, var(--color-primary-bg) 0%, var(--color-surface) 50%);
  animation: fadeInUp 0.5s ease;
}
.integral-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.integral-label { font-weight: 600; font-size: 14px; color: var(--color-text-secondary); }
.integral-link { font-size: 13px; color: var(--color-primary); cursor: pointer; font-weight: 500; }
.integral-row { display: flex; justify-content: center; align-items: center; }
.integral-item { display: flex; flex-direction: column; align-items: center; flex: 1; }
.integral-divider { width: 1px; height: 48px; background: var(--color-border); }
.num {
  font-size: 42px;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1.1;
  font-family: var(--font-display);
}
.num.frozen { color: var(--color-text-secondary); font-size: 32px; }
.unit { font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; font-weight: 500; }

@media (max-width: 640px) {
  .anni-days { font-size: 56px; }
  .num { font-size: 36px; }
}
</style>
