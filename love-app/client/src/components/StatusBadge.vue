<template>
  <span class="status-badge" :style="style">
    {{ config.label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true }
})

const STYLE_MAP = {
  pending:    { label: '待完成', cls: 'st-pending' },
  submitted:  { label: '待审核', cls: 'st-info' },
  approved:   { label: '已完成', cls: 'st-success' },
  available:  { label: '可兑换', cls: 'st-accent' },
  purchased:  { label: '已购买', cls: 'st-pending' },
  verified:   { label: '已核销', cls: 'st-info' },
  used:       { label: '已收货', cls: 'st-success' },
  expired:    { label: '已过期', cls: 'st-muted' },
  frozen:     { label: '已冻结', cls: 'st-pending' },
  confirmed:  { label: '已确认', cls: 'st-success' },
  active:     { label: '活跃', cls: 'st-success' },
  inactive:   { label: '已解绑', cls: 'st-muted' },
  private:    { label: '私人', cls: 'st-muted' },
  shared:     { label: '共享', cls: 'st-info' }
}

const config = computed(() => {
  return STYLE_MAP[props.status] || { label: props.status, cls: 'st-muted' }
})

const style = computed(() => ({}))
</script>

<style scoped>
.status-badge {
  display: inline-block;
  min-width: 56px;
  text-align: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.03em;
  line-height: 1.5;
  flex-shrink: 0;
}

/* 待处理 / 已购买 / 已冻结 — warm amber */
.st-pending { background: var(--color-warning-bg); color: #92400e; }

/* 已提交 / 已核销 / 共享 — cool blue */
.st-info { background: var(--color-info-bg); color: #1e40af; }

/* 已通过 / 已使用 / 已确认 / 活跃 — green */
.st-success { background: var(--color-success-bg); color: #065f46; }

/* 未通过 — red */
.st-danger { background: var(--color-danger-bg); color: #991b1b; }

/* 可兑换 — accent purple/ violet */
.st-accent { background: var(--color-accent-light); color: #7c3aed; }

/* 已过期 / 已解绑 / 私人 — muted gray */
.st-muted { background: #f3f4f6; color: #6b7280; }
</style>
