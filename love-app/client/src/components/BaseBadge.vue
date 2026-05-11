<template>
  <span class="badge" v-if="count > 0">
    {{ count > 99 ? '99+' : count }}
  </span>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 0 }
})
</script>

<style scoped>
.badge {
  position: absolute;
  top: -8px;
  right: -10px;
  background: var(--color-danger);
  color: #fff;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border-radius: 9px;
  padding: 0 4px;
}
</style>
