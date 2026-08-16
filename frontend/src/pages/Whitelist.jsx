import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Trash2, Shield, Loader2, Search, CheckCircle, XCircle } from 'lucide-react'

const Whitelist = () => {
  const [whitelist, setWhitelist] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newEntry, setNewEntry] = useState({ ip: '', description: '', type: 'ip' })
  const [editingEntry, setEditingEntry] = useState(null)

  useEffect(() => {
    setMockWhitelist()
    setLoading(false)
  }, [])

  const setMockWhitelist = () => {
    setWhitelist([
      { id: 1, ip: '192.168.1.0/24', description: 'Internal Office Network', type: 'cidr', addedAt: '2024-01-01', addedBy: 'admin', status: 'active' },
      { id: 2, ip: '10.0.0.0/8', description: 'Corporate VPN Range', type: 'cidr', addedAt: '2024-01-05', addedBy: 'admin', status: 'active' },
      { id: 3, ip: '203.0.113.50', description: 'Partner API Gateway', type: 'ip', addedAt: '2024-01-10', addedBy: 'security', status: 'active' },
      { id: 4, ip: '198.51.100.0/24', description: 'Development Environment', type: 'cidr', addedAt: '2024-01-12', addedBy: 'devops', status: 'active' },
    ])
  }

  const handleAdd = () => {
    if (!newEntry.ip.trim()) return
    const entry = {
      id: Date.now(),
      ...newEntry,
      addedAt: new Date().toISOString().split('T')[0],
      addedBy: 'admin',
      status: 'active',
    }
    setWhitelist(prev => [entry, ...prev])
    setShowModal(false)
    setNewEntry({ ip: '', description: '', type: 'ip' })
  }

  const handleDelete = (id) => {
    if (confirm('Remove this entry from whitelist?')) {
      setWhitelist(prev => prev.filter(item => item.id !== id))
    }
  }

  const handleToggleStatus = (item) => {
    setWhitelist(prev => prev.map(i => 
      i.id === item.id ? { ...i, status: i.status === 'active' ? 'inactive' : 'active' } : i
    ))
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
          <h1 className="text-3xl font-bold text-dark-900">Whitelist</h1>
          <p className="text-dark-500 mt-1">Manage trusted IP addresses and networks</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-900">{whitelist.filter(w => w.status === 'active').length}</p>
              <p className="text-sm text-dark-500">Active Entries</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-900">{whitelist.filter(w => w.type === 'cidr').length}</p>
              <p className="text-sm text-dark-500">CIDR Ranges</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-900">{whitelist.filter(w => w.type === 'ip').length}</p>
              <p className="text-sm text-dark-500">Individual IPs</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Whitelist Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">IP / Range</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Added By</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Date Added</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {whitelist.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-dark-500">
                    <Shield className="w-12 h-12 mx-auto text-beige-300 mb-3" />
                    <p>No whitelist entries</p>
                    <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Add First Entry</button>
                  </td>
                </tr>
              ) : (
                whitelist.map((entry, index) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-beige-50"
                  >
                    <td className="px-6 py-4">
                      <code className="font-mono text-sm text-dark-900">{entry.ip}</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.type === 'cidr' ? 'bg-blue-100 text-blue-700' : 'bg-primary-100 text-primary-700'
                      }`}>
                        {entry.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-dark-600">{entry.description}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(entry)}
                        className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          entry.status === 'active' 
                            ? 'bg-primary-50 text-primary-700 border-primary-100 hover:bg-primary-100'
                            : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                        }`}
                      >
                        {entry.status === 'active' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-500">{entry.addedBy}</td>
                    <td className="px-6 py-4 text-sm text-dark-500">{entry.addedAt}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="btn-ghost p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Remove from whitelist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-dark-900">Add Whitelist Entry</h3>
                <button onClick={() => setShowModal(false)} className="btn-ghost p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Type</label>
                  <select
                    value={newEntry.type}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, type: e.target.value }))}
                    className="input-field"
                  >
                    <option value="ip">Single IP Address</option>
                    <option value="cidr">CIDR Range</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    {newEntry.type === 'ip' ? 'IP Address' : 'CIDR Range (e.g., 192.168.1.0/24)'}
                  </label>
                  <input
                    type="text"
                    value={newEntry.ip}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, ip: e.target.value }))}
                    placeholder={newEntry.type === 'ip' ? '192.168.1.100' : '192.168.1.0/24'}
                    className="input-field font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Internal Office Network"
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleAdd} disabled={!newEntry.ip.trim()} className="btn-primary">
                  Add Entry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Need to import AnimatePresence
import { AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default Whitelist