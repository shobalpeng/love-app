import { useBindingStore } from '../stores/bindingStore'
import { sendRequest, getRequests, acceptRequest, rejectRequest, unbind } from '../api/bindings'

export function useBinding() {
  const store = useBindingStore()

  async function request(toUsername) {
    return sendRequest(toUsername)
  }

  async function fetchRequests() {
    return getRequests()
  }

  async function accept(id) {
    const result = await acceptRequest(id)
    await store.fetchStatus()
    return result
  }

  async function reject(id) {
    return rejectRequest(id)
  }

  async function unbindPartner() {
    const result = await unbind()
    await store.fetchStatus()
    return result
  }

  return {
    bound: store.bound,
    partner: store.partner,
    bindingId: store.bindingId,
    fetchStatus: store.fetchStatus,
    request,
    fetchRequests,
    accept,
    reject,
    unbind: unbindPartner
  }
}
