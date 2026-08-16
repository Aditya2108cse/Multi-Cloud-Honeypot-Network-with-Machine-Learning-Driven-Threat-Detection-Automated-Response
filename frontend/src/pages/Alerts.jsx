import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Search, Filter, ChevronDown, Loader2 } from 'lucide-react'

const Alerts = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [page, setPage] = useState(1)
  const alertsPerPage = 15

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/alerts?limit=100')
      if (res.ok) {
        const data = await res.json()
        setAlerts(data)
      } else {
        setMockAlerts()
      }
    } catch {
      setMockAlerts()
    } finally {
      setLoading(false)
    }
  }

  const setMockAlerts = () => {
    const mockAlerts = [
      { severity: 'Critical', ip: '185.234.219.8', description: 'SQL Injection & Brute Force Combo', time: '2m ago', source: 'OpenCanary SSH' },
      { severity: 'High', ip: '203.0.113.45', description: 'Port Scanning & Service Enumeration', time: '5m ago', source: 'OpenCanary HTTP' },
      { severity: 'High', ip: '192.168.1.100', description: 'Multiple Failed SSH Logins', time: '8m ago', source: 'OpenCanary SSH' },
      { severity: 'Medium', ip: '198.51.100.23', description: 'Suspicious Directory Traversal', time: '12m ago', source: 'OpenCanary HTTP' },
      { severity: 'High', ip: '203.0.113.99', description: 'Credential Stuffing Attack', time: '15m ago', source: 'OpenCanary FTP' },
      { severity: 'Medium', ip: '185.234.219.8', description: 'Web Shell Upload Attempt', time: '18m ago', source: 'OpenCanary HTTP' },
      { severity: 'Low', ip: '198.51.100.67', description: 'Port Knocking Sequence Detected', time: '22m ago', source: 'OpenCanary TCP' },
      { severity: 'Critical', ip: '192.168.1.200', description: 'Lateral Movement Attempt', time: '25m ago', source: 'OpenCanary SMB' },
      { severity: 'Medium', ip: '203.0.113.150', description: 'Database Enumeration', time: '28m ago', source: 'OpenCanary MySQL' },
      { severity: 'Low', ip: '198.51.100.89', description: 'Dns Tunneling Attempt', time: '30m ago', source: 'OpenCanary DNS' },
    ]
    // Duplicate for pagination demo
    setAlerts([...mockAlerts, ...mockAlerts.map((a, i) => ({ ...a, ip: a.ip.replace(/\d+$/, String(i + 10)) }))])
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.ip.toLowerCase().includes(search.toLowerCase()) ||
      alert.description.toLowerCase().includes(search.toLowerCase())
    const matchesSeverity = severityFilter === 'all' || alert.severity.toLowerCase() === severityFilter
    return matchesSearch && matchesSeverity
  })

  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage)
  const paginatedAlerts = filteredAlerts.slice((page - 1) * alertsPerPage, page * alertsPerPage)

  const getSeverityBadge = (severity) => {
    const badges = {
      Critical: 'bg-red-50 text-red-700 border border-red-100',
      High: 'bg-red-50 text-red-700 border border-red-100',
      Medium: 'bg-amber-50 text-amber-700 border border-amber-100',
      Low: 'bg-primary-50 text-primary-700 border border-primary-100',
    }
    return badges[severity] || 'bg-beige-100 text-beige-700 border border-beige-200'
  }

  const getSeverityIcon = (severity) => {
    const icons = {
      Critical: '🔴',
      High: '🔴',
      Medium: '🟡',
      Low: '🟢',
    }
    return icons[severity] || '🟡'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Alerts</h1>
          <p className="text-dark-500 mt-1">Monitor and investigate security alerts from honeypots</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="btn-primary flex items-center gap-2">
            Export
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search alerts by IP, description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="input-field pl-10"
            />
          </div>
          <select
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value); setPage(1) }}
            className="input-field w-full sm:w-48"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Source IP</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {paginatedAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-dark-500">
                    <AlertTriangle className="w-12 h-12 mx-auto text-beige-300 mb-3" />
                    <p>No alerts found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                paginatedAlerts.map((alert, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-beige-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityBadge(alert.severity)}`}>
                        {getSeverityIcon(alert.severity)} {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="font-mono text-sm text-dark-900">{alert.ip}</code>
                    </td>
                    <td className="px-6 py-4 text-dark-600 max-w-md truncate block">{alert.description}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-beige-100 rounded text-xs text-dark-600">{alert.source}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-500">{alert.time}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="btn-ghost p-2 text-sm" title="Investigate">Investigate</button>
                        <button className="btn-ghost p-2 text-sm" title="Block IP">Block</button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-beige-200 flex items-center justify-between">
            <p className="text-sm text-dark-500">
              Showing {(page - 1) * alertsPerPage + 1} to {Math.min(page * alertsPerPage, filteredAlerts.length)} of {filteredAlerts.length} alerts
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost p-2 disabled:opacity-50"
              >
                <ChevronDown className="w-4 h-4 rotate-180" />
              </button>
              <span className="text-sm text-dark-600 w-10 text-center">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost p-2 disabled:opacity-50"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default Alerts