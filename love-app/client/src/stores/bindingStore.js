import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getStatus } from '../api/bindings'

export const useBindingStore = defineStore('binding', () => {
  const bound = ref(false)
  const partner = ref(null)
  const bindingId = ref(null)
  const boundAt = ref(null)

  async function fetchStatus() {
    try {
      const data = await getStatus()
      bound.value = data.bound
      partner.value = data.partner
      bindingId.value = data.bindingId
      boundAt.value = data.boundAt
    } catch {
      bound.value = false
      partner.value = null
    }
  }

  return { bound, partner, bindingId, boundAt, fetchStatus }
})
