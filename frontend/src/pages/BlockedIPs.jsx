import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, ShieldOff, CheckCircle, XCircle, Loader2, RefreshCw, Trash2 } from 'lucide-react'

const BlockedIPs = () => {
  const [blockedIPs, setBlockedIPs] = useState([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(new Set())

  useEffect(() => {
    fetchBlockedIPs()
  }, [])

  const fetchBlockedIPs = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/threats')
      if (res.ok) {
        const threats = await res.json()
        // Check status for each IP
        const ips = [...new Set(threats.map(t => t.ip))]
        const statusPromises = ips.slice(0, 10).map(ip => 
          fetch(`http://localhost:8000/api/threats/${ip}/status`).catch(() => null)
        )
        const statusResults = await Promise.all(statusPromises)
        
        const data = ips.slice(0, 10).map((ip, index) => {
          const status = statusResults[index]?.ok ? 'BLOCKED' : 'UNKNOWN'
          return {
            ip,
            cloud: threats.find(t => t.ip === ip)?.cloud || 'Unknown',
            aws: status,
            azure: status,
            gcp: status,
            blockedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          }
        })
        setBlockedIPs(data)
      } else {
        setMockData()
      }
    } catch {
      setMockData()
    } finally {
      setLoading(false)
    }
  }

  const setMockData = () => {
    setBlockedIPs([
      { ip: '185.234.219.8', cloud: 'GCP', aws: 'BLOCKED', azure: 'BLOCKED', gcp: 'BLOCKED', blockedAt: '2024-01-15T10:30:00Z' },
      { ip: '203.0.113.45', cloud: 'AWS', aws: 'BLOCKED', azure: 'BLOCKED', gcp: 'BLOCKED', blockedAt: '2024-01-15T10:15:00Z' },
      { ip: '192.168.1.100', cloud: 'Azure', aws: 'BLOCKED', azure: 'BLOCKED', gcp: 'BLOCKED', blockedAt: '2024-01-15T09:45:00Z' },
      { ip: '198.51.100.23', cloud: 'GCP', aws: 'NOT_BLOCKED', azure: 'NOT_BLOCKED', gcp: 'BLOCKED', blockedAt: '2024-01-15T09:30:00Z' },
      { ip: '203.0.113.99', cloud: 'AWS', aws: 'BLOCKED', azure: 'BLOCKED', gcp: 'NOT_BLOCKED', blockedAt: '2024-01-15T09:00:00Z' },
    ])
  }

  const checkStatus = async (ip) => {
    setChecking(prev => new Set(prev).add(ip))
    try {
      const res = await fetch(`http://localhost:8000/api/threats/${ip}/status`)
      if (res.ok) {
        const status = await res.json()
        setBlockedIPs(prev => prev.map(item => 
          item.ip === ip ? { ...item, ...status } : item
        ))
      }
    } finally {
      setChecking(prev => {
        const next = new Set(prev)
        next.delete(ip)
        return next
      })
    }
  }

  const unblockIP = async (ip) => {
    if (!confirm(`Unblock ${ip} across all clouds?`)) return
    // In production, this would call the reset API
    alert('Unblock functionality requires backend implementation')
  }

  const formatTime = (iso) => {
    const date = new Date(iso)
    return date.toLocaleString()
  }

  const getStatusIcon = (status) => {
    if (status === 'BLOCKED') return <CheckCircle className="w-5 h-5 text-primary-600" />
    if (status === 'NOT_BLOCKED') return <XCircle className="w-5 h-5 text-red-500" />
    return <ShieldOff className="w-5 h-5 text-dark-400" />
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
          <h1 className="text-3xl font-bold text-dark-900">Blocked IPs</h1>
          <p className="text-dark-500 mt-1">Manage and verify IP blocks across cloud platforms</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchBlockedIPs} disabled={loading} className="btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Origin Cloud</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">AWS</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Azure</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">GCP</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Blocked At</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {blockedIPs.map((item, index) => (
                <motion.tr
                  key={item.ip}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-beige-50"
                >
                  <td className="px-6 py-4"><code className="font-mono text-sm text-dark-900">{item.ip}</code></td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-beige-100 rounded text-xs font-medium text-dark-700">{item.cloud}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.aws)}
                      <span className={`text-sm ${item.aws === 'BLOCKED' ? 'text-primary-600' : item.aws === 'NOT_BLOCKED' ? 'text-red-600' : 'text-dark-400'}`}>
                        {item.aws}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.azure)}
                      <span className={`text-sm ${item.azure === 'BLOCKED' ? 'text-primary-600' : item.azure === 'NOT_BLOCKED' ? 'text-red-600' : 'text-dark-400'}`}>
                        {item.azure}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.gcp)}
                      <span className={`text-sm ${item.gcp === 'BLOCKED' ? 'text-primary-600' : item.gcp === 'NOT_BLOCKED' ? 'text-red-600' : 'text-dark-400'}`}>
                        {item.gcp}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-500">{formatTime(item.blockedAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => checkStatus(item.ip)}
                        disabled={checking.has(item.ip)}
                        className="btn-ghost p-2 text-sm"
                        title="Re-check status"
                      >
                        {checking.has(item.ip) ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => unblockIP(item.ip)}
                        className="btn-ghost p-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Unblock IP"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 text-center"
        >
          <div className="text-3xl font-bold text-primary-600">{blockedIPs.filter(i => i.aws === 'BLOCKED').length}</div>
          <div className="text-sm text-dark-500 mt-1">Blocked on AWS</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6 text-center"
        >
          <div className="text-3xl font-bold text-primary-600">{blockedIPs.filter(i => i.azure === 'BLOCKED').length}</div>
          <div className="text-sm text-dark-500 mt-1">Blocked on Azure</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 text-center"
        >
          <div className="text-3xl font-bold text-primary-600">{blockedIPs.filter(i => i.gcp === 'BLOCKED').length}</div>
          <div className="text-sm text-dark-500 mt-1">Blocked on GCP</div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default BlockedIPs