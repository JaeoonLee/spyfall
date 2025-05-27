export function useApiFetch<T>(url: string, options: any = {}) {
    const token = import.meta.client ? localStorage.getItem('access_token') : null
  
    return $fetch<T>(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      },
      ...options
    })
  }
  