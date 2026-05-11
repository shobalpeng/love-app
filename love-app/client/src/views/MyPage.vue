<template>
  <div class="my-page">
    <h2>我的</h2>

    <!-- 管理员入口 -->
    <BaseCard v-if="isAdmin" class="section menu-card" @click="$router.push('/admin')">
      <div class="menu-row">
        <span class="menu-icon">&#x2699;&#xFE0F;</span>
        <span class="menu-label">管理后台</span>
        <span class="menu-arrow">&#x203A;</span>
      </div>
    </BaseCard>

    <!-- 关于我 -->
    <BaseCard class="section menu-card" @click="$router.push('/about-me')">
      <div class="menu-row">
        <span class="menu-icon">&#x1F464;</span>
        <span class="menu-label">关于我</span>
        <span class="menu-arrow">&#x203A;</span>
      </div>
    </BaseCard>

    <!-- 纪念日入口 -->
    <BaseCard class="section menu-card" @click="$router.push('/anniversaries')">
      <div class="menu-row">
        <span class="menu-icon">&#x1F4C5;</span>
        <span class="menu-label">纪念日</span>
        <span v-if="eventCount > 0" class="menu-badge">{{ eventCount }} 个纪念日</span>
        <span class="menu-arrow">&#x203A;</span>
      </div>
    </BaseCard>

    <!-- 主题入口 -->
    <BaseCard class="section menu-card" @click="$router.push('/settings')">
      <div class="menu-row">
        <span class="menu-icon">&#x1F3A8;</span>
        <span class="menu-label">主题风格</span>
        <span class="menu-arrow">&#x203A;</span>
      </div>
    </BaseCard>

    <!-- 退出 -->
    <button class="logout-btn" @click="handleLogout">退出登录</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import { useBindingStore } from '../stores/bindingStore'
import { useAuth } from '../composables/useAuth'
import BaseCard from '../components/BaseCard.vue'

const router = useRouter()
const { user } = storeToRefs(useAuthStore())
const { bound } = storeToRefs(useBindingStore())
const isAdmin = computed(() => user.value?.role === 'admin')
const { logout } = useAuth()
const eventCount = ref(0)

onMounted(async () => {
  await useBindingStore().fetchStatus()
  if (bound.value && user.value?.username) {
    try {
      const { getAnniversaries } = await import('../api/anniversaries')
      const data = await getAnniversaries()
      eventCount.value = Array.isArray(data) ? data.length : 0
    } catch { /* ignore */ }
  }
})

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<style scoped>
.my-page { overflow-x: hidden; max-width: 100%; padding-bottom: 24px; }
.my-page h2 { margin-bottom: 22px; }
.section { margin-bottom: 16px; }

/* ─── Menu Card ─── */
.menu-card { cursor: pointer; transition: transform var(--transition-fast), box-shadow var(--transition-fast); }
.menu-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.menu-row { display: flex; align-items: center; gap: 12px; }
.menu-icon { font-size: 20px; }
.menu-label { font-weight: 600; font-size: 15px; flex: 1; }
.menu-badge { font-size: 12px; color: var(--color-primary); font-weight: 500; background: var(--color-primary-bg); padding: 3px 10px; border-radius: 12px; }
.menu-arrow { font-size: 20px; color: var(--color-text-secondary); }

/* ─── Logout ─── */
.logout-btn {
  display: block;
  width: 100%;
  padding: 14px;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-body);
  transition: color var(--transition-fast);
  text-align: center;
  margin-top: 8px;
}
.logout-btn:hover { color: var(--color-danger); }
</style>
