<template>
  <div class="page" v-if="task">
    <button class="back-btn" @click="$router.back()">&#x2190; 返回</button>
    <div class="hero">
      <h2>{{ task.title }}</h2>
      <div class="hero-badge">
        <StatusBadge :status="task.status" />
      </div>
    </div>

    <!-- 信息卡片 -->
    <BaseCard class="section info-card">
      <div class="info-hero">
        <div class="points-big">+{{ task.points }}</div>
        <div class="points-label">积分奖励</div>
      </div>
      <div class="info-list">
        <div class="info-item">
          <span class="info-key">&#x1F4E4; 发布者</span>
          <span class="info-val">{{ task.publisher_name }}</span>
        </div>
        <div class="info-item">
          <span class="info-key">&#x1F4E5; 指派给</span>
          <span class="info-val">{{ task.assigned_name }}</span>
        </div>
        <div class="info-item">
          <span class="info-key">&#x1F4C6; 发布时间</span>
          <span class="info-val">{{ new Date(task.created_at).toLocaleString() }}</span>
        </div>
      </div>
      <div v-if="task.description" class="info-desc">{{ task.description }}</div>
      <div v-if="task.image_urls && task.image_urls.length" class="task-images">
        <img v-for="(url, i) in task.image_urls" :key="i" :src="url" alt="任务图片" @click="previewImage(url)" />
      </div>

      <div class="timeline" v-if="task.submissions && task.submissions.length > 0">
        <div class="tl-title">&#x1F4C8; 流转记录</div>
        <div class="tl-item"><span class="tl-dot done"></span>发布 — {{ new Date(task.created_at).toLocaleString() }}</div>
        <div v-for="sub in task.submissions" :key="sub.id" class="tl-item">
          <span class="tl-dot done"></span>完成 — {{ new Date(sub.submitted_at).toLocaleString() }}
          <span v-if="sub.reviewed_at"> | 审核 — {{ new Date(sub.reviewed_at).toLocaleString() }}</span>
        </div>
      </div>
      <div class="timeline" v-else>
        <div class="tl-title">&#x1F4C8; 流转记录</div>
        <div class="tl-item"><span class="tl-dot"></span>发布 — {{ new Date(task.created_at).toLocaleString() }}</div>
      </div>

      <div class="role-hint" :class="{ done: task.status === 'approved' }">
        <template v-if="isPublisher && task.status === 'pending'">&#x23F3; 你发布了此任务，等待对方完成</template>
        <template v-else-if="isAssignee && task.status === 'pending'">&#x1F4DD; {{ task.publisher_name }}已发布此任务，请在下方完成</template>
        <template v-else-if="task.status === 'submitted'">&#x1F440; 已提交，等待{{ task.publisher_name }}审核</template>
        <template v-else-if="task.status === 'approved'">&#x2713; 任务已完成</template>
      </div>
    </BaseCard>

    <!-- 发布者操作（待完成状态可编辑/删除） -->
    <BaseCard v-if="isPublisher && task.status === 'pending'" class="section">
      <template #header>管理任务</template>
      <div v-if="!editing" class="pub-actions">
        <BaseButton variant="primary" @click="startEdit">编辑任务</BaseButton>
        <BaseButton variant="danger" @click="handleDelete">删除任务</BaseButton>
      </div>
      <form v-else @submit.prevent="handleUpdate" class="edit-form">
        <label class="label">标题</label>
        <input v-model="editTitle" type="text" required class="input" />
        <label class="label">描述</label>
        <textarea v-model="editDescription" class="input textarea" rows="2"></textarea>
        <label class="label">积分奖励</label>
        <input v-model="editPoints" type="number" min="1" required class="input" />
        <div class="edit-btns">
          <BaseButton type="submit" variant="primary">保存</BaseButton>
          <BaseButton variant="ghost" @click="cancelEdit">取消</BaseButton>
        </div>
      </form>
    </BaseCard>

    <!-- 提交表单 -->
    <BaseCard v-if="isAssignee && task.status === 'pending'" class="section">
      <template #header>完成任务</template>
      <form @submit.prevent="handleSubmit" class="form">
        <textarea v-model="content" class="input textarea" placeholder="说明（可选）" rows="4"></textarea>
        <div class="submit-images">
          <div v-for="(url, i) in imageUrls" :key="i" class="submit-image-item">
            <img :src="url" alt="提交图片" />
            <button class="remove-btn" type="button" @click="imageUrls.splice(i,1)">&times;</button>
          </div>
          <label class="upload-btn" v-if="imageUrls.length < 3">
            <span>+</span>
            <input type="file" accept="image/*" @change="handleImageUpload" hidden />
          </label>
        </div>
        <BaseButton type="submit" :disabled="submitting" block>完成任务</BaseButton>
      </form>
      <p v-if="subError" class="error">{{ subError }}</p>
    </BaseCard>

    <!-- 审核 -->
    <BaseCard v-if="isPublisher && task.status === 'submitted'" class="section">
      <template #header>审核</template>
      <div class="form">
      <textarea v-model="comment" class="input textarea" placeholder="评语（可选）" rows="3"></textarea>
      <div class="review-btns">
        <BaseButton variant="primary" @click="handleReview('approved')" :disabled="reviewing" block>&#x2713; 通过</BaseButton>
      </div>
      <p v-if="reviewError" class="error">{{ reviewError }}</p>
      </div>
    </BaseCard>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { getTaskDetail, submitTask, reviewTask, updateTask, deleteTask } from '../../api/tasks'
