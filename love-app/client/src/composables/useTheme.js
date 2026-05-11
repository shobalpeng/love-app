import { storeToRefs } from 'pinia'
import { useThemeStore } from '../stores/themeStore'
import { onMounted } from 'vue'

export function useTheme() {
  const store = useThemeStore()
  const { current } = storeToRefs(store)

  onMounted(() => {
    store.applyTheme(current.value)
  })

  return {
    current,
    setTheme: store.setTheme
  }
}
