import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  Circle,
  TrendingUp,
  BarChart2,
  Zap,
} from 'lucide-react'

const Sidebar = ({ 
  isOpen, 
  mobileOpen, 
  onMobileClose, 
  navItems, 
  systemStatus, 
  location 
}) => {
  const [showCollapsed, setShowCollapsed] = useState(false)
  const [chartData, setChartData] = useState([10, 15, 13, 17, 14, 18, 16, 20, 18, 22, 20, 24])

  // Animate the mini chart
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev.slice(1)]
        const last = prev[prev.length - 1]
        const variance = (Math.random() - 0.5) * 4
        newData.push(Math.max(5, Math.min(30, last + variance)))
        return newData
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const MiniChart = () => (
    <svg width="100" height="30" viewBox="0 0 100 30">
      <polyline
        fill="none"
        stroke="#67B86B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={chartData.map((value, index) => 
          `${(index / (chartData.length - 1)) * 100},${30 - (value / 30) * 25}`
        ).join(' ')}
      />
    </svg>
  )

  const statusColor = systemStatus.status === 'operational' ? 'text-primary-600' : 'text-amber-600'
  const statusDot = systemStatus.status === 'operational' ? 'bg-primary-500' : 'bg-amber-500'

  if (!isOpen && !mobileOpen) {
    return (
      <aside className="fixed top-0 left-0 z-50 h-screen w-20 bg-white border-r border-beige-200 transition-all duration-300 flex flex-col">
        <div className="flex flex-col items-center pt-6 pb-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center"
          >
            <Shield className="w-6 h-6 text-primary-600" />
          </motion.div>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-dark-400 hover:bg-beige-100 hover:text-dark-700'
                }`}
                title={item.label}
                style={{ transitionDelay: `${index * 0.05}s` }}
              >
                <Icon className="w-5 h-5" />
              </NavLink>
            )
          })}
        </nav>

        <div className="p-3 border-t border-beige-200">
          <button
            onClick={() => setShowCollapsed(!showCollapsed)}
            className="flex items-center justify-center w-full p-2 rounded-lg text-dark-400 hover:bg-beige-100 hover:text-dark-700 transition-all"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </aside>
    )
  }

  return (
    <motion.aside
      initial={{ x: mobileOpen ? '-100%' : 0 }}
      animate={{ x: mobileOpen ? 0 : (isOpen ? 0 : '-260px') }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-beige-200 transition-all duration-300 flex flex-col ${
        mobileOpen ? 'w-64 lg:w-64' : (isOpen ? 'w-64' : 'w-20')
      }`}
    >
      {/* Logo & Title */}
      <div className={`flex items-center gap-3 px-4 py-6 border-b border-beige-200 ${!isOpen && !mobileOpen ? 'justify-center' : ''}`}>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0"
        >
          <Shield className="w-6 h-6 text-primary-600" />
        </motion.div>
        
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              key="title"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="font-semibold text-dark-900 text-lg">SafeNet Sentinel</div>
              <div className="text-xs text-dark-500">Threat Intelligence System</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              key="nav-labels"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-3 py-2 text-xs font-medium text-dark-400 uppercase tracking-wider">
                Navigation
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={`sidebar-link group flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                isActive ? 'sidebar-link-active' : ''
              }`}
              style={{ transitionDelay: `${index * 0.03}s` }}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isActive ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                  isActive ? 'bg-primary-100 text-primary-600' : 'text-dark-400 group-hover:text-dark-700'
                }`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              
              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className={`font-medium text-sm ${isActive ? 'text-primary-600' : 'text-dark-600 group-hover:text-dark-900'}`}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {isActive && isOpen && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 4 }}
                  exit={{ width: 0 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-primary-500 rounded-r-full"
                />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* System Status */}
      <div className={`p-4 border-t border-beige-200 ${!isOpen && !mobileOpen ? 'hidden' : ''}`}>
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              key="status"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-dark-400 uppercase tracking-wider">System Status</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`w-2 h-2 rounded-full ${statusDot} animate-pulse-soft`}
                />
              </div>
              
              <div className="glass-card p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className={`w-4 h-4 ${statusColor}`} />
                  <span className={`text-sm font-medium ${statusColor}`}>
                    {systemStatus.status === 'operational' ? 'All systems operational' : 'Some components degraded'}
                  </span>
                </div>
                <div className="text-xs text-dark-500 mb-3">{systemStatus.message}</div>
                <MiniChart />
              </div>

              {/* Security Quote */}
              <div className="glass-card p-4 bg-beige-50 border-beige-200">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="flex items-start gap-2"
                >
                  <div className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-600 italic leading-relaxed">
                      "Security is not a product, but a process. Continuous monitoring and automated response are the keys to resilient defense."
                    </p>
                    <p className="text-xs text-dark-400 mt-1">— SafeNet Sentinel</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse button for expanded sidebar */}
        {isOpen && !mobileOpen && (
          <button
            onClick={() => setShowCollapsed(true)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-beige-100 border border-beige-200 flex items-center justify-center text-dark-400 hover:bg-beige-200 hover:text-dark-700 transition-all shadow-md"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.aside>
  )
}

export default Sidebar