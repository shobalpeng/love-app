<template>
  <div class="page" v-if="recipe">
    <button class="back-btn" @click="$router.back()">&#x2190; 返回</button>
    <h2>编辑菜谱</h2>

    <BaseCard class="section">
      <form @submit.prevent="handleUpdate" class="form">
        <!-- 基本信息 -->
        <div class="form-section">
          <span class="section-icon">&#x1F372;</span>
          <span class="section-title">基本信息</span>
        </div>
        <label class="label">菜名</label>
        <input v-model="recipe.name" type="text" required class="input" placeholder="菜名" />

        <label class="label">分类</label>
        <input v-model="recipe.category" type="text" class="input" placeholder="如：川菜、面食、甜品" />

        <!-- 图片 -->
        <div class="form-section">
          <span class="section-icon">&#x1F4F7;</span>
          <span class="section-title">图片</span>
          <span class="section-hint">{{ imageUrls.length }}/5</span>
        </div>
        <div class="image-list">
          <div v-for="(url, i) in imageUrls" :key="i" class="image-item">
            <img :src="url" alt="菜谱图" />
            <button class="remove-btn" type="button" @click="removeImage(i)">&times;</button>
          </div>
          <label class="upload-btn" v-if="imageUrls.length < 5">
            <span class="plus">+</span>
            <span class="upload-text">添加图片</span>
            <input type="file" accept="image/*" @change="handleUpload" hidden />
          </label>
        </div>

        <!-- 制作方法 -->
        <div class="form-section">
          <span class="section-icon">&#x1F4DD;</span>
          <span class="section-title">制作方法</span>
        </div>
        <textarea
          v-model="recipe.method"
          class="input textarea"
          placeholder="详细的制作步骤..."
          rows="8"
          required
        ></textarea>

        <p v-if="error" class="error">&#x26A0; {{ error }}</p>
        <BaseButton type="submit" block :disabled="saving" class="submit-btn">
          {{ saving ? '保存中...' : '保存修改' }}
        </BaseButton>
      </form>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRecipeDetail, updateRecipe } from '../../api/recipes'
import { uploadImage } from '../../api/upload'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const recipe = ref(null)
const imageUrls = ref([])
const error = ref('')
const saving = ref(false)

onMounted(async () => {
  try {
    const data = await getRecipeDetail(route.params.id)
    recipe.value = data
    imageUrls.value = data.image_urls || []
  } catch { router.push('/recipes') }
})

async function handleUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const data = await uploadImage(file)
    imageUrls.value.push(data.url)
  } catch {
    error.value = '图片上传失败'
  }
}

function removeImage(i) {
  imageUrls.value.splice(i, 1)
}

async function handleUpdate() {
  error.value = ''
  saving.value = true
  try {
    const data = {
      name: recipe.value.name,
      category: recipe.value.category || null,
      method: recipe.value.method,
      image_urls: imageUrls.value.length > 0 ? imageUrls.value : null
    }
    await updateRecipe(recipe.value.id, data)
    router.push(`/recipes/${recipe.value.id}`)
  } catch (err) {
    error.value = err.response?.data?.error || '保存失败'
  } finally { saving.value = false }
}
</script>

<style scoped>
.page { overflow-x: hidden; max-width: 100%; animation: fadeInUp 0.4s ease; }
.page h2 { margin: 6px 0 20px; }
.back-btn {
  background: none; border: none; color: var(--color-text-secondary);
  font-size: 13px; cursor: pointer; font-family: var(--font-body);
  padding: 0 0 6px 0; transition: color var(--transition-fast);
}
.back-btn:hover { color: var(--color-primary); }
.section { margin-bottom: 16px; }

.form { display: flex; flex-direction: column; gap: 4px; }

/* ─── Section headers ─── */
.form-section {
  display: flex; align-items: center; gap: 8px;
  margin-top: 20px; margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border-light);
}
.form-section:first-child { margin-top: 0; }
.section-icon { font-size: 16px; }
.section-title { font-weight: 700; font-size: 14px; color: var(--color-text); }
.section-hint { margin-left: auto; font-size: 12px; color: var(--color-text-secondary); }

.label { font-size: 13px; font-weight: 600; color: var(--color-text-secondary); margin-top: 12px; margin-bottom: 4px; }
.label:first-of-type { margin-top: 4px; }

.input {
  padding: 12px 14px; border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm); font-size: 14px; outline: none;
  background: var(--color-surface); font-family: var(--font-body);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-glow); }
.textarea { resize: vertical; line-height: 1.7; }

.error { color: var(--color-danger); font-size: 13px; margin-top: 10px; }

/* ─── Image upload ─── */
.image-list { display: flex; gap: 10px; flex-wrap: wrap; }
.image-item { position: relative; border-radius: var(--radius-sm); overflow: hidden; }
.image-item img {
  width: 100px; height: 100px; object-fit: cover;
  display: block; border-radius: var(--radius-sm);
}
.remove-btn {
  position: absolute; top: 4px; right: 4px;
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(0,0,0,0.6); color: #fff;
  border: none; font-size: 14px; line-height: 1; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background var(--transition-fast);
}
.remove-btn:hover { background: var(--color-danger); }

.upload-btn {
  width: 100px; height: 100px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-sm);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 4px; cursor: pointer;
  transition: all var(--transition-fast);
}
.upload-btn:hover { border-color: var(--color-primary); background: var(--color-primary-bg); }
.plus { font-size: 24px; color: var(--color-text-secondary); line-height: 1; }
.upload-text { font-size: 10px; color: var(--color-text-secondary); }

.submit-btn { margin-top: 20px; }
</style>
