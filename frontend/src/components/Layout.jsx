import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Zap,
  Home,
  AlertTriangle,
  GitBranch,
  ShieldOff,
  Globe,
  FileText,
  Users,
  Settings,
  Terminal,
  Sun,
  Moon,
  Loader2,
} from 'lucide-react'
import Sidebar from './Sidebar'
import Header from './Header'
import AIAssistant from './AIAssistant'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [systemStatus, setSystemStatus] = useState({ status: 'checking', message: 'Checking...' })
  const location = useLocation()

  useEffect(() => {
    // Fetch system status
    fetch('http://localhost:8000/api/system-status')
      .then(res => res.json())
      .then(data => setSystemStatus(data))
      .catch(() => setSystemStatus({ status: 'degraded', message: 'Backend unavailable' }))
  }, [])

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/correlated-threats', label: 'Correlated Threats', icon: GitBranch },
    { path: '/blocked-ips', label: 'Blocked IPs', icon: ShieldOff },
    { path: '/geo-map', label: 'Geo Map', icon: Globe },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/whitelist', label: 'Whitelist', icon: Users },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/system-logs', label: 'System Logs', icon: Terminal },
  ]

  return (
    <div className="min-h-screen bg-beige-50 transition-all duration-300">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        navItems={navItems}
        systemStatus={systemStatus}
        location={location}
      />

      {/* Main content */}
      <div className={`lg:pl-64 transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-20'}`}>
        {/* Header */}
        <Header
          onMenuClick={() => setMobileSidebarOpen(true)}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Page content */}
        <main className="p-6 lg:p-8 pt-4">
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </main>

        {/* AI Assistant Panel */}
        <AIAssistant />
      </div>
    </div>
  )
}

export default Layout