import { uploadImage } from '../../api/upload'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'
import BaseEmpty from '../../components/BaseEmpty.vue'
import StatusBadge from '../../components/StatusBadge.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const task = ref(null)
const content = ref('')
const imageUrls = ref([])
const comment = ref('')
const submitting = ref(false)
const reviewing = ref(false)
const subError = ref('')
const reviewError = ref('')

// 编辑相关
const editing = ref(false)
const editTitle = ref('')
const editDescription = ref('')
const editPoints = ref(0)
const isAssignee = computed(() => user && task.value && user.id === task.value.assigned_to_id)
const isPublisher = computed(() => user && task.value && user.id === task.value.publisher_id)

async function handleImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  try { const data = await uploadImage(file); imageUrls.value.push(data.url) } catch { /* ignore */ }
}

onMounted(async () => {
  try { task.value = await getTaskDetail(route.params.id) } catch { router.push('/tasks') }
})

async function handleSubmit() {
  subError.value = ''; submitting.value = true
  try {
    const urls = imageUrls.value.length > 0 ? imageUrls.value : undefined
    await submitTask(task.value.id, { content: content.value, imageUrls: urls })
    content.value = ''; imageUrls.value = []; task.value = await getTaskDetail(task.value.id)
  } catch (err) { subError.value = err.response?.data?.error || '提交失败' }
  finally { submitting.value = false }
}

async function handleReview(status) {
  reviewError.value = ''; reviewing.value = true
  try {
    await reviewTask(task.value.id, { status, comment: comment.value || undefined })
    comment.value = ''; task.value = await getTaskDetail(task.value.id)
  } catch (err) { reviewError.value = err.response?.data?.error || '审核失败' }
  finally { reviewing.value = false }
}

function startEdit() {
  editTitle.value = task.value.title
  editDescription.value = task.value.description || ''
  editPoints.value = task.value.points
  editing.value = true
}

function cancelEdit() { editing.value = false }

async function handleUpdate() {
  try {
    task.value = await updateTask(task.value.id, {
      title: editTitle.value,
      description: editDescription.value || undefined,
      points: Number(editPoints.value),
    })
    editing.value = false
  } catch (err) { alert(err.response?.data?.error || '编辑失败') }
}

