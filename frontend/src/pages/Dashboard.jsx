import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  GitBranch,
  ShieldCheck,
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  MapPin,
  BarChart2,
  Zap,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import ThreatChart from '../components/ThreatChart'
import { Link } from 'react-router-dom'
import { useKPI, useChartData, useRecentAlerts, useTopAttackers } from '../hooks/useApi'

const Dashboard = () => {
  const { data: kpiData, loading: kpiLoading } = useKPI()
  const { data: chartData, loading: chartLoading } = useChartData(24)
  const { data: recentAlerts, loading: alertsLoading } = useRecentAlerts(10)
  const { data: topAttackers, loading: attackersLoading } = useTopAttackers(10)
  const [systemActivity, setSystemActivity] = useState([])
  const loading = kpiLoading || chartLoading || alertsLoading || attackersLoading

  useEffect(() => {
    // Generate system activity based on alerts
    if (recentAlerts.length > 0) {
      generateSystemActivity()
    }
  }, [recentAlerts])

  const generateSystemActivity = () => {
    const activities = [
      { stage: 'Alert Generated', icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-100' },
      { stage: 'Threat Correlated', icon: GitBranch, color: 'text-amber-500', bgColor: 'bg-amber-100' },
      { stage: 'IP Blocked', icon: ShieldCheck, color: 'text-primary-600', bgColor: 'bg-primary-100' },
      { stage: 'Threat Exported', icon: Globe, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    ]
    
    const descriptions = [
      'Multiple failed logins detected from 185.234.219.8',
      'Matched with known attack pattern (SQL Injection)',
      '185.234.219.8 blocked on all platforms (AWS, Azure, GCP)',
      'Sent to cloud platforms (AWS, Azure, GCP)',
    ]
    
    const times = ['2m ago', '3m ago', '4m ago', '5m ago']
    
    const activity = activities.map((item, index) => ({
      ...item,
      description: descriptions[index] || 'Processing...',
      time: times[index] || 'Just now',
    }))
    
    setSystemActivity(activity)
  }

  const setMockData = () => {
    // Mock chart data
    const now = new Date()
    const mockChartData = []
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
      mockChartData.push({
        time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        alerts: Math.round(20 + Math.sin(i * 0.3) * 15 + Math.random() * 10),
        correlated_threats: Math.round(5 + Math.sin(i * 0.5) * 3 + Math.random() * 5),
      })
    }
    setChartData(mockChartData)
    
    // Mock alerts
    setRecentAlerts([
      { severity: 'High', ip: '192.168.1.100', description: 'Multiple failed logins detected', time: '2m ago' },
      { severity: 'Medium', ip: '185.234.219.8', description: 'SQL Injection Attempt', time: '5m ago' },
      { severity: 'High', ip: '203.0.113.45', description: 'Port scanning detected', time: '8m ago' },
      { severity: 'Low', ip: '198.51.100.23', description: 'Suspicious activity blocked', time: '12m ago' },
      { severity: 'High', ip: '185.234.219.8', description: 'Credential stuffing attack', time: '15m ago' },
    ])
    
    // Mock top attackers
    setTopAttackers([
      { ip: '185.234.219.8', count: 128 },
      { ip: '203.0.113.45', count: 96 },
      { ip: '192.168.1.100', count: 74 },
      { ip: '198.51.100.23', count: 42 },
      { ip: '203.0.113.99', count: 31 },
    ])
    
    generateSystemActivity()
  }

  const getSeverityBadge = (severity) => {
    const badges = {
      High: 'badge-high',
      Medium: 'badge-medium',
      Low: 'badge-low',
      Critical: 'badge-high',
    }
    return badges[severity] || 'badge-medium'
  }

  const getSeverityIcon = (severity) => {
    const icons = {
      High: '🔴',
      Critical: '🔴',
      Medium: '🟡',
      Low: '🟢',
    }
    return icons[severity] || '🟡'
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-96"
      >
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </motion.div>
    )
  }

  // Default values if API fails
  const displayKpi = kpiData || { total_alerts: 1248, correlated_threats: 86, blocked_ips: 43, active_regions: 12 }
  const displayChartData = chartData && chartData.length > 0 ? chartData : null
  const displayAlerts = recentAlerts && recentAlerts.length > 0 ? recentAlerts : [
    { severity: 'High', ip: '192.168.1.100', description: 'Multiple failed logins detected', time: '2m ago' },
    { severity: 'Medium', ip: '185.234.219.8', description: 'SQL Injection Attempt', time: '5m ago' },
    { severity: 'High', ip: '203.0.113.45', description: 'Port scanning detected', time: '8m ago' },
    { severity: 'Low', ip: '198.51.100.23', description: 'Suspicious activity blocked', time: '12m ago' },
    { severity: 'High', ip: '185.234.219.8', description: 'Credential stuffing attack', time: '15m ago' },
  ]
  const displayAttackers = topAttackers && topAttackers.length > 0 ? topAttackers : [
    { ip: '185.234.219.8', count: 128 },
    { ip: '203.0.113.45', count: 96 },
    { ip: '192.168.1.100', count: 74 },
    { ip: '198.51.100.23', count: 42 },
    { ip: '203.0.113.99', count: 31 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-dark-900">Good Morning, Admin 👋</h1>
          <p className="text-dark-500 mt-1 text-lg">Here&apos;s what&apos;s happening in your infrastructure today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg border border-primary-100">
            <Zap className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">Live Monitoring Active</span>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        <StatCard
          title="Total Alerts"
          value={displayKpi.total_alerts.toLocaleString()}
          change={12.5}
          changeLabel="from yesterday"
          icon={AlertTriangle}
          iconColor="text-red-600"
          bgColor="bg-red-100"
          delay={0.1}
        />
        <StatCard
          title="Correlated Threats"
          value={displayKpi.correlated_threats}
          change={8.2}
          changeLabel="from yesterday"
          icon={GitBranch}
          iconColor="text-amber-600"
          bgColor="bg-amber-100"
          delay={0.15}
        />
        <StatCard
          title="Blocked IPs"
          value={displayKpi.blocked_ips}
          change={5.7}
          changeLabel="from yesterday"
          icon={ShieldCheck}
          iconColor="text-primary-600"
          bgColor="bg-primary-100"
          delay={0.2}
        />
        <StatCard
          title="Active Regions"
          value={displayKpi.active_regions}
          change={2}
          changeLabel="new regions"
          icon={Globe}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
          delay={0.25}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Left Column - Chart & Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 space-y-4 lg:space-y-6"
        >
          {/* Threat Activity Chart */}
          <ThreatChart data={chartData} />
          
          {/* Recent Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card"
          >
            <div className="p-6 border-b border-beige-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-900">Recent Alerts</h3>
                  <p className="text-sm text-dark-500">Latest threats detected by honeypots</p>
                </div>
              </div>
              <Link
                to="/alerts"
                className="btn-ghost text-sm flex items-center gap-1.5 self-start sm:self-center"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="divide-y divide-beige-200">
              {displayAlerts.length === 0 ? (
                <div className="p-8 text-center text-dark-500">
                  <AlertTriangle className="w-12 h-12 mx-auto text-beige-300 mb-3" />
                  <p>No recent alerts</p>
                </div>
              ) : (
                displayAlerts.map((alert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-beige-50 transition-colors flex items-center gap-4"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${getSeverityBadge(alert.severity).replace('border', 'bg-opacity-20')}`}>
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-medium text-dark-900">{alert.ip}</p>
                      <p className="text-sm text-dark-600 truncate">{alert.description}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-dark-400 whitespace-nowrap">{alert.time}</span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column - Top Attackers & System Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4 lg:space-y-6"
        >
          {/* Top Attacking IPs */}
          <div className="glass-card">
            <div className="p-6 border-b border-beige-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-900">Top Attacking IPs</h3>
                  <p className="text-sm text-dark-500">Most active threat sources</p>
                </div>
              </div>
              <Link to="/blocked-ips" className="btn-ghost text-sm hidden sm:flex items-center gap-1.5">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="p-6 space-y-4">
              {displayAttackers.length === 0 ? (
                <div className="text-center text-dark-500 py-8">
                  <MapPin className="w-12 h-12 mx-auto text-beige-300 mb-3" />
                  <p>No attack data available</p>
                </div>
              ) : (
                displayAttackers.map((attacker, index) => (
                  <motion.div
                    key={attacker.ip}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.08 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-dark-500 w-6 text-center">{index + 1}</span>
                        <span className="font-mono text-sm font-medium text-dark-900">{attacker.ip}</span>
                      </div>
                      <span className="text-sm font-semibold text-dark-900">{attacker.count} attacks</span>
                    </div>
                    <div className="h-2 bg-beige-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (attacker.count / (displayAttackers[0]?.count || 1)) * 100)}%` }}
                        transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 + index * 0.08 }}
                        className="h-full bg-primary-500 rounded-full"
                        style={{ '--progress-width': `${Math.min(100, (attacker.count / (displayAttackers[0]?.count || 1)) * 100)}%` }}
                      />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* System Activity Timeline */}
          <div className="glass-card">
            <div className="p-6 border-b border-beige-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-900">System Activity</h3>
                  <p className="text-sm text-dark-500">Automated response pipeline</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-beige-200" />
                
                {systemActivity.map((activity, index) => (
                  <motion.div
                    key={activity.stage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.15, duration: 0.4 }}
                    className="relative pb-8 last:pb-0 pl-14"
                  >
                    {/* Timeline dot and icon */}
                    <div className="absolute left-0 top-0 flex items-center">
                      <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary-500' : 'bg-beige-300'} border-2 border-white z-10`} />
                      <div className={`absolute left-2 w-8 h-8 rounded-full flex items-center justify-center ${activity.bgColor} -ml-2`}>
                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                    </div>
                    
                    {/* Connecting line animation for active step */}
                    {index === 0 && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="absolute left-5.5 top-full w-0.5 bg-primary-500"
                        style={{ height: 'calc(100% + 1.5rem)' }}
                      />
                    )}
                    
                    {/* Content */}
                    <div className="glass-card p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-dark-900">{activity.stage}</h4>
                          <p className="text-sm text-dark-600 mt-0.5">{activity.description}</p>
                        </div>
                        <span className="text-xs text-dark-400 whitespace-nowrap mt-1">{activity.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Dashboard