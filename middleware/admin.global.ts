// middleware/admin.global.ts

export default defineNuxtRouteMiddleware((_to, _from) => {
  const user = useCurrentUser();

  // Only apply this middleware to admin routes
  if (!_to.path.startsWith('/admin')) {
    return;
  }

  // Skip the middleware for the admin login page itself
  if (_to.path === '/admin/login') {
    return;
  }

  // Check if user is logged in
  if (!user.value) {
    return navigateTo('/admin/login');
  }

  // Check if user has admin role
  const isAdmin = user.value.email?.includes('developer');
  
  if (!isAdmin) {
    console.log('User is not an admin, redirecting to home');
    return navigateTo('/');
  }
}); 