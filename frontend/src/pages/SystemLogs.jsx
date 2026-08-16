import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Filter, Download, RefreshCw, Loader2, Search, ChevronDown, Info, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

const SystemLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)

  useEffect(() => {
    fetchLogs()
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 10000)
      return () => clearInterval(interval)
    }
  }, [filter, autoRefresh])

  const fetchLogs = async () => {
    // In production, this would fetch from a log aggregation endpoint
    setMockLogs()
    setLoading(false)
  }

  const setMockLogs = () => {
    const mockLogs = [
      { id: 1, timestamp: '2024-01-15T10:30:45.123Z', level: 'INFO', source: 'correlate_alerts', message: 'Correlation cycle started', details: 'Window: 15min, Threshold: 3' },
      { id: 2, timestamp: '2024-01-15T10:30:46.456Z', level: 'INFO', source: 'correlate_alerts', message: 'Found 3 IPs exceeding threshold', details: 'IPs: 185.234.219.8, 203.0.113.45, 192.168.1.100' },
      { id: 3, timestamp: '2024-01-15T10:30:47.789Z', level: 'INFO', source: 'correlate_alerts', message: 'Export written to /var/tmp/opencanary/opencanary_export.tsv', details: '' },
      { id: 4, timestamp: '2024-01-15T10:31:00.000Z', level: 'INFO', source: 'block_attacker', message: 'Blocker started processing export file', details: 'DRY_RUN=false' },
      { id: 5, timestamp: '2024-01-15T10:31:02.345Z', level: 'INFO', source: 'block_attacker', message: 'Processing 185.234.219.8 (seen_in=GCP)', details: '' },
      { id: 6, timestamp: '2024-01-15T10:31:05.678Z', level: 'INFO', source: 'block_attacker', message: '[AWS] OK: 185.234.219.8/32 blocked (prefix-list)', details: 'pl-067a3fa961dd2a39d, ver=5' },
      { id: 7, timestamp: '2024-01-15T10:31:08.901Z', level: 'INFO', source: 'block_attacker', message: '[Azure] OK: 185.234.219.8/32 appended to AutoBlockedIPs-Honeypot', details: 'RG=Capstone, NSG=AzureVMnsg706' },
      { id: 8, timestamp: '2024-01-15T10:31:12.234Z', level: 'INFO', source: 'block_attacker', message: '[GCP] OK: 185.234.219.8/32 blocked (rule=auto-deny-185-234-219-8)', details: 'priority=90' },
      { id: 9, timestamp: '2024-01-15T10:31:15.567Z', level: 'INFO', source: 'block_attacker', message: 'Processing 203.0.113.45 (seen_in=AWS)', details: '' },
      { id: 10, timestamp: '2024-01-15T10:31:18.890Z', level: 'INFO', source: 'block_attacker', message: '[AWS] OK: 203.0.113.45/32 blocked (prefix-list)', details: 'pl-067a3fa961dd2a39d, ver=6' },
      { id: 11, timestamp: '2024-01-15T10:31:22.123Z', level: 'INFO', source: 'block_attacker', message: '[Azure] OK: 203.0.113.45/32 appended to AutoBlockedIPs-Honeypot', details: '' },
      { id: 12, timestamp: '2024-01-15T10:31:25.456Z', level: 'INFO', source: 'block_attacker', message: '[GCP] OK: 203.0.113.45/32 blocked (rule=auto-deny-203-0-113-45)', details: '' },
      { id: 13, timestamp: '2024-01-15T10:31:30.789Z', level: 'WARN', source: 'block_attacker', message: '[AWS] 198.51.100.23 already blocked, skipping', details: '' },
      { id: 14, timestamp: '2024-01-15T10:31:35.012Z', level: 'INFO', source: 'block_attacker', message: 'DONE - processed 5 IPs', details: '5 blocked, 0 skipped, 0 errors' },
      { id: 15, timestamp: '2024-01-15T10:32:00.000Z', level: 'INFO', source: 'multicloud_block_status', message: 'Status check for 185.234.219.8', details: 'AWS: BLOCKED, Azure: BLOCKED, GCP: BLOCKED' },
      { id: 16, timestamp: '2024-01-15T10:35:00.000Z', level: 'INFO', source: 'system', message: 'Health check: All CLIs operational', details: 'aws, az, gcloud available' },
      { id: 17, timestamp: '2024-01-15T10:40:00.000Z', level: 'INFO', source: 'correlate_alerts', message: 'Correlation cycle completed', details: 'No new threats detected' },
    ]
    setLogs(mockLogs)
  }

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level.toLowerCase() === filter
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.source.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const formatTimestamp = (iso) => {
    const date = new Date(iso)
    return date.toLocaleString()
  }

  const getLevelStyle = (level) => {
    return {
      INFO: 'bg-blue-50 text-blue-700 border-blue-100',
      WARN: 'bg-amber-50 text-amber-700 border-amber-100',
      ERROR: 'bg-red-50 text-red-700 border-red-100',
      DEBUG: 'bg-beige-50 text-beige-700 border-beige-100',
    }[level] || 'bg-beige-50 text-beige-700 border-beige-100'
  }

  const getLevelIcon = (level) => {
    return {
      INFO: <Info className="w-3.5 h-3.5" />,
      WARN: <AlertCircle className="w-3.5 h-3.5" />,
      ERROR: <XCircle className="w-3.5 h-3.5" />,
      DEBUG: <Terminal className="w-3.5 h-3.5" />,
    }[level] || <Terminal className="w-3.5 h-3.5" />
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-10 h-10 text-primary-500 animate-spin" /></div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">System Logs</h1>
          <p className="text-dark-500 mt-1">Monitor system activity and troubleshoot issues</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-dark-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-beige-300 text-primary-600 focus:ring-primary-500"
            />
            Auto-refresh (10s)
          </label>
          <button onClick={fetchLogs} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-full sm:w-40"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead className="bg-beige-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Message</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-dark-500">
                    <Terminal className="w-12 h-12 mx-auto text-beige-300 mb-3" />
                    <p>No logs found</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.slice().reverse().map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`hover:bg-beige-50 transition-colors cursor-pointer ${selectedLog?.id === log.id ? 'bg-primary-50' : ''}`}
                    onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                  >
                    <td className="px-4 py-3 text-dark-500 whitespace-nowrap">{formatTimestamp(log.timestamp)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${getLevelStyle(log.level)}`}>
                        {getLevelIcon(log.level)}
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-dark-600">
                      <span className="px-2 py-0.5 bg-beige-100 rounded text-xs">{log.source}</span>
                    </td>
                    <td className="px-4 py-3 text-dark-900 max-w-md truncate block">{log.message}</td>
                    <td className="px-4 py-3 text-dark-500 max-w-lg truncate block">{log.details || '-'}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedLog(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-beige-200">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${getLevelStyle(selectedLog.level)}`}>
                    {getLevelIcon(selectedLog.level)}
                    {selectedLog.level}
                  </span>
                  <span className="px-2 py-0.5 bg-beige-100 rounded text-xs font-mono">{selectedLog.source}</span>
                </div>
                <button onClick={() => setSelectedLog(null)} className="btn-ghost p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-medium text-dark-500 uppercase tracking-wider mb-1">Timestamp</label>
                  <p className="font-mono text-sm text-dark-900">{formatTimestamp(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-500 uppercase tracking-wider mb-1">Message</label>
                  <p className="text-dark-900 whitespace-pre-wrap">{selectedLog.message}</p>
                </div>
                {selectedLog.details && (
                  <div>
                    <label className="block text-xs font-medium text-dark-500 uppercase tracking-wider mb-1">Details</label>
                    <p className="font-mono text-sm text-dark-600 whitespace-pre-wrap bg-beige-50 p-3 rounded">{selectedLog.details}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

import { AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default SystemLogs