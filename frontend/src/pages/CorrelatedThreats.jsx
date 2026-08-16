import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, ShieldCheck, Globe, Loader2, ArrowRight, Search, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'

const CorrelatedThreats = () => {
  const [threats, setThreats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchThreats()
  }, [])

  const fetchThreats = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/threats')
      if (res.ok) {
        const data = await res.json()
        setThreats(data.map((t, i) => ({
          ...t,
          id: i,
          pattern: 'SQL Injection + Brute Force',
          confidence: 95,
          events: 42,
          status: 'Blocked',
          statusColor: 'text-primary-600 bg-primary-100',
        })))
      } else {
        setMockThreats()
      }
    } catch {
      setMockThreats()
    } finally {
      setLoading(false)
    }
  }

  const setMockThreats = () => {
    setThreats([
      { id: 1, ip: '185.234.219.8', cloud: 'GCP', pattern: 'SQL Injection + Brute Force', confidence: 98, events: 128, timestamp: '2024-01-15 10:30:00', status: 'Blocked', statusColor: 'text-primary-600 bg-primary-100' },
      { id: 2, ip: '203.0.113.45', cloud: 'AWS', pattern: 'Port Scan + Service Enum', confidence: 92, events: 96, timestamp: '2024-01-15 10:15:00', status: 'Blocked', statusColor: 'text-primary-600 bg-primary-100' },
      { id: 3, ip: '192.168.1.100', cloud: 'Azure', pattern: 'Credential Stuffing', confidence: 89, events: 74, timestamp: '2024-01-15 09:45:00', status: 'Blocked', statusColor: 'text-primary-600 bg-primary-100' },
      { id: 4, ip: '198.51.100.23', cloud: 'GCP', pattern: 'Directory Traversal', confidence: 76, events: 42, timestamp: '2024-01-15 09:30:00', status: 'Monitoring', statusColor: 'text-amber-600 bg-amber-100' },
      { id: 5, ip: '203.0.113.99', cloud: 'AWS', pattern: 'Web Shell Upload', confidence: 85, events: 31, timestamp: '2024-01-15 09:00:00', status: 'Blocked', statusColor: 'text-primary-600 bg-primary-100' },
      { id: 6, ip: '192.168.1.200', cloud: 'Azure', pattern: 'Lateral Movement', confidence: 94, events: 28, timestamp: '2024-01-15 08:45:00', status: 'Blocked', statusColor: 'text-primary-600 bg-primary-100' },
    ])
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
          <h1 className="text-3xl font-bold text-dark-900">Correlated Threats</h1>
          <p className="text-dark-500 mt-1">Multi-vector attack patterns identified by correlation engine</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</button>
          <button className="btn-primary flex items-center gap-2">Export Report</button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Threat IP</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Cloud</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Attack Pattern</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Events</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Detected</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {threats.map((threat, index) => (
                <motion.tr
                  key={threat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-beige-50"
                >
                  <td className="px-6 py-4"><code className="font-mono text-sm text-dark-900">{threat.ip}</code></td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-beige-100 rounded text-xs font-medium text-dark-700">{threat.cloud}</span>
                  </td>
                  <td className="px-6 py-4 text-dark-600">{threat.pattern}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-xs h-2 bg-beige-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${threat.confidence}%` }}
                          transition={{ delay: 0.2 + index * 0.05, type: 'spring' }}
                          className="h-full bg-primary-500 rounded-full"
                        />
                      </div>
                      <span className="text-sm font-medium text-dark-900 w-12">{threat.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-dark-900">{threat.events}</td>
                  <td className="px-6 py-4 text-sm text-dark-500">{threat.timestamp}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${threat.statusColor}`}>
                      {threat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/blocked-ips/${threat.ip}`} className="btn-ghost text-sm flex items-center gap-1">
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

export default CorrelatedThreats