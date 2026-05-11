<template>
  <div class="page" v-if="product">
    <button class="back-btn" @click="$router.back()">&#x2190; 返回</button>
    <div class="hero">
      <h2>{{ product.name }}</h2>
      <StatusBadge :status="product.status" />
    </div>

    <!-- 信息卡片 -->
    <BaseCard class="section info-card">
      <div class="info-hero">
        <div class="price-big">{{ product.price }}</div>
        <div class="price-label">所需积分</div>
      </div>
      <div class="info-list">
        <div class="info-item">
          <span class="info-key">&#x1F464; 发布者</span>
          <span class="info-val">{{ product.publisher_name }}</span>
        </div>
        <div class="info-item">
          <span class="info-key">&#x1F4C6; 发布时间</span>
          <span class="info-val">{{ new Date(product.created_at).toLocaleString() }}</span>
        </div>
      </div>
      <div v-if="product.description" class="info-desc">{{ product.description }}</div>

      <div v-if="pr" class="timeline">
        <div class="tl-title">&#x1F4C8; 流转记录</div>
        <div class="tl-item"><span class="tl-dot done"></span>购买 — {{ new Date(pr.frozen_at).toLocaleString() }}</div>
        <div v-if="pr.verified_at" class="tl-item"><span class="tl-dot done"></span>核销 — {{ new Date(pr.verified_at).toLocaleString() }}</div>
        <div v-if="pr.confirmed_at" class="tl-item"><span class="tl-dot done"></span>收货 — {{ new Date(pr.confirmed_at).toLocaleString() }}</div>
      </div>

      <div v-if="product.image_urls && product.image_urls.length" class="images">
        <img v-for="(url, i) in product.image_urls" :key="i" :src="url" alt="商品图" />
      </div>
    </BaseCard>

    <!-- 发布者管理（可兑换状态） -->
    <BaseCard v-if="isPublisher && product.status === 'available'" class="section">
      <template #header>管理商品</template>
      <div v-if="!editing" class="pub-actions">
        <BaseButton variant="primary" @click="startEdit">编辑商品</BaseButton>
        <BaseButton variant="danger" @click="handleDelete">删除商品</BaseButton>
      </div>
      <form v-else @submit.prevent="handleUpdate" class="edit-form">
        <label class="label">名称</label>
        <input v-model="editName" type="text" required class="input" />
        <label class="label">描述</label>
        <textarea v-model="editDescription" class="input textarea" rows="2"></textarea>
        <label class="label">所需积分</label>
        <input v-model="editPrice" type="number" min="1" required class="input" />
        <div class="edit-btns">
          <BaseButton type="submit" variant="primary">保存</BaseButton>
          <BaseButton variant="ghost" @click="cancelEdit">取消</BaseButton>
        </div>
      </form>
    </BaseCard>

    <!-- 操作 -->
    <BaseCard v-if="(!isPublisher && product.status === 'available') || (isPublisher && product.status === 'purchased') || (!isPublisher && product.status === 'verified')" class="section">
      <template #header>操作</template>
      <div v-if="!isPublisher && product.status === 'available'">
        <p class="hint">可用积分：<strong>{{ balance?.available || 0 }}</strong>，冻结：{{ balance?.frozen || 0 }}</p>
        <BaseButton variant="primary" block @click="handlePurchase" :disabled="purchasing || (balance?.available || 0) < product.price">
          {{ (balance?.available || 0) < product.price ? '积分不足' : '购买（冻结积分）' }}
        </BaseButton>
      </div>
      <div v-if="isPublisher && product.status === 'purchased'">
        <BaseButton variant="primary" block @click="handleVerify" :disabled="operating">核销（确认交付）</BaseButton>
      </div>
      <div v-if="!isPublisher && product.status === 'verified'">
        <BaseButton variant="primary" block @click="handleConfirm" :disabled="operating">确认收货</BaseButton>
      </div>
      <p v-if="opError" class="error">{{ opError }}</p>
      <p v-if="opSuccess" class="success">{{ opSuccess }}</p>
    </BaseCard>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { getProductDetail, purchaseProduct, verifyProduct, confirmProduct, updateProduct, deleteProduct } from '../../api/products'
import { getBalance } from '../../api/integrals'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'
import StatusBadge from '../../components/StatusBadge.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const product = ref(null)
const balance = ref(null)
const operating = ref(false)
const purchasing = ref(false)
const opError = ref('')
const opSuccess = ref('')

const isPublisher = computed(() => user && product.value && user.id === product.value.publisher_id)
const pr = computed(() => product.value?.purchase_record)

