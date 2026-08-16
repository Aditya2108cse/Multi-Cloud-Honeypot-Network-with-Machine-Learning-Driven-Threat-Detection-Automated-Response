import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import CorrelatedThreats from './pages/CorrelatedThreats'
import BlockedIPs from './pages/BlockedIPs'
import GeoMap from './pages/GeoMap'
import Reports from './pages/Reports'
import Whitelist from './pages/Whitelist'
import Settings from './pages/Settings'
import SystemLogs from './pages/SystemLogs'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="correlated-threats" element={<CorrelatedThreats />} />
            <Route path="blocked-ips" element={<BlockedIPs />} />
            <Route path="geo-map" element={<GeoMap />} />
            <Route path="reports" element={<Reports />} />
            <Route path="whitelist" element={<Whitelist />} />
            <Route path="settings" element={<Settings />} />
            <Route path="system-logs" element={<SystemLogs />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}

export default App
