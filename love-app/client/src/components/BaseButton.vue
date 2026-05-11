<template>
  <button
    class="base-btn"
    :type="type"
    :class="[variant, { block, disabled, loading }]"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <span v-if="loading" class="spinner"></span>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})
defineEmits(['click'])
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 26px;
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), opacity var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.base-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: transparent;
  transition: background var(--transition-fast);
}

.base-btn:hover:not(.disabled):not(.loading)::after {
  background: rgba(255, 255, 255, 0.15);
}

.base-btn:active:not(.disabled):not(.loading) {
  transform: scale(0.97);
}

/* ─── Primary ─── */
.base-btn.primary {
  background: var(--color-primary-gradient);
  color: #fff;
  box-shadow: 0 4px 14px var(--color-primary-shadow);
}
.base-btn.primary:hover:not(.disabled):not(.loading) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--color-primary-shadow);
}

/* ─── Secondary ─── */
.base-btn.secondary {
  background: var(--color-border-light);
  color: var(--color-text);
}
.base-btn.secondary:hover:not(.disabled):not(.loading) {
  background: var(--color-border);
}

/* ─── Danger ─── */
.base-btn.danger {
  background: #fff;
  color: var(--color-danger);
  border: 1.5px solid var(--color-danger);
}
.base-btn.danger:hover:not(.disabled):not(.loading) {
  background: var(--color-danger-bg);
}

/* ─── Ghost ─── */
.base-btn.ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1.5px solid var(--color-border);
}
.base-btn.ghost:hover:not(.disabled):not(.loading) {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
}

.base-btn.block { width: 100%; }
.base-btn.disabled { opacity: 0.4; cursor: not-allowed; }

/* ─── Loading Spinner ─── */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
