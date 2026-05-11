<template>
  <div class="welcome">
    <div class="decor-circle c1"></div>
    <div class="decor-circle c2"></div>
    <div class="decor-circle c3"></div>

    <div class="welcome-content">
      <p class="overline">FOR TWO</p>
      <h1 class="title">情侣互动</h1>
      <p class="subtitle">记录属于你们的<br/>点点滴滴</p>
      <div class="actions">
        <router-link to="/login" class="btn-primary">登 录</router-link>
        <router-link to="/register" class="btn-ghost">注 册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
  position: relative;
  overflow: hidden;
  padding: 40px 20px;
}

/* ─── Floating Decor ─── */
.decor-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.06;
  background: var(--color-primary);
  animation: float 6s ease-in-out infinite;
}
.c1 { width: 200px; height: 200px; top: 10%; left: -60px; }
.c2 { width: 140px; height: 140px; top: 50%; right: -40px; animation-delay: -2s; }
.c3 { width: 100px; height: 100px; bottom: 15%; left: 30%; animation-delay: -4s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-14px); }
}

.welcome-content {
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.overline {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.title {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 8px;
  letter-spacing: 0.04em;
}

.subtitle {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 40px;
  line-height: 1.8;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-primary {
  padding: 12px 40px;
  background: var(--color-primary-gradient);
  color: #fff;
  border-radius: var(--radius-xl);
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.08em;
  box-shadow: 0 4px 16px var(--color-primary-shadow);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px var(--color-primary-shadow);
}

.btn-ghost {
  padding: 12px 40px;
  background: transparent;
  color: var(--color-text);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-xl);
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.08em;
  transition: all var(--transition-fast);
}
.btn-ghost:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

@media (max-width: 640px) {
  .title { font-size: 36px; }
  .actions { flex-direction: column; align-items: center; }
  .btn-primary, .btn-ghost { width: 220px; }
}
</style>
