/**
 * Custom React Hooks for API Data Fetching
 * Provides loading states, error handling, and caching
 */

import { useState, useEffect, useCallback } from 'react'
import { api, ApiError } from '../services/api'

// Generic hook for API data
export function useApiData(fetchFn, deps = [], options = {}) {
  const [data, setData] = useState(options.initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'An error occurred')
      if (options.onError) options.onError(err)
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

// Specific hooks for each endpoint
export function useSystemStatus() {
  return useApiData(() => api.getSystemStatus(), [], { initialData: { status: 'checking', message: 'Checking...' } })
}

export function useKPI() {
  return useApiData(() => api.getKPI(), [], { 
    initialData: { total_alerts: 0, correlated_threats: 0, blocked_ips: 0, active_regions: 0 } 
  })
}

export function useChartData(hours = 24) {
  return useApiData(() => api.getChartData(hours), [hours], { initialData: [] })
}

export function useRecentAlerts(limit = 20) {
  return useApiData(() => api.getRecentAlerts(limit), [limit], { initialData: [] })
}

export function useTopAttackers(limit = 10) {
  return useApiData(() => api.getTopAttackers(limit), [limit], { initialData: [] })
}

export function useThreats() {
  return useApiData(() => api.getThreats(), [], { initialData: [] })
}

export function useThreatStatus(ip) {
  return useApiData(() => api.getThreatStatus(ip), [ip], { initialData: { ip, aws: 'UNKNOWN', azure: 'UNKNOWN', gcp: 'UNKNOWN' } })
}

export function useConfig() {
  return useApiData(() => api.getConfig(), [], { initialData: {} })
}

// Mutation hooks
export function useTriggerBlock() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const trigger = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.triggerBlock()
      return result
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to trigger block')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { trigger, loading, error }
}

export function useTriggerReset() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const trigger = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.triggerReset()
      return result
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to trigger reset')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { trigger, loading, error }
}

export function useTriggerCorrelation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const trigger = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.triggerCorrelation()
      return result
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to trigger correlation')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { trigger, loading, error }
}

export function useUpdateConfig() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const update = async (config) => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.updateConfig(config)
      return result
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update config')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { update, loading, error }
}