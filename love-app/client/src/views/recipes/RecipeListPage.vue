<template>
  <div class="page">
    <div class="header-row">
      <h2>家庭菜谱</h2>
      <BaseButton @click="$router.push('/recipes/create')">添加菜谱</BaseButton>
    </div>

    <div class="search-row">
      <span class="search-icon">&#x1F50D;</span>
      <input v-model="search" type="text" class="input" placeholder="搜索菜名..." @input="refresh" />
      <input v-model="category" type="text" class="input" placeholder="分类筛选..." @input="refresh" style="max-width:160px" />
    </div>

    <BaseSkeleton v-if="initialLoad && recipes.length === 0" :count="5" />
    <div v-else-if="recipes.length === 0">
      <BaseEmpty text="暂无菜谱" />
    </div>

    <div v-for="recipe in recipes" :key="recipe.id" class="recipe-item" @click="$router.push(`/recipes/${recipe.id}`)">
      <div class="recipe-left">
        <div class="recipe-top">
          <span class="recipe-name">{{ recipe.name }}</span>
          <span v-if="recipe.category" class="recipe-cat">{{ recipe.category }}</span>
        </div>
        <div class="recipe-meta">
          <span>{{ recipe.author_name }}</span>
          <span class="meta-divider">{{ new Date(recipe.updated_at).toLocaleDateString() }}</span>
        </div>
      </div>
      <span class="recipe-arrow">&#x203A;</span>
    </div>

    <div v-if="recipes.length < total" class="load-more">
      <BaseButton variant="ghost" @click="fetchRecipes" :disabled="loading">加载更多</BaseButton>
    </div>
  </div>
</template>

<script>
export default { name: 'RecipeList' }
</script>
<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { getRecipeList } from '../../api/recipes'
import { useCache } from '../../composables/useCache'
import BaseButton from '../../components/BaseButton.vue'
import BaseEmpty from '../../components/BaseEmpty.vue'
import BaseSkeleton from '../../components/BaseSkeleton.vue'

const search = ref('')
const category = ref('')
const recipesCache = useCache('recipe_list', () => getRecipeList({ page: 1 }))
const recipes = ref(recipesCache.data.value?.records ?? [])
const total = ref(recipesCache.data.value?.total ?? 0)
const page = ref(1)
const loading = ref(false)
const initialLoad = ref(true)
const initialLoadDone = ref(false)

async function fetchRecipes(reset = false) {
  if (reset) { recipes.value = []; total.value = 0; page.value = 1 }
  loading.value = true
  const params = { page: page.value }
  if (search.value) params.search = search.value
  if (category.value) params.category = category.value
  try {
    const data = await getRecipeList(params)
    recipes.value = [...recipes.value, ...data.records]
    total.value = data.total
    page.value++
    if (!search.value && !category.value && recipesCache.cacheKey) {
      recipesCache.data.value = data
      try { localStorage.setItem(recipesCache.cacheKey, JSON.stringify(data)) } catch { /* */ }
    }
  } catch { /* ignore */ }
  finally { loading.value = false; initialLoad.value = false }
}

function loadMore() { fetchRecipes() }

let timer = null
function refresh() {
  clearTimeout(timer)
  timer = setTimeout(() => fetchRecipes(true), 300)
}

onMounted(() => { fetchRecipes(true) })
onActivated(() => { initialLoadDone.value && fetchRecipes(true); initialLoadDone.value = true })
</script>

<style scoped>
.page {
  overflow-x: hidden;
  max-width: 100%;
}
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-row h2 { margin: 0; }
.search-row { display: flex; gap: 10px; margin-bottom: 16px; position: relative; flex-wrap: wrap; }
.search-icon { position: absolute; left: 14px; top: 14px; font-size: 15px; opacity: 0.4; pointer-events: none; z-index: 1; }
.input { flex: 1; min-width: 120px; padding: 11px 14px 11px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius); font-size: 14px; outline: none; background: var(--color-surface); transition: border-color var(--transition-fast); }
.input:first-of-type { padding-left: 38px; }
.input:focus { border-color: var(--color-primary); }

.recipe-item {
  display: flex; align-items: center;
  padding: 18px;
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  border-left: 5px solid var(--color-primary-light);
  margin-bottom: 10px;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.recipe-item:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.recipe-left { flex: 1; min-width: 0; }
.recipe-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 8px; }
.recipe-name { font-weight: 600; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.recipe-cat { font-size: 11px; padding: 3px 12px; background: var(--color-primary-bg); color: var(--color-primary); border-radius: 12px; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
.recipe-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-secondary); font-weight: 500; }
.meta-divider { margin-left: 6px; padding-left: 8px; border-left: 1px solid var(--color-border); }
.recipe-arrow { font-size: 22px; color: var(--color-text-secondary); flex-shrink: 0; }
.load-more { text-align: center; margin-top: 18px; }
</style>