async function handleDelete() {
  if (!confirm('确定删除此任务？')) return
  try {
    await deleteTask(task.value.id)
    router.push('/tasks')
  } catch (err) { alert(err.response?.data?.error || '删除失败') }
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

/* ─── Hero ─── */
.hero {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 18px; gap: 10px;
}
.hero h2 { flex: 1; min-width: 0; word-break: break-word; }
.hero-badge { flex-shrink: 0; }
.section { margin-bottom: 16px; }

/* ─── Info Card ─── */
.info-card { background: linear-gradient(160deg, var(--color-primary-bg) 0%, var(--color-surface) 60%); }
.info-hero {
  text-align: center; padding: 8px 0 16px;
  border-bottom: 1px solid var(--color-border-light); margin-bottom: 14px;
}
.points-big {
  font-size: 48px; font-weight: 800; color: var(--color-primary);
  font-family: var(--font-display); line-height: 1.1;
}
.points-label { font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; font-weight: 500; }
.info-list { display: flex; flex-direction: column; gap: 8px; }
.info-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.info-key { color: var(--color-text-secondary); font-size: 13px; width: 120px; flex-shrink: 0; }
.info-val { font-weight: 600; color: var(--color-text); }
.info-desc {
  margin-top: 14px; padding: 14px; background: var(--color-bg-soft);
  border-radius: var(--radius-sm); font-size: 14px; line-height: 1.7;
  border-left: 3px solid var(--color-primary-light);
}
.task-images { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
.task-images img {
  width: 100px; height: 100px; object-fit: cover; border-radius: var(--radius-sm);
  cursor: pointer; box-shadow: var(--shadow-sm); transition: transform var(--transition-fast);
}
.task-images img:hover { transform: scale(1.05); }
.role-hint {
  margin-top: 14px; padding: 12px 16px; border-radius: var(--radius-sm);
  background: var(--color-warning-bg); color: #92400e; font-size: 13px; font-weight: 500;
}
.role-hint.done { background: var(--color-success-bg); color: #065f46; }

/* ─── Form ─── */
.form { display: flex; flex-direction: column; gap: 14px; }
.input {
  padding: 12px 14px; border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm); font-size: 14px; outline: none;
  background: var(--color-surface); font-family: var(--font-body);
  transition: border-color var(--transition-fast);
}
.input:focus { border-color: var(--color-primary); }
.textarea { resize: vertical; }
.submit-images { display: flex; gap: 8px; flex-wrap: wrap; }
.submit-image-item { position: relative; }
.submit-image-item img { width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); }
.submit-images .remove-btn {
  position: absolute; top: -6px; right: -6px; width: 22px; height: 22px;
  border-radius: 50%; background: var(--color-danger); color: #fff;
  border: none; font-size: 14px; line-height: 1; cursor: pointer;
}
.submit-images .upload-btn {
  width: 80px; height: 80px; border: 2px dashed var(--color-border);
  border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center;
  font-size: 24px; color: var(--color-text-secondary); cursor: pointer;
  transition: all var(--transition-fast);
}
.submit-images .upload-btn:hover { border-color: var(--color-primary); background: var(--color-primary-bg); }

.error { color: var(--color-danger); font-size: 13px; margin-top: 8px; }

/* ─── Timeline ─── */
.timeline {
  margin-top: 14px; padding-top: 14px;
  border-top: 1px solid var(--color-border-light);
}
.tl-title { font-size: 13px; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 10px; }
.tl-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--color-text-secondary); padding: 5px 0; }
.tl-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--color-border); flex-shrink: 0; }
.tl-dot.done { background: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-bg); }
.review-btns { display: flex; gap: 12px; margin-top: 12px; }

/* ─── Publisher Actions ─── */
.pub-actions { display: flex; justify-content: space-between; gap: 12px; }
.edit-form { display: flex; flex-direction: column; gap: 6px; }
.label { font-size: 13px; font-weight: 600; color: var(--color-text-secondary); margin-top: 6px; }
.edit-btns { display: flex; gap: 10px; margin-top: 12px; }
</style>
