import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  Sun,
  Moon,
  Shield,
  User,
  LogOut,
  Settings,
  Circle,
} from 'lucide-react'

const Header = ({ onMenuClick, sidebarOpen, onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const notificationsRef = useRef(null)
  const profileRef = useRef(null)

  // Notifications data
  const notifications = [
    { id: 1, title: 'New correlated threat detected', description: 'IP 185.234.219.8 matched attack pattern', time: '2m ago', unread: true },
    { id: 2, title: 'IP blocked across all clouds', description: '192.168.1.100 blocked on AWS, Azure, GCP', time: '5m ago', unread: true },
    { id: 3, title: 'Correlation completed', description: 'Found 3 new correlated threats in last run', time: '15m ago', unread: false },
    { id: 4, title: 'System health check passed', description: 'All cloud CLIs operational', time: '1h ago', unread: false },
  ]

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-beige-200 transition-all duration-300">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-dark-500 hover:bg-beige-100 hover:text-dark-700 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex p-2 rounded-lg text-dark-500 hover:bg-beige-100 hover:text-dark-700 transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 8h16M4 12h16M4 16h16" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 8h16M4 12h16M4 16h16" />
                <path d="M4 4h16M4 20h16" strokeOpacity="0.3" />
              </svg>
            )}
          </button>

          {/* Search */}
          <div className="hidden md:block relative">
            <label htmlFor="search" className="sr-only">Search</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              id="search"
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-64 md:w-80 lg:w-96 text-sm"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-dark-500 hover:bg-beige-100 hover:text-dark-700 transition-colors"
            aria-label={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-dark-500 hover:bg-beige-100 hover:text-dark-700 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-500 text-white text-xs font-medium flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-beige-200 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b border-beige-200">
                    <h3 className="font-semibold text-dark-900">Notifications</h3>
                    <span className="text-xs text-dark-500">{notifications.length} total</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: notification.id * 0.05 }}
                        className={`p-4 border-b border-beige-100 hover:bg-beige-50 transition-colors ${notification.unread ? 'bg-primary-50/50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.unread ? 'bg-primary-500' : 'bg-beige-300'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-900">{notification.title}</p>
                            <p className="text-sm text-dark-500 mt-0.5">{notification.description}</p>
                            <p className="text-xs text-dark-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-beige-200">
                    <button className="btn-ghost w-full text-sm">View all notifications</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-beige-100 transition-colors"
              aria-label="Profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-600" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-dark-900">Admin</p>
                <p className="text-xs text-dark-500">Super Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 text-dark-400 hidden md:block" />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-beige-200 overflow-hidden"
                >
                  <div className="p-3 border-b border-beige-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-dark-900">Admin User</p>
                        <p className="text-xs text-dark-500">superadmin@safenet.io</p>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="py-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-dark-600 hover:bg-beige-100 hover:text-dark-900 transition-colors">
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-dark-600 hover:bg-beige-100 hover:text-dark-900 transition-colors">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-dark-600 hover:bg-beige-100 hover:text-dark-900 transition-colors">
                      <Shield className="w-4 h-4" />
                      Security
                    </button>
                  </nav>
                  
                  <div className="border-t border-beige-200 p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-lg">
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header