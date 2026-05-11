<template>
  <div class="page">
    <button class="back-btn" @click="$router.back()">&#x2190; 返回</button>
    <h2>发布任务</h2>
    <BaseCard>
      <form @submit.prevent="handleCreate" class="form">
        <label class="label">标题 *</label>
        <input v-model="title" type="text" required class="input" placeholder="任务标题" />

        <label class="label">描述</label>
        <div class="desc-wrap">
          <textarea v-model="description" class="input textarea" placeholder="任务描述（可选）" rows="5"></textarea>
          <label class="img-btn" v-if="imageUrls.length < 3" title="添加图片">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <input type="file" accept="image/*" @change="handleImageUpload" hidden />
          </label>
        </div>
        <div v-if="imageUrls.length > 0" class="image-list">
          <div v-for="(url, i) in imageUrls" :key="i" class="image-item">
            <img :src="url" alt="图片" />
            <button class="remove-btn" type="button" @click="imageUrls.splice(i,1)">&times;</button>
          </div>
        </div>

        <label class="label">积分奖励 *</label>
        <input v-model="points" type="number" required class="input" placeholder="正整数" min="1" />

        <p v-if="error" class="error">{{ error }}</p>
        <BaseButton type="submit" block :disabled="submitting">发布任务</BaseButton>
      </form>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createTask } from '../../api/tasks'
import { uploadImage } from '../../api/upload'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'

const router = useRouter()
const title = ref('')
const description = ref('')
const imageUrls = ref([])
const points = ref(1)
const error = ref('')
const submitting = ref(false)

async function handleImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  try { const data = await uploadImage(file); imageUrls.value.push(data.url) } catch { error.value = '图片上传失败' }
}

async function handleCreate() {
  error.value = ''
  if (!Number.isInteger(Number(points.value)) || Number(points.value) <= 0) {
    error.value = '积分必须为正整数'; return
  }
  submitting.value = true
  try {
    await createTask({
      title: title.value,
      description: description.value || undefined,
      imageUrls: imageUrls.value.length > 0 ? imageUrls.value : undefined,
      points: Number(points.value),
    })
    router.push('/tasks')
  } catch (err) { error.value = err.response?.data?.error || '发布失败' }
  finally { submitting.value = false }
}
</script>

<style scoped>
.page h2 { margin-bottom: 18px; }
.back-btn {
  background: none; border: none; color: var(--color-text-secondary);
  font-size: 13px; cursor: pointer; font-family: var(--font-body);
  padding: 0 0 10px 0; transition: color var(--transition-fast);
}
.back-btn:hover { color: var(--color-primary); }
.form { display: flex; flex-direction: column; gap: 6px; }
.label { font-size: 13px; font-weight: 600; color: var(--color-text-secondary); margin-top: 8px; }
.input {
  padding: 11px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px; outline: none;
  background: var(--color-surface);
  transition: border-color var(--transition-fast);
}
.input:focus { border-color: var(--color-primary); }
.textarea { resize: vertical; font-family: var(--font-body); }
.error { color: var(--color-danger); font-size: 13px; }

.desc-wrap {
  position: relative;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  transition: border-color var(--transition-fast);
  min-height: 120px;
}
.desc-wrap:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-glow); }
.desc-wrap .textarea {
  border: none; outline: none; box-shadow: none;
  background: transparent;
  width: 100%; min-height: 120px; resize: none;
  padding: 12px 40px 40px 14px;
  font-size: 14px; font-family: var(--font-body);
  border-radius: var(--radius-sm);
}
.desc-wrap .textarea:focus { outline: none; box-shadow: none; }
.img-btn {
  position: absolute; bottom: 8px; right: 10px;
  width: 30px; height: 30px; border-radius: 6px;
  background: transparent;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-secondary); cursor: pointer;
  transition: none;
}
.img-btn:hover { color: var(--color-primary); }
.img-btn:active { color: var(--color-text-secondary); }

.image-list { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
.image-item { position: relative; }
.image-item img { width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); box-shadow: var(--shadow-sm); }
.remove-btn { position: absolute; top: -6px; right: -6px; width: 22px; height: 22px; border-radius: 50%; background: var(--color-danger); color: #fff; border: none; font-size: 14px; line-height: 1; cursor: pointer; }
</style>
