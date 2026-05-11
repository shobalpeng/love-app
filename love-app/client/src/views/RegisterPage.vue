<template>
  <AuthLayout title="创建账号">
    <router-link to="/login" class="back-link">&larr; 返回登录</router-link>
    <form @submit.prevent="handleRegister" class="form">
      <div class="field">
        <input v-model="username" type="text" required class="input" placeholder="用户名（2-20个字符）" autocomplete="username" />
      </div>
      <div class="field">
        <input v-model="password" type="password" required class="input" placeholder="密码（至少6位）" autocomplete="new-password" />
      </div>
      <div class="field">
        <input v-model="confirmPassword" type="password" required class="input" placeholder="确认密码" autocomplete="new-password" />
      </div>
      <p v-if="error" class="error">&#x26A0; {{ error }}</p>
      <BaseButton type="submit" variant="primary" block :loading="loading">注 册</BaseButton>
    </form>
    <p class="switch">已有账号？<router-link to="/login">去登录</router-link></p>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import AuthLayout from '../components/AuthLayout.vue'
import BaseButton from '../components/BaseButton.vue'

const router = useRouter()
const { register } = useAuth()
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  if (username.value.length < 2 || username.value.length > 20) {
    error.value = '用户名长度需在2-20个字符之间'
    return
  }
  if (password.value.length < 6) {
    error.value = '密码长度不能少于6位'
    return
  }
  loading.value = true
  try {
    await register(username.value, password.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form { display: flex; flex-direction: column; gap: 16px; }
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
.back-link {
  display: inline-block;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}
.back-link:hover { color: var(--color-primary); }
</style>
