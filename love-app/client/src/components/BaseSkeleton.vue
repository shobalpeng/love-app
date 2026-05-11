<template>
  <div class="skeleton-list">
    <div v-for="i in count" :key="i" class="skeleton-item">
      <div class="skeleton-left">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-meta"></div>
      </div>
      <div class="skeleton-right">
        <div class="skeleton-badge"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 5 }
})
</script>

<style scoped>
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border-radius: var(--radius);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-left: 5px solid var(--color-border);
}

.skeleton-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(90deg, var(--color-bg-soft) 25%, var(--color-border-light) 50%, var(--color-bg-soft) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-title {
  width: 60%;
  height: 16px;
}

.skeleton-meta {
  width: 40%;
}

.skeleton-badge {
  width: 48px;
  height: 22px;
  border-radius: 11px;
  background: linear-gradient(90deg, var(--color-bg-soft) 25%, var(--color-border-light) 50%, var(--color-bg-soft) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-right {
  flex-shrink: 0;
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
