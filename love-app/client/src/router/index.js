import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const routes = [
  { path: '/', name: 'Welcome', component: () => import('../views/WelcomePage.vue'), meta: { guest: true } },
  { path: '/login', name: 'Login', component: () => import('../views/LoginPage.vue'), meta: { guest: true } },
  { path: '/register', name: 'Register', component: () => import('../views/RegisterPage.vue'), meta: { guest: true } },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../views/DashboardPage.vue'), meta: { auth: true } },
  { path: '/binding', name: 'Binding', component: () => import('../views/BindingPage.vue'), meta: { auth: true } },
  { path: '/tasks', name: 'TaskList', component: () => import('../views/tasks/TaskListPage.vue'), meta: { auth: true } },
  { path: '/tasks/create', name: 'TaskCreate', component: () => import('../views/tasks/TaskCreatePage.vue'), meta: { auth: true } },
  { path: '/tasks/:id', name: 'TaskDetail', component: () => import('../views/tasks/TaskDetailPage.vue'), meta: { auth: true } },
  { path: '/products', name: 'ProductList', component: () => import('../views/products/ProductListPage.vue'), meta: { auth: true } },
  { path: '/products/create', name: 'ProductCreate', component: () => import('../views/products/ProductCreatePage.vue'), meta: { auth: true } },
  { path: '/products/:id', name: 'ProductDetail', component: () => import('../views/products/ProductDetailPage.vue'), meta: { auth: true } },
  { path: '/integrals', name: 'Integrals', component: () => import('../views/IntegralPage.vue'), meta: { auth: true } },
  { path: '/todos', name: 'Todos', component: () => import('../views/TodoPage.vue'), meta: { auth: true } },
  { path: '/recipes', name: 'RecipeList', component: () => import('../views/recipes/RecipeListPage.vue'), meta: { auth: true } },
  { path: '/recipes/create', name: 'RecipeCreate', component: () => import('../views/recipes/RecipeCreatePage.vue'), meta: { auth: true } },
  { path: '/recipes/:id', name: 'RecipeDetail', component: () => import('../views/recipes/RecipeDetailPage.vue'), meta: { auth: true } },
  { path: '/recipes/:id/edit', name: 'RecipeEdit', component: () => import('../views/recipes/RecipeEditPage.vue'), meta: { auth: true } },
  { path: '/notifications', name: 'Notifications', component: () => import('../views/NotificationPage.vue'), meta: { auth: true } },
  { path: '/me', name: 'My', component: () => import('../views/MyPage.vue'), meta: { auth: true } },
  { path: '/anniversaries', name: 'Anniversaries', component: () => import('../views/AnniversaryPage.vue'), meta: { auth: true } },
  { path: '/settings', name: 'Settings', component: () => import('../views/SettingsPage.vue'), meta: { auth: true } },
  { path: '/about-me', name: 'AboutMe', component: () => import('../views/AboutMePage.vue'), meta: { auth: true } },
  { path: '/admin', name: 'Admin', component: () => import('../views/AdminPage.vue'), meta: { auth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.meta.auth && !authStore.isLoggedIn) {
    return next('/login')
  }
  if (to.meta.guest && authStore.isLoggedIn) {
    return next('/dashboard')
  }
  next()
})

export default router
