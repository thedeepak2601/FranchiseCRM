/**
 * Frappe API Client
 * Handles all communication with ERPNext backend
 * Reuses 60-70% of HRMS architecture patterns
 */

// ============================================================
// CONFIGURATION
// ============================================================

export interface FrappeConfig {
  baseURL: string
  apiKey: string
  apiSecret: string
  tenantId: string
}

export const defaultConfig: FrappeConfig = {
  baseURL: import.meta.env.VITE_FRAPPE_URL || 'https://your-instance.erpnext.com',
  apiKey: import.meta.env.VITE_FRAPPE_API_KEY || '',
  apiSecret: import.meta.env.VITE_FRAPPE_API_SECRET || '',
  tenantId: import.meta.env.VITE_TENANT_ID || 'default',
}

// ============================================================
// API CLIENT
// ============================================================

class FrappeClient {
  private config: FrappeConfig

  constructor(config: FrappeConfig = defaultConfig) {
    this.config = config
  }

  getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `token ${this.config.apiKey}:${this.config.apiSecret}`,
      'X-Tenant-ID': this.config.tenantId,
    }
  }

  getUrl(endpoint: string): string {
    return `${this.config.baseURL}/api/v2/${endpoint}`
  }

  // ============================================================
  // REST API METHODS
  // ============================================================

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const url = new URL(this.getUrl(endpoint))
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Frappe API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(this.getUrl(endpoint), {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`Frappe API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(this.getUrl(endpoint), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Frappe API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(this.getUrl(endpoint), {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Frappe API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // ============================================================
  // RPC METHODS (Frappe RPC)
  // ============================================================

  async rpc<T>(method: string, args?: unknown): Promise<T> {
    return this.post<T>('method', {
      method,
      args: args || {},
    })
  }

  // ============================================================
  // FILE UPLOAD
  // ============================================================

  async uploadFile(file: File, doctype: string, docname: string): Promise<unknown> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('doctype', doctype)
    formData.append('docname', docname)
    formData.append('is_private', '0')

    const response = await fetch(`${this.config.baseURL}/api/method/upload_file`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.config.apiKey}:${this.config.apiSecret}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`File upload error: ${response.status}`)
    }

    return response.json()
  }
}

// Export singleton instance
export const frappeClient = new FrappeClient()

// ============================================================
// DOCTYPE-SPECIFIC API METHODS
// ============================================================

export const franchiseApi = {
  // Franchise
  getFranchises: (params?: Record<string, unknown>) => 
    frappeClient.get('resource/Franchise', params),
  
  getFranchise: (name: string) => 
    frappeClient.get(`resource/Franchise/${name}`),
  
  createFranchise: (data: unknown) => 
    frappeClient.post('resource/Franchise', data),
  
  updateFranchise: (name: string, data: unknown) => 
    frappeClient.put(`resource/Franchise/${name}`, data),
  
  deleteFranchise: (name: string) => 
    frappeClient.delete(`resource/Franchise/${name}`),

  // Brand
  getBrands: (params?: Record<string, unknown>) => 
    frappeClient.get('resource/Brand', params),
  
  getBrand: (name: string) => 
    frappeClient.get(`resource/Brand/${name}`),
  
  createBrand: (data: unknown) => 
    frappeClient.post('resource/Brand', data),
  
  updateBrand: (name: string, data: unknown) => 
    frappeClient.put(`resource/Brand/${name}`, data),

  // Location
  getLocations: (params?: Record<string, unknown>) => 
    frappeClient.get('resource/Franchise Location', params),
  
  createLocation: (data: unknown) => 
    frappeClient.post('resource/Franchise Location', data),

  // Finance
  getInvoices: (params?: Record<string, unknown>) => 
    frappeClient.get('resource/Sales Invoice', params),
  
  getPayments: (params?: Record<string, unknown>) => 
    frappeClient.get('resource/Payment Entry', params),

  // Dashboard Analytics
  getDashboardStats: () => 
    frappeClient.rpc('franchise_crm.api.get_dashboard_stats'),
  
  getRevenueChart: (period: string) => 
    frappeClient.rpc('franchise_crm.api.get_revenue_chart', { period }),
  
  getTopFranchises: (limit?: number) => 
    frappeClient.rpc('franchise_crm.api.get_top_franchises', { limit }),
}

export default frappeClient
