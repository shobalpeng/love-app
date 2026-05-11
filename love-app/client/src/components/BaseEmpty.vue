<template>
  <div class="empty">
    <div class="empty-icon-wrap">
      <span class="empty-icon">{{ icon }}</span>
    </div>
    <p class="empty-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '💭' },
  text: { type: String, default: '暂无数据' }
})
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 20px;
}
.empty-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-bg-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.empty-icon {
  font-size: 36px;
  opacity: 0.7;
}
.empty-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
}
</style>
