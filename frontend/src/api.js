import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: { 'Content-Type': 'application/json' }
});

/** ---- helpers ---- */
const PUBLIC_PATHS = ['/auth/login', '/auth/register']; // add more if needed

function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth:logout'));
}

function isJwtExpired(jwt) {
  try {
    const [, payload] = jwt.split('.');
    const { exp } = JSON.parse(atob(payload));
    return !exp || exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function isPublicRequest(cfg) {
  const url = new URL(cfg.url, api.defaults.baseURL);
  return PUBLIC_PATHS.some(p => url.pathname.startsWith(p));
}

api.interceptors.request.use((cfg) => {
  if (isPublicRequest(cfg)) return cfg;

  const token = localStorage.getItem('token');
  if (!token) {
    clearAuth();
    redirectToLogin();
    return Promise.reject(new axios.Cancel('No token; redirected to login'));
  }

  if (isJwtExpired(token)) {
    clearAuth();
    redirectToLogin();
    return Promise.reject(new axios.Cancel('Expired token; redirected to login'));
  }

  cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const rToken = err?.response?.data?.rToken;

    if (status === 401 && rToken) {
      clearAuth();
      redirectToLogin();
      return Promise.reject(new axios.Cancel('Invalid token; redirected to login'));
    }

    return Promise.reject(err);
  }
);

export default api;
