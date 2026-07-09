export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');

export function appPath(route) {
  const path = route.startsWith('/') ? route : `/${route}`;
  return `${BASE_PATH}${path}`;
}
