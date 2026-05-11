import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const current = ref(localStorage.getItem('theme') || 'warm')

  function setTheme(name) {
    current.value = name
    localStorage.setItem('theme', name)
    applyTheme(name)
  }

  function applyTheme(name) {
    const root = document.documentElement
    import(`../themes/${name}.js`).then(mod => {
      Object.entries(mod.default).forEach(([key, val]) => {
        root.style.setProperty(key, val)
      })
    })
  }

  // 初始化时应用主题
  applyTheme(current.value)

  return { current, setTheme, applyTheme }
})
