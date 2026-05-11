<template>
  <nav class="navbar">
    <div class="nav-left">
      <router-link to="/dashboard" class="logo">&#x2665; {{ siteTitle }}</router-link>
    </div>
    <div class="nav-center">
      <router-link to="/tasks" class="nav-link"><span class="nav-icon">&#x2691;</span>任务</router-link>
      <router-link to="/products" class="nav-link"><span class="nav-icon">&#x2726;</span>商品</router-link>
      <router-link to="/todos" class="nav-link"><span class="nav-icon">&#x2611;</span>待办</router-link>
      <router-link to="/recipes" class="nav-link"><span class="nav-icon">&#x2668;</span>菜谱</router-link>
      <router-link to="/me" class="nav-link"><span class="nav-icon">&#x2661;</span>我的</router-link>
    </div>
    <div class="nav-right">
      <router-link to="/notifications" class="bell-wrap">
        <span class="bell" :class="{ ringing: unreadCount > 0 }">&#x1F514;</span>
        <BaseBadge v-if="unreadCount > 0" :count="unreadCount" />
      </router-link>
    </div>
  </nav>

  <!-- Mobile Bottom Tabs -->
  <div class="bottom-bar">
    <router-link to="/dashboard" class="tab-item">
      <span class="tab-icon">&#x2302;</span><span>首页</span>
    </router-link>
    <router-link to="/tasks" class="tab-item">
      <span class="tab-icon">&#x2691;</span><span>任务</span>
    </router-link>
    <router-link to="/products" class="tab-item">
      <span class="tab-icon">&#x2726;</span><span>商品</span>
    </router-link>
    <router-link to="/todos" class="tab-item">
      <span class="tab-icon">&#x2611;</span><span>待办</span>
    </router-link>
    <router-link to="/recipes" class="tab-item">
      <span class="tab-icon">&#x2668;</span><span>菜谱</span>
    </router-link>
    <router-link to="/me" class="tab-item">
      <span class="tab-icon">&#x2661;</span><span>我的</span>
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useNotification } from '../composables/useNotification'
import BaseBadge from './BaseBadge.vue'

const { unreadCount } = useNotification()
const authStore = useAuthStore()
const siteTitle = ref('情侣互动')

onMounted(async () => {
  try {
    const r = await fetch('/api/config')
    const data = await r.json()
    siteTitle.value = data.siteTitle || '情侣互动'
  } catch { /* use default */ }
})
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 48px;
  margin: 10px 16px;
  border-radius: 24px;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-light);
  box-shadow: var(--shadow-lg);
  position: sticky;
  top: 10px;
  z-index: 100;
}

.nav-left, .nav-center, .nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  color: var(--color-primary);
  letter-spacing: 0.02em;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  position: relative;
}
.nav-link:hover { background: var(--color-primary-bg); color: var(--color-primary); }
.nav-link.router-link-active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 600;
}
.nav-icon { font-size: 15px; }

.bell-wrap {
  position: relative;
  font-size: 20px;
  padding: 6px;
  border-radius: 50%;
  transition: background var(--transition-fast);
}
.bell-wrap:hover { background: var(--color-bg-soft); }
.bell.ringing {
  animation: bell-ring 2s ease-in-out infinite;
  display: inline-block;
}

@keyframes bell-ring {
  0%, 100% { transform: rotate(0); }
  10%      { transform: rotate(15deg); }
  20%      { transform: rotate(-12deg); }
  30%      { transform: rotate(8deg); }
  40%      { transform: rotate(-6deg); }
  50%      { transform: rotate(3deg); }
  60%      { transform: rotate(0); }
}

/* ─── Mobile ─── */
@media (max-width: 640px) {
  .nav-center { display: none; }
  .navbar { margin: 8px 10px; padding: 0 16px; height: 44px; border-radius: 22px; top: 8px; }
}

.bottom-bar {
  display: none;
  position: fixed;
  bottom: 10px; left: 12px; right: 12px;
  height: 58px;
  border-radius: 29px;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-light);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--color-text-secondary);
  font-size: 10px;
  font-weight: 500;
  text-decoration: none;
  transition: color var(--transition-fast);
  position: relative;
}

.tab-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 20px;
  height: 3px;
  border-radius: 0 0 3px 3px;
  background: var(--color-primary-gradient);
  transition: transform var(--transition);
}

.tab-item.router-link-active {
  color: var(--color-primary);
}
.tab-item.router-link-active::before {
  transform: translateX(-50%) scaleX(1);
}

.tab-icon { font-size: 22px; }

@media (max-width: 640px) {
  .bottom-bar { display: flex; }
}
</style>
