export const isMockMode =
  import.meta.env.VITE_USE_MOCK_DATA === 'true' ||
  !import.meta.env.VITE_FRAPPE_URL ||
  import.meta.env.VITE_FRAPPE_URL === 'https://your-instance.erpnext.com'

export const appModeLabel = isMockMode ? 'Mock Mode' : 'ERPNext'
