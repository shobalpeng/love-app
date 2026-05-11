<template>
  <div class="base-card">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.5),
    var(--shadow);
  overflow: hidden;
  border: 1.5px solid var(--color-border-light);
  transition: box-shadow var(--transition), transform var(--transition);
}
.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
  font-weight: 600;
  font-size: 15px;
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-bg-soft);
}
.card-body {
  padding: 20px;
}
</style>
