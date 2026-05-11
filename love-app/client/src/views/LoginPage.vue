<template>
  <AuthLayout title="欢迎回来">
    <form @submit.prevent="handleLogin" class="form">
      <div class="field">
        <input v-model="username" type="text" required class="input" placeholder="用户名" autocomplete="username" />
      </div>
      <div class="field">
        <input v-model="password" type="password" required class="input" placeholder="密码" autocomplete="current-password" />
      </div>
      <p v-if="error" class="error">&#x26A0; {{ error }}</p>
      <BaseButton type="submit" variant="primary" block :loading="loading">登 录</BaseButton>
    </form>
    <p class="switch">还没有账号？<router-link to="/register">去注册</router-link></p>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import AuthLayout from '../components/AuthLayout.vue'
import BaseButton from '../components/BaseButton.vue'

const router = useRouter()
const { login } = useAuth()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await login(username.value, password.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form { display: flex; flex-direction: column; gap: 16px; }
.field { position: relative; }
.input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  background: var(--color-surface);
}
.input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-glow); }
.error { color: var(--color-danger); font-size: 13px; text-align: center; }
.switch { text-align: center; margin-top: 18px; font-size: 13px; color: var(--color-text-secondary); }
.switch a { font-weight: 600; }
</style>
