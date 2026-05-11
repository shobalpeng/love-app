<template>
  <div class="auth-layout">
    <div class="auth-card">
      <div class="auth-decor"></div>
      <h1 class="auth-title">{{ title }}</h1>
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' }
})
</script>

<style scoped>
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 20px;
}
.auth-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 40px 32px 32px;
  width: 100%;
  max-width: 400px;
  position: relative;
  overflow: hidden;
}
.auth-decor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--color-primary-gradient);
}
.auth-title {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 28px;
  color: var(--color-text);
  font-family: var(--font-display);
}
</style>
