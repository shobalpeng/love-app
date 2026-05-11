<template>
  <div class="page">
    <button class="back-btn" @click="$router.back()">&#x2190; 返回</button>
    <h2>关于我</h2>

    <!-- 用户信息 -->
    <BaseCard class="section profile-card">
      <div class="profile">
        <div class="avatar-ring">
          <div class="avatar">{{ user?.username?.charAt(0)?.toUpperCase() }}</div>
        </div>
        <p class="username">{{ user?.username }}</p>
        <p v-if="bound" class="partner-line">&#x2665; {{ partner?.username }}</p>
        <p v-else class="partner-line muted">未绑定</p>
        <BaseButton variant="ghost" @click="$router.push('/binding')" class="bind-btn">
          {{ bound ? '管理绑定' : '寻找伴侣' }}
        </BaseButton>
      </div>
    </BaseCard>

    <!-- 我的积分 -->
    <BaseCard class="section integral-card">
      <template #header>我的积分</template>
      <div class="score-grid">
        <div class="int-item"><span class="int-num">{{ myBalance.available }}</span><span class="int-label">可用</span></div>
        <div class="int-item"><span class="int-num frozen">{{ myBalance.frozen }}</span><span class="int-label">冻结中</span></div>
        <div class="int-item"><span class="int-num earned">{{ myBalance.earned }}</span><span class="int-label">已获得</span></div>
        <div class="int-item"><span class="int-num spent">{{ myBalance.spent }}</span><span class="int-label">已消费</span></div>
      </div>
    </BaseCard>

    <!-- 伴侣积分 -->
    <BaseCard v-if="bound" class="section integral-card partner-card">
      <template #header>{{ partner?.username }} 的积分</template>
      <div class="score-grid">
        <div class="int-item"><span class="int-num">{{ partnerBalance.available }}</span><span class="int-label">可用</span></div>
        <div class="int-item"><span class="int-num frozen">{{ partnerBalance.frozen }}</span><span class="int-label">冻结中</span></div>
        <div class="int-item"><span class="int-num earned">{{ partnerBalance.earned }}</span><span class="int-label">已获得</span></div>
        <div class="int-item"><span class="int-num spent">{{ partnerBalance.spent }}</span><span class="int-label">已消费</span></div>
      </div>
    </BaseCard>

    <!-- 快捷入口 -->
    <div class="link-row">
      <BaseCard class="menu-card" @click="$router.push('/integrals')">
        <span class="menu-icon">&#x1F4C8;</span><span class="menu-label">积分明细</span><span class="menu-arrow">&#x203A;</span>
      </BaseCard>
      <BaseCard class="menu-card" @click="$router.push('/notifications')">
        <span class="menu-icon">&#x1F514;</span><span class="menu-label">消息中心</span><span class="menu-arrow">&#x203A;</span>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import { useBindingStore } from '../stores/bindingStore'
import { getBalance, getPartnerBalance } from '../api/integrals'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'

const { user } = storeToRefs(useAuthStore())
const { bound, partner } = storeToRefs(useBindingStore())
const myBalance = reactive({ available: 0, frozen: 0, earned: 0, spent: 0 })
const partnerBalance = reactive({ available: 0, frozen: 0, earned: 0, spent: 0 })

onMounted(async () => {
  await useBindingStore().fetchStatus()
  try { Object.assign(myBalance, await getBalance()) } catch { /* */ }
  if (bound.value) {
    try { Object.assign(partnerBalance, await getPartnerBalance()) } catch { /* */ }
  }
})
</script>

<style scoped>
.page { overflow-x: hidden; max-width: 100%; animation: fadeInUp 0.4s ease; }
.page h2 { margin: 6px 0 20px; }
.back-btn { background: none; border: none; color: var(--color-text-secondary); font-size: 13px; cursor: pointer; font-family: var(--font-body); padding: 0 0 6px 0; transition: color var(--transition-fast); }
.back-btn:hover { color: var(--color-primary); }
.section { margin-bottom: 16px; }

/* Profile */
.profile-card { background: linear-gradient(160deg, var(--color-primary-bg) 0%, var(--color-surface) 70%); }
.profile { display: flex; flex-direction: column; align-items: center; padding: 8px 0 4px; }
.avatar-ring { width: 64px; height: 64px; border-radius: 50%; padding: 3px; background: var(--color-primary-gradient); margin-bottom: 10px; }
.avatar { width: 100%; height: 100%; border-radius: 50%; background: var(--color-primary-gradient); color: #fff; font-size: 26px; font-weight: 700; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); }
.username { font-size: 18px; font-weight: 700; font-family: var(--font-display); }
.partner-line { font-size: 13px; color: var(--color-primary); margin-top: 2px; font-weight: 600; }
.partner-line.muted { color: var(--color-text-secondary); }
.bind-btn { margin-top: 12px; }

/* Integral */
.integral-card { background: linear-gradient(135deg, var(--color-primary-bg) 0%, var(--color-surface) 50%); }
.partner-card { background: linear-gradient(135deg, #f5f0ff 0%, var(--color-surface) 50%); }
.score-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 8px; }
.int-item { display: flex; flex-direction: column; align-items: center; }
.int-num { font-size: 26px; font-weight: 800; color: var(--color-primary); font-family: var(--font-display); }
.int-num.frozen { color: var(--color-text-secondary); }
.int-num.earned { color: var(--color-success); }
.int-num.spent { color: var(--color-danger); }
.int-label { font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; font-weight: 500; }

.link-row { display: flex; gap: 10px; }
.menu-card { display: flex; align-items: center; gap: 10px; padding: 16px; cursor: pointer; transition: transform var(--transition-fast), box-shadow var(--transition-fast); flex: 1; }
.menu-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.menu-icon { font-size: 18px; }
.menu-label { font-weight: 600; font-size: 14px; flex: 1; }
.menu-arrow { font-size: 16px; color: var(--color-text-secondary); }
</style>
