import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Save, Shield, Cloud, Bell, User, Loader2, ToggleLeft, ToggleRight, Key, Database, Terminal, CheckCircle, Trash2 } from 'lucide-react'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [config, setConfig] = useState({
    correlation_window_minutes: 15,
    correlation_threshold: 3,
    aws_pl_id: '',
    aws_region: 'us-east-1',
    azure_rg: '',
    azure_nsg: '',
    gcp_project_id: '',
    cloud_label: 'GCP',
    opencanary_log_file: '/var/log/opencanary/opencanary.log',
    export_file: '/var/tmp/opencanary/opencanary_export.tsv',
  })
  const [notifications, setNotifications] = useState({
    email_alerts: true,
    critical_only: false,
    daily_summary: true,
    weekly_report: true,
    block_notifications: true,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'cloud', label: 'Cloud Config', icon: Cloud },
    { id: 'correlation', label: 'Correlation', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'advanced', label: 'Advanced', icon: Terminal },
  ]

  const handleSave = async (section) => {
    setSaving(true)
    try {
      // In production, this would call the backend API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-4xl"
    >
      <div>
        <h1 className="text-3xl font-bold text-dark-900">Settings</h1>
        <p className="text-dark-500 mt-1">Configure SafeNet Sentinel behavior and integrations</p>
      </div>

      {/* Tabs */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-beige-200">
          <nav className="flex -mb-px" aria-label="Settings tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-dark-500 hover:text-dark-700 hover:bg-beige-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-primary-50 border border-primary-100 rounded-lg flex items-center gap-3 text-primary-700"
            >
              <CheckCircle className="w-5 h-5" />
              Settings saved successfully!
            </motion.div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark-900">General Settings</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">System Name</label>
                  <input type="text" value="SafeNet Sentinel" className="input-field" disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">Timezone</label>
                  <select className="input-field">
                    <option>UTC</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                    <option>Asia/Tokyo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">Date Format</label>
                  <select className="input-field">
                    <option>YYYY-MM-DD</option>
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">Auto Refresh Interval</label>
                  <select className="input-field">
                    <option value="30">30 seconds</option>
                    <option value="60" selected>1 minute</option>
                    <option value="300">5 minutes</option>
                    <option value="600">10 minutes</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => handleSave('general')} disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save General Settings'}
                </button>
              </div>
            </div>
          )}

          {/* Cloud Config Tab */}
          {activeTab === 'cloud' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark-900">Cloud Provider Configuration</h3>
              <p className="text-sm text-dark-500">Configure credentials and resource IDs for each cloud provider. Credentials are managed via CLI tools (aws configure, az login, gcloud auth).</p>

              {/* AWS */}
              <div className="glass-card p-5 border border-beige-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <span className="text-xl">☁</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-900">Amazon Web Services</h4>
                    <p className="text-sm text-dark-500">Managed Prefix List for IP blocking</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Prefix List ID</label>
                    <input
                      type="text"
                      value={config.aws_pl_id}
                      onChange={(e) => setConfig(c => ({ ...c, aws_pl_id: e.target.value }))}
                      placeholder="pl-xxxxxxxxxxxxxxxxx"
                      className="input-field font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Region</label>
                    <input
                      type="text"
                      value={config.aws_region}
                      onChange={(e) => setConfig(c => ({ ...c, aws_region: e.target.value }))}
                      placeholder="us-east-1"
                      className="input-field"
                    />
                  </div>
                </div>
                <p className="text-xs text-dark-400 mt-3">Requires: AWS CLI configured with permissions to modify managed prefix lists</p>
              </div>

              {/* Azure */}
              <div className="glass-card p-5 border border-beige-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-xl">☁</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-900">Microsoft Azure</h4>
                    <p className="text-sm text-dark-500">Network Security Group for scalable IP blocking</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Resource Group</label>
                    <input
                      type="text"
                      value={config.azure_rg}
                      onChange={(e) => setConfig(c => ({ ...c, azure_rg: e.target.value }))}
                      placeholder="my-resource-group"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">NSG Name</label>
                    <input
                      type="text"
                      value={config.azure_nsg}
                      onChange={(e) => setConfig(c => ({ ...c, azure_nsg: e.target.value }))}
                      placeholder="my-nsg"
                      className="input-field"
                    />
                  </div>
                </div>
                <p className="text-xs text-dark-400 mt-3">Requires: Azure CLI logged in with Network Contributor role. Supports service principal auth via AZURE_CLIENT_ID/SECRET/TENANT_ID</p>
              </div>

              {/* GCP */}
              <div className="glass-card p-5 border border-beige-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-xl">☁</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-900">Google Cloud Platform</h4>
                    <p className="text-sm text-dark-500">VPC Firewall Rules for per-IP blocking</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Project ID</label>
                  <input
                    type="text"
                    value={config.gcp_project_id}
                    onChange={(e) => setConfig(c => ({ ...c, gcp_project_id: e.target.value }))}
                    placeholder="my-gcp-project"
                    className="input-field"
                  />
                </div>
                <p className="text-xs text-dark-400 mt-3">Requires: gcloud CLI authenticated with Compute Security Admin role</p>
              </div>

              <div className="flex justify-end">
                <button onClick={() => handleSave('cloud')} disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Cloud Configuration'}
                </button>
              </div>
            </div>
          )}

          {/* Correlation Tab */}
          {activeTab === 'correlation' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark-900">Threat Correlation Settings</h3>
              
              <div className="glass-card p-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Correlation Window (minutes)</label>
                    <input
                      type="number"
                      value={config.correlation_window_minutes}
                      onChange={(e) => setConfig(c => ({ ...c, correlation_window_minutes: parseInt(e.target.value) || 15 }))}
                      min="1"
                      max="1440"
                      className="input-field"
                    />
                    <p className="text-xs text-dark-400 mt-1">Time window to aggregate events for correlation</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Alert Threshold</label>
                    <input
                      type="number"
                      value={config.correlation_threshold}
                      onChange={(e) => setConfig(c => ({ ...c, correlation_threshold: parseInt(e.target.value) || 3 }))}
                      min="1"
                      max="100"
                      className="input-field"
                    />
                    <p className="text-xs text-dark-400 mt-1">Minimum events within window to trigger correlation</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5">
                <h4 className="font-medium text-dark-900 mb-3">File Paths</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">OpenCanary Log File</label>
                    <input
                      type="text"
                      value={config.opencanary_log_file}
                      onChange={(e) => setConfig(c => ({ ...c, opencanary_log_file: e.target.value }))}
                      className="input-field font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Export File (TSV)</label>
                    <input
                      type="text"
                      value={config.export_file}
                      onChange={(e) => setConfig(c => ({ ...c, export_file: e.target.value }))}
                      className="input-field font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => handleSave('correlation')} disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Correlation Settings'}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark-900">Notification Preferences</h3>
              
              <div className="space-y-4">
                {[
                  { key: 'email_alerts', label: 'Email Alerts', desc: 'Receive email notifications for new threats' },
                  { key: 'critical_only', label: 'Critical Only', desc: 'Only notify for critical severity threats' },
                  { key: 'daily_summary', label: 'Daily Summary', desc: 'Receive daily threat summary report' },
                  { key: 'weekly_report', label: 'Weekly Report', desc: 'Receive weekly security analytics report' },
                  { key: 'block_notifications', label: 'Block Notifications', desc: 'Notify when IPs are blocked across clouds' },
                ].map(item => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex items-center justify-between p-4 glass-card"
                  >
                    <div>
                      <p className="font-medium text-dark-900">{item.label}</p>
                      <p className="text-sm text-dark-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notifications[item.key] ? 'bg-primary-500' : 'bg-beige-300'
                      }`}
                      role="switch"
                      aria-checked={notifications[item.key]}
                    >
                      <motion.div
                        animate={{ x: notifications[item.key] ? 24 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-end">
                <button onClick={() => handleSave('notifications')} disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Notification Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark-900">Advanced Settings</h3>
              
              <div className="glass-card p-5">
                <h4 className="font-medium text-dark-900 mb-4">Danger Zone</h4>
                <p className="text-sm text-dark-500 mb-4">These actions are irreversible. Use with caution.</p>
                <div className="flex flex-wrap gap-3">
                  <button className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset All Blocks
                  </button>
                  <button className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Database className="w-4 h-4 mr-2" />
                    Clear Export File
                  </button>
                  <button className="btn-secondary text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200">
                    <Key className="w-4 h-4 mr-2" />
                    Regenerate API Keys
                  </button>
                </div>
              </div>

              <div className="glass-card p-5">
                <h4 className="font-medium text-dark-900 mb-4">Debug & Logs</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Log Level</label>
                    <select className="input-field">
                      <option>INFO</option>
                      <option>DEBUG</option>
                      <option>WARNING</option>
                      <option>ERROR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Debug Mode</label>
                    <div className="flex items-center gap-3">
                      <button className={`btn-secondary ${activeTab === 'debug' ? 'bg-primary-50 border-primary-200 text-primary-700' : ''}`}>Enabled</button>
                      <button className={`btn-secondary ${activeTab !== 'debug' ? 'bg-beige-50 border-beige-200 text-dark-700' : ''}`}>Disabled</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Settings