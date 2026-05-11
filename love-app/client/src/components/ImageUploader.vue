<template>
  <div class="image-uploader">
    <div v-if="modelValue" class="preview">
      <img :src="modelValue" alt="preview" />
      <button class="remove-btn" @click="remove">&times;</button>
    </div>
    <label v-else class="upload-trigger">
      <span class="plus">+</span>
      <span>上传图片</span>
      <input type="file" accept="image/*" @change="handleChange" hidden />
    </label>
  </div>
</template>

<script setup>
import { uploadImage } from '../api/upload'

const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

async function handleChange(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const data = await uploadImage(file)
    emit('update:modelValue', data.url)
  } catch {
    alert('上传失败')
  }
}

function remove() {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.image-uploader { display: inline-block; }
.preview {
  position: relative;
  display: inline-block;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}
.preview img {
  width: 120px; height: 120px;
  object-fit: cover;
  display: block;
}
.remove-btn {
  position: absolute;
  top: -4px; right: -4px;
  width: 24px; height: 24px;
  border-radius: 50%;
  background: var(--color-danger);
  color: #fff;
  border: none;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transition: transform var(--transition-fast);
}
.remove-btn:hover { transform: scale(1.1); }
.upload-trigger {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 120px; height: 120px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius);
  color: var(--color-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 500;
}
.upload-trigger:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
  color: var(--color-primary);
}
.plus { font-size: 28px; line-height: 1; }
</style>
