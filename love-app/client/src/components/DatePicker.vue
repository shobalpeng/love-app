<template>
  <div class="date-picker-wrap">
    <button type="button" class="trigger" @click="showPicker = !showPicker">
      <span class="cal-icon">&#x1F4C5;</span>
      {{ modelValue ? new Date(modelValue).toLocaleDateString('zh-CN') : placeholder }}
      <span v-if="modelValue" class="clear" @click.stop="clearDate">&times;</span>
    </button>
    <input
      v-if="showPicker"
      ref="inputRef"
      type="date"
      :value="dateStr"
      :min="minDate"
      class="date-input"
      @change="handleChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '点击设置截止时间' }
})
const emit = defineEmits(['update:modelValue'])

const showPicker = ref(false)
const inputRef = ref(null)

const minDate = computed(() => new Date().toISOString().split('T')[0])

const dateStr = computed(() => {
  if (!props.modelValue) return ''
  return new Date(props.modelValue).toISOString().split('T')[0]
})

function handleChange(e) {
  if (e.target.value) {
    emit('update:modelValue', new Date(e.target.value).toISOString())
  }
  showPicker.value = false
}

function clearDate() {
  emit('update:modelValue', '')
  showPicker.value = false
}

watch(showPicker, (val) => {
  if (val) {
    setTimeout(() => {
      if (inputRef.value) inputRef.value.showPicker()
    }, 50)
  }
})
</script>

<style scoped>
.date-picker-wrap { position: relative; }
.trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  width: 100%;
  font-family: var(--font-body);
}
.trigger:hover { border-color: var(--color-primary); }
.cal-icon { font-size: 15px; }
.clear {
  margin-left: auto;
  font-size: 18px;
  color: var(--color-text-secondary);
  width: 22px; height: 22px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition-fast);
}
.clear:hover { color: var(--color-danger); background: var(--color-danger-bg); }
.date-input {
  position: absolute;
  left: 0;
  top: 100%;
  margin-top: 6px;
  padding: 10px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  z-index: 10;
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
}
</style>
