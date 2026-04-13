import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory('/app/'),
  routes: [
    { path: '/login', component: () => import('@/pages/LoginPage.vue'), meta: { public: true } },
    { path: '/register', component: () => import('@/pages/RegisterPage.vue'), meta: { public: true } },
    {
      path: '/',
      component: () => import('@/components/layout/AppShell.vue'),
      children: [
        { path: '', redirect: '/scanner' },
        { path: 'scanner', component: () => import('@/pages/ScannerPage.vue') },
        { path: 'history', component: () => import('@/pages/HistoryPage.vue') },
        { path: 'history/:id', component: () => import('@/pages/SessionDetailPage.vue') },
        { path: 'profile', component: () => import('@/pages/ProfilePage.vue') },
        { path: 'credits', component: () => import('@/pages/CreditsPage.vue') },
        {
          path: 'admin',
          meta: { requiresAdmin: true },
          children: [
            { path: 'users', component: () => import('@/pages/admin/AdminUsersPage.vue') },
            { path: 'users/:id', component: () => import('@/pages/admin/AdminUserDetailPage.vue') },
            { path: 'sessions', component: () => import('@/pages/admin/AdminSessionsPage.vue') },
          ],
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated && !to.meta.public) {
    return '/login'
  }
  if (auth.isAuthenticated && to.meta.public) {
    return '/scanner'
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return '/scanner'
  }
})

export default router
