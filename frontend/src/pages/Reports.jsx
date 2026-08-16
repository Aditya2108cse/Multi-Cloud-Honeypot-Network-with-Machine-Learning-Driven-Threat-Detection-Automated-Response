import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Calendar, Filter, Loader2, BarChart2, ShieldCheck, AlertTriangle } from 'lucide-react'

const Reports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d')

  useEffect(() => {
    setMockReports()
    setLoading(false)
  }, [])

  const setMockReports = () => {
    setReports([
      { id: 1, name: 'Daily Threat Summary', type: 'Daily', period: '2024-01-15', status: 'Ready', size: '2.4 MB', generatedAt: '2024-01-15 06:00:00' },
      { id: 2, name: 'Weekly Security Report', type: 'Weekly', period: '2024-01-08 to 2024-01-14', status: 'Ready', size: '8.7 MB', generatedAt: '2024-01-15 00:00:00' },
      { id: 3, name: 'Monthly Executive Summary', type: 'Monthly', period: '2024-01-01 to 2024-01-31', status: 'Processing', size: '-', generatedAt: '2024-01-01 00:00:00' },
      { id: 4, name: 'Incident Response Report', type: 'Incident', period: '2024-01-14 14:30 - 16:45', status: 'Ready', size: '1.2 MB', generatedAt: '2024-01-14 17:00:00' },
      { id: 5, name: 'Compliance Audit Export', type: 'Compliance', period: 'Q4 2023', status: 'Ready', size: '15.3 MB', generatedAt: '2024-01-10 12:00:00' },
      { id: 6, name: 'Correlated Threat Analysis', type: 'Analysis', period: 'Last 24 Hours', status: 'Ready', size: '3.1 MB', generatedAt: '2024-01-15 08:00:00' },
    ])
  }

  const handleGenerate = (type) => {
    alert(`Generating ${type} report... This would trigger the backend report generation.`)
  }

  const handleDownload = (report) => {
    if (report.status === 'Ready') {
      alert(`Downloading ${report.name} (${report.size})`)
    }
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
          <h1 className="text-3xl font-bold text-dark-900">Reports</h1>
          <p className="text-dark-500 mt-1">Generate and download security reports</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field w-full sm:w-48"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Quick Generate */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary-600" />
          Quick Generate
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: 'Daily Threat Summary', icon: Calendar, desc: 'Last 24 hours of alerts and blocks', color: 'bg-primary-100 text-primary-600' },
            { type: 'Weekly Security Report', icon: BarChart2, desc: '7-day trend analysis and metrics', color: 'bg-blue-100 text-blue-600' },
            { type: 'Executive Summary', icon: ShieldCheck, desc: 'High-level overview for leadership', color: 'bg-green-100 text-green-600' },
            { type: 'Incident Report', icon: AlertTriangle, desc: 'Detailed incident timeline', color: 'bg-red-100 text-red-600' },
          ].map((item, index) => (
            <motion.button
              key={item.type}
              onClick={() => handleGenerate(item.type)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="glass-card p-5 hover:shadow-md transition-all text-left group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-dark-900 mb-1">{item.type}</h4>
              <p className="text-sm text-dark-500">{item.desc}</p>
              <div className="mt-4 text-primary-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Generate <span>→</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Report Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Generated</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {reports.map((report, index) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-beige-50"
                >
                  <td className="px-6 py-4 font-medium text-dark-900">{report.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-beige-100 rounded text-xs font-medium text-dark-700">{report.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-600">{report.period}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      report.status === 'Ready' ? 'bg-primary-50 text-primary-700 border-primary-100' :
                      report.status === 'Processing' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-600">{report.size}</td>
                  <td className="px-6 py-4 text-sm text-dark-500">{report.generatedAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(report)}
                        disabled={report.status !== 'Ready'}
                        className="btn-ghost p-2 text-sm disabled:opacity-50"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
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

export default Reports