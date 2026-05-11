<template>
  <div class="settings">
    <button class="back-btn" @click="$router.back()">&#x2190; 返回</button>
    <h2>主题设置</h2>

    <BaseCard class="section">
      <div class="theme-list">
        <div
          v-for="(info, name) in themes"
          :key="name"
          class="theme-item"
          :class="{ active: current === name }"
          @click="setTheme(name)"
        >
          <div class="theme-preview">
            <span class="swatch" :class="'swatch-' + name"></span>
            <span class="theme-label">{{ info.label }}</span>
          </div>
          <span v-if="current === name" class="check">&#x2713;</span>
        </div>
      </div>
    </BaseCard>

  </div>
</template>

<script setup>
import { useTheme } from '../composables/useTheme'
import BaseCard from '../components/BaseCard.vue'
import themeRegistry from '../themes/registry'

const { current, setTheme } = useTheme()
const themes = themeRegistry
</script>

<style scoped>
.settings h2 { margin: 6px 0 20px; }
.back-btn { background: none; border: none; color: var(--color-text-secondary); font-size: 13px; cursor: pointer; font-family: var(--font-body); padding: 0 0 6px 0; transition: color var(--transition-fast); }
.back-btn:hover { color: var(--color-primary); }
.section { margin-bottom: 16px; }
.theme-list { display: flex; flex-direction: column; gap: 10px; }
.theme-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.theme-item:hover { border-color: var(--color-primary-light); }
.theme-item.active { border-color: var(--color-primary); background: var(--color-primary-bg); }
.theme-preview { display: flex; align-items: center; gap: 14px; }
.swatch { width: 32px; height: 32px; border-radius: 50%; box-shadow: var(--shadow-sm); }
.swatch-clay { background: linear-gradient(135deg, #e11d48, #fb7185); }
.swatch-warm { background: linear-gradient(135deg, #e8546b, #f2797e); }
.swatch-minimal { background: linear-gradient(135deg, #5b5fef, #7c7ff5); }
.swatch-handdrawn { background: linear-gradient(135deg, #6daa6d, #8bc08b); }
.theme-label { font-weight: 600; font-size: 15px; }
.check { color: var(--color-primary); font-weight: 700; font-size: 18px; }
</style>