// 编辑相关
const editing = ref(false)
const editName = ref('')
const editDescription = ref('')
const editPrice = ref(0)
function startEdit() {
  editName.value = product.value.name
  editDescription.value = product.value.description || ''
  editPrice.value = product.value.price
  editing.value = true
}
function cancelEdit() { editing.value = false }
async function handleUpdate() {
  try {
    product.value = await updateProduct(product.value.id, {
      name: editName.value, description: editDescription.value || undefined,
      price: Number(editPrice.value)
    })
    editing.value = false
  } catch (err) { alert(err.response?.data?.error || '编辑失败') }
}
async function handleDelete() {
  if (!confirm('确定删除此商品？')) return
  try { await deleteProduct(product.value.id); router.push('/products') }
  catch (err) { alert(err.response?.data?.error || '删除失败') }
}

onMounted(async () => {
  try {
    product.value = await getProductDetail(route.params.id)
    try { balance.value = await getBalance() } catch { balance.value = { available: 0, frozen: 0 } }
  } catch { router.push('/products') }
})

async function handlePurchase() {
  opError.value = ''; opSuccess.value = ''; purchasing.value = true
  try { await purchaseProduct(product.value.id); opSuccess.value = '购买成功，等待对方核销'; product.value = await getProductDetail(product.value.id) }
  catch (err) { opError.value = err.response?.data?.error || '操作失败' }
  finally { purchasing.value = false }
}
async function handleVerify() {
  opError.value = ''; opSuccess.value = ''; operating.value = true
  try { await verifyProduct(product.value.id); opSuccess.value = '已核销，等待对方确认收货'; product.value = await getProductDetail(product.value.id) }
  catch (err) { opError.value = err.response?.data?.error || '操作失败' }
  finally { operating.value = false }
}
async function handleConfirm() {
  opError.value = ''; opSuccess.value = ''; operating.value = true
  try { await confirmProduct(product.value.id); opSuccess.value = '确认收货，积分已扣除'; product.value = await getProductDetail(product.value.id) }
  catch (err) { opError.value = err.response?.data?.error || '操作失败' }
  finally { operating.value = false }
}
</script>

<style scoped>
.page { overflow-x: hidden; max-width: 100%; animation: fadeInUp 0.4s ease; }
.page h2 { margin: 0; font-size: 22px; }
.back-btn {
  background: none; border: none; color: var(--color-text-secondary);
  font-size: 13px; cursor: pointer; font-family: var(--font-body);
  padding: 0 0 12px 0; transition: color var(--transition-fast);
}
.back-btn:hover { color: var(--color-primary); }

.hero {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 18px; gap: 10px;
}
.hero h2 { flex: 1; min-width: 0; word-break: break-word; }
.hero :deep(.status-badge) { flex-shrink: 0; }
.section { margin-bottom: 16px; }

/* ─── Info Card ─── */
.info-card { background: linear-gradient(160deg, var(--color-primary-bg) 0%, var(--color-surface) 60%); }
.info-hero {
  text-align: center; padding: 8px 0 16px;
  border-bottom: 1px solid var(--color-border-light); margin-bottom: 14px;
}
.price-big {
  font-size: 48px; font-weight: 800; color: var(--color-primary);
  font-family: var(--font-display); line-height: 1.1;
}
.price-label { font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; font-weight: 500; }
.info-list { display: flex; flex-direction: column; gap: 8px; }
.info-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.info-key { color: var(--color-text-secondary); font-size: 13px; width: 120px; flex-shrink: 0; }
.info-val { font-weight: 600; color: var(--color-text); }
.info-desc {
  margin-top: 14px; padding: 14px; background: var(--color-bg-soft);
  border-radius: var(--radius-sm); font-size: 14px; line-height: 1.7;
  border-left: 3px solid var(--color-primary-light);
}

/* ─── Timeline ─── */
.timeline {
  margin-top: 14px; padding-top: 14px;
  border-top: 1px solid var(--color-border-light);
}
.tl-title { font-size: 13px; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 10px; }
.tl-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--color-text-secondary); padding: 5px 0; }
.tl-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--color-border); flex-shrink: 0; }
.tl-dot.done { background: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-bg); }

.images { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.images img {
  width: 100px; height: 100px; object-fit: cover;
  border-radius: var(--radius); box-shadow: var(--shadow-sm);
}

.input {
  flex: 1; padding: 11px 14px; border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm); font-size: 14px; outline: none;
  background: var(--color-surface); font-family: var(--font-body);
}
.input:focus { border-color: var(--color-primary); }

.hint { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 12px; }
.hint strong { color: var(--color-primary); font-family: var(--font-display); font-size: 16px; }
.error { color: var(--color-danger); font-size: 13px; margin-top: 10px; }
.success { color: var(--color-success); font-size: 13px; margin-top: 10px; }
.pub-actions { display: flex; justify-content: space-between; gap: 12px; }
.edit-form { display: flex; flex-direction: column; gap: 4px; }
.label { font-size: 13px; font-weight: 600; color: var(--color-text-secondary); margin-top: 6px; }
.edit-btns { display: flex; gap: 10px; margin-top: 12px; }
</style>
