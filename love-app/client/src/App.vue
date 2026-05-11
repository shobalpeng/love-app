<template>
  <div id="app-root">
    <AppNavbar v-if="authStore.isLoggedIn" />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <keep-alive :include="cachedViews">
            <component :is="Component" />
          </keep-alive>
        </Transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/authStore'
import AppNavbar from './components/AppNavbar.vue'

const authStore = useAuthStore()

// 需要保持状态的列表页组件（返回时不重置筛选）
const cachedViews = ['TaskList', 'ProductList', 'Todos', 'RecipeList']

// 从环境变量读取网站标题
onMounted(async () => {
  try {
    const r = await fetch('/api/config')
    const data = await r.json()
    document.title = data.siteTitle || '情侣互动'
  } catch { /* keep default */ }
})
</script>

<style>
.main-content {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px 16px;
}

@media (max-width: 640px) {
  .main-content {
    padding: 12px 12px 76px;
  }
}

/* ─── Page Transitions ─── */
.page-enter-active {
  animation: page-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-leave-active {
  animation: page-leave 0.2s ease;
}

@keyframes page-enter {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes page-leave {
  from { opacity: 1; }
  to   { opacity: 0; }
}
</style>
