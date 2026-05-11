<template>
  <div class="page" v-if="recipe">
    <button class="back-btn" @click="$router.back()">&#x2190; 返回</button>
    <div class="hero">
      <h2>{{ recipe.name }}</h2>
      <span v-if="recipe.category" class="cat">{{ recipe.category }}</span>
    </div>

    <BaseCard class="section info-card">
      <div class="info-list">
        <div class="info-item">
          <span class="info-key">&#x1F464; 作者</span>
          <span class="info-val">{{ recipe.author_name }}</span>
        </div>
        <div class="info-item">
          <span class="info-key">&#x1F4C6; 更新于</span>
          <span class="info-val">{{ new Date(recipe.updated_at).toLocaleString() }}</span>
        </div>
      </div>

      <div v-if="recipe.image_urls && recipe.image_urls.length" class="images">
        <img v-for="(url, i) in recipe.image_urls" :key="i" :src="url" alt="菜谱图" @click="previewIdx = i" />
      </div>
      <div v-if="previewIdx !== null" class="image-overlay" @click="previewIdx = null">
        <img :src="recipe.image_urls[previewIdx]" alt="大图" />
      </div>

      <div class="method">
        <h3>&#x1F372; 制作方法</h3>
        <p>{{ recipe.method }}</p>
      </div>
    </BaseCard>

    <div class="actions">
      <BaseButton variant="primary" @click="$router.push(`/recipes/${recipe.id}/edit`)">编辑</BaseButton>
      <BaseButton variant="danger" @click="handleDelete">删除</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRecipeDetail, deleteRecipe } from '../../api/recipes'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const recipe = ref(null)
const previewIdx = ref(null)

onMounted(async () => {
  try { recipe.value = await getRecipeDetail(route.params.id) } catch { router.push('/recipes') }
})

async function handleDelete() {
  if (!confirm('确定删除此菜谱？')) return
  try { await deleteRecipe(recipe.value.id); router.push('/recipes') }
  catch { alert('删除失败') }
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
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 18px; flex-wrap: wrap;
}
.cat {
  padding: 4px 14px; background: var(--color-primary-gradient);
  color: #fff; border-radius: 14px; font-size: 12px; font-weight: 600;
  white-space: nowrap;
}
.section { margin-bottom: 16px; }

/* ─── Info Card ─── */
.info-card { background: linear-gradient(160deg, #fafaf7 0%, var(--color-surface) 50%); }
.info-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.info-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.info-key { color: var(--color-text-secondary); font-size: 13px; width: 80px; flex-shrink: 0; }
.info-val { font-weight: 600; color: var(--color-text); }

.images { display: flex; gap: 10px; margin: 14px 0; flex-wrap: wrap; }
.images img {
  width: 100px; height: 100px; object-fit: cover;
  border-radius: var(--radius); box-shadow: var(--shadow-sm);
  cursor: pointer; transition: transform var(--transition-fast);
}
.images img:hover { transform: scale(1.05); }

.image-overlay {
  position: fixed; inset: 0; z-index: 999;
  background: rgba(0,0,0,0.8);
  display: flex; align-items: center; justify-content: center;
  padding: 40px;
}
.image-overlay img {
  max-width: 90vw; max-height: 90vh; object-fit: contain;
  border-radius: var(--radius-lg); box-shadow: var(--shadow-xl);
}

.method {
  margin-top: 18px; padding-top: 18px;
  border-top: 1px solid var(--color-border-light);
}
.method h3 {
  font-family: var(--font-display); font-size: 18px;
  margin-bottom: 12px; color: var(--color-text);
}
.method p {
  font-size: 14px; line-height: 2; white-space: pre-wrap;
  color: var(--color-text-secondary);
}

.actions { display: flex; gap: 12px; margin-top: 4px; }
</style>
