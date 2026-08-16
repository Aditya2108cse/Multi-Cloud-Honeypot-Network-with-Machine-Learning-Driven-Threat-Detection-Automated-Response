/**
 * API Service Layer for SafeNet Sentinel Frontend
 * Communicates with the FastAPI backend wrapper
 */

const API_BASE_URL = 'http://localhost:8000/api'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.detail || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      )
    }
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    // Network error or other
    throw new ApiError(
      error.message || 'Network error. Please check if the backend is running.',
      0,
      { originalError: error }
    )
  }
}

// API Methods
export const api = {
  // Health & Status
  healthCheck: () => request('/health'),
  getSystemStatus: () => request('/system-status'),

  // Threats
  getThreats: () => request('/threats'),
  getThreatStatus: (ip) => request(`/threats/${ip}/status`),
  triggerBlock: () => request('/block', { method: 'POST' }),
  triggerReset: () => request('/reset', { method: 'POST' }),
  triggerCorrelation: () => request('/correlate', { method: 'POST' }),

  // KPI & Dashboard
  getKPI: () => request('/kpi'),
  getChartData: (hours = 24) => request(`/chart-data?hours=${hours}`),
  getRecentAlerts: (limit = 20) => request(`/alerts?limit=${limit}`),
  getTopAttackers: (limit = 10) => request(`/top-attackers?limit=${limit}`),

  // Configuration
  getConfig: () => request('/config'),
  updateConfig: (config) => request('/config', { method: 'PUT', body: config }),
}

export { ApiError }
export default api