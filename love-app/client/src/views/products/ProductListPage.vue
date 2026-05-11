<template>
  <div class="page">
    <div class="header-row">
      <h2>商品兑换</h2>
      <BaseButton @click="$router.push('/products/create')">发布商品</BaseButton>
    </div>

    <div class="search-row">
      <span class="search-icon">&#x1F50D;</span>
      <input v-model="search" class="input" type="text" placeholder="搜索商品名称..." @input="debounceSearch" />
    </div>

    <div class="filter-row">
      <select v-model="status" class="select">
        <option value="">全部商品</option>
        <option value="available">可兑换</option>
        <option value="purchased">已购买</option>
        <option value="verified">已核销</option>
        <option value="used">已使用</option>
      </select>
    </div>

    <div v-if="products.length === 0">
      <BaseEmpty text="暂无商品" />
    </div>

    <div v-for="product in products" :key="product.id" class="product-item" :class="'status-' + product.status" @click="$router.push(`/products/${product.id}`)">
      <div class="product-left">
        <div class="product-top">
          <span class="product-name">{{ product.name }}</span>
        </div>
        <div class="product-meta">
          <span>{{ product.publisher_name }}</span>
        </div>
      </div>
      <StatusBadge :status="product.status" class="product-status" />
      <div class="product-right">
        <span class="price">{{ product.price }}</span>
        <span class="price-unit">积分</span>
      </div>
    </div>

    <div v-if="products.length < total" class="load-more">
      <BaseButton variant="ghost" @click="loadMore" :disabled="loading">加载更多</BaseButton>
    </div>
  </div>
</template>

<script>
export default { name: 'ProductList' }
</script>
<script setup>
import { ref, watch, onMounted, onActivated } from 'vue'
import { getProductList } from '../../api/products'
import { useCache } from '../../composables/useCache'
import BaseButton from '../../components/BaseButton.vue'
import BaseEmpty from '../../components/BaseEmpty.vue'
import StatusBadge from '../../components/StatusBadge.vue'

const productsCache = useCache('product_list', () => getProductList())
const products = ref(productsCache.data.value?.records ?? [])
const search = ref('')
const status = ref('')
const total = ref(productsCache.data.value?.total ?? 0)
const page = ref(1)
const loading = ref(false)

let searchTimer = null
function debounceSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => refreshList(), 300)
}

function refreshList() {
  products.value = []
  total.value = 0
  page.value = 1
  fetchProducts()
}

async function fetchProducts() {
  loading.value = true
  try {
    const s = search.value || undefined
    const st = status.value || undefined
    const data = await getProductList(s, st, page.value)
    products.value = [...products.value, ...data.records]
    total.value = data.total
    page.value++
    if (!s && !st && productsCache.cacheKey) {
      productsCache.data.value = data
      try { localStorage.setItem(productsCache.cacheKey, JSON.stringify(data)) } catch { /* */ }
    }
  } catch { /* ignore */ }
  finally { loading.value = false }
}

function loadMore() { fetchProducts() }

watch(status, () => refreshList())
onMounted(() => { refreshList() })
onActivated(() => { refreshList() })
</script>

<style scoped>
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-row h2 { margin: 0; }

.search-row { position: relative; margin-bottom: 14px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 15px; opacity: 0.4; pointer-events: none; }
.input { width: 100%; padding: 11px 14px 11px 40px; border: 1.5px solid var(--color-border); border-radius: var(--radius); font-size: 14px; outline: none; background: var(--color-surface); transition: border-color var(--transition-fast), box-shadow var(--transition-fast); }
.input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-glow); }

.filter-row { display: flex; gap: 10px; margin-bottom: 14px; }
.select {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  font-size: 13px;
  color: var(--color-text);
  outline: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-weight: 500;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
  transition: border-color var(--transition-fast);
}
.select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-glow);
}

.product-item {
  display: flex; align-items: center; gap: 16px;
  padding: 18px;
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  border-left: 5px solid var(--color-border);
  margin-bottom: 10px;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.product-item:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.product-item.status-available { border-left-color: #a78bfa; }
.product-item.status-purchased { border-left-color: #f59e0b; }
.product-item.status-verified { border-left-color: #60a5fa; }
.product-item.status-used { border-left-color: #10b981; }
.product-item.status-expired { border-left-color: #9ca3af; }

.product-left { flex: 1; min-width: 0; }
.product-top { display: flex; align-items: center; margin-bottom: 8px; }
.product-name { font-weight: 600; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-status { flex-shrink: 0; margin-left: 10px; }
.product-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-secondary); font-weight: 500; }
.meta-divider { margin-left: 6px; padding-left: 8px; border-left: 1px solid var(--color-border); }

.product-right { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; min-width: 52px; }
.price { color: var(--color-primary); font-weight: 800; font-size: 24px; line-height: 1; font-family: var(--font-display); }
.price-unit { font-size: 11px; color: var(--color-text-secondary); }

.load-more { text-align: center; margin-top: 18px; }
</style>
